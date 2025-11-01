import { Lightbulb } from 'lucide-react'

export const ATSTips = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="font-semibold text-blue-900">Tips for Better ATS Results</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
        <div>
          <h4 className="font-medium mb-2 text-blue-900">📄 Resume Tips:</h4>
          <ul className="space-y-1 list-disc list-inside ml-2">
            <li>Use standard section headings (Experience, Education, Skills)</li>
            <li>Include relevant keywords from the job posting</li>
            <li>Use a simple, clean format without graphics or tables</li>
            <li>Save as PDF to maintain formatting</li>
            <li>Avoid headers and footers in your document</li>
            <li>Use standard fonts like Arial, Calibri, or Times New Roman</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2 text-blue-900">📋 Job Description Tips:</h4>
          <ul className="space-y-1 list-disc list-inside ml-2">
            <li>Copy the complete job description for best results</li>
            <li>Include requirements, responsibilities, and preferred skills</li>
            <li>Use the official job posting from the company's website</li>
            <li>Ensure the text is clear and complete</li>
            <li>Include both required and preferred qualifications</li>
            <li>Copy any specific technical requirements mentioned</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white rounded border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Pro Tip:</strong> ATS systems scan for exact keyword matches. Use the same terminology 
          and phrases from the job description in your resume to improve compatibility scores.
        </p>
      </div>
    </div>
  )
}