import React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthDialog } from './AuthDialog'
import { SEO } from './SEO'
import { useState } from 'react'
import { Button } from './ui/button'
import { FileText, Zap, BarChart3, Star, Check, Download, Printer, X } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const { isAuthenticated, user, isLoading } = useAppSelector(state => state.auth)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const location = useLocation()
  const navigate = useNavigate()

  // Features data
  const features = [
    {
      id: 'builder',
      icon: FileText,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      title: 'Smart Resume Builder',
      description: 'Dynamic sections, drag-and-drop interface, and professional templates. Build your resume exactly how you want it with real-time preview.'
    },
    {
      id: 'download',
      icon: Download,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      title: 'Download Resume',
      description: 'Download your resume as PDF, save multiple versions, and access your saved resumes anytime from anywhere. Cloud storage included.'
    },
    {
      id: 'formatting',
      icon: Star,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      title: 'Advanced Formatting',
      description: 'Header alignment, professional styling options, and customizable layouts to make your resume stand out from the competition.'
    },
    {
      id: 'ai_resume',
      icon: Printer,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      title: 'AI Resume Enhancement',
      description: 'AI-powered content enhancement, smart suggestions for improving your resume, and automated optimization for better job matching.'
    },
    {
      id: 'saved_resumes',
      icon: BarChart3,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      title: 'My Saved Resumes',
      description: 'Access all your saved resumes in one place. Manage multiple versions, duplicate resumes, and quickly switch between different resume formats.'
    },
    {
      id: 'templates',
      icon: Zap,
      iconColor: 'text-pink-600',
      bgColor: 'bg-pink-100',
      title: 'Professional Template',
      description: 'Choose from a variety of industry-specific templates designed by hiring experts and tailored for different career levels.'
    }
  ]

  // Show loading spinner while we're checking authentication or fetching user data
  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If authenticated and not on main page, show children (protected routes)
  if (isAuthenticated && user && location.pathname !== '/') {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  // Default welcome screen with prominent Google Auth
  return (
    <>
      <SEO 
        title="Write Yourself - AI-Powered Resume Builder"
        description="Create professional, ATS-friendly resumes with AI-powered enhancements. Build, optimize, and download your perfect resume in minutes with our intelligent resume builder."
        keywords="resume builder, AI resume, ATS resume, professional resume, resume maker, CV builder, job application, career tools, resume templates, resume optimization"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Modern Centered Header */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 px-8 py-4 flex items-center justify-between min-w-[400px] max-w-2xl w-full">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">write_yourself</h1>
            </div>
            {isAuthenticated && user ? (
              <Button 
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => navigate('/builder')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50 bg-white/50"
                onClick={() => {
                  setAuthMode('login')
                  setAuthDialogOpen(true)
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          {isAuthenticated && user ? (
            <>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Welcome back,
                <span className="text-blue-600"> {user?.name || user?.email?.split('@')[0]}</span>!
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Continue crafting your professional resume with our powerful tools. 
                Your progress is automatically saved.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Build Your Perfect 
                <span className="text-blue-600"> Resume</span>
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Create professional, ATS-friendly resumes with AI-powered enhancements. 
                Get hired faster with our intelligent resume builder.
              </p>
            </>
          )}
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {isAuthenticated && user ? (
              <>
                <Button 
                  size="lg" 
                  className="px-8 py-3 text-lg"
                  onClick={() => navigate('/builder')}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Continue Building
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-3 text-lg"
                  onClick={() => navigate('/my_resumes')}
                >
                  <Download className="w-5 h-5 mr-2" />
                  My Resumes
                </Button>
              </>
            ) : (
              <Button 
                size="lg" 
                className="px-8 py-3 text-lg"
                onClick={() => {
                  setAuthMode('register')
                  setAuthDialogOpen(true)
                }}
              >
                <Zap className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-16">
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-1" />
               Save Resumes
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              AI-Powered
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              ATS-Optimized
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <div key={feature.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                  <IconComponent className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our AI Resume Builder?
            </h3>
            <p className="text-lg text-gray-600">
              See how we compare to traditional resume builders
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">Write Yourself</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Traditional Builders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">AI Content Enhancement</td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">No Manual Copying</td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Instant Download Ready</td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-500">Limited</span>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">ATS Optimization</td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-500">Basic</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Cloud Storage</td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Real-time Preview</td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-500">Limited</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-white rounded-lg p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
          {isAuthenticated && user ? (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Continue?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Your resume is waiting for you. Continue where you left off and make it perfect.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="px-8 py-3"
                  onClick={() => navigate('/builder')}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Open Resume Builder
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-3"
                  onClick={() => navigate('/my_resumes')}
                >
                  <Download className="w-5 h-5 mr-2" />
                  View My Resumes
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Build Your Resume?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Make your resume more appealing and stand out from the competition. Join thousands of professionals who landed their dream jobs.
              </p>
              <Button 
                size="lg" 
                className="px-8 py-3"
                onClick={() => {
                  setAuthMode('register')
                  setAuthDialogOpen(true)
                }}
              >
                <FileText className="w-5 h-5 mr-2" />
                Start Building Your Resume
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultMode={authMode}
      />
      </div>
    </>
  )
}

// Hook for easy authentication checking
export const useRequireAuth = () => {
  const { isAuthenticated, user } = useAppSelector(state => state.auth)
  return { isAuthenticated, user, requiresAuth: !isAuthenticated }
}