import { NotFoundPage } from '@/pages/not-found-page'
import { getMeta } from '@/shared/lib/get-meta'

export const handle = {
  hideFooter: true,
  centered: true
}

export const meta = () => {
  return getMeta('notFound')
}

const NotFoundRoute = () => {
  return <NotFoundPage />
}

export default NotFoundRoute
