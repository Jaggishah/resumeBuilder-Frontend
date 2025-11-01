import { useAppSelector, useAppDispatch } from '../../redux/hooks'
import { AccordionWrapper } from './AccordionWrapper'
import { AddSectionDialog } from './AddSectionDialog'
import { 
  type DynamicSection,
  type SectionItem,
  addDynamicSection,
  addSectionItem,
  updateSectionItem,
  removeSectionItem,
  removeDynamicSection,
  updateDynamicSection
} from '../../redux/features/resumeSlice'
import QuickSelection from './QuickSelection'
export function ResumeEditor() {
  const dispatch = useAppDispatch()
  const dynamicSections = useAppSelector(state => state.resume.dynamicSections)

  const handleSectionReorder = (reorderedSections: DynamicSection[]) => {
    console.log('Sections reordered:', reorderedSections.map(s => s.title))
    // TODO: Save order to state if needed
  }

  // Add Section functionality
  const handleAddSection = (sectionConfig: {
    id: string
    title: string
    template: string
    hasDuration: boolean
    hasAchievements: boolean
  }) => {
    const newSection: DynamicSection = {
      id: sectionConfig.id,
      title: sectionConfig.title,
      template: sectionConfig.template,
      hasDuration: sectionConfig.hasDuration,
      hasAchievements: sectionConfig.hasAchievements,
      isPersonal: false,
      items: []
    }
    dispatch(addDynamicSection(newSection))
  }

  // Section item management
  const handleAddItem = (sectionId: string) => {
    const newItem: SectionItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      achievements: []
    }
    
    dispatch(addSectionItem({ sectionId, item: newItem }))
  }

  const handleUpdateItem = (sectionId: string, itemId: string, field: string, value: string) => {
    dispatch(updateSectionItem({
      sectionId,
      itemId,
      data: { [field]: value }
    }))
  }

  const handleRemoveItem = (sectionId: string, itemId: string) => {
    dispatch(removeSectionItem({ sectionId, itemId }))
  }

  const handleAddAchievement = (sectionId: string, itemId: string) => {
    const sectionItem = dynamicSections
      .find(section => section.id === sectionId)?.items
      ?.find(item => item.id === itemId)

    if (sectionItem) {
      const achievements = [...(sectionItem.achievements || []), '']
      dispatch(updateSectionItem({
        sectionId,
        itemId,
        data: { achievements }
      }))
    }
  }

  const handleUpdateAchievement = (sectionId: string, itemId: string, index: number, value: string) => {
    const sectionItem = dynamicSections
      .find(section => section.id === sectionId)?.items
      ?.find(item => item.id === itemId)

    if (sectionItem && sectionItem.achievements) {
      const achievements = [...sectionItem.achievements]
      achievements[index] = value
      dispatch(updateSectionItem({
        sectionId,
        itemId,
        data: { achievements }
      }))
    }
  }

  const handleRemoveAchievement = (sectionId: string, itemId: string, index: number) => {
    const sectionItem = dynamicSections
      .find(section => section.id === sectionId)?.items
      ?.find(item => item.id === itemId)

    if (sectionItem && sectionItem.achievements) {
      const achievements = sectionItem.achievements.filter((_: string, i: number) => i !== index)
      dispatch(updateSectionItem({
        sectionId,
        itemId,
        data: { achievements }
      }))
    }
  }

  const handleRemoveSection = (sectionId: string) => {
    dispatch(removeDynamicSection(sectionId))
  }

  const handleUpdateSection = (sectionId: string, data: Partial<DynamicSection>) => {
    dispatch(updateDynamicSection({ id: sectionId, data }))
    
    // If hasAchievements is being enabled, ensure all items have achievements array
    if (data.hasAchievements === true) {
      const section = dynamicSections.find(s => s.id === sectionId)
      if (section) {
        section.items.forEach(item => {
          if (!item.achievements) {
            dispatch(updateSectionItem({
              sectionId,
              itemId: item.id,
              data: { achievements: [] }
            }))
          }
        })
      }
    }
  }

  return (
    // Constrain editor height so preview stays visible; make it scrollable when content overflows
    <div className="p-6 max-w-full" style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
      <AccordionWrapper 
        onReorder={handleSectionReorder}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={handleRemoveItem}
        onAddAchievement={handleAddAchievement}
        onUpdateAchievement={handleUpdateAchievement}
        onRemoveAchievement={handleRemoveAchievement}
        onRemoveSection={handleRemoveSection}
        onUpdateSection={handleUpdateSection}
      />

      {/* Add Section Button at the bottom */}
      <div className="flex flex-col gap-4 items-center mt-6">
        <QuickSelection 
          handleAddSection={handleAddSection}
          existingSections={dynamicSections}
        />
        
        <div className="mt-3">
          <AddSectionDialog 
            onAddSection={handleAddSection} 
            existingSections={dynamicSections}
          />
        </div>
      </div>
    </div>
  )
}