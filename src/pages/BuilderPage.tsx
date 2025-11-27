import { ResumeEditor } from '../components/ResumeEditor'
import { ResumePDF } from '../components/ResumePDF'
import ResumePDFNew from '../components/ResumePDFNew'
import { ImportDialog } from '../components/ImportDialog'
import { SEO } from '../components/SEO'
import { useAppSelector } from '../../redux/hooks'
import type { RootState } from '../../redux/store'
import { Upload, Download, Save, Edit, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SaveResumeDialog from '../components/SaveResumeDialog'
import { downloadWithReactToPrint } from '../utils/downloadUtils'
import { useState } from 'react'
import { useIsMobile } from '../hooks/use-mobile'
import { cn } from '@/lib/utils'

export function BuilderPage() {
  const resumeData = useAppSelector((state: RootState) => state.resume)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const isMobile = useIsMobile()

  const handlePrintToPDF = async () => {
    try {
      await downloadWithReactToPrint(resumeData.personalInfo.name || 'my-resume', resumeData.formatting)
    } catch (error) {
      console.error('Print to PDF failed:', error)
      alert('Print to PDF failed. Please try again.')
    }
  }

  return (
    <>
      <SEO 
        title="Resume Builder - Create Professional Resumes"
        description="Build your professional resume with our AI-powered editor. Add sections, customize content, and see real-time preview as you create your perfect resume."
        keywords="resume builder, resume editor, professional resume, CV maker, resume creation, job application"
      />
      

      
      {/* Mobile Tab Navigation */}
      {isMobile && (
        <div className="bg-white border-b border-gray-200 mb-4 sticky top-0 z-10">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors focus:outline-none",
                activeTab === 'editor'
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Edit className="h-4 w-4 inline mr-2" />
              Edit Resume
              {activeTab === 'editor' && <span className="ml-1 text-xs">●</span>}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors focus:outline-none",
                activeTab === 'preview'
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Eye className="h-4 w-4 inline mr-2" />
              Preview
              {activeTab === 'preview' && <span className="ml-1 text-xs">●</span>}
            </button>
          </div>
        </div>
      )}

      <div className={cn(
        "gap-6",
        isMobile ? "flex flex-col" : "grid grid-cols-1 lg:grid-cols-2"
      )} style={{ 
        height: isMobile ? 'calc(100vh - 120px)' : '100vh', 
        overflow: 'hidden' 
      }}>
        
        {/* Editor Panel */}
        <div className={cn(
          "bg-white rounded-lg shadow-sm border border-gray-300",
          isMobile ? (activeTab === 'editor' ? "flex" : "hidden") : "flex"
        )} style={{ 
          flexDirection: 'column', 
          maxHeight: isMobile ? 'calc(100vh - 120px)' : '100vh' 
        }}>
          <div className="p-3 md:p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                {isMobile ? "Edit" : "Edit Resume"}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">
                Fill in your information below
              </p>
            </div>
            <ImportDialog 
              trigger={
                <Button size="sm" className="text-xs md:text-sm">
                  <Upload className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">AI Import</span>
                  <span className="sm:hidden">Import</span>
                </Button>
              }
            />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ResumeEditor />
          </div>
        </div>

        {/* Preview Panel */}
        <div className={cn(
          "bg-gray-50 rounded-lg shadow-sm border border-gray-200",
          isMobile ? (activeTab === 'preview' ? "flex" : "hidden") : "flex"
        )} style={{ 
          flexDirection: 'column', 
          maxHeight: isMobile ? 'calc(100vh - 120px)' : '100vh' 
        }}>
          <div className="p-3 md:p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                {isMobile ? "Preview" : "Resume Preview"}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">
                Live preview of your resume
              </p>
            </div>
            <div className="flex gap-1 md:gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setSaveDialogOpen(true)}
                className="text-xs md:text-sm px-2 md:px-3"
              >
                <Save className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Save</span>
                <span className="sm:hidden">Save</span>
              </Button>
             
              <Button 
                size="sm" 
                onClick={handlePrintToPDF} 
                title="Print to PDF (preserves exact styling)"
                className="text-xs md:text-sm px-2 md:px-3"
              >
                <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {/* <ResumePDF />
             */}
            <ResumePDFNew />
          </div>
        </div>
        
        <SaveResumeDialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} />
      </div>
    </>
  )
}

