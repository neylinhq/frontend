import { HomePage } from '@/pages/home-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('home')
}

export default function Home() {
  return <HomePage />
}
