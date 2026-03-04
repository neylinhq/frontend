import { createContext, useContext } from 'react'

import type { ThemeContextState } from './theme.types'

const initialState: ThemeContextState = {
  mode: 'system',
  setMode: () => null,
  resolvedMode: 'light',
  palette: 'classic',
  setPalette: () => null
}

export const ThemeContext = createContext<ThemeContextState>(initialState)

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
