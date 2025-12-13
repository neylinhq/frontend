import { getCookie } from '@/shared/api/server'
import type { Mode, Palette } from '@/shared/core/theme'
import { MODE_COOKIE_KEY, PALETTE_COOKIE_KEY } from '@/shared/core/theme'

export type ThemeData = {
  mode: Mode
  palette: Palette
}

/**
 * Get theme data from cookies for SSR
 */
export const getThemeData = (request: Request) => {
  const cookieHeader = request.headers.get('Cookie') ?? ''

  const mode = (getCookie(cookieHeader, MODE_COOKIE_KEY) as Mode) || 'system'
  const palette = (getCookie(cookieHeader, PALETTE_COOKIE_KEY) as Palette) || 'classic'

  return { mode, palette }
}
