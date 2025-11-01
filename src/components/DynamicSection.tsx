import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Minus } from 'lucide-react'
import { AIEnhanceButton } from './AIEnhanceButton'
import { AICustomPromptButton } from './AICustomPromptButton'

// Base interface for all dynamic section items
interface BaseSectionItem {
  id: string
}

// Field configuration for different input types
interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'email' | 'url' | 'date'
  placeholder: string
  required?: boolean
  rows?: number // for textarea
}

// Section type definitions
interface SectionType {
  id: string
  title: string
  fields: FieldConfig[]
  allowMultiple: boolean
  hasAchievements?: boolean
}

// Dynamic section item interface
interface DynamicSectionItem extends BaseSectionItem {
  [key: string]: any
  achievements?: string[]
}

interface DynamicSectionProps {
  sectionType: SectionType
  data: DynamicSectionItem[]
  onAdd: () => void
  onUpdate: (id: string, field: string, value: string | string[]) => void
  onRemove: (id: string) => void
  onAddAchievement?: (id: string) => void
  onUpdateAchievement?: (id: string, achievementIndex: number, value: string) => void
  onRemoveAchievement?: (id: string, achievementIndex: number) => void
}

export const DynamicSection = ({
  sectionType,
  data,
  onAdd,
  onUpdate,
  onRemove,
  onAddAchievement,
  onUpdateAchievement,
  onRemoveAchievement
}: DynamicSectionProps) => {
  const renderField = (item: DynamicSectionItem, field: FieldConfig) => {
    const value = item[field.key] || ''
    
    if (field.type === 'textarea') {
      return (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            <div className="flex gap-2">
              <AIEnhanceButton
                content={value}
                sectionName={`${field.key}_${sectionType.id}`}
                onEnhanced={(enhanced) => onUpdate(item.id, field.key, enhanced)}
                variant="ghost"
                size="sm"
              />
              <AICustomPromptButton
                content={value}
                sectionName={`${field.key}_${sectionType.id}`}
                onEnhanced={(enhanced) => onUpdate(item.id, field.key, enhanced)}
                variant="ghost"
                size="sm"
              />
            </div>
          </div>
          <Textarea
            value={value}
            onChange={(e) => onUpdate(item.id, field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
          />
        </div>
      )
    }
    
    return (
      <Input
        type={field.type}
        value={value}
        onChange={(e) => onUpdate(item.id, field.key, e.target.value)}
        placeholder={field.placeholder}
      />
    )
  }

  const renderAchievements = (item: DynamicSectionItem) => {
    if (!sectionType.hasAchievements || !item.achievements) return null

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">Achievements/Responsibilities</label>
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
        
        {item.achievements.map((achievement, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Achievement {index + 1}</span>
              <div className="flex gap-2">
                <AIEnhanceButton
                  content={achievement}
                  sectionName={`achievement_${sectionType.id}`}
                  onEnhanced={(enhanced) => onUpdateAchievement?.(item.id, index, enhanced)}
                  variant="ghost"
                  size="sm"
                />
                <AICustomPromptButton
                  content={achievement}
                  sectionName={`achievement_${sectionType.id}`}
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
              placeholder="Describe an achievement or responsibility..."
              rows={2}
              className="w-full"
            />
          </div>
        ))}
        
        {item.achievements.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No achievements added. Click "Add Achievement" to add responsibilities or accomplishments.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add {sectionType.title}
        </Button>
      </div>
      
      <div className="space-y-6">
        {data.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900">{sectionType.title} Entry</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Regular fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionType.fields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(item, field)}
                </div>
              ))}
            </div>
            
            {/* Achievements section */}
            {renderAchievements(item)}
          </div>
        ))}
        
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No {sectionType.title.toLowerCase()} entries yet.</p>
            <p className="text-sm">Click "Add {sectionType.title}" to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}


// Helper function to create a new item for a section type
export const createNewSectionItem = (sectionType: SectionType): DynamicSectionItem => {
  const newItem: DynamicSectionItem = {
    id: Date.now().toString()
  }
  
  // Initialize all fields with empty values
  sectionType.fields.forEach(field => {
    newItem[field.key] = field.type === 'textarea' ? '' : ''
  })
  
  // Add achievements array if needed
  if (sectionType.hasAchievements) {
    newItem.achievements = []
  }
  
  return newItem
}