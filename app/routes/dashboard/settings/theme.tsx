import { useTranslation } from 'react-i18next'
import { PaletteSelect } from '@/features/theme/palette-select'
import { ThemeToggle } from '@/features/theme/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { Label } from '@/shared/components/label'
import { LanguageSwitcher } from '@/shared/components/language-switcher'

const ThemePage = () => {
  const { t } = useTranslation()

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold tracking-tight'>{t('settings.theme.title')}</h2>
        <p className='text-sm text-muted-foreground mt-1'>{t('settings.theme.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.theme.appearance.title')}</CardTitle>
          <CardDescription>{t('settings.theme.appearance.description')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>{t('settings.theme.appearance.mode')}</Label>
              <p className='text-sm text-muted-foreground'>
                {t('settings.theme.appearance.modeDescription')}
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>{t('settings.theme.appearance.palette')}</Label>
              <p className='text-sm text-muted-foreground'>
                {t('settings.theme.appearance.paletteDescription')}
              </p>
            </div>
            <PaletteSelect />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.theme.language.title')}</CardTitle>
          <CardDescription>{t('settings.theme.language.description')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>{t('settings.theme.language.current')}</Label>
              <p className='text-sm text-muted-foreground'>
                {t('settings.theme.language.currentDescription')}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ThemePage
