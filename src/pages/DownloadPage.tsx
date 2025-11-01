import { useState } from 'react'
import { Download, FileText, Share2, Printer, Copy, Code, FileJson, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppSelector } from '../../redux/hooks'
import type { RootState } from '../../redux/store'

// import { ResumePreview } from '../components/ResumePreview'

export function DownloadPage() {
  const resumeData = useAppSelector((state: RootState) => state.resume)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [shareableLink, setShareableLink] = useState<string>('')

  const handleDownload = async (format: string, downloadFn: () => Promise<void> | void) => {
    setIsDownloading(format)
    try {
      await downloadFn()
    } catch (error) {
      console.error(`Error downloading as ${format}:`, error)
      alert(`Failed to download as ${format}. Please try again.`)
    } finally {
      setIsDownloading(null)
    }
  }


  const downloadOptions = [
    {
      id: 'pdf',
      title: 'PDF Download',
      description: 'Best for job applications and printing',
      icon: FileText,
      color: 'text-red-600',
      action: async () => {
        await downloadAsPDF(`${resumeData.personalInfo.name || 'resume'}`)
      },
      primary: true
    },
    {
      id: 'html',
      title: 'HTML File',
      description: 'Viewable in any web browser',
      icon: Code,
      color: 'text-orange-600',
      action: () => {
        downloadAsHTML(resumeData, resumeData.personalInfo.name || 'resume')
      }
    },
    {
      id: 'text',
      title: 'Plain Text',
      description: 'Simple text format',
      icon: Type,
      color: 'text-gray-600',
      action: () => {
        () => {}
      }
    },
    {
      id: 'json',
      title: 'JSON Data',
      description: 'For backup and re-importing',
      icon: FileJson,
      color: 'text-blue-600',
      action: () => {
        () => {}
      }
    },
    {
      id: 'print',
      title: 'Print Resume',
      description: 'Print directly from browser',
      icon: Printer,
      color: 'text-green-600',
      action: () => {
        () => {}
      }
    },
    {
      id: 'share',
      title: 'Share Link',
      description: 'Generate a shareable URL',
      icon: Share2,
      color: 'text-purple-600',
      action: () => {
        () => {}
      }
    }
  ]

  return (
    <div className="space-y-8">
      {/* Download Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Download & Export</h2>
        <p className="text-gray-600 mb-8">Export your resume in various formats</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloadOptions.map((option) => {
            const Icon = option.icon
            const isLoading = isDownloading === option.id
            
            return (
              <div key={option.id} className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <Icon className={`h-12 w-12 ${option.color} mx-auto mb-4`} />
                <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                <Button 
                  className={`w-full ${option.primary ? '' : 'variant-outline'}`}
                  variant={option.primary ? 'default' : 'outline'}
                  onClick={() => handleDownload(option.id, option.action)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Processing...' : `${option.id === 'print' ? 'Print' : option.id === 'share' ? 'Generate Link' : 'Download'}`}
                </Button>
              </div>
            )
          })}
        </div>
        
        {shareableLink && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Shareable Link Generated:</h4>
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={shareableLink} 
                readOnly 
                className="flex-1 p-2 border border-purple-200 rounded text-sm"
              />
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(shareableLink)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Download Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>PDF:</strong> Best for job applications and professional use</li>
            <li>• <strong>HTML:</strong> Can be opened in any browser and easily shared</li>
            <li>• <strong>Plain Text:</strong> Universal format for simple text editors</li>
            <li>• <strong>JSON:</strong> Use for backing up your data or importing later</li>
            <li>• Make sure all sections are completed before downloading</li>
          </ul>
        </div>
      </div>
      
      {/* Preview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Before Download</h3>
        <div id="resume-preview" className="border border-gray-200 rounded-lg p-6">
          {/* <ResumePreview data={resumeData} /> */}
        </div>
      </div>
    </div>
  )
}