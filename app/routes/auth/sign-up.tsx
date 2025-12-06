import { type ActionFunctionArgs, redirect } from 'react-router'
import { sessionApi } from '@/entities/session'
import { commitSession } from '@/entities/session/session.server'
import { SignUpPage } from '@/pages/auth/sign-up-page'
import { ApiError } from '@/shared/api/api-client'
import { getMeta } from '@/shared/lib/get-meta'

export const handle = {
  hideAuthButtons: true,
  hideFooter: true,
  centered: true
}

export const meta = () => {
  return getMeta('signUp')
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('[sign-up action] Starting registration for:', email)

  try {
    // Use session API for registration
    const { user, accessToken, refreshToken } = await sessionApi.register({ email, password })

    console.log('[sign-up action] Success! User:', user.id)

    const sessionData = { token: accessToken, user, refreshToken }
    const cookie = await commitSession(sessionData)

    // Redirect to verify-email page with email in query
    const verifyUrl = `/auth/verify-email?email=${encodeURIComponent(user.email)}`

    return redirect(verifyUrl, {
      headers: {
        'Set-Cookie': cookie
      }
    })
  } catch (error) {
    console.error('[sign-up action] Error:', error)

    // Extract error message from API response
    if (error instanceof ApiError) {
      const data = error.data as { error?: { message?: string; code?: string } } | null
      const message = data?.error?.message || error.message
      return { error: message, code: data?.error?.code }
    }

    return {
      error: error instanceof Error ? error.message : 'Ошибка регистрации'
    }
  }
}

const SignUpRoute = () => {
  return <SignUpPage />
}

export default SignUpRoute
