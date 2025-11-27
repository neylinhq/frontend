import { SelectPopover } from '@/shared/ui/select-popover'
import { COLOR_THEMES } from '../theme.constants'
import { useTheme } from './theme-provider'

type ColorThemeSelectProps = {
  compact?: boolean
}

export function ColorThemeSelect({ compact }: ColorThemeSelectProps) {
  const { colorTheme, setColorTheme } = useTheme()

  const items = COLOR_THEMES.map(theme => ({
    value: theme.value,
    label: theme.name,
    color: theme.color
  }))

  return (
    <SelectPopover
      items={items}
      value={colorTheme}
      onChange={setColorTheme}
      compact={compact}
      align="end"
    />
  )
}
