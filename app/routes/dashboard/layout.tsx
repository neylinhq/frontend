import { useEffect } from 'react'
import { type LoaderFunctionArgs, Outlet, redirect, useLoaderData, useMatches } from 'react-router'
import { useSessionStore } from '@/entities/session'
import { getSession } from '@/entities/session/session.server'
import { DashboardLayout } from '@/widgets/dashboard-layout/ui/dashboard-layout'

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request)

  if (!session || !session.user) {
    const url = new URL(request.url)
    const pathname = url.pathname
    // Редирект на логин, если нет сессии
    throw redirect(`/auth/sign-in?from=${encodeURIComponent(pathname)}`)
  }

  // Возвращаем данные пользователя, чтобы React Router мог их использовать (хотя мы их также положим в стор)
  return { user: session.user }
}

export default function DashboardRoute() {
  const { user } = useLoaderData<typeof loader>()
  const setUser = useSessionStore(state => state.setUser)
  const matches = useMatches()

  // Check if any child route has disableScroll in handle
  const disableScroll = matches.some(
    match => (match.handle as { disableScroll?: boolean })?.disableScroll
  )

  // Гидратация стора данными с сервера
  useEffect(() => {
    if (user) {
      setUser(user)
    }
  }, [user, setUser])

  return (
    <DashboardLayout disableScroll={disableScroll}>
      <Outlet />
    </DashboardLayout>
  )
}
