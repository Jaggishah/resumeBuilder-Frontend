import React from 'react'
import { AuthGuard } from './AuthGuard'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  return (
    <AuthGuard fallback={fallback}>
      {children}
    </AuthGuard>
  )
}