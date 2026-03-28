import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  // API Routes (resource routes without UI)
  route('api/refresh', 'routes/api.refresh.ts'),

  // Public Routes (with shared header/footer)
  layout('routes/public/layout.tsx', [
    index('routes/home.tsx'),
    route('pricing', 'routes/pricing.tsx'),
    route('legal/terms', 'routes/legal/terms.tsx'),
    route('legal/privacy', 'routes/legal/privacy.tsx'),
    route('legal/cookies', 'routes/legal/cookies.tsx'),
    route('legal/license', 'routes/legal/license.tsx'),

    // Auth Routes (centered, no footer, no auth buttons)
    route('auth/sign-in', 'routes/auth/sign-in.tsx'),
    route('auth/sign-up', 'routes/auth/sign-up.tsx'),
    route('auth/verify-email', 'routes/auth/verify-email.tsx'),
    route('auth/reset-password', 'routes/auth/reset-password.tsx'),
    route('auth/two-factor', 'routes/auth/two-factor.tsx'),

    // 404 Route (centered, no footer)
    route('*', 'routes/404.tsx'),

    // Docs UI (with sidebar navigation)
    layout('routes/docs/layout.tsx', [
      route('docs/ui', 'routes/docs/index.tsx'),
      route('docs/ui/colors', 'routes/docs/colors.tsx'),
      route('docs/ui/typography', 'routes/docs/typography.tsx'),
      // Components
      route('docs/ui/alert-dialog', 'routes/docs/alert-dialog.tsx'),
      route('docs/ui/avatar', 'routes/docs/avatar.tsx'),
      route('docs/ui/badge', 'routes/docs/badge.tsx'),
      route('docs/ui/button', 'routes/docs/button.tsx'),
      route('docs/ui/card', 'routes/docs/card.tsx'),
      route('docs/ui/checkbox', 'routes/docs/checkbox.tsx'),
      route('docs/ui/collapsible', 'routes/docs/collapsible.tsx'),
      route('docs/ui/context-menu', 'routes/docs/context-menu.tsx'),
      route('docs/ui/dialog', 'routes/docs/dialog.tsx'),
      route('docs/ui/drawer', 'routes/docs/drawer.tsx'),
      route('docs/ui/dropdown-menu', 'routes/docs/dropdown-menu.tsx'),
      route('docs/ui/form', 'routes/docs/form.tsx'),
      route('docs/ui/icon', 'routes/docs/icon.tsx'),
      route('docs/ui/input', 'routes/docs/input.tsx'),
      route('docs/ui/label', 'routes/docs/label.tsx'),
      route('docs/ui/popover', 'routes/docs/popover.tsx'),
      route('docs/ui/progress', 'routes/docs/progress.tsx'),
      route('docs/ui/radio-group', 'routes/docs/radio-group.tsx'),
      route('docs/ui/select', 'routes/docs/select.tsx'),
      route('docs/ui/separator', 'routes/docs/separator.tsx'),
      route('docs/ui/sheet', 'routes/docs/sheet.tsx'),
      route('docs/ui/slider', 'routes/docs/slider.tsx'),
      route('docs/ui/switch', 'routes/docs/switch.tsx'),
      route('docs/ui/table', 'routes/docs/table.tsx'),
      route('docs/ui/tabs', 'routes/docs/tabs.tsx'),
      route('docs/ui/textarea', 'routes/docs/textarea.tsx')
    ])
  ]),

  route('auth/logout', 'routes/auth/logout.ts'),

  // Dashboard Routes
  layout('routes/dashboard/layout.tsx', [
    route('dashboard/overview', 'routes/dashboard/overview.tsx'),
    route('dashboard/maps/new', 'routes/dashboard/maps/new.tsx'),
    route('dashboard/maps/:mapId/view', 'routes/dashboard/maps/$mapId/view.tsx'),
    route('dashboard/maps/:mapId/node/:nodeId', 'routes/dashboard/maps/$mapId/node.$nodeId.tsx'),
    route('dashboard/maps/:mapId/practice', 'routes/dashboard/maps/$mapId/practice.tsx'),

    // Settings Routes
    layout('routes/dashboard/settings/layout.tsx', [
      route('dashboard/settings/profile', 'routes/dashboard/settings/profile.tsx'),
      route('dashboard/settings/preferences', 'routes/dashboard/settings/preferences.tsx'),
      route('dashboard/settings/integrations', 'routes/dashboard/settings/integrations.tsx'),
      route('dashboard/settings/account', 'routes/dashboard/settings/account.tsx'),
      route('dashboard/settings/billing', 'routes/dashboard/settings/billing.tsx')
    ])
  ])
] satisfies RouteConfig
