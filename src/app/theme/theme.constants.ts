import type { ColorTheme, Theme } from './theme.types'

export const THEME_STORAGE_KEY = 'vite-ui-theme'
export const COLOR_THEME_STORAGE_KEY = 'arbor-color-theme'

export const THEMES: { name: string; value: Theme }[] = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'System', value: 'system' }
]

export const COLOR_THEMES: { name: string; value: ColorTheme; color: string }[] = [
  { name: 'Classic', value: 'classic', color: '#6366F1' },
  { name: 'Vanilla', value: 'vanilla', color: '#E8A830' },
  { name: 'Vivid', value: 'vivid', color: '#14B8A6' }
]
