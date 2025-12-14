import { ResetPasswordPage } from '@/pages/auth/reset-password-page'
import { getMeta } from '@/shared/lib/get-meta'

export const handle = {
  hideFooter: true,
  centered: true
}

export const meta = () => {
  return getMeta('resetPassword')
}

const ResetPasswordRoute = () => {
  return <ResetPasswordPage />
}

export default ResetPasswordRoute
