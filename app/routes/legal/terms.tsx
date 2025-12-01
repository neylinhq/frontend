import { TermsPage } from '@/pages/legal/terms-page'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('terms')
}

const TermsRoute = () => {
  return <TermsPage />
}

export default TermsRoute
