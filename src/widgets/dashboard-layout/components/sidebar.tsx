import type { LucideIcon } from 'lucide-react'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { Button } from '@/shared/components/button'
import { Logo } from '@/shared/components/logo'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/tooltip'
import { DASHBOARD_ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { UserNav } from '@/widgets/user-nav'
import { DASHBOARD_SIDEBAR_ITEMS } from '../dashboard-layout.constants'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isExpanded?: boolean
  /** Callback to toggle sidebar */
  onToggle?: () => void
}

export const Sidebar = ({ className, isExpanded, onToggle }: SidebarProps) => {
  const { t } = useTranslation()

  return (
    <div className={cn('flex h-full flex-col bg-card', className)}>
      {/* Logo + Toggle */}
      <div className='h-14 flex items-center px-3 border-b'>
        <div className='w-10 h-10 flex items-center justify-center flex-shrink-0 group relative'>
          <Logo
            size='xl'
            href={DASHBOARD_ROUTES.overview}
            className={!isExpanded ? 'group-hover:scale-0 transition-transform' : ''}
          />
          {!isExpanded && onToggle && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-muted-foreground absolute inset-0 m-auto scale-0 group-hover:scale-100 transition-transform'
                  onClick={onToggle}
                >
                  <PanelLeft className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='right'>{t('nav.expandSidebar')}</TooltipContent>
            </Tooltip>
          )}
        </div>
        {isExpanded && onToggle && (
          <div className='flex-1 flex justify-end'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-muted-foreground'
                  onClick={onToggle}
                >
                  <PanelLeftClose className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='right'>{t('nav.collapseSidebar')}</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className='flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden'>
        {DASHBOARD_SIDEBAR_ITEMS.map(item => (
          <NavItem key={item.href} to={item.href} icon={item.icon} isExpanded={isExpanded}>
            {t(item.title)}
          </NavItem>
        ))}
      </div>

      {/* User Nav */}
      <div className='px-3 border-t flex items-center h-14'>
        <UserNav isExpanded={isExpanded} />
      </div>
    </div>
  )
}

const NavItem = ({
  to,
  icon: Icon,
  children,
  isExpanded
}: {
  to: string
  icon: LucideIcon
  children: React.ReactNode
  isExpanded?: boolean
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center h-8 rounded-md text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground relative',
          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
        )
      }
    >
      <div className='w-10 flex items-center justify-center flex-shrink-0'>
        <Icon className='size-5' />
      </div>
      {isExpanded && <span className='whitespace-nowrap pr-3'>{children}</span>}
    </NavLink>
  )
}
