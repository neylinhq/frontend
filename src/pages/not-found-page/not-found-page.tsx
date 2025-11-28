import { Home, LayoutDashboard, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { DASHBOARD_ROUTES, ROUTES } from '@/shared/config'
import { Button } from '@/shared/ui/button'
import { Typography } from '@/shared/ui/typography'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className='max-w-2xl w-full text-center space-y-8'>
      {/* 404 Illustration */}
      <div className='relative'>
        <div className='text-[200px] font-bold text-muted-foreground/10 leading-none select-none'>
          404
        </div>
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center'>
            <Search className='h-16 w-16 text-primary' />
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className='space-y-4'>
        <Typography variant='h1'>{t('notFound.title')}</Typography>
        <p className='text-lg text-muted-foreground max-w-md mx-auto text-balance'>
          {t('notFound.description')}
        </p>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-3 justify-center items-center pt-4'>
        <Button asChild size='lg' className='w-full sm:w-auto'>
          <Link to={ROUTES.home}>
            <Home className='mr-2 h-4 w-4' />
            {t('notFound.backToHome')}
          </Link>
        </Button>
        <Button asChild size='lg' variant='outline' className='w-full sm:w-auto'>
          <Link to={DASHBOARD_ROUTES.overview}>
            <LayoutDashboard className='mr-2 h-4 w-4' />
            {t('notFound.goToDashboard')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
