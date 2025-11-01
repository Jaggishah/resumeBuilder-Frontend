import { useState } from 'react'
import { ATSFileUploader, type ATSInputData } from '../components/ATSFileUploader'
import { ATSAnalysisResults, type ATSAnalysisResult } from '../components/ATSAnalysisResults'
import { useAnalyzeATSMutation } from '../../redux/features/api/apiSlice'
import { Button } from '../components/ui/button'
import { Zap, AlertTriangle } from 'lucide-react'
import { useSubscriptionUpdate } from '../hooks/useSubscriptionUpdate'

export function ATSCheckerPage() {
  const [inputData, setInputData] = useState<ATSInputData>({})
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [analyzeATS, { isLoading }] = useAnalyzeATSMutation()
  const updateSubscription = useSubscriptionUpdate()

  const handleAnalyze = async () => {
    if (!inputData) return

    try {
      setError(null)
      const result = await analyzeATS(inputData).unwrap()
      setAnalysisResult(result)
      
      // Update subscription data after successful operation
      await updateSubscription()
    } catch (err: any) {
      console.error('ATS Analysis failed:', err)
      setError(err?.data?.detail || err?.message || 'Analysis failed. Please try again.')
      setAnalysisResult(null)
    }
  }

  const canAnalyze = () => {
    const hasResume = inputData.resume_file || inputData.resume_text?.trim()
    const hasJob = inputData.job_description?.trim() || inputData.job_url?.trim()
    return hasResume && hasJob && !isLoading
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Input Section */}
      <ATSFileUploader 
        onDataChange={setInputData}
        isLoading={isLoading}
      />

      {/* Analyze Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleAnalyze}
          disabled={!canAnalyze()}
          size="lg"
          className="px-8 py-3"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Analyze ATS Compatibility
            </>
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900 mb-1">Analysis Failed</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {analysisResult && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Analysis Complete!</h2>
            <p className="text-gray-600">Here's how your resume performs against the job requirements</p>
          </div>
          
          <ATSAnalysisResults 
            analysis={analysisResult}
            isLoading={false}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && !analysisResult && (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Resume</h3>
          <p className="text-gray-600">
            Our AI is comparing your resume against the job requirements. This may take a few moments...
          </p>
        </div>
      )}

    
    </div>
  )
}