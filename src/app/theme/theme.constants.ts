import type { Theme } from './theme.types'

export const THEME_STORAGE_KEY = 'vite-ui-theme'

export const THEMES: { name: string; value: Theme }[] = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'System', value: 'system' }
]
