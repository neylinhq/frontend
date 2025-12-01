import {
  CreditCard,
  type LucideIcon,
  Palette,
  Settings2,
  Shield,
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
    title: 'settings.nav.theme',
    href: SETTINGS_ROUTES.theme,
    icon: Palette
  },
  {
    title: 'settings.nav.security',
    href: SETTINGS_ROUTES.security,
    icon: Shield
  },
  {
    title: 'settings.nav.billing',
    href: SETTINGS_ROUTES.billing,
    icon: CreditCard
  }
]
