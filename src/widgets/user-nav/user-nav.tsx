import { useQueryClient } from '@tanstack/react-query'
import { HelpCircle, Mail, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { sessionApi, useSessionStore } from '@/entities/session'
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
import { getShortcut } from '@/shared/lib/platform'
import { USER_NAV_LOGOUT_ITEM, USER_NAV_MAIN_SECTION } from './user-nav.constants'

export const UserNav = () => {
  const { user, logout } = useSessionStore()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    try {
      await sessionApi.logout()
    } finally {
      // Clear all cached data to prevent data leakage between users
      queryClient.clear()
      logout()
      navigate('/auth/sign-in')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='rounded-full cursor-pointer'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user.avatarUrl} alt={user.email} />
            <AvatarFallback>{user.firstName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount side='bottom' sideOffset={8}>
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
          {USER_NAV_MAIN_SECTION.map(item => {
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
              <a
                href={SUPPORT_CONTACTS.telegram.url}
                target='_blank'
                rel='noopener noreferrer'
              >
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
