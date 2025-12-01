import { CookiesPage } from '@/pages/legal/cookies-page'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('cookies')
}

const CookiesRoute = () => {
  return <CookiesPage />
}

export default CookiesRoute
