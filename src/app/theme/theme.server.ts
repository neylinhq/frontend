import { COLOR_THEME_COOKIE_KEY, THEME_COOKIE_KEY } from './theme.constants'
import type { ColorTheme, Theme } from './theme.types'

export type ThemeData = {
  theme: Theme
  colorTheme: ColorTheme
}

/**
 * Get theme data from cookies for SSR
 */
export function getThemeData(request: Request): ThemeData {
  const cookieHeader = request.headers.get('Cookie') ?? ''

  const getCookie = (name: string): string | undefined =>
    cookieHeader
      .split(';')
      .find(c => c.trim().startsWith(`${name}=`))
      ?.split('=')[1]
      ?.trim()

  const theme = (getCookie(THEME_COOKIE_KEY) as Theme) || 'system'
  const colorTheme = (getCookie(COLOR_THEME_COOKIE_KEY) as ColorTheme) || 'classic'

  return { theme, colorTheme }
}
