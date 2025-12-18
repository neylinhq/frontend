import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, HelpCircle, Mail, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router'
import { sessionApi } from '@/entities/session'
import { useLoaderUser } from '@/entities/user'
import { ModeSelect } from '@/features/theme/mode-select'
import { PaletteSelect } from '@/features/theme/palette-select'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/avatar'
import { Button } from '@/shared/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { LanguageSelect } from '@/shared/components/language-switcher'
import { SUPPORT_CONTACTS } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { getShortcut } from '@/shared/lib/platform'
import { getUserNavMainSection, USER_NAV_LOGOUT_ITEM } from './user-nav.constants'

interface UserNavProps {
  /** Show only avatar in compact mode (for collapsed sidebar) */
  compact?: boolean
  /** Sidebar mode - shows expanded user info when sidebar is expanded */
  sidebarMode?: boolean
}

export const UserNav = ({ compact = false, sidebarMode = false }: UserNavProps) => {
  const user = useLoaderUser()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  if (!user) {
    return null
  }

  // Check if user is in dashboard
  const isDashboard = location.pathname.startsWith('/dashboard')
  const mainMenuItems = getUserNavMainSection(isDashboard)

  const handleLogout = async () => {
    try {
      await sessionApi.logout()
    } finally {
      // Clear all cached data to prevent data leakage between users
      queryClient.clear()
      navigate('/auth/sign-in')
    }
  }

  // Sidebar mode: show full width trigger with user info
  const triggerContent = sidebarMode ? (
    <Button
      variant='ghost'
      className={cn(
        'h-auto p-2 justify-start transition-colors',
        compact ? 'w-10 justify-center' : 'w-full'
      )}
    >
      <Avatar className='h-8 w-8 shrink-0'>
        <AvatarImage src={user.avatarUrl} alt={user.email} />
        <AvatarFallback>{user.firstName?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      {!compact && (
        <>
          <div className='flex-1 ml-2 text-left min-w-0'>
            <p className='text-sm font-medium leading-none truncate'>
              {user.firstName || user.email.split('@')[0]}
            </p>
          </div>
          <ChevronDown className='h-4 w-4 text-muted-foreground shrink-0' />
        </>
      )}
    </Button>
  ) : (
    <Button variant='ghost' size='icon' className='rounded-full cursor-pointer'>
      <Avatar className='h-8 w-8'>
        <AvatarImage src={user.avatarUrl} alt={user.email} />
        <AvatarFallback>{user.firstName?.[0] || 'U'}</AvatarFallback>
      </Avatar>
    </Button>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{triggerContent}</DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-56'
        align={sidebarMode || compact ? 'start' : 'end'}
        side={sidebarMode || compact ? 'right' : 'bottom'}
        sideOffset={8}
        forceMount
      >
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {user.firstName} {user.lastName}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {mainMenuItems.map(item => {
            const Icon = item.icon
            const shortcut = getShortcut(item.shortcut)

            if (item.href) {
              return (
                <DropdownMenuItem key={item.title} asChild>
                  <Link to={item.href}>
                    <Icon className='mr-2 h-4 w-4' />
                    <span>{t(item.title)}</span>
                    {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
                  </Link>
                </DropdownMenuItem>
              )
            }

            return (
              <DropdownMenuItem key={item.title}>
                <Icon className='mr-2 h-4 w-4' />
                <span>{t(item.title)}</span>
                {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <HelpCircle className='mr-2 h-4 w-4' />
            <span>{t('nav.support')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem asChild>
              <a href={SUPPORT_CONTACTS.telegram.url} target='_blank' rel='noopener noreferrer'>
                <Send className='mr-2 h-4 w-4' />
                <span>{t('support.telegram')}</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={SUPPORT_CONTACTS.email.url}>
                <Mail className='mr-2 h-4 w-4' />
                <span>{t('support.email')}</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <div className='px-2 py-2 flex items-center justify-center gap-1'>
          <LanguageSelect compact />
          <ModeSelect compact />
          <PaletteSelect compact />
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <USER_NAV_LOGOUT_ITEM.icon className='mr-2 h-4 w-4' />
          <span>{t(USER_NAV_LOGOUT_ITEM.title)}</span>
          <DropdownMenuShortcut>{getShortcut(USER_NAV_LOGOUT_ITEM.shortcut)}</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
