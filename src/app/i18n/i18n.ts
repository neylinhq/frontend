import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

export interface I18nInitData {
  locale: string
  translations: Record<string, unknown>
}

/**
 * Initialize i18n with SSR data
 */
export const initI18n = (data: I18nInitData) => {
  // Already initialized
  if (i18n.isInitialized) {
    // But language mismatch - add resources and switch
    if (i18n.language !== data.locale) {
      i18n.addResourceBundle(data.locale, 'translation', data.translations, true, true)
      i18n.changeLanguage(data.locale)
    }
    return i18n
  }

  i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      lng: data.locale,
      fallbackLng: 'en',
      debug: false,

      resources: {
        [data.locale]: {
          translation: data.translations
        }
      },
      partialBundledLanguages: true,

      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json'
      },

      react: {
        useSuspense: false
      },

      interpolation: {
        escapeValue: false
      }
    })

  return i18n
}

/**
 * Change language - saves to cookie and does full page navigation
 */
export const changeLanguage = (lng: string) => {
  document.cookie = `i18nextLng=${lng}; path=/; max-age=31536000; SameSite=Lax`
  // Full navigation instead of reload to avoid HMR cache issues
  window.location.href = window.location.href
}

export default i18n
