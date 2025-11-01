import React, { useRef, useState } from 'react'
import { Upload, FileText, Link, X, CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

export interface ATSInputData {
  resume_file?: File
  resume_text?: string
  job_description?: string
  job_url?: string
}

interface ATSFileUploaderProps {
  onDataChange: (data: ATSInputData) => void
  isLoading?: boolean
}

export const ATSFileUploader: React.FC<ATSFileUploaderProps> = ({ 
  onDataChange, 
  isLoading = false 
}) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('file')
  const [jobInputMethod, setJobInputMethod] = useState<'text' | 'url'>('text')
  
  const resumeFileRef = useRef<HTMLInputElement>(null)

  const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setResumeFile(file)
      updateData({ resume_file: file })
    }
  }

  const handleResumeTextChange = (text: string) => {
    setResumeText(text)
    updateData({ resume_text: text })
  }

  const handleJobDescriptionChange = (text: string) => {
    setJobDescription(text)
    updateData({ job_description: text })
  }

  const handleJobUrlChange = (url: string) => {
    setJobUrl(url)
    updateData({ job_url: url })
  }

  const updateData = (updates: Partial<ATSInputData>) => {
    const currentData: ATSInputData = {
      ...(resumeFile && { resume_file: resumeFile }),
      ...(resumeText && { resume_text: resumeText }),
      ...(jobDescription && { job_description: jobDescription }),
      ...(jobUrl && { job_url: jobUrl })
    }
    
    onDataChange({ ...currentData, ...updates })
  }

  const removeResumeFile = () => {
    setResumeFile(null)
    if (resumeFileRef.current) {
      resumeFileRef.current.value = ''
    }
    updateData({ resume_file: undefined })
  }

  const clearResumeText = () => {
    setResumeText('')
    updateData({ resume_text: undefined })
  }

  const isResumeProvided = (inputMethod === 'file' && resumeFile) || (inputMethod === 'text' && resumeText.trim())
  const isJobProvided = (jobInputMethod === 'text' && jobDescription.trim()) || (jobInputMethod === 'url' && jobUrl.trim())
  const canAnalyze = isResumeProvided && isJobProvided && !isLoading

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">ATS Compatibility Checker</h3>
        <p className="text-gray-600">Upload your resume and job description to get an AI-powered ATS analysis</p>
      </div>

      {/* Resume Input Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Resume Input</Label>
          <div className="flex gap-4 mt-2">
            <Button
              variant={inputMethod === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMethod('file')}
              disabled={isLoading}
            >
              <FileText className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            <Button
              variant={inputMethod === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMethod('text')}
              disabled={isLoading}
            >
              <FileText className="w-4 h-4 mr-2" />
              Paste Text
            </Button>
          </div>
        </div>

        {inputMethod === 'file' && (
          <div>
            {resumeFile ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">{resumeFile.name}</p>
                    <p className="text-sm text-green-700">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeResumeFile}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => resumeFileRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload your resume</p>
                <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX files</p>
                <input
                  ref={resumeFileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
        )}

        {inputMethod === 'text' && (
          <div>
            <Textarea
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => handleResumeTextChange(e.target.value)}
              className="min-h-[200px]"
              disabled={isLoading}
            />
            {resumeText && (
              <div className="mt-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearResumeText}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Job Description Input Section */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Job Description</Label>
          <div className="flex gap-4 mt-2">
            <Button
              variant={jobInputMethod === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setJobInputMethod('text')}
              disabled={isLoading}
            >
              <FileText className="w-4 h-4 mr-2" />
              Paste Text
            </Button>
            <Button
              variant={jobInputMethod === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setJobInputMethod('url')}
              disabled={true}
            >
              <Link className="w-4 h-4 mr-2" />
              Job URL
            </Button>
          </div>
        </div>

        {jobInputMethod === 'text' && (
          <Textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => handleJobDescriptionChange(e.target.value)}
            className="min-h-[150px]"
            disabled={isLoading}
          />
        )}

        {jobInputMethod === 'url' && (
          <Input
            placeholder="https://company.com/job-posting"
            value={jobUrl}
            onChange={(e) => handleJobUrlChange(e.target.value)}
            disabled={isLoading}
          />
        )}
      </div>

      {/* Analysis Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Ready to Analyze?</p>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center">
                {isResumeProvided ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-1" />
                )}
                <span className={`text-sm ${isResumeProvided ? 'text-green-700' : 'text-gray-500'}`}>
                  Resume provided
                </span>
              </div>
              <div className="flex items-center">
                {isJobProvided ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-1" />
                )}
                <span className={`text-sm ${isJobProvided ? 'text-green-700' : 'text-gray-500'}`}>
                  Job description provided
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${canAnalyze ? 'text-green-600' : 'text-gray-500'}`}>
              {canAnalyze ? 'Ready to analyze!' : 'Missing information'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}