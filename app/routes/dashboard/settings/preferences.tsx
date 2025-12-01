import { useOutletContext } from 'react-router'
import { PreferencesForm } from '@/features/settings/preferences-form'
import type { SettingsContext } from './layout'

const PreferencesPage = () => {
  const { user } = useOutletContext<SettingsContext>()
  return <PreferencesForm user={user} />
}

export default PreferencesPage
