import { redirect } from 'react-router'
import { sessionApi } from '@/entities/session'
import { destroySession } from '@/entities/session/session.server'

export const action = async () => {
  // Call logout API to cleanup server-side session (ignore errors - we logout anyway)
  try {
    await sessionApi.logout()
  } catch {
    // Ignore - token might be expired or invalid, we still want to destroy local session
  }

  // Destroy client cookie
  return redirect('/auth/sign-in', {
    headers: {
      'Set-Cookie': await destroySession()
    }
  })
}
