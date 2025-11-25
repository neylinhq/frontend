import { useEffect } from 'react'
import { type LoaderFunctionArgs, redirect } from 'react-router'
import { useSessionStore } from '@/entities/session'
import { getSession } from '@/entities/session/session.server'
import { DashboardLayout } from '@/widgets/dashboard-layout/dashboard-layout'

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

export default function DashboardRoute({ loaderData }: { loaderData: any }) {
  // TODO: fix typing
  const setUser = useSessionStore(state => state.setUser)

  // Гидратация стора данными с сервера
  useEffect(() => {
    if (loaderData?.user) {
      setUser(loaderData.user)
    }
  }, [loaderData, setUser])

  return <DashboardLayout />
}
