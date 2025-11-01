import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Minus } from 'lucide-react'
import { useCallback } from 'react'
import { AIEnhanceButton } from './AIEnhanceButton'
import { AICustomPromptButton } from './AICustomPromptButton'

// Section item interface
interface SectionItem {
  id: string
  [key: string]: any
}

// Section configuration
interface SectionConfig {
  title: string
  hasDuration: boolean
  hasAchievements: boolean
}

interface CustomSectionProps {
  config: SectionConfig
  data: SectionItem[]
  onAdd: () => void
  onUpdate: (id: string, field: string, value: string) => void
  onRemove: (id: string) => void
  onAddAchievement?: (id: string) => void
  onUpdateAchievement?: (id: string, index: number, value: string) => void
  onRemoveAchievement?: (id: string, index: number) => void
}

export const CustomSection = ({
  config,
  data,
  onAdd,
  onUpdate,
  onRemove,
  onAddAchievement,
  onUpdateAchievement,
  onRemoveAchievement
}: CustomSectionProps) => {
  const renderBasicFields = useCallback((item: SectionItem) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <Input
          value={item.title || ''}
          onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
          placeholder="Enter title..."
        />
      </div>
      
      {config.hasDuration && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
          <Input
            value={item.duration || ''}
            onChange={(e) => onUpdate(item.id, 'duration', e.target.value)}
            placeholder="Jan 2020 - Present"
          />
        </div>
      )}
      
      <div className={config.hasDuration ? '' : 'md:col-span-2'}>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <div className="flex gap-2">
            <AIEnhanceButton
              content={item.description || ''}
              sectionName={`description_${config.title.toLowerCase().replace(/\s+/g, '_')}`}
              onEnhanced={(enhanced) => onUpdate(item.id, 'description', enhanced)}
              variant="ghost"
              size="sm"
            />
            <AICustomPromptButton
              content={item.description || ''}
              sectionName={`description_${config.title.toLowerCase().replace(/\s+/g, '_')}`}
              onEnhanced={(enhanced) => onUpdate(item.id, 'description', enhanced)}
              variant="ghost"
              size="sm"
            />
          </div>
        </div>
        <Textarea
          value={item.description || ''}
          onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
          placeholder="Enter description..."
          rows={3}
        />
      </div>
    </div>
  ), [config.hasDuration, onUpdate])

  const renderAchievements = useCallback((item: SectionItem) => {
    if (!config.hasAchievements) return null

    const achievements = item.achievements || []

    return (
      <div className="space-y-3 mt-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">Achievements</label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onAddAchievement?.(item.id)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Achievement
          </Button>
        </div>
        
        {achievements.map((achievement: string, index: number) => (
          <div key={`${item.id}-achievement-${index}`} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Achievement {index + 1}</span>
              <div className="flex gap-2">
                <AIEnhanceButton
                  content={achievement}
                  sectionName={`achievement_${config.title.toLowerCase().replace(/\s+/g, '_')}`}
                  onEnhanced={(enhanced) => onUpdateAchievement?.(item.id, index, enhanced)}
                  variant="ghost"
                  size="sm"
                />
                <AICustomPromptButton
                  content={achievement}
                  sectionName={`achievement_${config.title.toLowerCase().replace(/\s+/g, '_')}`}
                  onEnhanced={(enhanced) => onUpdateAchievement?.(item.id, index, enhanced)}
                  variant="ghost"
                  size="sm"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveAchievement?.(item.id, index)}
                  className="self-start"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={achievement}
              onChange={(e) => onUpdateAchievement?.(item.id, index, e.target.value)}
              placeholder="Describe an achievement..."
              rows={2}
              className="w-full"
            />
          </div>
        ))}
        
        {achievements.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No achievements added yet.
          </p>
        )}
      </div>
    )
  }, [config.hasAchievements, onAddAchievement, onUpdateAchievement, onRemoveAchievement])

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add {config.title}
        </Button>
      </div>
      
      <div className="space-y-6">
        {data.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900">{config.title} Entry</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
            
            {renderBasicFields(item)}
            {renderAchievements(item)}
          </div>
        ))}
        
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No {config.title.toLowerCase()} entries yet.</p>
            <p className="text-sm">Click "Add {config.title}" to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}