import type { PlanDetails } from '@/entities/subscription'
import { subscriptionApi } from '@/entities/subscription'
import { PricingPage } from '@/pages/pricing-page'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('pricing')
}

export const loader = async () => {
  // Fetch plans on server for SSR
  const plans = await subscriptionApi.getPlans()
  return { plans }
}

const Pricing = ({ loaderData }: { loaderData: { plans: PlanDetails[] } }) => {
  return <PricingPage plans={loaderData.plans} />
}

export default Pricing
