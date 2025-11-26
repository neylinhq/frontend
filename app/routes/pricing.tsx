import type { PlanDetails } from '@/entities/subscription/subscription.schema'
import { subscriptionApi } from '@/entities/subscription/subscription.api'
import { PricingPage } from '@/pages/pricing-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('pricing')
}

export async function loader() {
  // Fetch plans on server for SSR
  const plans = await subscriptionApi.getPlans()
  return { plans }
}

export default function Pricing({ loaderData }: { loaderData: { plans: PlanDetails[] } }) {
  return <PricingPage plans={loaderData.plans} />
}
