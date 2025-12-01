import { type ActionFunctionArgs, redirect } from 'react-router'
import { sessionApi } from '@/entities/session/session.api'
import { commitSession } from '@/entities/session/session.server'
import { SignInPage } from '@/pages/auth/sign-in-page'
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
    // Use session API instead of hardcoded logic
    const { user, token } = await sessionApi.login({ email, password })

    const sessionData = { token, user }
    const cookie = await commitSession(sessionData)

    const url = new URL(request.url)
    const returnUrl = url.searchParams.get('from') || '/dashboard/overview'

    return redirect(returnUrl, {
      headers: {
        'Set-Cookie': cookie
      }
    })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Неверный email или пароль'
    }
  }
}

const SignInRoute = () => {
  return <SignInPage />
}

export default SignInRoute
