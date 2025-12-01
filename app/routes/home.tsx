import { HomePage } from '@/pages/home-page'
import { getMeta } from '@/shared/lib/get-meta'

export const meta = () => {
  return getMeta('home')
}

const Home = () => {
  return <HomePage />
}

export default Home
