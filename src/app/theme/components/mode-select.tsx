import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SelectPopover } from '@/shared/ui/select-popover'
import type { Theme } from '../theme.types'
import { useTheme } from './theme-provider'

const MODE_ICONS: Record<Theme, React.ReactNode> = {
  light: <Sun className="h-4 w-4" />,
  dark: <Moon className="h-4 w-4" />,
  system: <Monitor className="h-4 w-4" />
}

type ModeSelectProps = {
  compact?: boolean
}

export function ModeSelect({ compact }: ModeSelectProps) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  const items = [
    { value: 'light' as Theme, label: t('theme.light'), icon: MODE_ICONS.light },
    { value: 'dark' as Theme, label: t('theme.dark'), icon: MODE_ICONS.dark },
    { value: 'system' as Theme, label: t('theme.system'), icon: MODE_ICONS.system }
  ]

  return (
    <SelectPopover
      items={items}
      value={theme}
      onChange={setTheme}
      compact={compact}
      align="end"
    />
  )
}
