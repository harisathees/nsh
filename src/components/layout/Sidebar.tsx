import React, { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  Landmark,
  FileText,
  Users,
  Settings,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Building2,
  RefreshCw,
  Users2Icon,
  Users2
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavigationItem {
  name: string
  href?: string
  icon: any
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pledge Entry', href: '/pledge-entry', icon: PlusCircle },
  { 
    name: 'Re-Pledge', 
    icon: Landmark,
    children: [
      { name: 'Add Re-pledge', href: '/re-pledge-entry/add', icon: PlusCircle },
      { name: 'Re-pledge Details', href: '/re-pledge-entry/details', icon: Users },
    ]
  },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Master Settings', href: '/settings', icon: Settings },
]

interface NavigationItemComponentProps {
  item: NavigationItem
  onClose: () => void
  level?: number
}

function NavigationItemComponent({ item, onClose, level = 0 }: NavigationItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const location = useLocation()
  
  // Check if current path matches this item or any of its children
  const isActive = item.href === location.pathname || 
    (item.children && item.children.some(child => child.href === location.pathname))
  
  // Auto-expand if any child is active
  React.useEffect(() => {
    if (item.children && item.children.some(child => child.href === location.pathname)) {
      setIsExpanded(true)
    }
  }, [location.pathname, item.children])

  const handleClick = () => {
    if (item.children) {
      setIsExpanded(!isExpanded)
    } else if (item.href) {
      onClose()
    }
  }

  if (item.children) {
    return (
      <div>
        <button
          onClick={handleClick}
          className={cn(
            "w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
            level > 0 ? "pl-6" : "",
            isActive
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <div className="flex items-center">
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        {isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children.map((child) => (
              <NavigationItemComponent
                key={child.name}
                item={child}
                onClose={onClose}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.href!}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
          level > 0 ? "pl-9" : "",
          isActive
            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )
      }
    >
      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
      {item.name}
    </NavLink>
  )
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b lg:justify-center">
            <h2 className="text-lg font-semibold text-gray-800">Gold Loan</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavigationItemComponent
                key={item.name}
                item={item}
                onClose={onClose}
              />
            ))}
          </nav>

          {/* User Info + Logout */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">SH</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Sabari Harish
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}