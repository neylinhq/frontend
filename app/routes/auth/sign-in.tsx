import { type ActionFunctionArgs, redirect } from 'react-router'
import { sessionApi } from '@/entities/session/session.api'
import { commitSession } from '@/entities/session/session.server'
import { SignInPage } from '@/pages/auth/sign-in-page'
import { ApiError } from '@/shared/api/api-client'
import { getMeta } from '@/shared/lib/get-meta'

export const handle = {
  hideAuthButtons: true,
  hideFooter: true,
  centered: true
}

export const meta = () => {
  return getMeta('signIn')
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    console.log('[sign-in action] Starting login for:', email)

    // Use session API instead of hardcoded logic
    const result = await sessionApi.login({ email, password })
    console.log('[sign-in action] Login result:', result)

    const { user, accessToken } = result

    const sessionData = { token: accessToken, user }
    const cookie = await commitSession(sessionData)

    const url = new URL(request.url)
    const returnUrl = url.searchParams.get('from') || '/dashboard/overview'

    return redirect(returnUrl, {
      headers: {
        'Set-Cookie': cookie
      }
    })
  } catch (error) {
    // Extract error message from API response
    if (error instanceof ApiError) {
      const data = error.data as { error?: { message?: string; code?: string } } | null
      const message = data?.error?.message || 'Неверный email или пароль'
      return { error: message, code: data?.error?.code }
    }

    return {
      error: error instanceof Error ? error.message : 'Неверный email или пароль'
    }
  }
}

const SignInRoute = () => {
  return <SignInPage />
}

export default SignInRoute
