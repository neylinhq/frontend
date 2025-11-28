import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLoaderData, useLocation } from 'react-router'
import { type User, userApi } from '@/entities/user'
import { SETTINGS_NAV_ITEMS } from '@/features/settings'
import { cn } from '@/shared/lib/cn'
import type { Route } from './+types/layout'

// SSR loader - fetch user data on the server
export async function loader(_args: Route.LoaderArgs) {
  const user = await userApi.getCurrentUser()
  return { user }
}

// Context type for child routes
export type SettingsContext = {
  user: User
}

export default function SettingsLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className='h-full overflow-y-auto [scrollbar-gutter:stable]'>
      <div className='container max-w-6xl mx-auto py-10 px-4 md:px-6 lg:px-8'>
        <div className='mb-10'>
          <h1 className='text-3xl font-bold tracking-tight'>{t('settings.title')}</h1>
          <p className='text-muted-foreground mt-2'>{t('settings.description')}</p>
        </div>

        <div className='flex flex-col md:flex-row gap-6 lg:gap-10'>
          {/* Sidebar Navigation */}
          <aside className='md:w-56 flex-shrink-0'>
            <nav className='space-y-1 sticky top-6'>
              {SETTINGS_NAV_ITEMS.map(item => {
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
                    <Icon className='h-4 w-4' />
                    {t(item.title)}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Content Area */}
          <main className='flex-1 min-w-0 max-w-3xl'>
            <Outlet context={{ user } satisfies SettingsContext} />
          </main>
        </div>
      </div>
    </div>
  )
}
