import { type ActionFunctionArgs, redirect } from 'react-router'
// TODO: Implement registration logic
// import { commitSession } from '@/entities/session/session.server'
import { SignUpPage } from '@/pages/auth/sign-up-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('signUp')
}

export async function action({ request }: ActionFunctionArgs) {
  // Mock registration
  const formData = await request.formData()
  const email = formData.get('email')

  if (email) {
    return redirect('/auth/sign-in')
  }
  return null
}

export default function SignUpRoute() {
  return <SignUpPage />
}
