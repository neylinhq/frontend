export type Theme = 'dark' | 'light' | 'system'
export type ColorTheme = 'classic' | 'vanilla' | 'vivid'

export type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  colorTheme: ColorTheme
  setColorTheme: (colorTheme: ColorTheme) => void
}
