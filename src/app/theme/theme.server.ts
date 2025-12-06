import type { Mode, Palette } from '@/shared/lib/theme'
import { MODE_COOKIE_KEY, PALETTE_COOKIE_KEY } from '@/shared/lib/theme'

export type ThemeData = {
  mode: Mode
  palette: Palette
}

/**
 * Get theme data from cookies for SSR
 */
export const getThemeData = (request: Request) => {
  const cookieHeader = request.headers.get('Cookie') ?? ''

  const getCookie = (name: string): string | undefined =>
    cookieHeader
      .split(';')
      .find(c => c.trim().startsWith(`${name}=`))
      ?.split('=')[1]
      ?.trim()

  const mode = (getCookie(MODE_COOKIE_KEY) as Mode) || 'system'
  const palette = (getCookie(PALETTE_COOKIE_KEY) as Palette) || 'classic'

  return { mode, palette }
}
