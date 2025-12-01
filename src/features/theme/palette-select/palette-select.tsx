import { Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/shared/components/dropdown-menu'
import { PALETTES, useTheme } from '@/shared/lib/theme'

export const PaletteSelect = () => {
  const { palette, setPalette } = useTheme()
  const { t } = useTranslation()

  const currentPalette = PALETTES.find(p => p.value === palette)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          <Palette className='h-[1.2rem] w-[1.2rem]' />
          <span
            className='absolute bottom-1 right-1 h-2 w-2 rounded-full border border-background'
            style={{ backgroundColor: currentPalette?.previewColor }}
          />
          <span className='sr-only'>{t('settings.theme.appearance.palette')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {PALETTES.map(p => (
          <DropdownMenuItem
            key={p.value}
            onClick={() => setPalette(p.value)}
            className='gap-2'
          >
            <span
              className='h-3 w-3 rounded-full'
              style={{ backgroundColor: p.previewColor }}
            />
            {p.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
