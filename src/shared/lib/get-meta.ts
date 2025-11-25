import { APP_NAME } from '@/shared/config'

// Мета данные на разных языках
const META_TRANSLATIONS = {
  ru: {
    home: {
      title: 'Главная',
      description: 'Платформа для управления знаниями'
    },
    overview: {
      title: 'Обзор',
      description: 'Ваши карты знаний'
    },
    mapView: {
      title: 'Карта знаний',
      description: 'Визуализация графа знаний'
    },
    signIn: {
      title: 'Вход',
      description: 'Войдите в свой аккаунт'
    },
    signUp: {
      title: 'Регистрация',
      description: 'Создайте новый аккаунт'
    },
    resetPassword: {
      title: 'Сброс пароля',
      description: 'Восстановите доступ к аккаунту'
    }
  },
  en: {
    home: {
      title: 'Home',
      description: 'Knowledge management platform'
    },
    overview: {
      title: 'Overview',
      description: 'Your knowledge maps'
    },
    mapView: {
      title: 'Knowledge Map',
      description: 'Knowledge graph visualization'
    },
    signIn: {
      title: 'Sign In',
      description: 'Sign in to your account'
    },
    signUp: {
      title: 'Sign Up',
      description: 'Create a new account'
    },
    resetPassword: {
      title: 'Reset Password',
      description: 'Restore access to your account'
    }
  },
  de: {
    home: {
      title: 'Startseite',
      description: 'Plattform für Wissensmanagement'
    },
    overview: {
      title: 'Übersicht',
      description: 'Ihre Wissenskarten'
    },
    mapView: {
      title: 'Wissenskarte',
      description: 'Visualisierung des Wissensgraphen'
    },
    signIn: {
      title: 'Anmelden',
      description: 'Melden Sie sich bei Ihrem Konto an'
    },
    signUp: {
      title: 'Registrieren',
      description: 'Erstellen Sie ein neues Konto'
    },
    resetPassword: {
      title: 'Passwort zurücksetzen',
      description: 'Stellen Sie den Zugriff auf Ihr Konto wieder her'
    }
  }
} as const

type MetaKey = keyof typeof META_TRANSLATIONS.ru

function getCurrentLanguage(): 'ru' | 'en' | 'de' {
  // Проверяем localStorage (где i18next хранит язык)
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('i18nextLng')
    if (savedLang === 'ru' || savedLang === 'en' || savedLang === 'de') {
      return savedLang
    }
  }
  // Дефолт - русский
  return 'ru'
}

export function getMeta(key: MetaKey) {
  const lang = getCurrentLanguage()
  const { title, description } = META_TRANSLATIONS[lang][key]

  return [
    { title: `${APP_NAME} — ${title}` },
    { name: 'description', content: description }
  ]
}
