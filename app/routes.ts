import { index, layout, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('ui', 'routes/ui.tsx'),

  // Auth Routes
  route('auth/sign-in', 'routes/auth/sign-in.tsx'),
  route('auth/sign-up', 'routes/auth/sign-up.tsx'),
  route('auth/reset-password', 'routes/auth/reset-password.tsx'),
  route('auth/logout', 'routes/auth/logout.ts'), // Logout action route

  // Dashboard Routes
  layout('routes/dashboard/layout.tsx', [
    route('dashboard/overview', 'routes/dashboard/overview.tsx'),
    route('dashboard/maps/:mapId/view', 'routes/dashboard/maps/$mapId/view.tsx')
  ])
] satisfies RouteConfig
