import { Puzzle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

const IntegrationsPage = () => {
  const { t } = useTranslation()

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold tracking-tight'>
          {t('settings.integrations.title')}
        </h2>
        <p className='text-sm text-muted-foreground mt-1'>
          {t('settings.integrations.description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Puzzle className='h-5 w-5' />
            {t('common.comingSoon')}
          </CardTitle>
          <CardDescription>{t('settings.integrations.comingSoonDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            {t('settings.integrations.comingSoonMessage')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default IntegrationsPage
