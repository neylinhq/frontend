import { Menu, PanelLeft, PanelLeftClose, Sparkles } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router'
import { Button } from '@/shared/components/button'
import { Separator } from '@/shared/components/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/tooltip'
import { APP_NAME, DASHBOARD_ROUTES, ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { UserNav } from '@/widgets/user-nav'
import {
  SIDEBAR_MAIN_ITEMS,
  SIDEBAR_SECONDARY_ITEMS,
  type SidebarItem
} from '../dashboard-layout.constants'
import { useSidebar } from '../sidebar-context'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  forceExpanded?: boolean
}

export const Sidebar = ({ className, forceExpanded }: SidebarProps) => {
  const { isExpanded: contextExpanded, toggle } = useSidebar()

  const isExpanded = forceExpanded ?? contextExpanded

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex h-full flex-col bg-background border-r',
          'transition-[width] duration-200 ease-out',
          isExpanded ? 'w-64' : 'w-16',
          className
        )}
      >
        {/* Logo */}
        <div className='h-14 flex items-center px-3 shrink-0'>
          <Link
            to={DASHBOARD_ROUTES.overview}
            className='flex items-center w-10 h-10 justify-center text-foreground'
          >
            <span className='text-xl font-semibold'>
              {APP_NAME[0].toUpperCase()}
            </span>
          </Link>
          {isExpanded && (
            <span className='text-xl font-semibold text-foreground ml-0'>
              {APP_NAME.slice(1)}
            </span>
          )}
        </div>

        <Separator />

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto overflow-x-hidden py-2 px-2'>
          <div className='space-y-0.5'>
            {SIDEBAR_MAIN_ITEMS.map(item => (
              <NavItem key={item.href} item={item} isExpanded={isExpanded} />
            ))}
          </div>

          <Separator className='my-2' />

          <div className='space-y-0.5'>
            {SIDEBAR_SECONDARY_ITEMS.map(item => (
              <NavItem key={item.href} item={item} isExpanded={isExpanded} />
            ))}
          </div>
        </nav>

        {/* Bottom */}
        <div className='shrink-0 px-2 pb-2 space-y-0.5'>
          <UpgradeButton isExpanded={isExpanded} />
          <UserNav compact={!isExpanded} sidebarMode />
          <Separator className='my-2' />
          {!forceExpanded && <ToggleButton isExpanded={isExpanded} onToggle={toggle} />}
        </div>
      </aside>
    </TooltipProvider>
  )
}

export const MobileMenuTrigger = () => {
  const { t } = useTranslation()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='md:hidden'>
          <Menu className='h-5 w-5' />
          <span className='sr-only'>{t('nav.menu')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='p-0 w-64'>
        <Sidebar forceExpanded className='border-none' />
      </SheetContent>
    </Sheet>
  )
}

// ============================================================================
// NavItem
// ============================================================================

interface NavItemProps {
  item: SidebarItem
  isExpanded: boolean
}

const NavItem = ({ item, isExpanded }: NavItemProps) => {
  const { t } = useTranslation()
  const Icon = item.icon

  const link = (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          'flex items-center h-9 rounded-md text-sm font-medium',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      <div className='w-12 h-9 flex items-center justify-center shrink-0'>
        <Icon className='h-[18px] w-[18px]' />
      </div>
      {isExpanded && <span className='pr-3'>{t(item.title)}</span>}
    </NavLink>
  )

  if (isExpanded) return link

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side='right' sideOffset={8}>
        {t(item.title)}
      </TooltipContent>
    </Tooltip>
  )
}

// ============================================================================
// UpgradeButton
// ============================================================================

interface UpgradeButtonProps {
  isExpanded: boolean
}

const UpgradeButton = ({ isExpanded }: UpgradeButtonProps) => {
  const { t } = useTranslation()

  const button = (
    <Link
      to={ROUTES.pricing}
      className={cn(
        'flex items-center h-9 rounded-md text-sm font-medium',
        'border border-border',
        'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <div className='w-12 h-9 flex items-center justify-center shrink-0'>
        <Sparkles className='h-[18px] w-[18px]' />
      </div>
      {isExpanded && <span className='pr-3'>{t('nav.upgrade')}</span>}
    </Link>
  )

  if (isExpanded) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side='right' sideOffset={8}>
        {t('nav.upgrade')}
      </TooltipContent>
    </Tooltip>
  )
}

// ============================================================================
// ToggleButton
// ============================================================================

interface ToggleButtonProps {
  isExpanded: boolean
  onToggle: () => void
}

const ToggleButton = ({ isExpanded, onToggle }: ToggleButtonProps) => {
  const { t } = useTranslation()

  const button = (
    <button
      type='button'
      onClick={onToggle}
      className={cn(
        'flex items-center h-9 w-full rounded-md text-sm font-medium',
        'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <div className='w-12 h-9 flex items-center justify-center shrink-0'>
        {isExpanded ? (
          <PanelLeftClose className='h-[18px] w-[18px]' />
        ) : (
          <PanelLeft className='h-[18px] w-[18px]' />
        )}
      </div>
      {isExpanded && <span className='pr-3'>{t('nav.collapse')}</span>}
    </button>
  )

  if (isExpanded) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side='right' sideOffset={8}>
        {t('nav.expand')}
      </TooltipContent>
    </Tooltip>
  )
}
