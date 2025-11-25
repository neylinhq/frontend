import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Arbor' }, { name: 'description', content: 'Arbor Frontend' }]
}

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Arbor</h1>
    </div>
  )
}
