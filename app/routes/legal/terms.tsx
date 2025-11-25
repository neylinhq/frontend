import { TermsPage } from '@/pages/legal/terms-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('terms')
}

export default function TermsRoute() {
  return <TermsPage />
}
