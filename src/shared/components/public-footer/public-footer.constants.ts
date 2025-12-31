import { DOCS_ROUTES, LEGAL_ROUTES, ROUTES } from '@/shared/config/routes'
import { SUPPORT_CONTACTS } from '@/shared/config/support'

export interface FooterLink {
  labelKey: string
  href: string
  external?: boolean
}

export interface FooterSection {
  titleKey: string
  links: FooterLink[]
}

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    titleKey: 'footer.sections.product',
    links: [
      { labelKey: 'footer.links.features', href: `${ROUTES.home}#features` },
      { labelKey: 'footer.links.pricing', href: ROUTES.pricing }
    ]
  },
  {
    titleKey: 'footer.sections.resources',
    links: [
      { labelKey: 'footer.links.documentation', href: DOCS_ROUTES.ui },
      { labelKey: 'footer.links.helpCenter', href: SUPPORT_CONTACTS.telegram.url, external: true }
    ]
  },
  {
    titleKey: 'footer.sections.company',
    links: [
      { labelKey: 'footer.links.about', href: `${ROUTES.home}#about` },
      { labelKey: 'footer.links.blog', href: '#' }
    ]
  },
  {
    titleKey: 'footer.sections.legal',
    links: [
      { labelKey: 'legal.terms.title', href: LEGAL_ROUTES.terms },
      { labelKey: 'legal.privacy.title', href: LEGAL_ROUTES.privacy },
      { labelKey: 'legal.cookies.title', href: LEGAL_ROUTES.cookies },
      { labelKey: 'legal.license.title', href: LEGAL_ROUTES.license }
    ]
  }
]

export const SOCIAL_LINKS = [
  { name: 'Telegram', url: SUPPORT_CONTACTS.telegram.url, icon: 'telegram' as const },
  { name: 'Email', url: SUPPORT_CONTACTS.email.url, icon: 'email' as const }
] as const

export type SocialIconType = (typeof SOCIAL_LINKS)[number]['icon']
