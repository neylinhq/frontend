import { useTranslation } from 'react-i18next'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { ThemeToggle } from '@/app/theme/components/theme-toggle'
import { LanguageSwitcher } from '@/features/language-switcher'

export default function ThemePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t('settings.theme.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('settings.theme.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.theme.appearance.title')}</CardTitle>
          <CardDescription>{t('settings.theme.appearance.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.theme.appearance.mode')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.theme.appearance.modeDescription')}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.theme.language.title')}</CardTitle>
          <CardDescription>{t('settings.theme.language.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings.theme.language.current')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.theme.language.currentDescription')}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.theme.customization.title')}</CardTitle>
          <CardDescription>{t('settings.theme.customization.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.theme.customization.accentColor')}</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="h-8 w-8 rounded-md bg-zinc-900 dark:bg-zinc-100 border-2 border-primary"
                  aria-label="Zinc"
                />
                <button
                  type="button"
                  className="h-8 w-8 rounded-md bg-blue-500 border-2 border-transparent hover:border-primary"
                  aria-label="Blue"
                />
                <button
                  type="button"
                  className="h-8 w-8 rounded-md bg-green-500 border-2 border-transparent hover:border-primary"
                  aria-label="Green"
                />
                <button
                  type="button"
                  className="h-8 w-8 rounded-md bg-orange-500 border-2 border-transparent hover:border-primary"
                  aria-label="Orange"
                />
                <button
                  type="button"
                  className="h-8 w-8 rounded-md bg-rose-500 border-2 border-transparent hover:border-primary"
                  aria-label="Rose"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('settings.theme.customization.accentColorHint')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
