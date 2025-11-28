import { redirect } from 'react-router'
import { sessionApi } from '@/entities/session/session.api'
import { destroySession } from '@/entities/session/session.server'

export async function action() {
  // Call logout API to cleanup server-side session if needed
  await sessionApi.logout()

  // Destroy client cookie
  return redirect('/auth/sign-in', {
    headers: {
      'Set-Cookie': await destroySession()
    }
  })
}
