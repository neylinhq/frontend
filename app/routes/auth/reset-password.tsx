import type { ActionFunctionArgs } from 'react-router'
import { sessionApi } from '@/entities/session'
import { ResetPasswordPage } from '@/pages/auth/reset-password-page'
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
  const email = formData.get('email') as string

  try {
    // Use session API for password reset
    const result = await sessionApi.resetPassword(email)
    return result
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Ошибка сброса пароля'
    }
  }
}

const ResetPasswordRoute = () => {
  return <ResetPasswordPage />
}

export default ResetPasswordRoute
