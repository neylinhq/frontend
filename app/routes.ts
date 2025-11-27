import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  // Public Routes (with shared header/footer)
  layout('routes/public/layout.tsx', [
    index('routes/home.tsx'),
    route('pricing', 'routes/pricing.tsx'),
    route('legal/terms', 'routes/legal/terms.tsx'),
    route('legal/privacy', 'routes/legal/privacy.tsx'),
    route('legal/cookies', 'routes/legal/cookies.tsx'),
    route('legal/license', 'routes/legal/license.tsx'),

    // Docs UI (with sidebar navigation)
    layout('routes/docs/layout.tsx', [
      route('docs/ui', 'routes/docs/index.tsx'),
      route('docs/ui/colors', 'routes/docs/colors.tsx'),
      route('docs/ui/typography', 'routes/docs/typography.tsx'),
      route('docs/ui/button', 'routes/docs/button.tsx'),
      route('docs/ui/card', 'routes/docs/card.tsx'),
    ])
  ]),

  // Auth Routes (with header, no footer, centered)
  layout('routes/auth/layout.tsx', [
    route('auth/sign-in', 'routes/auth/sign-in.tsx'),
    route('auth/sign-up', 'routes/auth/sign-up.tsx'),
    route('auth/reset-password', 'routes/auth/reset-password.tsx')
  ]),
  route('auth/logout', 'routes/auth/logout.ts'),

  // Dashboard Routes
  layout('routes/dashboard/layout.tsx', [
    route('dashboard/overview', 'routes/dashboard/overview.tsx'),
    route('dashboard/maps/:mapId/view', 'routes/dashboard/maps/$mapId/view.tsx'),
    route('dashboard/maps/:mapId/node/:nodeId', 'routes/dashboard/maps/$mapId/node.$nodeId.tsx'),

    // Settings Routes
    layout('routes/dashboard/settings/layout.tsx', [
      route('dashboard/settings/profile', 'routes/dashboard/settings/profile.tsx'),
      route('dashboard/settings/preferences', 'routes/dashboard/settings/preferences.tsx'),
      route('dashboard/settings/theme', 'routes/dashboard/settings/theme.tsx'),
      route('dashboard/settings/integrations', 'routes/dashboard/settings/integrations.tsx'),
      route('dashboard/settings/security', 'routes/dashboard/settings/security.tsx'),
      route('dashboard/settings/billing', 'routes/dashboard/settings/billing.tsx')
    ])
  ]),

  // 404 Route
  route('*', 'routes/404.tsx')
] satisfies RouteConfig
