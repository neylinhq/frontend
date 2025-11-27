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
    nodeEdit: {
      title: 'Редактирование узла',
      description: 'Редактирование узла карты знаний'
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
    },
    terms: {
      title: 'Условия использования',
      description: 'Пожалуйста, внимательно прочитайте эти условия перед использованием нашего сервиса'
    },
    privacy: {
      title: 'Политика конфиденциальности',
      description: 'Узнайте, как мы собираем, используем и защищаем ваши персональные данные'
    },
    cookies: {
      title: 'Политика использования Cookie',
      description: 'Информация о том, как мы используем cookies для улучшения вашего опыта'
    },
    license: {
      title: 'Лицензионное соглашение',
      description: 'Условия лицензирования программного обеспечения Arbor'
    },
    notFound: {
      title: 'Страница не найдена',
      description: 'К сожалению, запрашиваемая страница не существует или была перемещена'
    },
    pricing: {
      title: 'Тарифы',
      description: 'Выберите подходящий тариф для управления вашими знаниями'
    },
    uiShowcase: {
      title: 'UI Компоненты',
      description: 'Библиотека компонентов интерфейса с документацией и примерами'
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
    nodeEdit: {
      title: 'Edit Node',
      description: 'Edit knowledge map node'
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
    },
    terms: {
      title: 'Terms of Service',
      description: 'Please read these terms carefully before using our service'
    },
    privacy: {
      title: 'Privacy Policy',
      description: 'Learn how we collect, use, and protect your personal data'
    },
    cookies: {
      title: 'Cookie Policy',
      description: 'Information about how we use cookies to improve your experience'
    },
    license: {
      title: 'License Agreement',
      description: 'Arbor software licensing terms'
    },
    notFound: {
      title: 'Page Not Found',
      description: 'Sorry, the page you\'re looking for doesn\'t exist or has been moved'
    },
    pricing: {
      title: 'Pricing',
      description: 'Choose the right plan for your knowledge management needs'
    },
    uiShowcase: {
      title: 'UI Components',
      description: 'Component library with documentation and examples'
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
    nodeEdit: {
      title: 'Knoten bearbeiten',
      description: 'Wissenskarte Knoten bearbeiten'
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
    },
    terms: {
      title: 'Nutzungsbedingungen',
      description: 'Bitte lesen Sie diese Bedingungen sorgfältig durch, bevor Sie unseren Service nutzen'
    },
    privacy: {
      title: 'Datenschutzerklärung',
      description: 'Erfahren Sie, wie wir Ihre personenbezogenen Daten erheben, verwenden und schützen'
    },
    cookies: {
      title: 'Cookie-Richtlinie',
      description: 'Informationen darüber, wie wir Cookies verwenden, um Ihr Erlebnis zu verbessern'
    },
    license: {
      title: 'Lizenzvereinbarung',
      description: 'Lizenzbedingungen für die Arbor-Software'
    },
    notFound: {
      title: 'Seite nicht gefunden',
      description: 'Leider existiert die gesuchte Seite nicht oder wurde verschoben'
    },
    pricing: {
      title: 'Preise',
      description: 'Wählen Sie den richtigen Tarif für Ihre Wissensmanagement-Bedürfnisse'
    },
    uiShowcase: {
      title: 'UI-Komponenten',
      description: 'Komponentenbibliothek mit Dokumentation und Beispielen'
    }
  }
} as const

type MetaKey = keyof typeof META_TRANSLATIONS.ru
type Language = 'ru' | 'en' | 'de'

function getCurrentLanguage(): Language {
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
  const translations = META_TRANSLATIONS[lang] as Record<MetaKey, { title: string; description: string }>
  const { title, description } = translations[key]

  return [
    { title: `${APP_NAME} — ${title}` },
    { name: 'description', content: description }
  ]
}
