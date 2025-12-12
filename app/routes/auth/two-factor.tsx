import { TwoFactorPage } from '@/pages/auth/two-factor-page'
import { getMeta } from '@/shared/lib/get-meta'

export const handle = {
  hideAuthButtons: true,
  hideFooter: true,
  centered: true
}

export const meta = () => {
  return getMeta('twoFactor')
}

const TwoFactorRoute = () => {
  return <TwoFactorPage />
}

export default TwoFactorRoute
