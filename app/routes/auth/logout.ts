import { redirect } from 'react-router'
import { destroySession } from '@/entities/session/session.server'

export async function action() {
  // Удаляем куку
  return redirect('/auth/sign-in', {
    headers: {
      'Set-Cookie': await destroySession()
    }
  })
}
