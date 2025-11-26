import * as fs from 'fs'
import * as path from 'path'

export const supportedLanguages = ['en', 'ru', 'de'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]
export const defaultLanguage: SupportedLanguage = 'en'

/**
 * Get translations for a specific language on the server side
 */
export function getTranslations(locale: SupportedLanguage): Record<string, unknown> {
  const filePath = path.join(process.cwd(), 'public', 'locales', locale, 'translation.json')

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    // Fallback to default language if file not found
    if (locale !== defaultLanguage) {
      return getTranslations(defaultLanguage)
    }
    return {}
  }
}

/**
 * Detect language from request headers (Accept-Language)
 */
export function detectLanguage(acceptLanguage: string | null): SupportedLanguage {
  if (!acceptLanguage) return defaultLanguage

  // Parse Accept-Language header (e.g., "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = 'q=1'] = lang.trim().split(';')
      return {
        code: code.split('-')[0].toLowerCase(), // ru-RU -> ru
        quality: parseFloat(q.replace('q=', '')) || 1
      }
    })
    .sort((a, b) => b.quality - a.quality)

  // Find first supported language
  for (const { code } of languages) {
    if (supportedLanguages.includes(code as SupportedLanguage)) {
      return code as SupportedLanguage
    }
  }

  return defaultLanguage
}

/**
 * Get i18n data for SSR - to be used in root loader
 */
export function getI18nData(request: Request) {
  // Check cookie first (user preference), then Accept-Language header
  const cookieHeader = request.headers.get('Cookie')
  const cookieLocale = cookieHeader
    ?.split(';')
    .find(c => c.trim().startsWith('i18nextLng='))
    ?.split('=')[1]
    ?.trim()

  const locale = (
    supportedLanguages.includes(cookieLocale as SupportedLanguage)
      ? cookieLocale
      : detectLanguage(request.headers.get('Accept-Language'))
  ) as SupportedLanguage

  const translations = getTranslations(locale)

  return {
    locale,
    translations
  }
}
