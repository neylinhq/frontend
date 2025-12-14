import { SignUpPage } from '@/pages/auth/sign-up-page'
import { getMeta } from '@/shared/lib/get-meta'

export const handle = {
  hideFooter: true,
  centered: true
}

export const meta = () => {
  return getMeta('signUp')
}

const SignUpRoute = () => {
  return <SignUpPage />
}

export default SignUpRoute
