import { type ActionFunctionArgs, redirect } from 'react-router'
import { commitSession } from '@/entities/session/session.server'
import type { User } from '@/entities/user'
import { SignInPage } from '@/pages/auth/sign-in-page' // Используем Page, а не Form напрямую!

// Mock User
const MOCK_USER: User = {
  id: '1',
  email: 'm@example.com',
  firstName: 'Max',
  lastName: 'Robinson',
  role: 'user',
  createdAt: new Date().toISOString()
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')

  if (email === 'm@example.com' && password === 'password') {
    const sessionData = {
      token: 'mock-jwt-token',
      user: MOCK_USER
    }

    const cookie = await commitSession(sessionData)
    const url = new URL(request.url)
    const returnUrl = url.searchParams.get('from') || '/dashboard/overview'

    return redirect(returnUrl, {
      headers: {
        'Set-Cookie': cookie
      }
    })
  }

  return { error: 'Неверный email или пароль' }
}

export default function SignInRoute() {
  return <SignInPage />
}
