import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from 'react-router'
import { sessionApi } from '@/entities/session'
import { getSession, commitSession } from '@/entities/session/session.server'
import { VerifyEmailPage } from '@/pages/auth/verify-email-page'
import { ApiError } from '@/shared/api/api-client'
import { getMeta } from '@/shared/lib/get-meta'

export const handle = {
  hideAuthButtons: true,
  hideFooter: true,
  centered: true
}

export const meta = () => {
  return getMeta('verifyEmail')
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request)
  const url = new URL(request.url)

  // Get email from query params or session
  const email = url.searchParams.get('email') || session?.user?.email

  // If user is already verified, redirect to dashboard
  if (session?.user?.emailVerified) {
    throw redirect('/dashboard/overview')
  }

  return { email }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const intent = formData.get('intent') as string
  const session = await getSession(request)

  try {
    if (intent === 'resend') {
      // Resend verification email - requires auth
      await sessionApi.resendVerification()
      return { success: true }
    }

    if (intent === 'verify') {
      const code = formData.get('code') as string

      if (!code || code.length !== 6) {
        return { error: 'Please enter a valid 6-digit code' }
      }

      // Verify email
      await sessionApi.verifyEmail({ code })

      // Update session to mark email as verified
      if (session?.user) {
        const updatedSession = {
          ...session,
          user: { ...session.user, emailVerified: true }
        }
        const cookie = await commitSession(updatedSession)

        return redirect('/dashboard/overview', {
          headers: {
            'Set-Cookie': cookie
          }
        })
      }

      return redirect('/dashboard/overview')
    }

    return { error: 'Invalid action' }
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as { error?: { message?: string } } | null
      const message = data?.error?.message || 'Verification failed'
      return { error: message }
    }

    if (error instanceof Response) {
      throw error // Re-throw redirects
    }

    return { error: 'An error occurred. Please try again.' }
  }
}

const VerifyEmailRoute = () => {
  return <VerifyEmailPage />
}

export default VerifyEmailRoute
