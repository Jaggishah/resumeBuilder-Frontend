export function TemplatesPage() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Choose Template</h2>
      <p className="text-gray-600 mb-6">Select a template for your resume</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="bg-gray-100 h-48 rounded mb-4 flex items-center justify-center">
            <span className="text-gray-500">Modern Template</span>
          </div>
          <h3 className="font-semibold text-gray-900">Modern</h3>
          <p className="text-sm text-gray-600">Clean and professional design</p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="bg-gray-100 h-48 rounded mb-4 flex items-center justify-center">
            <span className="text-gray-500">Classic Template</span>
          </div>
          <h3 className="font-semibold text-gray-900">Classic</h3>
          <p className="text-sm text-gray-600">Traditional layout</p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="bg-gray-100 h-48 rounded mb-4 flex items-center justify-center">
            <span className="text-gray-500">Creative Template</span>
          </div>
          <h3 className="font-semibold text-gray-900">Creative</h3>
          <p className="text-sm text-gray-600">Unique and eye-catching</p>
        </div>
      </div>
    </div>
  )
}