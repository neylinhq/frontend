import type { ActionFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { sessionApi } from '@/entities/session'
import { ResetPasswordPage } from '@/pages/auth/reset-password-page'
import { ApiError } from '@/shared/api/api-client'
import { getMeta } from '@/shared/lib/get-meta'

export const handle = {
  hideAuthButtons: true,
  hideFooter: true,
  centered: true
}

export const meta = () => {
  return getMeta('resetPassword')
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const intent = formData.get('intent') as string

  try {
    if (intent === 'request') {
      // Step 1: Request password reset code
      const email = formData.get('email') as string

      if (!email) {
        return { error: 'Email is required' }
      }

      await sessionApi.forgotPassword(email)

      // Return step to show OTP form
      return { step: 'code', email }
    }

    if (intent === 'reset') {
      // Step 2: Verify code and reset password
      const email = formData.get('email') as string
      const code = formData.get('code') as string
      const password = formData.get('password') as string

      if (!email || !code || !password) {
        return { error: 'All fields are required' }
      }

      if (code.length !== 6) {
        return { error: 'Invalid verification code' }
      }

      await sessionApi.resetPassword({ email, code, password })

      // Return success step
      return { step: 'complete' }
    }

    return { error: 'Invalid action' }
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as { error?: { message?: string } } | null
      const message = data?.error?.message || 'An error occurred'
      return { error: message }
    }

    if (error instanceof Response) {
      throw error
    }

    return { error: 'An error occurred. Please try again.' }
  }
}

const ResetPasswordRoute = () => {
  return <ResetPasswordPage />
}

export default ResetPasswordRoute
