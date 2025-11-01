import React, { useState } from 'react'
import { GoogleOAuthButton } from './GoogleOAuthButton'
import { useLoginMutation, useRegisterMutation } from '../../redux/features/api/apiSlice'
import { useAppDispatch } from '../../redux/hooks'
import { loginStart, loginSuccess, loginFailure } from '../../redux/features/authSlice'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { AlertCircle, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

interface AuthFormProps {
  onSuccess?: () => void
  defaultMode?: 'login' | 'register'
}

export const AuthForm: React.FC<AuthFormProps> = ({ 
  onSuccess,
  defaultMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dispatch = useAppDispatch()
  const [login, { isLoading: isLoginLoading }] = useLoginMutation()
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation()

  const isLoading = isLoginLoading || isRegisterLoading

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    if (error) setError(null) // Clear error when user starts typing
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return false
    }

    if (mode === 'register') {
      if (!formData.name) {
        setError('Name is required')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        return false
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setError(null)
      dispatch(loginStart())

      let result
      if (mode === 'login') {
        result = await login({
          email: formData.email,
          password: formData.password
        }).unwrap()
      } else {
        result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name
        }).unwrap()
      }

      dispatch(loginSuccess({
        user: result.user,
        access_token: result.access_token,
        refresh_token: result.refresh_token
      }))

      onSuccess?.()
    } catch (err: any) {
      console.error('Authentication failed:', err)
      dispatch(loginFailure())
      
      const errorMessage = err?.data?.detail || err?.message || 
        (mode === 'login' ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.')
      setError(errorMessage)
    }
  }

  const handleGoogleSuccess = () => {
    onSuccess?.()
  }

  const handleGoogleError = (error: string) => {
    setError(error)
  }

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login')
    setError(null)
    setFormData(prev => ({ ...prev, confirmPassword: '' }))
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-600">
          {mode === 'login' 
            ? 'Sign in to access your resume builder' 
            : 'Start building your professional resume'
          }
        </p>
      </div>

      {/* Google OAuth */}
      <GoogleOAuthButton 
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        text={mode === 'login' ? 'signin_with' : 'signup_with'}
        size="large"
        theme="outline"
      />

      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-white px-3 text-sm text-gray-500">or continue with email</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field for register */}
        {mode === 'register' && (
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>
        )}

        {/* Email field */}
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {/* Password field */}
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="pl-10 pr-10"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password field for register */}
        {mode === 'register' && (
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pl-10 pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {mode === 'login' ? 'Signing in...' : 'Creating account...'}
            </>
          ) : (
            mode === 'login' ? 'Sign In' : 'Create Account'
          )}
        </Button>
      </form>

      {/* Toggle Mode */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-blue-600 hover:text-blue-700 font-medium"
            disabled={isLoading}
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}