import { useOutletContext } from 'react-router'
import { ProfileForm } from '@/features/settings/profile-form'
import type { SettingsContext } from './layout'

const ProfilePage = () => {
  const { user } = useOutletContext<SettingsContext>()
  return <ProfileForm user={user} />
}

export default ProfilePage
