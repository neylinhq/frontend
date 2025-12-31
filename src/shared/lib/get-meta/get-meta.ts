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
    mapCreation: {
      title: 'Создать карту',
      description: 'Создайте новую карту знаний'
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
    verifyEmail: {
      title: 'Подтверждение email',
      description: 'Подтвердите ваш адрес электронной почты'
    },
    twoFactor: {
      title: 'Двухфакторная аутентификация',
      description: 'Введите код для подтверждения входа'
    },
    terms: {
      title: 'Условия использования',
      description:
        'Пожалуйста, внимательно прочитайте эти условия перед использованием нашего сервиса'
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
      description: 'Условия лицензирования программного обеспечения Neylin'
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
    },
    docs: {
      title: 'Документация',
      description: 'Дизайн-система и библиотека компонентов с примерами'
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
    mapCreation: {
      title: 'Create Map',
      description: 'Create a new knowledge map'
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
      description: 'Sign in to an account'
    },
    signUp: {
      title: 'Sign Up',
      description: 'Create a new account'
    },
    resetPassword: {
      title: 'Reset Password',
      description: 'Restore access to your account'
    },
    verifyEmail: {
      title: 'Verify Email',
      description: 'Verify your email address'
    },
    twoFactor: {
      title: 'Two-Factor Authentication',
      description: 'Enter code to verify your login'
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
      description: 'Neylin software licensing terms'
    },
    notFound: {
      title: 'Page Not Found',
      description: "Sorry, the page you're looking for doesn't exist or has been moved"
    },
    pricing: {
      title: 'Pricing',
      description: 'Choose the right plan for your knowledge management needs'
    },
    uiShowcase: {
      title: 'UI Components',
      description: 'Component library with documentation and examples'
    },
    docs: {
      title: 'Documentation',
      description: 'Design system and component library with examples'
    }
  }
} as const

type MetaKey = keyof typeof META_TRANSLATIONS.ru
type Language = keyof typeof META_TRANSLATIONS

const getCurrentLanguage = (): Language => {
  // Read from document.documentElement.lang (set by SSR)
  if (typeof document !== 'undefined') {
    const lang = document.documentElement.lang
    if (lang === 'ru' || lang === 'en') {
      return lang
    }
  }
  return 'en'
}

export const getMeta = (key: MetaKey) => {
  const lang = getCurrentLanguage()
  const translations = META_TRANSLATIONS[lang]
  const { title, description } = translations[key]

  return [{ title: `${title} | ${APP_NAME}` }, { name: 'description', content: description }]
}
