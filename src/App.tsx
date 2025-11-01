import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
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
  const { isAuthenticated, user, access_token } = useAppSelector(state => state.auth)
  
  // Initialize automatic token refresh
  useTokenRefresh()
  
  // Fetch user profile if we have a token but no user data
  const { data: profileData, error: profileError } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated || !access_token || !!user
  })
  
  // Update user data when profile is fetched
  useEffect(() => {
    if (profileData) {
      dispatch(setUser(profileData))
    }
  }, [profileData, dispatch])
  
  // Handle profile fetch error (token might be invalid)
  useEffect(() => {
    if (profileError && 'status' in profileError) {
      console.error('Failed to fetch user profile:', profileError)
      // If we get a 401 or 403, the token is likely invalid
      if (profileError.status === 401 || profileError.status === 403) {
        // The token refresh mechanism will handle this
        console.log('Token appears to be invalid, will attempt refresh')
      }
    }
  }, [profileError])
  
  return <>{children}</>
}

function App() {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        <TokenRefreshProvider>
          <BrowserRouter>
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
          </BrowserRouter>
        </TokenRefreshProvider>
      </GoogleOAuthProvider>
    </Provider>
  )
}

export default App