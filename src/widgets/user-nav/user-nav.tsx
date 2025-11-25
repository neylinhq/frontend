import { Link } from 'react-router'
import { ThemeToggle } from '@/app/theme/components/theme-toggle'
import { getShortcut } from '@/shared/lib/platform'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/shared/ui/dropdown-menu'
import { USER_NAV_LOGOUT_ITEM, USER_NAV_MAIN_SECTION } from './user-nav.constants'

export function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-14 w-full justify-start gap-3 px-3 hover:bg-accent rounded-none"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-sm">
            <span className="font-medium">User Name</span>
            <span className="text-xs text-muted-foreground">Pro Plan</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" forceMount side="top" sideOffset={4}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">User Name</p>
            <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
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
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                    {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
                  </Link>
                </DropdownMenuItem>
              )
            }

            return (
              <DropdownMenuItem key={item.title}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
                {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="p-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground px-2">Тема</span>
          <ThemeToggle />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <USER_NAV_LOGOUT_ITEM.icon className="mr-2 h-4 w-4" />
          <span>{USER_NAV_LOGOUT_ITEM.title}</span>
          <DropdownMenuShortcut>{getShortcut(USER_NAV_LOGOUT_ITEM.shortcut)}</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
