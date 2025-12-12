import {
  CreditCard,
  type LucideIcon,
  Settings2,
  User as UserIcon
} from 'lucide-react'
import { SETTINGS_ROUTES } from './routes'

export interface SettingsNavItem {
  title: string
  href: string
  icon: LucideIcon
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    title: 'settings.nav.profile',
    href: SETTINGS_ROUTES.profile,
    icon: UserIcon
  },
  {
    title: 'settings.nav.preferences',
    href: SETTINGS_ROUTES.preferences,
    icon: Settings2
  },
  {
    title: 'settings.nav.account',
    href: SETTINGS_ROUTES.security,
    icon: UserIcon
  },
  {
    title: 'settings.nav.billing',
    href: SETTINGS_ROUTES.billing,
    icon: CreditCard
  }
]
