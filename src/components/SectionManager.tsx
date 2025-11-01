import { useState } from 'react'
import { AddSectionDialog } from './AddSectionDialog'
import { CustomSection } from './CustomSection'
import { Button } from '@/components/ui/button'

// Example of how to use the AddSectionDialog and CustomSection components
interface SectionData {
  id: string
  title: string
  hasDuration: boolean
  hasAchievements: boolean
  items: any[]
}

export const SectionManager = () => {
  const [sections, setSections] = useState<SectionData[]>([])

  const handleAddSection = (sectionConfig: {
    id: string
    title: string
    template: string
    hasDuration: boolean
    hasAchievements: boolean
  }) => {
    const newSection: SectionData = {
      id: sectionConfig.id,
      title: sectionConfig.title,
      hasDuration: sectionConfig.hasDuration,
      hasAchievements: sectionConfig.hasAchievements,
      items: []
    }
    setSections(prev => [...prev, newSection])
  }

  const handleAddItem = (sectionId: string) => {
    const newItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      achievements: []
    }
    
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, items: [...section.items, newItem] }
        : section
    ))
  }

  const handleUpdateItem = (sectionId: string, itemId: string, field: string, value: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId
        ? {
            ...section,
            items: section.items.map(item =>
              item.id === itemId ? { ...item, [field]: value } : item
            )
          }
        : section
    ))
  }

  const handleRemoveItem = (sectionId: string, itemId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId
        ? { ...section, items: section.items.filter(item => item.id !== itemId) }
        : section
    ))
  }

  const handleAddAchievement = (sectionId: string, itemId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId
        ? {
            ...section,
            items: section.items.map(item =>
              item.id === itemId 
                ? { ...item, achievements: [...(item.achievements || []), ''] }
                : item
            )
          }
        : section
    ))
  }

  const handleUpdateAchievement = (sectionId: string, itemId: string, index: number, value: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId
        ? {
            ...section,
            items: section.items.map(item =>
              item.id === itemId 
                ? {
                    ...item,
                    achievements: item.achievements.map((ach: string, i: number) => 
                      i === index ? value : ach
                    )
                  }
                : item
            )
          }
        : section
    ))
  }

  const handleRemoveAchievement = (sectionId: string, itemId: string, index: number) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId
        ? {
            ...section,
            items: section.items.map(item =>
              item.id === itemId 
                ? {
                    ...item,
                    achievements: item.achievements.filter((_: any, i: number) => i !== index)
                  }
                : item
            )
          }
        : section
    ))
  }

  const handleRemoveSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId))
  }

  return (
    <div className="space-y-6">
      {/* Add Section Button */}
      <div className="flex justify-center">
        <AddSectionDialog onAddSection={handleAddSection} />
      </div>

      {/* Render all sections */}
      {sections.map((section) => (
        <div key={section.id} className="border border-gray-300 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleRemoveSection(section.id)}
            >
              Remove Section
            </Button>
          </div>
          
          <CustomSection
            config={{
              title: section.title,
              hasDuration: section.hasDuration,
              hasAchievements: section.hasAchievements
            }}
            data={section.items}
            onAdd={() => handleAddItem(section.id)}
            onUpdate={(itemId, field, value) => handleUpdateItem(section.id, itemId, field, value)}
            onRemove={(itemId) => handleRemoveItem(section.id, itemId)}
            onAddAchievement={(itemId) => handleAddAchievement(section.id, itemId)}
            onUpdateAchievement={(itemId, index, value) => handleUpdateAchievement(section.id, itemId, index, value)}
            onRemoveAchievement={(itemId, index) => handleRemoveAchievement(section.id, itemId, index)}
          />
        </div>
      ))}

      {/* {sections.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No sections added yet</p>
          <p className="text-sm">Click "Add Section" above to get started</p>
        </div>
      )} */}
    </div>
  )
}

export default SectionManager