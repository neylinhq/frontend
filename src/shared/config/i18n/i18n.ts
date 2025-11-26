import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

// Настраиваем детекцию языка (Browser -> LocalStorage -> Navigator)
const detectionOptions = {
  order: ['localStorage', 'navigator'],
  lookupLocalStorage: 'i18nextLng',
  caches: ['localStorage']
}

export interface I18nInitData {
  locale: string
  translations: Record<string, unknown>
}

let initialized = false

/**
 * Initialize i18n with SSR data (translations from server)
 */
export function initI18n(data?: I18nInitData) {
  if (initialized) return i18n

  if (data?.translations) {
    // SSR mode: use pre-loaded translations
    i18n
      .use(Backend) // For loading other languages on demand
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        lng: data.locale,
        fallbackLng: 'en',
        debug: import.meta.env.DEV,
        detection: detectionOptions,

        resources: {
          [data.locale]: {
            translation: data.translations
          }
        },

        react: {
          useSuspense: false // Уже есть данные, Suspense не нужен
        },

        interpolation: {
          escapeValue: false
        },

        // Загружаем остальные языки по требованию при смене языка
        partialBundledLanguages: true,
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json'
        }
      })
  } else {
    // Client-only mode (fallback): load translations via HTTP
    i18n
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: 'en',
        debug: import.meta.env.DEV,
        detection: detectionOptions,

        react: {
          useSuspense: true
        },

        interpolation: {
          escapeValue: false
        },

        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json'
        }
      })
  }

  initialized = true
  return i18n
}

export default i18n
