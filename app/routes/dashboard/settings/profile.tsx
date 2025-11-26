import { useOutletContext } from 'react-router'
import { ProfileForm } from '@/features/settings'
import type { SettingsContext } from './layout'

export default function ProfilePage() {
  const { user } = useOutletContext<SettingsContext>()
  return <ProfileForm user={user} />
}
