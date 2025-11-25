import { PrivacyPage } from '@/pages/legal/privacy-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('privacy')
}

export default function PrivacyRoute() {
  return <PrivacyPage />
}
