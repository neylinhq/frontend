import { ArrowRightIcon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Button } from '@/shared/components/button'
import { Typography } from '@/shared/components/typography'
import { AUTH_ROUTES } from '@/shared/config'
import { GraphWorkspace } from '@/widgets/graph-workspace'

import { DEMO_MAP } from './home-page.demo.constants'
import { HOME_FEATURES } from './home-page.constants'

export const HomePage = () => {
  const { t } = useTranslation()

  return (
    <>
      {/* Hero */}
      <section className='pt-14 pb-20'>
        <div className='max-w-5xl mx-auto px-6'>
          <div className='max-w-2xl'>
            <p className='text-sm text-muted-foreground mb-3'>{t('home.badge', 'Open Alpha')}</p>

            <Typography variant='h1' className='leading-tight'>
              {t('home.headline', 'Think in graphs,')}
              <br />
              {t('home.headlinePart2', 'not lists')}
            </Typography>

            <p className='mt-4 text-lg text-muted-foreground leading-relaxed'>
              {t(
                'home.subheadline',
                'A visual workspace for organizing knowledge and discovering connections.'
              )}
            </p>

            <div className='mt-6 flex items-center gap-3'>
              <Button asChild>
                <Link to={AUTH_ROUTES.signUp}>
                  {t('home.cta.getStartedFree', 'Get Started Free')}
                  <ArrowRightIcon className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className='pb-20'>
        <div className='max-w-5xl mx-auto px-6'>
          <div className='rounded-lg border overflow-hidden h-[500px] relative'>
            <GraphWorkspace mapId='demo' data={DEMO_MAP} readOnly className='h-full w-full' />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='py-20 border-t'>
        <div className='max-w-5xl mx-auto px-6'>
          <Typography variant='h2' className='mb-8'>
            {t('home.features.title', 'Built for deep work')}
          </Typography>

          <div className='grid sm:grid-cols-2 gap-x-12 gap-y-8'>
            {HOME_FEATURES.map(feature => (
              <div key={feature.titleKey}>
                <h3 className='font-medium mb-1'>{t(feature.titleKey)}</h3>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {t(feature.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-16 border-t'>
        <div className='max-w-5xl mx-auto px-6'>
          <div className='flex items-center justify-between'>
            <div>
              <Typography variant='h2'>{t('home.cta.ready', 'Ready to start?')}</Typography>
              <p className='text-sm text-muted-foreground mt-1'>
                {t('home.cta.freeInfo', 'Free tier available. No credit card required.')}
              </p>
            </div>
            <Button asChild>
              <Link to={AUTH_ROUTES.signUp}>
                {t('home.cta.createAccount', 'Create Free Account')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
