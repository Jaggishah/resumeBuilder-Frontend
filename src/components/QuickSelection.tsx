import React from 'react'
import type { DynamicSection } from '../../redux/features/resumeSlice'

interface QuickSelectionProps {
  handleAddSection: (sectionConfig: {
    id: string
    title: string
    template: string
    hasDuration: boolean
    hasAchievements: boolean
  }) => void
  existingSections: DynamicSection[]
}

const QuickSelection: React.FC<QuickSelectionProps> = ({ handleAddSection, existingSections }) => {
  // Filter out sections that already exist (excluding personal_info)
  const existingTemplates = existingSections
    .filter(section => section.template !== 'personal_info')
    .map(section => section.template.toLowerCase())
  
  // Check if a section type already exists
  const sectionExists = (template: string) => {
    return existingTemplates.includes(template.toLowerCase())
  }

  // Check if any quick sections are available
  const hasAvailableSections = !sectionExists('education') || 
                               !sectionExists('experience') || 
                               !sectionExists('skills') || 
                               !sectionExists('certifications') || 
                               !sectionExists('projects')

  if (!hasAvailableSections) {
    return (
      <div className="text-center text-gray-500 text-sm">
        All quick sections have been added. Use "Add Section" for custom sections.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {!sectionExists('education') && (
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => handleAddSection({
            id: `education-${Date.now()}`,
            title: "Education",
            template: "education",
            hasDuration: true,
            hasAchievements: false
          })}
        >
          + Education
        </button>
      )}
      
      {!sectionExists('experience') && (
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => handleAddSection({
            id: `experience-${Date.now()}`,
            title: "Experience",
            template: "experience",
            hasDuration: true,
            hasAchievements: true
          })}
        >
          + Experience
        </button>
      )}
      
      {!sectionExists('skills') && (
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => handleAddSection({
            id: `skills-${Date.now()}`,
            title: "Skills",
            template: "skills",
            hasDuration: false,
            hasAchievements: false
          })}
        >
          + Skills
        </button>
      )}
      
      {!sectionExists('certifications') && (
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => handleAddSection({
            id: `certifications-${Date.now()}`,
            title: "Certifications",
            template: "certifications",
            hasDuration: false,
            hasAchievements: false
          })}
        >
          + Certifications
        </button>
      )}
      
      {!sectionExists('projects') && (
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => handleAddSection({
            id: `projects-${Date.now()}`,
            title: "Projects",
            template: "projects",
            hasDuration: false,
            hasAchievements: true
          })}
        >
          + Projects
        </button>
      )}
    </div>
  )
}

export default QuickSelection
