import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'react-router'
import { QueryProvider } from '@/app/providers/query-provider'
import { ThemeProvider } from '@/app/theme'
import { Toaster } from 'sonner'
import '@/shared/styles/globals.css'
import type React from 'react'
import { useEffect, useRef } from 'react'
import type { Route } from './+types/root'
import { initI18n, type I18nInitData } from '@/shared/config/i18n'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap'
  }
]

export async function loader({ request }: Route.LoaderArgs) {
  // Dynamic import to avoid bundling Node.js fs module for client
  const { getI18nData } = await import('@/shared/config/i18n/i18n.server')
  const i18nData = getI18nData(request)
  return { i18n: i18nData }
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
        {/* Theme Script: предотвращает мигание белого фона в темной теме */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'vite-ui-theme';
                  var theme = localStorage.getItem(storageKey);
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

                  if (theme === 'dark' || (!theme && systemTheme)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
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
  const { i18n: i18nData } = useLoaderData<typeof loader>()
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
      <ThemeProvider>
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
