import { createContext, useContext, useLayoutEffect, useState } from 'react'
import {
  MODE_COOKIE_KEY,
  MODE_STORAGE_KEY,
  PALETTE_COOKIE_KEY,
  PALETTE_STORAGE_KEY
} from '../theme.constants'
import type { Mode, Palette, ThemeProviderState } from '../theme.types'

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

// Resolve system preference to actual mode
function resolveMode(mode: Mode): 'dark' | 'light' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

const initialState: ThemeProviderState = {
  mode: 'system',
  setMode: () => null,
  resolvedMode: 'light',
  palette: 'classic',
  setPalette: () => null
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

type ThemeProviderProps = {
  children: React.ReactNode
  defaultMode?: Mode
  defaultPalette?: Palette
}

export const ThemeProvider = ({
  children,
  defaultMode = 'system',
  defaultPalette = 'classic',
  ...props
}: ThemeProviderProps) => {
  const [mode, setModeState] = useState<Mode>(() =>
    typeof window !== 'undefined'
      ? (localStorage.getItem(MODE_STORAGE_KEY) as Mode) || defaultMode
      : defaultMode
  )

  const [palette, setPaletteState] = useState<Palette>(() =>
    typeof window !== 'undefined'
      ? (localStorage.getItem(PALETTE_STORAGE_KEY) as Palette) || defaultPalette
      : defaultPalette
  )

  const [resolvedMode, setResolvedMode] = useState<'dark' | 'light'>(() =>
    typeof window !== 'undefined' ? resolveMode(mode) : 'light'
  )

  // Apply dark/light mode class (useLayoutEffect for earlier execution)
  useLayoutEffect(() => {
    const root = window.document.documentElement
    const resolved = resolveMode(mode)
    setResolvedMode(resolved)

    // Only update if the class is different (prevents FOUC on hydration)
    if (!root.classList.contains(resolved)) {
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
    }
  }, [mode])

  // Apply palette data attribute
  useLayoutEffect(() => {
    const root = window.document.documentElement

    if (palette === 'classic') {
      delete root.dataset.palette
    } else {
      root.dataset.palette = palette
    }
  }, [palette])

  // Listen to system preference changes
  useLayoutEffect(() => {
    if (mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const resolved = resolveMode('system')
      setResolvedMode(resolved)
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mode])

  const value: ThemeProviderState = {
    mode,
    setMode: (newMode: Mode) => {
      withoutTransitions(() => {
        localStorage.setItem(MODE_STORAGE_KEY, newMode)
        setCookie(MODE_COOKIE_KEY, newMode)
        setModeState(newMode)
      })
    },
    resolvedMode,
    palette,
    setPalette: (newPalette: Palette) => {
      withoutTransitions(() => {
        localStorage.setItem(PALETTE_STORAGE_KEY, newPalette)
        setCookie(PALETTE_COOKIE_KEY, newPalette)
        setPaletteState(newPalette)
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
