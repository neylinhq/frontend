export interface LegalLink {
  key: 'terms' | 'privacy' | 'cookies' | 'license'
  href: string
  titleKey: string
}

export const LEGAL_LINKS: Record<LegalLink['key'], LegalLink> = {
  terms: {
    key: 'terms',
    href: '/legal/terms',
    titleKey: 'legal.terms.title'
  },
  privacy: {
    key: 'privacy',
    href: '/legal/privacy',
    titleKey: 'legal.privacy.title'
  },
  cookies: {
    key: 'cookies',
    href: '/legal/cookies',
    titleKey: 'legal.cookies.title'
  },
  license: {
    key: 'license',
    href: '/legal/license',
    titleKey: 'legal.license.title'
  }
}

export type LegalLinkVariant = 'footer' | 'inline' | 'embedded' | 'full'

export const DEFAULT_LINKS_BY_VARIANT: Record<LegalLinkVariant, LegalLink['key'][]> = {
  footer: ['terms', 'privacy'],
  inline: ['terms', 'privacy'],
  embedded: ['terms', 'privacy'],
  full: ['terms', 'privacy', 'cookies', 'license']
}
