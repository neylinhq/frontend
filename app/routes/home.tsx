import type { LoaderFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { API_URL, DASHBOARD_ROUTES } from '@/shared/config'
import { HomePage } from '@/pages/home-page'
import { getMeta } from '@/shared/lib/get-meta'

// Redirect authenticated users to dashboard
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get('Cookie')

  try {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader })
      }
    })

    // If user is authenticated, redirect to dashboard
    if (response.ok) {
      throw redirect(DASHBOARD_ROUTES.overview)
    }
  } catch (error) {
    // If it's a redirect, re-throw it
    if (error instanceof Response) {
      throw error
    }
    // Otherwise, ignore errors and show landing page
  }

  return null
}

export const meta = () => {
  return getMeta('home')
}

const Home = () => {
  return <HomePage />
}

export default Home
