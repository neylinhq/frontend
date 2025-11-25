import type { LucideIcon } from 'lucide-react'

export interface UserNavItem {
  title: string
  href?: string
  icon: LucideIcon
  shortcut?: {
    mac: string
    win: string
  }
  action?: string // идентификатор действия если это не ссылка
}

export interface UserNavSection {
  title?: string // Для лейблов или группировки
  items: UserNavItem[]
}

export const USER_NAV_ITEMS: UserNavItem[] = [
  // Эта часть для основных пунктов меню
]

// Для примера разделим как в макете
import { CreditCard, LogOut, Settings, Sparkles } from 'lucide-react'

export const USER_NAV_MAIN_SECTION: UserNavItem[] = [
  {
    title: 'Подписка',
    icon: Sparkles,
    action: 'subscription',
    shortcut: {
      mac: '⌘P',
      win: 'Ctrl+P'
    }
  },
  {
    title: 'Настройки',
    href: '/dashboard/settings/profile',
    icon: Settings,
    shortcut: {
      mac: '⌘S',
      win: 'Ctrl+S'
    }
  },
  {
    title: 'Биллинг',
    icon: CreditCard,
    action: 'billing'
  }
]

export const USER_NAV_LOGOUT_ITEM: UserNavItem = {
  title: 'Выйти',
  icon: LogOut,
  action: 'logout',
  shortcut: {
    mac: '⇧⌘Q',
    win: 'Shift+Ctrl+Q'
  }
}
