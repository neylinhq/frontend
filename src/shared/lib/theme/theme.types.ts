export type Mode = 'dark' | 'light' | 'system'
export type Palette = 'classic' | 'vanilla' | 'vivid' | 'mono'

export type ThemeContextState = {
  mode: Mode
  setMode: (mode: Mode) => void
  resolvedMode: 'dark' | 'light'
  palette: Palette
  setPalette: (palette: Palette) => void
}
