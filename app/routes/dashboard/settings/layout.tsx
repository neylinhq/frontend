import { Link, Outlet, useLocation } from 'react-router'
import { User, Settings2, Palette, Puzzle, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'

const settingsNavItems = [
  {
    title: 'settings.nav.profile',
    href: '/dashboard/settings/profile',
    icon: User
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
    title: 'settings.nav.integrations',
    href: '/dashboard/settings/integrations',
    icon: Puzzle
  },
  {
    title: 'settings.nav.security',
    href: '/dashboard/settings/security',
    icon: Shield
  }
]

export default function SettingsLayout() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4 md:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('settings.description')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
        {/* Sidebar Navigation */}
        <aside className="md:w-56 flex-shrink-0">
          <nav className="space-y-1 sticky top-20">
            {settingsNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.title)}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 max-w-3xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
