import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Briefcase, GraduationCap, Award, Code, FolderOpen, User } from 'lucide-react'
import type { DynamicSection } from '../../redux/features/resumeSlice'

// Section templates
export const SECTION_TEMPLATES = {
  experience: {
    id: 'experience',
    name: 'Experience',
    icon: Briefcase,
    description: 'Work experience with duration and achievements',
    hasDuration: true,
    hasAchievements: true,
    fields: ['company', 'position', 'location', 'description']
  },
  education: {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    description: 'Educational background',
    hasDuration: true,
    hasAchievements: false,
    fields: ['institution', 'degree', 'field', 'gpa']
  },
  skills: {
    id: 'skills',
    name: 'Skills',
    icon: Code,
    description: 'Technical and soft skills',
    hasDuration: false,
    hasAchievements: false,
    fields: ['category', 'skillsList']
  },
  certifications: {
    id: 'certifications',
    name: 'Certifications',
    icon: Award,
    description: 'Professional certifications and licenses',
    hasDuration: false,
    hasAchievements: false,
    fields: ['name', 'issuer', 'date', 'description']
  },
  projects: {
    id: 'projects',
    name: 'Projects',
    icon: FolderOpen,
    description: 'Personal and professional projects',
    hasDuration: false,
    hasAchievements: true,
    fields: ['name', 'technologies', 'url', 'description']
  },
  custom: {
    id: 'custom',
    name: 'Custom Section',
    icon: User,
    description: 'Create your own section type',
    hasDuration: false,
    hasAchievements: false,
    fields: []
  }
}

interface AddSectionDialogProps {
  onAddSection: (sectionData: {
    id: string
    title: string
    template: string
    hasDuration: boolean
    hasAchievements: boolean
  }) => void
  existingSections: DynamicSection[]
  trigger?: React.ReactNode
}

export const AddSectionDialog = ({ onAddSection, existingSections, trigger }: AddSectionDialogProps) => {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [customHasDuration, setCustomHasDuration] = useState(false)
  const [customHasAchievements, setCustomHasAchievements] = useState(false)

  // Filter out sections that already exist (excluding personal_info)
  const existingTemplates = existingSections
    .filter(section => section.template !== 'personal_info')
    .map(section => section.template.toLowerCase())
  
  // Filter available templates to exclude existing ones
  const availableTemplates = Object.entries(SECTION_TEMPLATES).filter(([key]) => {
    // Always allow custom sections and exclude existing templates (except custom)
    return key === 'custom' || !existingTemplates.includes(key.toLowerCase())
  })

  const handleAddSection = () => {
    if (!selectedTemplate) return

    const template = SECTION_TEMPLATES[selectedTemplate as keyof typeof SECTION_TEMPLATES]
    
    let sectionData = {
      id: Date.now().toString(),
      title: template.name,
      template: selectedTemplate,
      hasDuration: template.hasDuration,
      hasAchievements: template.hasAchievements
    }

    // If custom section, use custom values
    if (selectedTemplate === 'custom') {
      if (!customTitle.trim()) return
      sectionData = {
        ...sectionData,
        title: customTitle.trim(),
        hasDuration: customHasDuration,
        hasAchievements: customHasAchievements
      }
    }

    onAddSection(sectionData)
    
    // Reset form
    setSelectedTemplate('')
    setCustomTitle('')
    setCustomHasDuration(false)
    setCustomHasAchievements(false)
    setOpen(false)
  }

  // Get template data, but for custom sections use dynamic data based on checkboxes
  const selectedTemplateData = selectedTemplate ? SECTION_TEMPLATES[selectedTemplate as keyof typeof SECTION_TEMPLATES] : null
  
  // Create dynamic preview data for custom sections
  const previewData = useMemo(() => {
    console.log('Selected Template:', selectedTemplate)
    if (selectedTemplate === 'custom') {
      return {
        ...SECTION_TEMPLATES.custom,
        hasDuration: customHasDuration,
        hasAchievements: customHasAchievements
      }
    }
    return selectedTemplateData
  }, [selectedTemplate, selectedTemplateData, customHasDuration, customHasAchievements])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            Choose a section type or create a custom one to add to your resume.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Section Type</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a section type" />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map(([key, template]) => {
                  const IconComponent = template.icon
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{template.name}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Template Preview */}
          {previewData && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <previewData.icon className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">{previewData.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{previewData.description}</p>
              
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded ${previewData.hasDuration ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {previewData.hasDuration ? '✓ Has Duration' : '✗ No Duration'}
                  </span>
                  <span className={`px-2 py-1 rounded ${previewData.hasAchievements ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {previewData.hasAchievements ? '✓ Has Achievements' : '✗ No Achievements'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Custom Section Options */}
          {selectedTemplate === 'custom' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Custom Section Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="customTitle">Section Title</Label>
                <Input
                  id="customTitle"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Volunteering, Languages, Publications"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="customDuration"
                    checked={customHasDuration}
                    onChange={(e) => setCustomHasDuration(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="customDuration" className="text-sm">
                    Include duration fields (start/end dates)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="customAchievements"
                    checked={customHasAchievements}
                    onChange={(e) => setCustomHasAchievements(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="customAchievements" className="text-sm">
                    Include achievements/bullet points
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddSection}
            disabled={!selectedTemplate || (selectedTemplate === 'custom' && !customTitle.trim())}
          >
            Add Section
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}