import React, { useState } from 'react'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { useSubmitFeedbackMutation } from '../../redux/features/api/apiSlice'
import { Send, Heart, AlertCircle } from 'lucide-react'

export const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // RTK Query hook for submitting feedback
  const [submitFeedback, { isLoading: isSubmitting }] = useSubmitFeedbackMutation()



  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!formData.message.trim()) {
      setError('Please enter your feedback message')
      return
    }
    
    try {
      await submitFeedback({ message: formData.message }).unwrap()
      setSubmitted(true)
      
      // Reset form after submission
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          message: ''
        })
      }, 3000)
    } catch (err: any) {
      console.error('Failed to submit feedback:', err)
      setError(JSON.stringify(err?.data?.detail || err?.message || 'Failed to submit feedback. Please try again.'))
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h2>
          <p className="text-green-700">
            Your feedback has been submitted successfully. We appreciate your input and will review it carefully.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* Feedback Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Message */}
          <div>
            <Label htmlFor="message" className="mb-4 block text-lg font-semibold">Your Feedback</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Please share your detailed feedback, suggestions, or describe any issues you've encountered..."
              rows={8}
              className="resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.message.trim()}
              className="px-8 py-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </div>


    </div>
  )
  
}