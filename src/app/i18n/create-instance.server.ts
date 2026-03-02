import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'

/**
 * Create a fresh i18next instance for server-side rendering.
 * Each request gets its own instance to support different locales.
 */
export const createServerI18nInstance = async (
  locale: string,
  translations: Record<string, unknown>
) => {
  const instance = createInstance()

  await instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: 'en',
    resources: {
      [locale]: { translation: translations }
    },
    interpolation: {
      escapeValue: false
    }
  })

  return instance
}
