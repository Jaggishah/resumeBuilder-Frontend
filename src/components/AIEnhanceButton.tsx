import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { useEnhanceContentMutation } from '../../redux/features/api/apiSlice'
import { useSubscriptionUpdate } from '../hooks/useSubscriptionUpdate'

interface AIEnhanceButtonProps {
  content: string
  sectionName: string
  onEnhanced: (enhancedContent: string) => void
  variant?: 'outline' | 'default' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export const AIEnhanceButton: React.FC<AIEnhanceButtonProps> = ({
  content,
  sectionName,
  onEnhanced,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const [enhanceContent, { isLoading }] = useEnhanceContentMutation()
  const [error, setError] = useState<string | null>(null)
  const updateSubscription = useSubscriptionUpdate()

  const handleEnhance = async () => {
    if (!content.trim()) {
      setError('Please enter some content to enhance')
      return
    }

    try {
      setError(null)
      const result = await enhanceContent({
        content: content.trim(),
        section_name: sectionName
      }).unwrap()

      onEnhanced(result.enhanced)
      
      // Update subscription data after successful operation
      await updateSubscription()
    } catch (err: any) {
      console.error('AI Enhancement failed:', err)
      setError(JSON.stringify(err?.data?.detail) || 'Failed to enhance content. Please try again.')
      setTimeout(() => setError(null), 5000)
    }
  }

  return (
    <div className="flex flex-col">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleEnhance}
        disabled={isLoading || !content.trim()}
        className={`${className} ${error ? 'border-red-300' : ''}`}
        title="Enhance with AI"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Enhancing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-1" />
            AI Enhance
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}