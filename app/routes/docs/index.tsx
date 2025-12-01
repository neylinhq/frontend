import { ArrowRight, Keyboard, Moon, Package, Palette, Sparkles, Type, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DOCS_ROUTES } from '@/shared/config'
import { getMeta } from '@/shared/lib/get-meta'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Typography } from '@/shared/ui/typography'
import type { Route } from './+types/index'

export const handle = {
  breadcrumb: 'Introduction'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('docs')
}

const UiIndexPage = () => {
  const { t } = useTranslation()
  return (
    <div className='space-y-12'>
      {/* Hero Section */}
      <header className='space-y-4'>
        <div className='flex items-center gap-3'>
          <Typography variant='h1'>{t('docs.index.title')}</Typography>
          <Badge variant='success'>{t('docs.index.version')}</Badge>
        </div>
        <Typography variant='lead' className='max-w-2xl'>
          {t('docs.index.lead')}
        </Typography>
        <div className='flex items-center gap-3 pt-2'>
          <Button asChild>
            <Link to={DOCS_ROUTES.button}>
              {t('docs.index.getStarted')}
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
          <Button variant='outline' asChild>
            <Link to={DOCS_ROUTES.colors}>{t('docs.index.viewColors')}</Link>
          </Button>
        </div>
      </header>

      {/* Quick Links */}
      <section className='space-y-4'>
        <Typography variant='h2'>{t('docs.index.explore')}</Typography>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <QuickLinkCard
            icon={<Palette className='h-5 w-5' />}
            title={t('docs.index.quickLinks.colors.title')}
            description={t('docs.index.quickLinks.colors.description')}
            href={DOCS_ROUTES.colors}
            badge={t('docs.badges.foundation')}
          />
          <QuickLinkCard
            icon={<Type className='h-5 w-5' />}
            title={t('docs.index.quickLinks.typography.title')}
            description={t('docs.index.quickLinks.typography.description')}
            href={DOCS_ROUTES.typography}
            badge={t('docs.badges.foundation')}
          />
          <QuickLinkCard
            icon={<Package className='h-5 w-5' />}
            title={t('docs.index.quickLinks.components.title')}
            description={t('docs.index.quickLinks.components.description')}
            href={DOCS_ROUTES.button}
            badge={t('docs.badges.components')}
          />
        </div>
      </section>

      {/* Features */}
      <section className='space-y-6'>
        <Typography variant='h2'>{t('docs.index.features.title')}</Typography>
        <div className='grid gap-6 sm:grid-cols-2'>
          <FeatureCard
            icon={<Sparkles className='h-5 w-5 text-brand' />}
            title={t('docs.index.features.colorThemes.title')}
            description={t('docs.index.features.colorThemes.description')}
          />
          <FeatureCard
            icon={<Moon className='h-5 w-5 text-brand' />}
            title={t('docs.index.features.darkMode.title')}
            description={t('docs.index.features.darkMode.description')}
          />
          <FeatureCard
            icon={<Keyboard className='h-5 w-5 text-brand' />}
            title={t('docs.index.features.accessibility.title')}
            description={t('docs.index.features.accessibility.description')}
          />
          <FeatureCard
            icon={<Zap className='h-5 w-5 text-brand' />}
            title={t('docs.index.features.typescript.title')}
            description={t('docs.index.features.typescript.description')}
          />
        </div>
      </section>

      {/* Installation */}
      <section className='space-y-4 pt-6 border-t'>
        <Typography variant='h2'>{t('docs.index.quickStart.title')}</Typography>
        <Typography variant='p'>
          {t('docs.index.quickStart.description')}{' '}
          <code className='relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm'>
            src/shared/ui/
          </code>
          {t('docs.index.quickStart.importText')}
        </Typography>
        <div className='rounded-lg bg-muted/50 border p-4 font-mono text-sm'>
          <span className='text-muted-foreground'>{t('docs.index.quickStart.exampleComment')}</span>
          <br />
          <span className='text-blue-500'>import</span>
          {' { Button } '}
          <span className='text-blue-500'>from</span>
          {" '@/shared/ui/button'"}
          <br />
          <br />
          {'<'}
          <span className='text-green-600'>Button</span>
          {' variant="brand">Click me</'}
          <span className='text-green-600'>Button</span>
          {'>'}
        </div>
      </section>
    </div>
  )
}

const QuickLinkCard = ({
  icon,
  title,
  description,
  href,
  badge
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  badge?: string
}) => {
  return (
    <Link to={href} className='group'>
      <div className='docs-card-hover h-full rounded-xl border bg-card p-5 transition-all'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand'>
            {icon}
          </div>
          {badge && (
            <Badge variant='outline' className='text-xs'>
              {badge}
            </Badge>
          )}
        </div>
        <h3 className='font-semibold mb-1 group-hover:text-brand transition-colors'>{title}</h3>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
    </Link>
  )
}

const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) => {
  return (
    <div className='flex gap-4 p-4 rounded-lg border bg-card/50'>
      <div className='flex-shrink-0 mt-0.5'>{icon}</div>
      <div>
        <h3 className='font-medium mb-1'>{title}</h3>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
    </div>
  )
}

export default UiIndexPage
