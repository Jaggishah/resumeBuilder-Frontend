import React, { useState, useEffect } from 'react'
import { useAppSelector } from '../../redux/hooks'
import { CheckCircle, X } from 'lucide-react'
import { Button } from './ui/button'

export const WelcomeMessage: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    // Show welcome message when user first authenticates
    if (isAuthenticated && user) {
      // Check if this is a new session (no previous welcome shown)
      const hasShownWelcome = localStorage.getItem(`welcome_shown_${user.id}`)
      if (!hasShownWelcome) {
        setShowWelcome(true)
        localStorage.setItem(`welcome_shown_${user.id}`, 'true')
      }
    }
  }, [isAuthenticated, user])

  const handleClose = () => {
    setShowWelcome(false)
  }

  if (!showWelcome || !user) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              Welcome, {user.name}! 🎉
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              You're all set! Start building your professional resume with our AI-powered tools.
            </p>
            <Button size="sm" onClick={handleClose}>
              Get Started
            </Button>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}