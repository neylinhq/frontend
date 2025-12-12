/**
 * Централизованная конфигурация путей приложения
 * Используйте эти константы вместо хардкода путей
 */

// ==================== PUBLIC ROUTES ====================
export const ROUTES = {
  home: '/',
  pricing: '/pricing'
} as const

// ==================== AUTH ROUTES ====================
export const AUTH_ROUTES = {
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  verifyEmail: '/auth/verify-email',
  resetPassword: '/auth/reset-password',
  logout: '/auth/logout'
} as const

// ==================== DASHBOARD ROUTES ====================
export const DASHBOARD_ROUTES = {
  overview: '/dashboard/overview',
  aiLab: '/dashboard/ai-lab'
} as const

// ==================== MAPS ROUTES ====================
export const MAPS_ROUTES = {
  new: '/dashboard/maps/new',
  view: (mapId: string) => `/dashboard/maps/${mapId}/view`,
  practice: (mapId: string) => `/dashboard/maps/${mapId}/practice`,
  node: (mapId: string, nodeId: string) => `/dashboard/maps/${mapId}/node/${nodeId}`
} as const

// ==================== KNOWLEDGE BASE ROUTES ====================
export const KNOWLEDGE_BASE_ROUTES = {
  concepts: '/dashboard/knowledge-base/concepts'
} as const

// ==================== SETTINGS ROUTES ====================
export const SETTINGS_ROUTES = {
  profile: '/dashboard/settings/profile',
  preferences: '/dashboard/settings/preferences',
  integrations: '/dashboard/settings/integrations',
  security: '/dashboard/settings/security',
  billing: '/dashboard/settings/billing'
} as const

// ==================== LEGAL ROUTES ====================
export const LEGAL_ROUTES = {
  terms: '/legal/terms',
  privacy: '/legal/privacy',
  cookies: '/legal/cookies',
  license: '/legal/license'
} as const

// ==================== DOCS ROUTES ====================
export const DOCS_ROUTES = {
  ui: '/docs/ui',
  colors: '/docs/ui/colors',
  typography: '/docs/ui/typography',
  button: '/docs/ui/button',
  card: '/docs/ui/card'
} as const
