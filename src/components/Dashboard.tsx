import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './Header'
import { AppSidebar } from './Sidebar'
import { WelcomeMessage } from './WelcomeMessage'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { setActiveSection } from '../../redux/features/resumeSlice'

export function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const activeSection = useAppSelector(state => state.resume.activeSection)

  // Update active section based on current route
  useEffect(() => {
    const currentPath = location.pathname.split('/')[1] || 'builder'
    if (currentPath !== activeSection) {
      dispatch(setActiveSection(currentPath))
    }
  }, [location.pathname, activeSection, dispatch])

  const handleSectionChange = (section: string) => {
    dispatch(setActiveSection(section))
    navigate(`/${section}`)
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full ">
        <AppSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        <SidebarInset className="flex-1">
            <Header activeSection={activeSection} />
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-emerald-100">
            <div className=" flex-1 rounded-xl  p-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
        <WelcomeMessage />
      </div>
    </SidebarProvider>
  )
}