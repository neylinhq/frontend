import { useLayoutEffect, useState } from 'react'
import type { Mode, Palette, ThemeContextState } from '@/shared/core/theme'
import {
  MODE_COOKIE_KEY,
  MODE_STORAGE_KEY,
  PALETTE_COOKIE_KEY,
  PALETTE_STORAGE_KEY,
  ThemeContext
} from '@/shared/core/theme'

const setCookie = (name: string, value: string) => {
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

const withoutTransitions = (callback: () => void) => {
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

const resolveMode = (mode: Mode) => {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

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
    if (mode !== 'system') {
      return
    }

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

  const value: ThemeContextState = {
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
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
