import { PaletteIcon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { PALETTES, useTheme } from '@/shared/core/theme'

export const PaletteToggle = () => {
  const { setPalette } = useTheme()
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          <PaletteIcon className='h-5 w-5' />
          <span className='sr-only'>{t('settings.theme.appearance.palette')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {PALETTES.map(p => (
          <DropdownMenuItem key={p.value} onClick={() => setPalette(p.value)} className='gap-2'>
            <span
              className='h-3 w-3 rounded-full border border-border'
              style={{ backgroundColor: p.previewColor }}
            />
            {p.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
