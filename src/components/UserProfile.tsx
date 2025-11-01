import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../../redux/hooks'
import { useLogoutMutation } from '../../redux/features/api/apiSlice'
import { logout } from '../../redux/features/authSlice'
import { Button } from './ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { AuthDialog } from './AuthDialog'
import {  LogOut, } from 'lucide-react'

export const UserProfile: React.FC = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()

  const handleLogin = () => {
    setAuthMode('login')
    setAuthDialogOpen(true)
  }

  const handleRegister = () => {
    setAuthMode('register')
    setAuthDialogOpen(true)
  }

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap()
    } catch (error) {
      console.error('Logout API call failed:', error)
      // Continue with local logout even if API call fails
    } finally {
      dispatch(logout())
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogin}
          >
            Sign In
          </Button>
          <Button 
            size="sm"
            onClick={handleRegister}
          >
            Get Started
          </Button>
        </div>
        
        <AuthDialog 
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          defaultMode={authMode}
        />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          {user.picture ? (
            <img 
              src={user.picture} 
              alt={user.name}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="hidden sm:inline-block">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
{/*         
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <FileText className="mr-2 h-4 w-4" />
          <span>My Resumes</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>ATS Reports</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator /> */}
        
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}