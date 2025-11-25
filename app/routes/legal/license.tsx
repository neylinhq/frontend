import { LicensePage } from '@/pages/legal/license-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('license')
}

export default function LicenseRoute() {
  return <LicensePage />
}
