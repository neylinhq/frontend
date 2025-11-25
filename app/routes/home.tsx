import { APP_NAME } from '@/shared/config'
import { getMeta } from '@/shared/lib/get-meta'

export function meta() {
  return getMeta('home')
}

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{APP_NAME}</h1>
    </div>
  )
}
