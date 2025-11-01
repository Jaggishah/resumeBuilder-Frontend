import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { useGoogleOAuthMutation } from '../../redux/features/api/apiSlice'
import { useAppDispatch } from '../../redux/hooks'
import { loginStart, loginSuccess, loginFailure } from '../../redux/features/authSlice'

interface GoogleOAuthButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  size?: 'large' | 'medium' | 'small'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  width?: string
}

export const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  size = 'large',
  theme = 'outline',
  width = '100%'
}) => {
  const dispatch = useAppDispatch()
  const [googleOAuth, { isLoading }] = useGoogleOAuthMutation()

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError?.('No credential received from Google')
      return
    }

    try {
      dispatch(loginStart())
      
      const result = await googleOAuth({
        access_token: credentialResponse.credential,
        id_token: credentialResponse.credential
      }).unwrap()

      dispatch(loginSuccess({
        user: result.user,
        access_token: result.access_token,
        refresh_token: result.refresh_token
      }))

      onSuccess?.()
    } catch (error: any) {
      console.error('Google OAuth failed:', error)
      dispatch(loginFailure())
      
      const errorMessage = error?.data?.detail || error?.message || 'Authentication failed'
      onError?.(errorMessage)
    }
  }

  const handleError = () => {
    console.error('Google OAuth error')
    dispatch(loginFailure())
    onError?.('Google authentication failed')
  }

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center border border-gray-300 rounded-md bg-white"
        style={{ width, height: size === 'large' ? '56px' : size === 'medium' ? '48px' : '40px' }}
      >
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ width, }} className='flex justify-center items-center'>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text={text}
        size={size}
        theme={theme}
        width={width}
        logo_alignment="left"
      />
    </div>
  )
}