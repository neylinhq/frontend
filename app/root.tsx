import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useRouteLoaderData
} from 'react-router'
import { QueryProvider } from '@/app/providers/query-provider'
import { ThemeProvider } from '@/app/theme'
import { WalletProviders } from '@/features/billing/crypto-wallet-connect/components/wallet-providers'
import { Toaster } from '@/shared/components/toast'
import { TooltipProvider } from '@/shared/components/tooltip'
import '@/shared/styles/globals.css'
import type React from 'react'
import { useEffect, useRef } from 'react'
import { initI18n } from '@/app/i18n'
import { MODE_COOKIE_KEY, PALETTE_COOKIE_KEY } from '@/shared/core/theme'
import type { Route } from './+types/root'

export const links: Route.LinksFunction = () => [
  // Favicon
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
  { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico', sizes: '32x32' },
  { rel: 'apple-touch-icon', href: '/favicon/apple-touch-icon.png', sizes: '180x180' }
]

export const loader = async ({ request }: Route.LoaderArgs) => {
  if (import.meta.env.VITE_MOCK_API === 'true') {
    const { ensureServerMocking } = await import('@/shared/mocks/server-runtime')
    ensureServerMocking()
  }

  // Dynamic imports to avoid bundling Node.js modules for client
  const { getI18nData } = await import('@/app/i18n/server/i18n.server')
  const { getThemeData } = await import('@/app/theme/server/theme.server')

  const i18nData = getI18nData(request)
  const themeData = getThemeData(request)

  return {
    i18n: i18nData,
    theme: themeData
  }
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  // SSR Theme Injection: получаем тему из loader для применения на сервере
  // Используем inference от loader через 'root' route ID
  const data = useRouteLoaderData<typeof loader>('root')

  // SSR: применяем dark класс если mode === 'dark' (для 'system' нельзя определить на сервере)
  const ssrDarkClass = data?.theme?.mode === 'dark' ? 'dark' : undefined
  const ssrPalette =
    data?.theme?.palette && data.theme.palette !== 'classic' ? data.theme.palette : undefined

  const ssrLang = data?.i18n?.locale || 'en'

  return (
    // suppressHydrationWarning нужен для html, так как клиентский скрипт может изменить классы
    <html lang={ssrLang} className={ssrDarkClass} data-palette={ssrPalette} suppressHydrationWarning>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />

        {/* Critical CSS: ПЕРВЫМ в head для немедленного применения до загрузки внешних стилей */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html.theme-transition-disabled,
              html.theme-transition-disabled *,
              html.theme-transition-disabled *::before,
              html.theme-transition-disabled *::after {
                transition: none !important;
                transition-duration: 0s !important;
              }
              /* Classic theme (default) */
              html { background-color: #ffffff; color: #171717; }
              html.dark { background-color: #121212; color: #ededed; }
              /* Vanilla theme */
              html[data-palette="vanilla"] { background-color: #faf9f7; color: #211d1a; }
              html[data-palette="vanilla"].dark { background-color: #161412; color: #e8e4de; }
              /* Vivid theme */
              html[data-palette="vivid"] { background-color: #f8fafc; color: #151921; }
              html[data-palette="vivid"].dark { background-color: #0f1318; color: #e6e9ec; }
              /* Mono theme */
              html[data-palette="mono"] { background-color: #fcfcfc; color: #0a0a0a; }
              html[data-palette="mono"].dark { background-color: #0a0a0a; color: #f5f5f5; }
            `
          }}
        />

        <Meta />
        <Links />

        {/* Theme & Locale Script: синхронизация темы и предотвращение мигания */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var MODE_KEY = '${MODE_COOKIE_KEY}';
                  var PALETTE_KEY = '${PALETTE_COOKIE_KEY}';

                  // Отключаем transitions - класс снимется в ThemeProvider после hydration
                  document.documentElement.classList.add('theme-transition-disabled');

                  function getCookie(n) {
                    var m = document.cookie.match('(^|;)\\\\s*' + n + '\\\\s*=\\\\s*([^;]+)');
                    return m ? m.pop() : null;
                  }

                  // Dark/Light mode (localStorage > cookie > system)
                  var localMode = localStorage.getItem(MODE_KEY);
                  var cookieMode = getCookie(MODE_KEY);
                  var mode = localMode || cookieMode;
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var shouldBeDark = mode === 'dark' || (mode === 'system' && systemDark) || (!mode && systemDark);

                  // Синхронизация с SSR (SSR мог установить dark из cookie)
                  var hasDark = document.documentElement.classList.contains('dark');
                  if (shouldBeDark && !hasDark) {
                    document.documentElement.classList.add('dark');
                  } else if (!shouldBeDark && hasDark) {
                    document.documentElement.classList.remove('dark');
                  }

                  // Sync localStorage -> cookie (для будущих SSR запросов)
                  if (localMode && localMode !== cookieMode) {
                    document.cookie = MODE_KEY + '=' + localMode + '; path=/; max-age=31536000; SameSite=Lax';
                  }

                  // Palette (localStorage > cookie)
                  var localPalette = localStorage.getItem(PALETTE_KEY);
                  var cookiePalette = getCookie(PALETTE_KEY);
                  var palette = localPalette || cookiePalette;
                  var currentPalette = document.documentElement.dataset.palette;

                  if (palette && palette !== 'classic' && palette !== currentPalette) {
                    document.documentElement.dataset.palette = palette;
                  } else if ((!palette || palette === 'classic') && currentPalette) {
                    delete document.documentElement.dataset.palette;
                  }

                  // Sync localStorage -> cookie для palette
                  if (localPalette && localPalette !== cookiePalette) {
                    document.cookie = PALETTE_KEY + '=' + localPalette + '; path=/; max-age=31536000; SameSite=Lax';
                  }
                } catch (e) { /* localStorage unavailable - use defaults */ }
              })();
            `
          }}
        />

      </head>
      <body className='bg-background text-foreground'>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

const App = () => {
  const { i18n: i18nData, theme: themeData } = useLoaderData<typeof loader>()
  const initializedRef = useRef(false)
  const navigation = useNavigation()

  // Initialize i18n with SSR data on first render
  if (!initializedRef.current) {
    initI18n(i18nData)
    initializedRef.current = true
  }

  // Disable transitions during navigation to prevent flash
  useEffect(() => {
    if (navigation.state === 'loading') {
      document.documentElement.classList.add('theme-transition-disabled')
    } else if (navigation.state === 'idle') {
      const timer = setTimeout(() => {
        document.documentElement.classList.remove('theme-transition-disabled')
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [navigation.state])

  return (
    <QueryProvider>
      <ThemeProvider defaultMode={themeData.mode} defaultPalette={themeData.palette}>
        <WalletProviders>
          <TooltipProvider>
            <Outlet />
            <Toaster />
          </TooltipProvider>
        </WalletProviders>
      </ThemeProvider>
    </QueryProvider>
  )
}

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className='pt-16 p-4 container mx-auto'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className='w-full p-4 overflow-x-auto'>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}

export default App
