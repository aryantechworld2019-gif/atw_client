import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  HelpCircle,
  Code,
  Package,
  Clock,
  CreditCard,
  FileText,
  Bell,
  Shield,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  name: string
  path: string
  icon: React.ElementType
  subItems?: NavItem[]
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Clients',
    path: '/clients',
    icon: Users,
    subItems: [
      { name: 'All Clients', path: '/clients', icon: Users },
      { name: 'Add Client', path: '/clients/add', icon: Users },
    ],
  },
  {
    name: 'Queries',
    path: '/queries',
    icon: HelpCircle,
    subItems: [
      { name: 'All Queries', path: '/queries', icon: HelpCircle },
      { name: 'Create Query', path: '/queries/create', icon: HelpCircle },
    ],
  },
  {
    name: 'Developers',
    path: '/developers',
    icon: Code,
    subItems: [
      { name: 'All Developers', path: '/developers', icon: Code },
      { name: 'Add Developer', path: '/developers/add', icon: Code },
    ],
  },
  {
    name: 'Maintenance',
    path: '/maintenance',
    icon: Package,
    subItems: [
      { name: 'All Packages', path: '/maintenance/packages', icon: Package },
      { name: 'Create Package', path: '/maintenance/packages/create', icon: Package },
    ],
  },
  {
    name: 'Time Logs',
    path: '/time-logs',
    icon: Clock,
  },
  {
    name: 'Payments',
    path: '/payments',
    icon: CreditCard,
    subItems: [
      { name: 'All Payments', path: '/payments', icon: CreditCard },
      { name: 'Record Payment', path: '/payments/record', icon: CreditCard },
    ],
  },
  {
    name: 'Invoices',
    path: '/invoices',
    icon: FileText,
    subItems: [
      { name: 'All Invoices', path: '/invoices', icon: FileText },
      { name: 'Create Invoice', path: '/invoices/create', icon: FileText },
    ],
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: BarChart3,
    subItems: [
      { name: 'Overview', path: '/reports/overview', icon: BarChart3 },
      { name: 'Client Reports', path: '/reports/clients', icon: BarChart3 },
      { name: 'Developer Reports', path: '/reports/developers', icon: BarChart3 },
      { name: 'Financial Reports', path: '/reports/financial', icon: BarChart3 },
    ],
  },
  {
    name: 'Notifications',
    path: '/notifications',
    icon: Bell,
  },
  {
    name: 'Audit Logs',
    path: '/audit-logs',
    icon: Shield,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    subItems: [
      { name: 'Profile', path: '/settings/profile', icon: Settings },
      { name: 'Account', path: '/settings/account', icon: Settings },
      { name: 'Security', path: '/settings/security', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    )
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const Icon = item.icon
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const active = isActive(item.path)

    if (hasSubItems) {
      return (
        <div key={item.name} className="mb-1">
          <button
            onClick={() => toggleExpand(item.name)}
            className={`
              w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg
              transition-colors duration-150
              ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <div className="flex items-center">
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.subItems?.map((subItem) => renderNavItem(subItem, true))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.name}
        to={item.path}
        className={`
          flex items-center px-4 py-2.5 text-sm font-medium rounded-lg
          transition-colors duration-150 mb-1
          ${
            active
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }
          ${isSubItem ? 'pl-8' : ''}
        `}
      >
        <Icon className="w-5 h-5 mr-3" />
        <span>{item.name}</span>
      </Link>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* Logo */}
      <div className="flex items-center px-6 py-5 border-b border-gray-200">
        <LayoutDashboard className="w-8 h-8 text-primary-600 mr-3" />
        <div>
          <h1 className="text-lg font-bold text-gray-900">Aryan Tech</h1>
          <p className="text-xs text-gray-500">Client Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => renderNavItem(item))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © 2025 Aryan Tech World
        </p>
      </div>
    </div>
  )
}
