import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteLoaderData
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
    // Оптимизировано: только используемые начертания (400, 500, 600, 700)
    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap'
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
  // SSR Theme Injection: получаем тему из loader для применения на сервере
  // Используем inference от loader через 'root' route ID
  const data = useRouteLoaderData<typeof loader>('root')

  // SSR: применяем dark класс если mode === 'dark' (для 'system' нельзя определить на сервере)
  const ssrDarkClass = data?.theme?.mode === 'dark' ? 'dark' : undefined
  const ssrPalette =
    data?.theme?.palette && data.theme.palette !== 'classic' ? data.theme.palette : undefined

  return (
    // suppressHydrationWarning нужен для html, так как клиентский скрипт может изменить классы
    <html
      lang="en"
      className={ssrDarkClass}
      data-palette={ssrPalette}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

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
                  // Отключаем transitions до полной загрузки
                  document.documentElement.classList.add('theme-transition-disabled');

                  // Ждем загрузки основного шрифта (не всех шрифтов!) И DOM
                  Promise.all([
                    document.fonts ? document.fonts.load('400 16px "IBM Plex Sans"').catch(function(){}) : Promise.resolve(),
                    new Promise(function(r) {
                      if (document.readyState === 'complete') r();
                      else window.addEventListener('load', r);
                    })
                  ]).then(function() {
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
                  var localMode = localStorage.getItem('ely-si-mode');
                  var cookieMode = getCookie('ely-si-mode');
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
                    document.cookie = 'ely-si-mode=' + localMode + '; path=/; max-age=31536000; SameSite=Lax';
                  }

                  // Palette (localStorage > cookie)
                  var localPalette = localStorage.getItem('ely-si-palette');
                  var cookiePalette = getCookie('ely-si-palette');
                  var palette = localPalette || cookiePalette;
                  var currentPalette = document.documentElement.dataset.palette;

                  if (palette && palette !== 'classic' && palette !== currentPalette) {
                    document.documentElement.dataset.palette = palette;
                  } else if ((!palette || palette === 'classic') && currentPalette) {
                    delete document.documentElement.dataset.palette;
                  }

                  // Sync localStorage -> cookie для palette
                  if (localPalette && localPalette !== cookiePalette) {
                    document.cookie = 'ely-si-palette=' + localPalette + '; path=/; max-age=31536000; SameSite=Lax';
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
