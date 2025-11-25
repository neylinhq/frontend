import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('ui', 'routes/ui.tsx'),

  // Auth Routes
  route('auth/sign-in', 'routes/auth/sign-in.tsx'),
  route('auth/sign-up', 'routes/auth/sign-up.tsx'),
  route('auth/reset-password', 'routes/auth/reset-password.tsx'),

  // Dashboard Routes
  layout('routes/dashboard/layout.tsx', [
    route('dashboard/overview', 'routes/dashboard/overview.tsx')
    // Будущие роуты:
    // route('dashboard/maps/new', 'routes/dashboard/maps/new.tsx'),
    // route('dashboard/maps/:mapId/view', 'routes/dashboard/maps/view.tsx'),
  ])
] satisfies RouteConfig
