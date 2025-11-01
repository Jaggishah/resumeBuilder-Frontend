import React from 'react'
import { CheckCircle, AlertCircle, XCircle, TrendingUp, FileText, Target } from 'lucide-react'

export interface ATSAnalysisResult {
  overall_score: number
  compatibility_score: number
  keyword_match_percentage: number
  missing_keywords: string[]
  matched_keywords: string[]
  suggestions: string[]
  section_analysis: {
    [key: string]: {
      score: number
      feedback: string
      suggestions: string[]
    }
  }
  formatting_issues: string[]
  strengths: string[]
}

interface ATSAnalysisResultsProps {
  analysis: ATSAnalysisResult
  isLoading?: boolean
}

export const ATSAnalysisResults: React.FC<ATSAnalysisResultsProps> = ({ 
  analysis, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Overall Score Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">ATS Analysis Results</h3>
        <div className={`inline-flex items-center px-6 py-3 rounded-full ${getScoreColor(analysis.overall_score)}`}>
          {getScoreIcon(analysis.overall_score)}
          <span className="ml-2 text-2xl font-bold">{analysis.overall_score}%</span>
          <span className="ml-2">Overall ATS Score</span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-gray-900">Job Compatibility</h4>
          </div>
          <div className="text-2xl font-bold text-blue-600">{analysis.compatibility_score}%</div>
          <p className="text-sm text-gray-600">How well your resume matches the job requirements</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FileText className="w-5 h-5 text-purple-600 mr-2" />
            <h4 className="font-semibold text-gray-900">Keyword Match</h4>
          </div>
          <div className="text-2xl font-bold text-purple-600">{analysis.keyword_match_percentage}%</div>
          <p className="text-sm text-gray-600">Keywords from job description found in resume</p>
        </div>
      </div>

      {/* Keywords Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matched Keywords */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Matched Keywords ({analysis.matched_keywords.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.matched_keywords.map((keyword, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Keywords */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            Missing Keywords ({analysis.missing_keywords.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_keywords.map((keyword, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section Analysis */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
          Section Analysis
        </h4>
        <div className="space-y-3">
          {Object.entries(analysis.section_analysis).map(([section, data]) => (
            <div key={section} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900 capitalize">{section}</h5>
                <div className={`px-3 py-1 rounded-full text-sm ${getScoreColor(data.score)}`}>
                  {data.score}%
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{data.feedback}</p>
              {data.suggestions.length > 0 && (
                <div className="space-y-1">
                  {data.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Strengths
          </h4>
          <div className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">{strength}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Suggestions */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
          Recommendations
        </h4>
        <div className="space-y-2">
          {analysis.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              <span className="text-sm text-gray-700">{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Formatting Issues */}
      {analysis.formatting_issues.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            Formatting Issues
          </h4>
          <div className="space-y-2">
            {analysis.formatting_issues.map((issue, index) => (
              <div key={index} className="flex items-start">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}