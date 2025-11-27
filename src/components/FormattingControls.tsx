import React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { updateFormattingSection } from '../../redux/features/resumeSlice'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Settings, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

export function FormattingControls() {
  const dispatch = useAppDispatch()
  const formatting = useAppSelector(state => state.resume.formatting)

  const handleHeaderChange = (key: string, value: any) => {
    dispatch(updateFormattingSection({
      section: 'header',
      data: { [key]: value }
    }))
  }



  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Settings className="h-4 w-4" />
          Format Options
        </div>
      </div>
      <div className="p-4 space-y-4">
        


        {/* Header Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Header Style</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-2 block">Name Alignment</label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={formatting.header.nameAlignment === 'left' ? 'default' : 'outline'}
                  onClick={() => handleHeaderChange('nameAlignment', 'left')}
                  className="flex-1 h-8 text-xs"
                >
                  <AlignLeft className="h-3 w-3 mr-1" />
                  Left
                </Button>
                <Button
                  size="sm"
                  variant={formatting.header.nameAlignment === 'center' ? 'default' : 'outline'}
                  onClick={() => handleHeaderChange('nameAlignment', 'center')}
                  className="flex-1 h-8 text-xs"
                >
                  <AlignCenter className="h-3 w-3 mr-1" />
                  Center
                </Button>
                <Button
                  size="sm"
                  variant={formatting.header.nameAlignment === 'right' ? 'default' : 'outline'}
                  onClick={() => handleHeaderChange('nameAlignment', 'right')}
                  className="flex-1 h-8 text-xs"
                >
                  <AlignRight className="h-3 w-3 mr-1" />
                  Right
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-600 mb-2 block">Contact Info Alignment</label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={formatting.header.contactAlignment === 'left' ? 'default' : 'outline'}
                  onClick={() => handleHeaderChange('contactAlignment', 'left')}
                  className="flex-1 h-8 text-xs"
                >
                  <AlignLeft className="h-3 w-3 mr-1" />
                  Left
                </Button>
                <Button
                  size="sm"
                  variant={formatting.header.contactAlignment === 'center' ? 'default' : 'outline'}
                  onClick={() => handleHeaderChange('contactAlignment', 'center')}
                  className="flex-1 h-8 text-xs"
                >
                  <AlignCenter className="h-3 w-3 mr-1" />
                  Center
                </Button>
                <Button
                  size="sm"
                  variant={formatting.header.contactAlignment === 'right' ? 'default' : 'outline'}
                  onClick={() => handleHeaderChange('contactAlignment', 'right')}
                  className="flex-1 h-8 text-xs"
                >
                  <AlignRight className="h-3 w-3 mr-1" />
                  Right
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showDivider"
                checked={formatting.header.showDivider}
                onChange={(e) => handleHeaderChange('showDivider', e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="showDivider" className="text-xs text-gray-600">
                Show header divider line
              </label>
            </div>
          </div>
        </div>



      </div>
    </div>
  )
}