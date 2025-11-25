import { index, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('ui', 'routes/ui.tsx'),
  route('auth/sign-in', 'routes/auth/sign-in.tsx'),
  route('auth/sign-up', 'routes/auth/sign-up.tsx'),
  route('auth/reset-password', 'routes/auth/reset-password.tsx')
] satisfies RouteConfig
