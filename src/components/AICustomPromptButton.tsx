import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MessageSquare, Loader2, Sparkles } from 'lucide-react'
import { useEnhanceContentMutation } from '../../redux/features/api/apiSlice'
import { useSubscriptionUpdate } from '../hooks/useSubscriptionUpdate'

interface AICustomPromptButtonProps {
  content: string
  sectionName: string
  onEnhanced: (enhancedContent: string) => void
  variant?: 'outline' | 'default' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export const AICustomPromptButton: React.FC<AICustomPromptButtonProps> = ({
  content,
  sectionName,
  onEnhanced,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const [enhanceContent, { isLoading }] = useEnhanceContentMutation()
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [instruction, setInstruction] = useState('')
  const updateSubscription = useSubscriptionUpdate()

  // Predefined instruction templates
  const instructionTemplates = [
    "Make it more professional and formal",
    "Add specific metrics and achievements",
    "Make it more concise and impactful", 
    "Focus on leadership and team collaboration",
    "Emphasize technical skills and expertise",
    "Make it more action-oriented with strong verbs",
    "Tailor for a senior-level position",
    "Include industry-specific keywords"
  ]

  const handleEnhance = async () => {
    if (!content.trim()) {
      setError('Please enter some content to enhance')
      return
    }

    if (!instruction.trim()) {
      setError('Please provide instructions for the AI')
      return
    }

    try {
      setError(null)
      const result = await enhanceContent({
        content: content.trim(),
        section_name: sectionName,
        instruction: instruction.trim()
      }).unwrap()

      onEnhanced(result.enhanced)
      setIsOpen(false)
      setInstruction('')
      
      // Update subscription data after successful operation
      await updateSubscription()
    } catch (err: any) {
      console.error('AI Custom Enhancement failed:', err)
      setError(err?.data?.detail || 'Failed to enhance content. Please try again.')
    }
  }

  const handleTemplateSelect = (template: string) => {
    setInstruction(template)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setInstruction('')
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          disabled={!content.trim()}
          className={className}
          title="Custom AI Enhancement with Instructions"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          AI Prompt
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Custom AI Enhancement
          </DialogTitle>
          <DialogDescription>
            Give specific instructions to improve your content with AI assistance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Templates */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Quick Instructions (click to use)
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {instructionTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                  className="justify-start text-left h-auto py-2 px-3 text-xs hover:bg-gray-100"
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Instruction Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Your Instructions
            </label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Enter specific instructions for how you want the AI to improve your content..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Content Preview */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Content to Enhance
            </label>
            <div className="bg-gray-50 border rounded-md p-3 max-h-24 overflow-y-auto">
              <p className="text-sm text-gray-600">
                {content.trim() || 'No content available'}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleEnhance}
            disabled={isLoading || !content.trim() || !instruction.trim()}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Enhance
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}