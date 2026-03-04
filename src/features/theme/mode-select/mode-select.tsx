import { Monitor01Icon, Moon01Icon, SunIcon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import { SelectPopover } from '@/shared/components/select-popover'
import type { Mode } from '@/shared/core/theme'
import { useTheme } from '@/shared/core/theme'

const MODE_ICONS: Record<Mode, React.ReactNode> = {
  light: <SunIcon className='h-4 w-4' />,
  dark: <Moon01Icon className='h-4 w-4' />,
  system: <Monitor01Icon className='h-4 w-4' />
}

type ModeSelectProps = {
  compact?: boolean
}

export const ModeSelect = ({ compact }: ModeSelectProps) => {
  const { t } = useTranslation()
  const { mode, setMode } = useTheme()

  const items = [
    { value: 'light' as Mode, label: t('theme.light'), icon: MODE_ICONS.light },
    { value: 'dark' as Mode, label: t('theme.dark'), icon: MODE_ICONS.dark },
    { value: 'system' as Mode, label: t('theme.system'), icon: MODE_ICONS.system }
  ]

  return (
    <SelectPopover items={items} value={mode} onChange={setMode} compact={compact} align='center' />
  )
}
