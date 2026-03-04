import { AlertTriangleIcon, RefreshCw01Icon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'

import type { ErrorBoundaryLevel } from './error-boundary'

interface ErrorFallbackProps {
  error?: Error
  level?: ErrorBoundaryLevel
  onRetry?: () => void
}

export const ErrorFallback = ({ error, level = 'widget', onRetry }: ErrorFallbackProps) => {
  const { t } = useTranslation()

  if (level === 'feature') {
    return (
      <div className='p-2 text-sm text-destructive flex items-center gap-2'>
        <AlertTriangleIcon className='h-4 w-4 flex-shrink-0' />
        <span>{t('error.featureFailed', 'Something went wrong')}</span>
      </div>
    )
  }

  if (level === 'widget') {
    return (
      <Card className='p-4 border-destructive/20 bg-destructive/5'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <AlertTriangleIcon className='h-8 w-8 text-destructive' />
          <p className='text-sm text-muted-foreground'>
            {t('error.widgetFailed', 'This section encountered an error')}
          </p>
          {onRetry && (
            <Button onClick={onRetry} size='sm' variant='outline'>
              <RefreshCw01Icon className='h-4 w-4 mr-2' />
              {t('common.retry', 'Retry')}
            </Button>
          )}
        </div>
      </Card>
    )
  }

  // page level
  return (
    <div className='flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8'>
      <AlertTriangleIcon className='h-12 w-12 text-destructive' />
      <h2 className='text-xl font-semibold'>{t('error.pageFailed', 'Something went wrong')}</h2>
      <p className='text-muted-foreground text-center max-w-md'>
        {error?.message || t('error.pageFailedDescription', 'An unexpected error occurred')}
      </p>
      <Button onClick={() => window.location.reload()}>
        <RefreshCw01Icon className='h-4 w-4 mr-2' />
        {t('common.refresh', 'Refresh page')}
      </Button>
    </div>
  )
}
