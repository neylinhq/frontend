import { useEffect, useState } from 'react'
import { type LoaderFunctionArgs, Outlet, redirect, useLoaderData, useOutletContext } from 'react-router'
import { useSessionStore } from '@/entities/session'
import { getSession } from '@/entities/session/session.server'
import { DashboardLayout } from '@/widgets/dashboard-layout/ui/dashboard-layout'

type DashboardContext = {
  setDisableScroll: (value: boolean) => void
}

export function useDashboardContext() {
  return useOutletContext<DashboardContext>()
}

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
  const [disableScroll, setDisableScroll] = useState(false)

  // Гидратация стора данными с сервера
  useEffect(() => {
    if (user) {
      setUser(user)
    }
  }, [user, setUser])

  return (
    <DashboardLayout disableScroll={disableScroll}>
      <Outlet context={{ setDisableScroll } satisfies DashboardContext} />
    </DashboardLayout>
  )
}
