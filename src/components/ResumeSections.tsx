import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Minus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { useCallback } from 'react'
import { type PersonalInfo, addLink, removeLink, updatePersonalInfo } from '../../redux/features/resumeSlice'
import { AIEnhanceButton } from './AIEnhanceButton'
import { AICustomPromptButton } from './AICustomPromptButton'

// Type-safe field configuration
type StringField = keyof Pick<PersonalInfo, 'name' | 'email' | 'phone' | 'location' | 'linkedin' | 'github' | 'summary'>

interface FieldConfig {
  id: StringField
  label: string
  type?: string
  placeholder: string
}

// Move field definitions outside component to prevent re-creation on every render
const basicFields: FieldConfig[] = [
  { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
  { id: 'phone', label: 'Phone', type: 'text', placeholder: '+1 (555) 123-4567' },
  { id: 'location', label: 'Location', type: 'text', placeholder: 'City, State' }
]

const socialFields: FieldConfig[] = [
  { id: 'linkedin', label: 'LinkedIn Profile', placeholder: 'https://www.linkedin.com/in/your-profile' },
  { id: 'github', label: 'GitHub Profile', placeholder: 'https://github.com/yourusername' }
]

export const PersonalInfoSection = () => {
  const dispatch = useAppDispatch()
  const personalInfo: PersonalInfo = useAppSelector(state => state.resume.personalInfo)

  const onUpdate = useCallback((field: StringField, value: string) => {
    dispatch(updatePersonalInfo({ [field]: value }))
  }, [dispatch])

  const onAddLink = useCallback(() => {
    const newLink = { id: Date.now().toString(), label: '', url: '' }
    dispatch(addLink(newLink))
  }, [dispatch])

  const onRemoveLink = useCallback((id: string) => {
    dispatch(removeLink(id))
  }, [dispatch])

  const onUpdateLink = useCallback((id: string, field: 'label' | 'url', value: string) => {
    const updatedLinks = personalInfo.additionalLinks.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    )
    dispatch(updatePersonalInfo({ additionalLinks: updatedLinks }))
  }, [dispatch, personalInfo.additionalLinks])

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {basicFields.map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            <Input
              type={field.type || 'text'}
              value={personalInfo[field.id]}
              onChange={(e) => onUpdate(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      {/* Professional Links */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Professional Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialFields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <Input
                value={personalInfo[field.id]}
                onChange={(e) => onUpdate(field.id, e.target.value)}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Additional Links */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700">Additional Links</h3>
          <Button onClick={onAddLink} size="sm" >
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </div>

        {personalInfo?.additionalLinks?.length > 0 && (
          <div className="space-y-3">
            {personalInfo?.additionalLinks?.map((link) => (
              <div key={link.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-600">Additional Link</span>
                  <Button variant="destructive" size="sm" onClick={() => onRemoveLink(link.id)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                    <Input
                      value={link.label}
                      onChange={(e) => onUpdateLink(link.id, 'label', e.target.value)}
                      placeholder="Portfolio, Website, Blog..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
                    <Input
                      value={link.url}
                      onChange={(e) => onUpdateLink(link.id, 'url', e.target.value)}
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {personalInfo?.additionalLinks?.length === 0 && (
          <p className="text-sm text-gray-500 italic">
             Click "Add Link" to add portfolio, website, or other professional links.
          </p>
        )}
      </div>

      {/* Professional Summary */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
          <div className="flex gap-2">
            <AIEnhanceButton
              content={personalInfo.summary}
              sectionName="summary_resume"
              onEnhanced={(enhanced) => onUpdate('summary', enhanced)}
              variant="outline"
              size="sm"
            />
            <AICustomPromptButton
              content={personalInfo.summary}
              sectionName="summary_resume"
              onEnhanced={(enhanced) => onUpdate('summary', enhanced)}
              variant="outline"
              size="sm"
            />
          </div>
        </div>
        <Textarea
          value={personalInfo.summary}
          onChange={(e) => onUpdate('summary', e.target.value)}
          placeholder="Write a brief summary about yourself..."
          rows={4}
        />
      </div>
    </div>
  )
}



interface ExperienceData {
  id: string
  company: string
  position: string
  duration: string
  description: string
}

interface ExperienceSectionProps {
  data: ExperienceData[]
  onAdd: () => void
  onUpdate: (id: string, field: string, value: string) => void
  onRemove: (id: string) => void
}

export const ExperienceSection = ({ data, onAdd, onUpdate, onRemove }: ExperienceSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>
      <div className="space-y-6">
        {data.map((exp) => (
          <div key={exp.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900">Experience Entry</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(exp.id)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <Input
                  value={exp.company}
                  onChange={(e) => onUpdate(exp.id, 'company', e.target.value)}
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <Input
                  value={exp.position}
                  onChange={(e) => onUpdate(exp.id, 'position', e.target.value)}
                  placeholder="Job Title"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <Input
                value={exp.duration}
                onChange={(e) => onUpdate(exp.id, 'duration', e.target.value)}
                placeholder="Jan 2020 - Present"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={exp.description}
                onChange={(e) => onUpdate(exp.id, 'description', e.target.value)}
                placeholder="Describe your responsibilities and achievements..."
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface EducationData {
  id: string
  school: string
  degree: string
  year: string
}

interface EducationSectionProps {
  data: EducationData[]
  onAdd: () => void
  onUpdate: (id: string, field: string, value: string) => void
  onRemove: (id: string) => void
}

export const EducationSection = ({ data, onAdd, onUpdate, onRemove }: EducationSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>
      <div className="space-y-4">
        {data.map((edu) => (
          <div key={edu.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900">Education Entry</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(edu.id)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School/University</label>
                <Input
                  value={edu.school}
                  onChange={(e) => onUpdate(edu.id, 'school', e.target.value)}
                  placeholder="University Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                <Input
                  value={edu.degree}
                  onChange={(e) => onUpdate(edu.id, 'degree', e.target.value)}
                  placeholder="Bachelor of Science"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <Input
                value={edu.year}
                onChange={(e) => onUpdate(edu.id, 'year', e.target.value)}
                placeholder="2020"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}