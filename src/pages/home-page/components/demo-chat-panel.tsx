import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Button } from '@/shared/components/button'
import { AUTH_ROUTES } from '@/shared/config'

export const DemoChatPanel = memo(function DemoChatPanel() {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col items-center justify-center h-full p-6 gap-4'>
      <p className='text-sm text-muted-foreground text-center'>
        {t('home.demo.chatCta', 'Sign in to chat with AI about this knowledge graph')}
      </p>
      <Button asChild size='sm' variant='outline'>
        <Link to={AUTH_ROUTES.signUp}>
          {t('home.cta.getStartedFree', 'Get Started Free')}
        </Link>
      </Button>
    </div>
  )
})
