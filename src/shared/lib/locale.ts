const SUPPORTED_LANGUAGES = ['en', 'ru'] as const
const DEFAULT_LANGUAGE = 'en'

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

/**
 * Get locale from request cookies (server-side)
 */
export const getLocale = (request: Request): SupportedLanguage => {
  const cookieHeader = request.headers.get('Cookie')
  const cookieLocale = cookieHeader
    ?.split(';')
    .find(c => c.trim().startsWith('i18nextLng='))
    ?.split('=')[1]
    ?.trim()

  return (
    SUPPORTED_LANGUAGES.includes(cookieLocale as SupportedLanguage)
      ? cookieLocale
      : DEFAULT_LANGUAGE
  ) as SupportedLanguage
}
