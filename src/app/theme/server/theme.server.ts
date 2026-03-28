import type { Mode, Palette } from '@/shared/core/theme'
import { MODE_COOKIE_KEY, PALETTE_COOKIE_KEY } from '@/shared/core/theme'
import { getCookieHeader, parseCookieHeader } from '@/shared/lib/cookies'

export type ThemeData = {
  mode: Mode
  palette: Palette
}

/**
 * Get theme data from cookies for SSR
 */
export const getThemeData = (request: Request) => {
  const cookieHeader = getCookieHeader(request)

  const mode = (parseCookieHeader(cookieHeader, MODE_COOKIE_KEY) as Mode) || 'system'
  const palette = (parseCookieHeader(cookieHeader, PALETTE_COOKIE_KEY) as Palette) || 'classic'

  return { mode, palette }
}
