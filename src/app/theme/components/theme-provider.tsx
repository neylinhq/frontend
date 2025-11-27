import { createContext, useContext, useEffect, useState } from 'react'
import {
  COLOR_THEME_COOKIE_KEY,
  COLOR_THEME_STORAGE_KEY,
  THEME_COOKIE_KEY,
  THEME_STORAGE_KEY
} from '../theme.constants'
import type { ColorTheme, Theme, ThemeProviderState } from '../theme.types'

// Helper to set cookie (1 year expiry)
function setCookie(name: string, value: string) {
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

// Disable transitions during theme change to prevent flickering
function withoutTransitions(callback: () => void) {
  const root = document.documentElement
  root.classList.add('theme-transition-disabled')
  callback()
  // Re-enable after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('theme-transition-disabled')
    })
  })
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  colorTheme: 'classic',
  setColorTheme: () => null
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ColorTheme
  storageKey?: string
}

export const ThemeProvider = ({
  children,
  defaultTheme = 'system',
  defaultColorTheme = 'classic',
  storageKey = THEME_STORAGE_KEY,
  ...props
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window !== 'undefined'
      ? (localStorage.getItem(storageKey) as Theme) || defaultTheme
      : defaultTheme
  )

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() =>
    typeof window !== 'undefined'
      ? (localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ColorTheme) || defaultColorTheme
      : defaultColorTheme
  )

  // Apply dark/light mode class
  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  // Apply color theme data attribute
  useEffect(() => {
    const root = window.document.documentElement

    if (colorTheme === 'classic') {
      delete root.dataset.theme
    } else {
      root.dataset.theme = colorTheme
    }
  }, [colorTheme])

  const value: ThemeProviderState = {
    theme,
    setTheme: (newTheme: Theme) => {
      withoutTransitions(() => {
        localStorage.setItem(storageKey, newTheme)
        setCookie(THEME_COOKIE_KEY, newTheme)
        setTheme(newTheme)
      })
    },
    colorTheme,
    setColorTheme: (newColorTheme: ColorTheme) => {
      withoutTransitions(() => {
        localStorage.setItem(COLOR_THEME_STORAGE_KEY, newColorTheme)
        setCookie(COLOR_THEME_COOKIE_KEY, newColorTheme)
        setColorThemeState(newColorTheme)
      })
    }
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
