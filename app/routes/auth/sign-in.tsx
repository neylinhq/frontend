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

const SignInRoute = () => {
  return <SignInPage />
}

export default SignInRoute
