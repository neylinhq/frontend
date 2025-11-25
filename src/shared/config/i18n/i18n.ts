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

i18n
  // загружаем переводы через http (public/locales)
  .use(Backend)
  // определяем язык пользователя
  .use(LanguageDetector)
  // передаем i18n в react-i18next
  .use(initReactI18next)
  // инициализируем
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    detection: detectionOptions,

    react: {
      useSuspense: true // Включаем Suspense
    },

    interpolation: {
      escapeValue: false
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    }
  })

export default i18n
