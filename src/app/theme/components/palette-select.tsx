import { SelectPopover } from '@/shared/ui/select-popover'
import { PALETTES } from '../theme.constants'
import { useTheme } from './theme-provider'

type PaletteSelectProps = {
  compact?: boolean
}

export const PaletteSelect = ({ compact }: PaletteSelectProps) => {
  const { palette, setPalette } = useTheme()

  const items = PALETTES.map(p => ({
    value: p.value,
    label: p.name,
    color: p.previewColor
  }))

  return (
    <SelectPopover
      items={items}
      value={palette}
      onChange={setPalette}
      compact={compact}
      align='end'
    />
  )
}
