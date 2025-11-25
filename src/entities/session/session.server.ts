import { createCookie } from 'react-router'
import { IS_PROD, SESSION_SECRET } from '@/shared/config'

export const sessionCookie = createCookie('arbor_session', {
  secrets: [SESSION_SECRET],
  secure: IS_PROD,
  sameSite: 'lax',
  path: '/',
  httpOnly: true, // недоступно для JS
  maxAge: 60 * 60 * 24 * 30 // 30 days
})

export async function getSession(request: Request) {
  const cookieHeader = request.headers.get('Cookie')
  return (await sessionCookie.parse(cookieHeader)) || null
}

export async function commitSession(session: any) {
  return await sessionCookie.serialize(session)
}

export async function destroySession() {
  return await sessionCookie.serialize('', { maxAge: 0 }) // удаляем
}
