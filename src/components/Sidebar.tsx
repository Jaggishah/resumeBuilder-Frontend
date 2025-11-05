import { FileText, Eye, Plus, Home, CreditCard, Clock, RotateCcw, MessageSquare } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAppSelector } from '../../redux/hooks'
import { useGetProfileQuery } from '../../redux/features/api/apiSlice'

interface AppSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const sidebarItems = [
  {
    id: 'builder',
    label: 'Builder',
    icon: FileText,
    description: 'Edit your resume'
  }
  ,
  {
    id: 'my_resumes',
    label: 'My Resumes',
    icon: Plus,
    description: 'Choose template'
  },
  {
    id: 'ATS_checker',
    label: 'ATS Checker - [beta]',
    icon: Eye,
    description: 'ATS Resume Analysis'
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageSquare,
    description: 'Share your feedback'
  }
  // {
  //   id: 'download',
  //   label: 'Download',
  //   icon: Download,
  //   description: 'Export resume'
  // }
]

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const user = useAppSelector(state => state.auth.user)
  const { isFetching } = useGetProfileQuery(undefined, {
    skip: !user // Only run if user exists
  })
  
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <Home className="h-6 w-6" />
          <span className="font-semibold">write_yourself</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onSectionChange(item.id)}
                      isActive={isActive}
                      tooltip={item.description}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border">
        {user?.subscription && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium capitalize">{user.subscription.type} Plan</span>
              {isFetching && (
                <RotateCcw className="h-3 w-3 text-blue-600 animate-spin" />
              )}
            </div>
            
            {!user.subscription.is_unlimited && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Credits</span>
                  <span>{user.subscription.credits_remaining}/{user.subscription.credits_remaining + user.subscription.credits_used}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ 
                      width: `${(user.subscription.credits_remaining / (user.subscription.credits_remaining + user.subscription.credits_used)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
            
            {user.subscription.is_unlimited && (
              <div className="text-xs text-green-600 flex items-center gap-1">
                <span>Unlimited credits</span>
              </div>
            )}
            
            {user.subscription.end_date && (
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Expires: {new Date(user.subscription.end_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
  
    </Sidebar>
  )
}