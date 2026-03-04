import { createCookie } from 'react-router'

import { IS_PROD, SESSION_SECRET } from '@/shared/config'

import type { SessionData } from '../session.types'

export const sessionCookie = createCookie('neylin-session', {
  secrets: [SESSION_SECRET],
  secure: IS_PROD,
  sameSite: 'lax',
  path: '/',
  httpOnly: true, // недоступно для JS
  maxAge: 60 * 60 * 24 * 30 // 30 days
})

const isValidSession = (value: unknown) => {
  return typeof value === 'object' && value !== null && 'user' in value && 'token' in value
}

export const getSession = async (request: Request) => {
  const cookieHeader = request.headers.get('Cookie')
  const session = await sessionCookie.parse(cookieHeader)

  if (!session || !isValidSession(session)) {
    return null
  }

  return session as SessionData
}

export const commitSession = async (session: SessionData) => {
  return await sessionCookie.serialize(session)
}

export const destroySession = async () => {
  return await sessionCookie.serialize('', { maxAge: 0 }) // удаляем
}
