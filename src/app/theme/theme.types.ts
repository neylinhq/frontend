export type Mode = 'dark' | 'light' | 'system'
export type Palette = 'classic' | 'vanilla' | 'vivid'

export type ThemeProviderState = {
  mode: Mode
  setMode: (mode: Mode) => void
  resolvedMode: 'dark' | 'light'
  palette: Palette
  setPalette: (palette: Palette) => void
}

// Re-export for backward compatibility during migration
/** @deprecated Use Mode instead */
export type Theme = Mode
/** @deprecated Use Palette instead */
export type ColorTheme = Palette
