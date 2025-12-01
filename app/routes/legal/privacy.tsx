import { PrivacyPage } from '@/pages/legal/privacy-page'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('privacy')
}

const PrivacyRoute = () => {
  return <PrivacyPage />
}

export default PrivacyRoute
