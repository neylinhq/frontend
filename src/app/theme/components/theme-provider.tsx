import { createContext, useContext, useEffect, useState } from 'react'
import { COLOR_THEME_STORAGE_KEY, THEME_STORAGE_KEY } from '../theme.constants'
import type { ColorTheme, Theme, ThemeProviderState } from '../theme.types'

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
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    colorTheme,
    setColorTheme: (colorTheme: ColorTheme) => {
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme)
      setColorThemeState(colorTheme)
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
