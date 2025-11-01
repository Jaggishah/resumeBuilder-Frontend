import { ResumeEditor } from '../components/ResumeEditor'
import { ResumePDF } from '../components/ResumePDF'
import { ImportDialog } from '../components/ImportDialog'
import { useAppSelector } from '../../redux/hooks'
import type { RootState } from '../../redux/store'
import { Upload, Download, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SaveResumeDialog from '../components/SaveResumeDialog'
import { downloadWithReactToPrint } from '../utils/downloadUtils'
import { useState } from 'react'

export function BuilderPage() {
  const resumeData = useAppSelector((state: RootState) => state.resume)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  const handlePrintToPDF = async () => {
    try {
      await downloadWithReactToPrint(resumeData.personalInfo.name || 'my-resume')
    } catch (error) {
      console.error('Print to PDF failed:', error)
      alert('Print to PDF failed. Please try again.')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-300" style={{ display: 'flex', flexDirection: 'column', maxHeight: '100vh' }}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Resume</h2>
            <p className="text-sm text-gray-600">Fill in your information below</p>
          </div>
          <ImportDialog 
            trigger={
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                 AI Import
              </Button>
            }
          />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ResumeEditor />
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200" style={{ display: 'flex', flexDirection: 'column', maxHeight: '100vh' }}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Resume Preview</h2>
            <p className="text-sm text-gray-600">Live preview of your resume</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSaveDialogOpen(true)}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
           
            <Button size="sm" onClick={handlePrintToPDF} title="Print to PDF (preserves exact styling)">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {/* <Button size="sm" variant="outline" onClick={handleDownloadTextPDF} title="Download with clickable links">
              <Download className="h-4 w-4 mr-2" />
              Text PDF
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadImagePDF} title="Download as image (fallback)">
              <Download className="h-4 w-4 mr-2" />
              Image PDF
            </Button> */}
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ResumePDF />
        </div>
      </div>
      <SaveResumeDialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} />
    </div>
  )
}

