import type { LucideIcon } from 'lucide-react'
import type React from 'react'
import { NavLink } from 'react-router'
import { cn } from '@/shared/lib/cn'
import { UserNav } from '@/widgets/user-nav'
import { DASHBOARD_SIDEBAR_ITEMS } from '../dashboard-layout.constants'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn('flex h-full flex-col bg-card', className)}>
      <div className="h-14 flex items-center px-4 border-b font-semibold tracking-tight">
        Arbor <span className="text-xs ml-2 text-muted-foreground font-normal">alpha</span>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {DASHBOARD_SIDEBAR_ITEMS.map(item => (
          <NavItem key={item.href} to={item.href} icon={item.icon}>
            {item.title}
          </NavItem>
        ))}
      </div>

      <div className="border-t">
        <UserNav />
      </div>
    </div>
  )
}

function NavItem({
  to,
  icon: Icon,
  children
}: {
  to: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
        )
      }
    >
      <Icon className="h-4 w-4" />
      {children}
    </NavLink>
  )
}
