import { UiShowcasePage } from '@/pages/ui-showcase-page'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/ui'

export function meta(_args: Route.MetaArgs) {
  return getMeta('uiShowcase')
}

export default function PublicUiRoute() {
  return <UiShowcasePage />
}
