import * as React from "react"
import { createContext, useContext, useState, useRef, useEffect } from "react"

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(undefined)

const useDropdownMenu = () => {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error("useDropdownMenu must be used within a DropdownMenu")
  }
  return context
}

interface DropdownMenuProps {
  children: React.ReactNode
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children, asChild }) => {
  const { open, setOpen } = useDropdownMenu()
  
  const handleClick = () => {
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      'aria-expanded': open,
      'aria-haspopup': true
    })
  }

  return (
    <button
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup={true}
      className="inline-flex justify-center w-full"
    >
      {children}
    </button>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  children, 
  align = 'start',
  className = '' 
}) => {
  const { open, setOpen } = useDropdownMenu()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  }

  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-1 ${alignmentClasses[align]} bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[8rem] ${className}`}
    >
      {children}
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  const { setOpen } = useDropdownMenu()

  const handleClick = () => {
    if (!disabled) {
      onClick?.()
      setOpen(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${className}`}
    >
      {children}
    </button>
  )
}

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-4 py-2 text-sm font-medium text-gray-900 ${className}`}>
      {children}
    </div>
  )
}

const DropdownMenuSeparator: React.FC = () => {
  return <hr className="my-1 border-gray-200" />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}