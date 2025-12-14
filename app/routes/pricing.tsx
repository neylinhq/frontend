import type { LoaderFunctionArgs } from 'react-router'
import type { PlanDetails } from '@/entities/subscription'
import { PricingPage } from '@/pages/pricing-page'
import { API_URL } from '@/shared/config'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('pricing')
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get('Cookie')

  try {
    const response = await fetch(`${API_URL}/subscriptions/plans`, {
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader })
      }
    })

    if (!response.ok) {
      console.warn('Failed to load plans:', response.status, response.statusText)
      return { plans: [] }
    }

    const data = await response.json()
    return { plans: data.data as PlanDetails[] }
  } catch (error) {
    console.warn('Failed to load plans in SSR:', error)
    return { plans: [] }
  }
}

const Pricing = ({ loaderData }: { loaderData: { plans: PlanDetails[] } }) => {
  return <PricingPage plans={loaderData.plans} />
}

export default Pricing
