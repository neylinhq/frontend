import { useMatches } from 'react-router'

import type { User } from './user.schema'

interface LoaderDataWithUser {
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

  // Находим любой match с user в data (dashboard layout загружает user)
  const matchWithUser = matches.find(match => (match.data as LoaderDataWithUser)?.user)

  return (matchWithUser?.data as LoaderDataWithUser)?.user ?? null
}
