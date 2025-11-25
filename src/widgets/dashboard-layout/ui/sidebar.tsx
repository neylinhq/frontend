import type { LucideIcon } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { cn } from '@/shared/lib/cn'
import { DASHBOARD_SIDEBAR_ITEMS } from '../dashboard-layout.constants'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isExpanded?: boolean
}

export function Sidebar({ className, isExpanded }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex h-full flex-col bg-card border-r', className)}>
      {/* Navigation */}
      <div className="flex-1 py-4 space-y-1 overflow-y-auto" style={{ paddingLeft: isExpanded ? '8px' : '8px', paddingRight: isExpanded ? '8px' : '8px' }}>
        {DASHBOARD_SIDEBAR_ITEMS.map(item => (
          <NavItem key={item.href} to={item.href} icon={item.icon} isExpanded={isExpanded}>
            {t(item.title)}
          </NavItem>
        ))}
      </div>
    </div>
  )
}

function NavItem({
  to,
  icon: Icon,
  children,
  isExpanded
}: {
  to: string
  icon: LucideIcon
  children: React.ReactNode
  isExpanded?: boolean
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center rounded-md py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground relative',
          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
        )
      }
    >
      <div className="w-11 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      {isExpanded && (
        <span className="whitespace-nowrap pr-3">
          {children}
        </span>
      )}
    </NavLink>
  )
}
