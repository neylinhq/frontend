import type { ColorTheme, Theme } from './theme.types'

export const THEME_STORAGE_KEY = 'vite-ui-theme'
export const COLOR_THEME_STORAGE_KEY = 'arbor-color-theme'

export const THEMES: { name: string; value: Theme }[] = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'System', value: 'system' }
]

export const COLOR_THEMES: { name: string; value: ColorTheme; color: string }[] = [
  { name: 'Classic', value: 'classic', color: 'var(--color-preview-classic)' },
  { name: 'Vanilla', value: 'vanilla', color: 'var(--color-preview-vanilla)' },
  { name: 'Vivid', value: 'vivid', color: 'var(--color-preview-vivid)' }
]
