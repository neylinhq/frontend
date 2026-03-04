import * as fs from 'node:fs'
import * as path from 'node:path'

import { getLocale, type SupportedLanguage } from '@/shared/lib/locale'

export { getLocale, type SupportedLanguage }

export const defaultLanguage: SupportedLanguage = 'en'

/**
 * Get translations for a specific language on the server side
 */
export const getTranslations = (locale: SupportedLanguage): Record<string, unknown> => {
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
 * Get i18n data for SSR - to be used in root loader
 */
export const getI18nData = (request: Request) => {
  const locale = getLocale(request)
  const translations = getTranslations(locale)

  return {
    locale,
    translations
  }
}
