import { useMatches } from 'react-router'
import type { User } from './user.schema'

interface DashboardLoaderData {
  user: User
}

/**
 * SSR-safe хук для получения текущего пользователя из loader data.
 *
 * Данные доступны сразу при рендере (без useEffect), т.к. приходят из SSR loader.
 * Работает только внутри dashboard routes (где загружен user через layout loader).
 *
 * @example
 * const user = useLoaderUser()
 * // user доступен и на SSR, и на клиенте без flash
 */
export const useLoaderUser = (): User | null => {
  const matches = useMatches()

  // Находим dashboard layout match (первый match с user в data)
  const dashboardMatch = matches.find(
    match => match.pathname.startsWith('/dashboard') && (match.data as DashboardLoaderData)?.user
  )

  return (dashboardMatch?.data as DashboardLoaderData)?.user ?? null
}
