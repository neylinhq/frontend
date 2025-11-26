import { Home, LayoutDashboard, type LucideIcon } from 'lucide-react'

export interface ActionButton {
  icon: LucideIcon
  labelKey: string
  href: string
  variant?: 'default' | 'outline'
}

export const ACTION_BUTTONS: ActionButton[] = [
  {
    icon: Home,
    labelKey: 'notFound.backToHome',
    href: '/',
    variant: 'default'
  },
  {
    icon: LayoutDashboard,
    labelKey: 'notFound.goToDashboard',
    href: '/dashboard/overview',
    variant: 'outline'
  }
]
