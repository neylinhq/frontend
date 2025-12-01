import { LicensePage } from '@/pages/legal/license-page'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('license')
}

const LicenseRoute = () => {
  return <LicensePage />
}

export default LicenseRoute
