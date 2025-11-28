import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from 'react-router'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/app/providers/query-provider'
import { ThemeProvider } from '@/app/theme'
import '@/shared/styles/globals.css'
import type React from 'react'
import { useEffect, useRef } from 'react'
import { type I18nInitData, initI18n } from '@/shared/config/i18n'
import type { Route } from './+types/root'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap'
  }
]

export async function loader({ request }: Route.LoaderArgs) {
  // Dynamic imports to avoid bundling Node.js modules for client
  const { getI18nData } = await import('@/shared/config/i18n/i18n.server')
  const { getThemeData } = await import('@/app/theme/theme.server')

  const i18nData = getI18nData(request)
  const themeData = getThemeData(request)

  return { i18n: i18nData, theme: themeData }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning нужен для html, так как мы меняем класс dark скриптом
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Theme & Locale Script: предотвращает мигание при загрузке */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Disable transitions during hydration to prevent FOUC
                  document.documentElement.classList.add('theme-transition-disabled');
                  window.addEventListener('load', function() {
                    requestAnimationFrame(function() {
                      requestAnimationFrame(function() {
                        document.documentElement.classList.remove('theme-transition-disabled');
                      });
                    });
                  });

                  function getCookie(n) {
                    var m = document.cookie.match('(^|;)\\\\s*' + n + '\\\\s*=\\\\s*([^;]+)');
                    return m ? m.pop() : null;
                  }
                  // Dark/Light mode (localStorage > cookie > system)
                  var mode = localStorage.getItem('ely-si-mode') || getCookie('ely-si-mode');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (mode === 'dark' || (mode === 'system' && systemDark) || (!mode && systemDark)) {
                    document.documentElement.classList.add('dark');
                  }
                  // Palette (localStorage > cookie)
                  var palette = localStorage.getItem('ely-si-palette') || getCookie('ely-si-palette');
                  if (palette && palette !== 'classic') {
                    document.documentElement.dataset.palette = palette;
                  }
                  // Locale (localStorage > cookie)
                  var locale = localStorage.getItem('i18nextLng') || getCookie('i18nextLng') || 'en';
                  document.documentElement.lang = locale;
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { i18n: i18nData, theme: themeData } = useLoaderData<typeof loader>()
  const initializedRef = useRef(false)

  // Initialize i18n with SSR data on first render
  if (!initializedRef.current) {
    initI18n(i18nData as I18nInitData)
    initializedRef.current = true
  }

  // Sync locale to html lang attribute
  useEffect(() => {
    document.documentElement.lang = i18nData.locale
  }, [i18nData.locale])

  return (
    <QueryProvider>
      <ThemeProvider defaultMode={themeData.mode} defaultPalette={themeData.palette}>
        <Outlet />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
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
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
