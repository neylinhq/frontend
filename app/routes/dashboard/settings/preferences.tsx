import { useOutletContext } from 'react-router'
import { PreferencesForm } from '@/features/settings'
import type { SettingsContext } from './layout'

export default function PreferencesPage() {
  const { user } = useOutletContext<SettingsContext>()
  return <PreferencesForm user={user} />
}
