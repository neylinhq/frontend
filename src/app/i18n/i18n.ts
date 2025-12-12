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
 * Change language without page reload
 */
export const changeLanguage = async (lng: string) => {
  // 1. Change language in i18next (lazy loads translations if needed)
  await i18n.changeLanguage(lng)

  // 2. Save to localStorage for client-side persistence
  localStorage.setItem('i18nextLng', lng)

  // 3. Save to cookie for SSR
  document.cookie = `i18nextLng=${lng}; path=/; max-age=31536000; SameSite=Lax`
}

export default i18n
