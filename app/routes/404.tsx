import { NotFoundPage } from '@/pages/not-found-page'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('notFound')
}

export default function NotFoundRoute() {
  return <NotFoundPage />
}
