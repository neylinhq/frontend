import { type ActionFunctionArgs, redirect } from 'react-router'
import { sessionApi } from '@/entities/session/session.api'
import { commitSession } from '@/entities/session/session.server'
import { SignUpPage } from '@/pages/auth/sign-up-page'
import { getMeta } from '@/shared/lib/get-meta'

export const handle = {
  hideAuthButtons: true,
  hideFooter: true,
  centered: true,
}

export function meta() {
  return getMeta('signUp')
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  try {
    // Use session API for registration
    const { user, token } = await sessionApi.register({ email, password, name })

    const sessionData = { token, user }
    const cookie = await commitSession(sessionData)

    return redirect('/dashboard/overview', {
      headers: {
        'Set-Cookie': cookie
      }
    })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Ошибка регистрации'
    }
  }
}

export default function SignUpRoute() {
  return <SignUpPage />
}
