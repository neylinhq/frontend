import { User as UserIcon, Settings2, Palette, Shield, CreditCard, type LucideIcon } from 'lucide-react'

export interface SettingsNavItem {
  title: string
  href: string
  icon: LucideIcon
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    title: 'settings.nav.profile',
    href: '/dashboard/settings/profile',
    icon: UserIcon
  },
  {
    title: 'settings.nav.preferences',
    href: '/dashboard/settings/preferences',
    icon: Settings2
  },
  {
    title: 'settings.nav.theme',
    href: '/dashboard/settings/theme',
    icon: Palette
  },
  {
    title: 'settings.nav.security',
    href: '/dashboard/settings/security',
    icon: Shield
  },
  {
    title: 'settings.nav.billing',
    href: '/dashboard/settings/billing',
    icon: CreditCard
  }
]
