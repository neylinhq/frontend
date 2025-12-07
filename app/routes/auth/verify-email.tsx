import type { LoaderFunctionArgs } from 'react-router'
import { VerifyEmailPage } from '@/pages/auth/verify-email-page'
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
  const url = new URL(request.url)
  const email = url.searchParams.get('email')
  return { email }
}

const VerifyEmailRoute = () => {
  return <VerifyEmailPage />
}

export default VerifyEmailRoute
