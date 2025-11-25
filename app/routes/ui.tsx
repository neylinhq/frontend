import { UiShowcasePage } from '@/pages/ui-showcase-page'
import type { Route } from './+types/ui'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'UI Kit Showcase' }]
}

export default function UiRoute() {
  return <UiShowcasePage />
}
