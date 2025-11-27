import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { AuthForm } from './AuthForm'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: 'login' | 'register'
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ 
  open, 
  onOpenChange, 
  defaultMode = 'login' 
}) => {
  const navigate = useNavigate()

  const handleSuccess = () => {
    onOpenChange(false)
    navigate('/builder')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
        </DialogHeader>
        <AuthForm 
          onSuccess={handleSuccess}
          defaultMode={defaultMode}
        />
      </DialogContent>
    </Dialog>
  )
}