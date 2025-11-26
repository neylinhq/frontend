import { PricingPage } from '@/pages/pricing-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('pricing')
}

export default function Pricing() {
  return <PricingPage />
}
