import { UiShowcasePage } from '@/pages/ui-showcase'
import type { Route } from './+types/ui'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'UI Kit Showcase' }]
}

export default function UiRoute() {
  return <UiShowcasePage />
}
