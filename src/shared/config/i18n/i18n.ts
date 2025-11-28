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
    // SSR mode: синхронная инициализация с готовыми переводами
    // Backend включен для загрузки других языков при переключении
    i18n
      .use(Backend)
      .use(initReactI18next)
      .init({
        lng: data.locale,
        fallbackLng: 'en',
        debug: false,
        initImmediate: true,

        // Текущий язык уже загружен, остальные загрузим через Backend
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
