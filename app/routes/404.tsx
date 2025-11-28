import { NotFoundPage } from '@/pages/not-found-page'
import { getMeta } from '@/shared/lib/get-meta'

export const handle = {
  hideFooter: true,
  centered: true
}

export function meta() {
  return getMeta('notFound')
}

export default function NotFoundRoute() {
  return <NotFoundPage />
}
