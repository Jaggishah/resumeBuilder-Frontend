import React, { useState, useMemo, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { GripVertical, Settings, Edit2, Check, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { 
  type DynamicSection, 
  updateSections
} from '../../redux/features/resumeSlice'
import { PersonalInfoSection } from './ResumeSections'
import { CustomSection } from './CustomSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Briefcase, GraduationCap, Code, Award, Languages, Globe, FileText } from 'lucide-react'

interface AccordionWrapperProps {
  onReorder: (reorderedSections: DynamicSection[]) => void
  onAddItem: (sectionId: string) => void
  onUpdateItem: (sectionId: string, itemId: string, field: string, value: string) => void
  onRemoveItem: (sectionId: string, itemId: string) => void
  onAddAchievement?: (sectionId: string, itemId: string) => void
  onUpdateAchievement?: (sectionId: string, itemId: string, index: number, value: string) => void
  onRemoveAchievement?: (sectionId: string, itemId: string, index: number) => void
  onRemoveSection: (sectionId: string) => void
  onUpdateSection?: (sectionId: string, data: Partial<DynamicSection>) => void
}

interface SortableAccordionItemProps {
  section: DynamicSection
  onAddItem: (sectionId: string) => void
  onUpdateItem: (sectionId: string, itemId: string, field: string, value: string) => void
  onRemoveItem: (sectionId: string, itemId: string) => void
  onAddAchievement?: (sectionId: string, itemId: string) => void
  onUpdateAchievement?: (sectionId: string, itemId: string, index: number, value: string) => void
  onRemoveAchievement?: (sectionId: string, itemId: string, index: number) => void
  onRemoveSection: (sectionId: string) => void
  onUpdateSection?: (sectionId: string, data: Partial<DynamicSection>) => void
}

const SortableAccordionItem = React.memo(({ 
  section, 
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onAddAchievement,
  onUpdateAchievement,
  onRemoveAchievement,
  onRemoveSection,
  onUpdateSection
}: SortableAccordionItemProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(section.title)

  const handleTitleEdit = () => {
    if (!section.isPersonal) {
      setIsEditingTitle(true)
      setEditedTitle(section.title)
    }
  }

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle.trim() !== section.title) {
      onUpdateSection?.(section.id, { title: editedTitle.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setEditedTitle(section.title)
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      handleTitleCancel()
    }
  }

  // Update local title state when section title changes from external sources
  useEffect(() => {
    setEditedTitle(section.title)
  }, [section.title])
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    disabled: section.isPersonal // Disable dragging for personal info
  })

  // Determine which icon to display based on section template
  const getIconForTemplate = (template: string) => {
    switch (template) {
      case 'personal_info':
        return <User className="h-5 w-5" />;
      case 'experience':
        return <Briefcase className="h-5 w-5" />;
      case 'education':
        return <GraduationCap className="h-5 w-5" />;
      case 'skills':
        return <Code className="h-5 w-5" />;
      case 'certifications':
        return <Award className="h-5 w-5" />;
      case 'languages':
        return <Languages className="h-5 w-5" />;
      case 'websites':
        return <Globe className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Set the content based on template type
  const renderContent = () => {
    switch (section.template) {
      case 'personal_info':
        return <PersonalInfoSection />;
      default:
        return (
          <CustomSection
            config={{
              title: section.title,
              hasDuration: section.hasDuration || false,
              hasAchievements: section.hasAchievements || false
            }}
            data={section.items || []}
            onAdd={() => onAddItem(section.id)}
            onUpdate={(itemId, field, value) => onUpdateItem(section.id, itemId, field, value)}
            onRemove={(itemId) => onRemoveItem(section.id, itemId)}
            onAddAchievement={onAddAchievement && ((itemId) => onAddAchievement(section.id, itemId))}
            onUpdateAchievement={onUpdateAchievement && ((itemId, index, value) => 
              onUpdateAchievement(section.id, itemId, index, value))}
            onRemoveAchievement={onRemoveAchievement && ((itemId, index) => 
              onRemoveAchievement(section.id, itemId, index))}
          />
        );
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <AccordionItem value={section.id} className="border rounded-lg mb-2 border-gray-400 [&:last-child]:border-b">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center space-x-3 w-full">
            {!section.isPersonal && (
              <div
                {...attributes}
                {...listeners}
                className="flex items-center cursor-grab hover:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
            )}
            <div className="flex items-center space-x-2 flex-1 text-left">
              {getIconForTemplate(section.template)}
              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    onBlur={handleTitleSave}
                    autoFocus
                    className="text-lg font-semibold h-8 px-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTitleSave()
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTitleCancel()
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg font-semibold">{section.title}</span>
                  {!section.isPersonal && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTitleEdit()
                      }}
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      title="Edit section name"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            {!section.isPersonal && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-red-500"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onRemoveSection(section.id);
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {renderContent()}
          
          {/* Section Configuration Controls - Only for non-personal sections */}
          {!section.isPersonal && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Section Configuration</h4>
                <Settings className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={section.hasDuration || false}
                    onChange={(e) => {
                      onUpdateSection?.(section.id, { hasDuration: e.target.checked })
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Has Duration/Date fields
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={section.hasAchievements || false}
                    onChange={(e) => {
                      onUpdateSection?.(section.id, { hasAchievements: e.target.checked })
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Has Achievements/Bullet points
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Configure whether this section should include duration fields and achievement lists for each entry.
              </p>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </div>
  )
})

export const AccordionWrapper = ({ 
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onAddAchievement,
  onUpdateAchievement,
  onRemoveAchievement,
  onRemoveSection,
  onUpdateSection
}: AccordionWrapperProps) => {
  const dispatch = useAppDispatch()
  const dynamicSections = useAppSelector(state => state.resume.dynamicSections)
  const [accordionValue, setAccordionValue] = useState<string>('personal-info')

  // Create personal info section (always first)
  const personalInfoSection: DynamicSection = useMemo(() => ({
    id: 'personal-info',
    title: 'Personal Information',
    template: 'personal_info',
    hasDuration: false,
    hasAchievements: false,
    isPersonal: true,
    items: []
  }), [])

  // All sections including personal info
  const allSections = useMemo(() => [personalInfoSection, ...dynamicSections], [personalInfoSection, dynamicSections])

  // Removed handleAddSection - now moved to ResumeEditor

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = dynamicSections.findIndex((section) => section.id === active.id)
      const newIndex = dynamicSections.findIndex((section) => section.id === over?.id)

      const newSections = arrayMove(dynamicSections, oldIndex, newIndex)
      dispatch(updateSections(newSections))
    }
  }

  // Separate personal info from draggable sections
  const personalInfo = allSections.find(section => section.isPersonal)
  const draggableSections = allSections.filter(section => !section.isPersonal)
  const sortableIds = draggableSections.map(section => section.id)

  return (
    <div className="space-y-4">
      {/* Personal Info - Always first, not draggable */}
      {personalInfo && (
        <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue}>
          <SortableAccordionItem 
            section={personalInfo}
            onAddItem={onAddItem}
            onUpdateItem={onUpdateItem}
            onRemoveItem={onRemoveItem}
            onAddAchievement={onAddAchievement}
            onUpdateAchievement={onUpdateAchievement}
            onRemoveAchievement={onRemoveAchievement}
            onRemoveSection={onRemoveSection}
            onUpdateSection={onUpdateSection}
          />
        </Accordion>
      )}

      {/* Draggable sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue}>
            {draggableSections.map((section) => (
              <SortableAccordionItem
                key={section.id}
                section={section}
                onAddItem={onAddItem}
                onUpdateItem={onUpdateItem}
                onRemoveItem={onRemoveItem}
                onAddAchievement={onAddAchievement}
                onUpdateAchievement={onUpdateAchievement}
                onRemoveAchievement={onRemoveAchievement}
                onRemoveSection={onRemoveSection}
                onUpdateSection={onUpdateSection}
              />
            ))}
          </Accordion>
        </SortableContext>
      </DndContext>

    </div>
  )
}