import { useState, useRef } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAppDispatch } from '../../redux/hooks'
import { 
  updatePersonalInfo, 
  updateSections,
  type DynamicSection 
} from '../../redux/features/resumeSlice'


import { useUploadResumeMutation } from '../../redux/features/api/apiSlice';

interface ImportDialogProps {
  trigger?: React.ReactNode
}

export function ImportDialog({ trigger }: ImportDialogProps) {
    const [uploadResume] = useUploadResumeMutation()
    const [open, setOpen] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dispatch = useAppDispatch()

  // Function to parse and populate resume data from uploaded JSON
  const populateResumeFromJSON = (jsonData: any) => {
    try {
      // Update personal information
      const personalInfo = {
        name: jsonData.name || '',
        email: jsonData.email || '',
        phone: jsonData.phone || '',
        location: jsonData.location || '',
        summary: Array.isArray(jsonData.summary) ? jsonData.summary.join('\n') : (jsonData.summary || ''),
        linkedin: jsonData.linkedin || '',
        github: jsonData.github || '',
        additionalLinks: jsonData.website ? [{ id: '1', label: 'Website', url: jsonData.website }] : []
      }
      
      dispatch(updatePersonalInfo(personalInfo))

      // Create dynamic sections based on the sections array
      const newSections: DynamicSection[] = []
      const availableSections = jsonData.section || []

      // Helper function to get section configuration
      const getSectionConfig = (sectionType: string) => {
        const configs: Record<string, { title: string; template: string; hasDuration: boolean; hasAchievements: boolean }> = {
          experience: { title: 'Work Experience', template: 'experience', hasDuration: true, hasAchievements: true },
          education: { title: 'Education', template: 'education', hasDuration: true, hasAchievements: false },
          skills: { title: 'Technical Skills', template: 'skills', hasDuration: false, hasAchievements: false },
          projects: { title: 'Projects', template: 'projects', hasDuration: true, hasAchievements: true },
          certifications: { title: 'Certifications', template: 'certifications', hasDuration: true, hasAchievements: false },
          // Add more section types as needed
          achievements: { title: 'Achievements', template: 'achievements', hasDuration: false, hasAchievements: true },
          publications: { title: 'Publications', template: 'publications', hasDuration: true, hasAchievements: false },
          awards: { title: 'Awards', template: 'awards', hasDuration: true, hasAchievements: false },
          languages: { title: 'Languages', template: 'languages', hasDuration: false, hasAchievements: false },
          volunteer: { title: 'Volunteer Experience', template: 'volunteer', hasDuration: true, hasAchievements: true },
          interests: { title: 'Interests', template: 'interests', hasDuration: false, hasAchievements: false }
        }
        return configs[sectionType] || { title: sectionType.charAt(0).toUpperCase() + sectionType.slice(1), template: sectionType, hasDuration: false, hasAchievements: false }
      }

      // Helper function to map section data generically
      const mapSectionData = (sectionType: string, sectionData: any[]) => {
        if (!sectionData || !Array.isArray(sectionData)) return []

        return sectionData.map((item: any, index: number) => ({
          id: `${sectionType}_${index + 1}`,
          title: item.title || '',
          company: item.company || item.issuer || item.institution || item.organization || '',
          duration: item.duration || '',
          location: item.location || '',
          description: item.description || '',
          achievements: item.achievements || []
        }))
      }

      // Process each section dynamically
      availableSections.forEach((sectionType: string) => {
        console.log('Processing section:', sectionType)
        const sectionData = jsonData[sectionType]
        if (!sectionData) return

        const config = getSectionConfig(sectionType)
        let items: any[] = []

        // Special handling for skills section (object format)
        if (sectionType === 'skills' && typeof sectionData === 'object' && !Array.isArray(sectionData)) {
          items = Object.entries(sectionData).map(([category, skills], index) => ({
            id: `skill_${index + 1}`,
            title: category,
            description: skills as string,
            company: '',
            duration: '',
            location: '',
            achievements: []
          }))
        } else {
          items = mapSectionData(sectionType, sectionData)
        }

        if (items.length > 0) {
          const section: DynamicSection = {
            id: `${sectionType}_imported`,
            title: config.title,
            template: config.template,
            hasDuration: config.hasDuration,
            hasAchievements: config.hasAchievements,
            isPersonal: false,
            items
          }
          newSections.push(section)
        }
      })
   
      // Update the sections in Redux
      dispatch(updateSections(newSections))

      console.log('Resume data populated successfully:', {
        personalInfo,
        sectionsCount: newSections.length,
        importedSections: availableSections
      })

    } catch (error) {
      console.error('Error parsing resume data:', error)
      alert('Error parsing resume data. Please check the format and try again.')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const file = files[0]
    
    if (file && (file.type === 'application/pdf')) {
      setUploadedFile(file)
      processFile(file)
    } else {
      alert('Please upload a PDF.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      processFile(file)
    }
  }

  const processFile = async (file: File) => {
    setIsUploading(true)
    
    try {
      const response = await uploadResume({ 
        file 
      }).unwrap()
      
      // Handle successful response
      if (response && response.json_data) {
        // Populate the resume data from the uploaded JSON
        populateResumeFromJSON(response.json_data)
    
        // Reset file state
        setUploadedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        // Close dialog and show success message
        setOpen(false)
        alert('Resume imported successfully!')
      }
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Error processing file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Resume
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Resume</DialogTitle>
          <DialogDescription>
            Upload your existing resume in PDF.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className="space-y-2">
                <FileText className="h-12 w-12 text-green-600 mx-auto" />
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{uploadedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {isUploading ? 'Processing...' : 'File uploaded successfully'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Drop your resume here</p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                </div>
                <p className="text-xs text-gray-400">Supports PDF and Word documents</p>
              </div>
            )}
          </div>
          
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* Browse Button */}
          {!uploadedFile && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
          )}
          
          {/* Process Button */}
          {uploadedFile && !isUploading && (
            <Button className="w-full" onClick={() => processFile(uploadedFile)}>
              <FileText className="h-4 w-4 mr-2" />
              Process Resume
            </Button>
          )}
          
          {isUploading && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Processing your resume...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}