import { Provider } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { HelmetProvider } from 'react-helmet-async'
import { store } from '../redux/store'
import { Dashboard } from "./components/Dashboard"
import { BuilderPage } from './pages/BuilderPage'
import MyResumesPage from './pages/MyResumesPage'
import { ATSCheckerPage } from './pages/ATSCheckerPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { AuthGuard } from './components/AuthGuard'
import { useTokenRefresh } from './hooks/useTokenRefresh'
import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { useGetProfileQuery } from '../redux/features/api/apiSlice'
import { setUser } from '../redux/features/authSlice'

// Component to handle token refresh and user initialization
function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { access_token } = useAppSelector((state) => state.auth)
  const { 
    data: profile, 
    error, 
    isLoading 
  } = useGetProfileQuery(undefined, {
    skip: !access_token
  })

  useTokenRefresh()

  useEffect(() => {
    if (profile && !error) {
      dispatch(setUser(profile))
    }
  }, [profile, error, dispatch])

  if (isLoading && access_token) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  }

  if (error && access_token) {
    console.error('Failed to load profile:', error)
    // Continue rendering even if profile fetch fails
  }

  return <>{children}</>
}

// Main App Routes Component (without Router wrapper)
function AppRoutes() {
  useEffect(() => {
    // Signal to prerenderer that the page is ready
    if (typeof window !== 'undefined') {
      document.dispatchEvent(new Event('render-event'))
    }
  }, [])

  return (
    <Provider store={store}>
      <HelmetProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
          <TokenRefreshProvider>
            <AuthGuard>
              <Routes>
                <Route path="/" element={<Navigate to="/builder" replace />} />
                <Route path="/" element={<Dashboard />}>
                  <Route path="builder" element={<BuilderPage />} />
                  <Route path="my_resumes" element={<MyResumesPage />} />
                  <Route path="ats_checker" element={<ATSCheckerPage />} />
                  <Route path="feedback" element={<FeedbackPage />} />
                  {/* <Route path="templates" element={<TemplatesPage />} /> */}
                  {/* <Route path="download" element={<DownloadPage />} /> */}
                </Route>
              </Routes>
            </AuthGuard>
          </TokenRefreshProvider>
        </GoogleOAuthProvider>
      </HelmetProvider>
    </Provider>
  )
}

export default AppRoutes