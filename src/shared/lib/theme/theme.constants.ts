import { APP_NAME } from '@/shared/config'
import type { Mode, Palette } from './theme.types'

const APP_PREFIX = APP_NAME.toLowerCase().replace(/\./g, '-')

// Storage keys (localStorage + cookies use same keys)
export const MODE_STORAGE_KEY = `${APP_PREFIX}-mode`
export const PALETTE_STORAGE_KEY = `${APP_PREFIX}-palette`

// Cookie keys (same as storage for consistency)
export const MODE_COOKIE_KEY = MODE_STORAGE_KEY
export const PALETTE_COOKIE_KEY = PALETTE_STORAGE_KEY

export const MODES: { name: string; value: Mode }[] = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'System', value: 'system' }
]

// Preview colors use CSS variables that automatically switch for light/dark mode
// See globals.css: --preview-classic, --preview-vanilla, --preview-vivid, --preview-mono
export const PALETTES: { name: string; value: Palette; previewColor: string }[] = [
  { name: 'Mono', value: 'mono', previewColor: 'var(--color-preview-mono)' },
  { name: 'Classic', value: 'classic', previewColor: 'var(--color-preview-classic)' },
  { name: 'Vanilla', value: 'vanilla', previewColor: 'var(--color-preview-vanilla)' },
  { name: 'Vivid', value: 'vivid', previewColor: 'var(--color-preview-vivid)' }
]
