export const SUPPORT_CONTACTS = {
  telegram: {
    url: 'https://t.me/neylin_support',
    label: 'Telegram'
  },
  email: {
    url: 'mailto:support@neylin.app',
    address: 'support@neylin.app',
    label: 'Email'
  }
} as const

export type SupportChannel = keyof typeof SUPPORT_CONTACTS
