import {
  CreditCard01Icon,
  Sliders01Icon,
  User01Icon,
  UserEditIcon
} from '@untitledui/icons-react/outline'
import type { ComponentType, SVGProps } from 'react'

import { SETTINGS_ROUTES } from './routes'

export interface SettingsNavItem {
  title: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    title: 'settings.nav.profile',
    href: SETTINGS_ROUTES.profile,
    icon: User01Icon
  },
  {
    title: 'settings.nav.preferences',
    href: SETTINGS_ROUTES.preferences,
    icon: Sliders01Icon
  },
  {
    title: 'settings.nav.account',
    href: SETTINGS_ROUTES.account,
    icon: UserEditIcon
  },
  {
    title: 'settings.nav.billing',
    href: SETTINGS_ROUTES.billing,
    icon: CreditCard01Icon
  }
]
