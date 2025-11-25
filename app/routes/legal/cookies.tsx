import { CookiesPage } from '@/pages/legal/cookies-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('cookies')
}

export default function CookiesRoute() {
  return <CookiesPage />
}
