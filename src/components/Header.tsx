
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserProfile } from './UserProfile'

interface HeaderProps {
  activeSection: string
}

export function Header({ activeSection }: HeaderProps) {
  return (
     <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center space-x-2 flex-1">
            <span className="text-lg font-semibold text-gray-900">{String(activeSection)?.toUpperCase()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <UserProfile />
        </div>
     </header>
  )
}