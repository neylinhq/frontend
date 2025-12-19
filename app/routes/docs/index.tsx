import { ArrowRightIcon, Keyboard01Icon, Moon01Icon, PackageIcon, PaletteIcon, Stars01Icon, Type01Icon, ZapIcon } from '@untitledui/icons-react/outline'
import { Link } from 'react-router'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Typography } from '@/shared/components/typography'
import { DOCS_ROUTES } from '@/shared/config'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/index'

export const handle = {
  breadcrumb: 'Introduction'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('docs')
}

const UiIndexPage = () => {
  return (
    <div className='space-y-12'>
      {/* Hero Section */}
      <header className='space-y-4'>
        <div className='flex items-center gap-3'>
          <Typography variant='h1'>Design System</Typography>
          <Badge variant='success'>v1.0</Badge>
        </div>
        <Typography variant='lead' className='max-w-2xl'>
          A collection of reusable components built with Radix UI and Tailwind CSS. Featuring 3
          color themes, dark mode support, and full TypeScript coverage.
        </Typography>
        <div className='flex items-center gap-3 pt-2'>
          <Button asChild>
            <Link to={DOCS_ROUTES.button}>
              Get Started
              <ArrowRightIcon className='ml-2 h-4 w-4' />
            </Link>
          </Button>
          <Button variant='outline' asChild>
            <Link to={DOCS_ROUTES.colors}>View Colors</Link>
          </Button>
        </div>
      </header>

      {/* Quick Links */}
      <section className='space-y-4'>
        <Typography variant='h2'>Explore</Typography>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <QuickLinkCard
            icon={<PaletteIcon className='h-5 w-5' />}
            title='Colors'
            description='Color palette and semantic tokens for all themes'
            href={DOCS_ROUTES.colors}
            badge='Foundation'
          />
          <QuickLinkCard
            icon={<Type01Icon className='h-5 w-5' />}
            title='Typography'
            description='Type scale and text formatting styles'
            href={DOCS_ROUTES.typography}
            badge='Foundation'
          />
          <QuickLinkCard
            icon={<PackageIcon className='h-5 w-5' />}
            title='Components'
            description='25+ production-ready UI components'
            href={DOCS_ROUTES.button}
            badge='Components'
          />
        </div>
      </section>

      {/* Features */}
      <section className='space-y-6'>
        <Typography variant='h2'>Features</Typography>
        <div className='grid gap-6 sm:grid-cols-2'>
          <FeatureCard
            icon={<Stars01Icon className='h-5 w-5 text-brand' />}
            title='3 Color Themes'
            description='Classic, Vanilla, and Vivid themes with consistent semantic tokens across all components.'
          />
          <FeatureCard
            icon={<Moon01Icon className='h-5 w-5 text-brand' />}
            title='Dark Mode'
            description='First-class dark mode support with smooth transitions and proper contrast ratios.'
          />
          <FeatureCard
            icon={<Keyboard01Icon className='h-5 w-5 text-brand' />}
            title='Accessibility'
            description='Built on Radix UI primitives with full keyboard navigation and ARIA support.'
          />
          <FeatureCard
            icon={<ZapIcon className='h-5 w-5 text-brand' />}
            title='TypeScript'
            description='Fully typed components with IntelliSense support and compile-time safety.'
          />
        </div>
      </section>

      {/* Installation */}
      <section className='space-y-4 pt-6 border-t'>
        <Typography variant='h2'>Quick Start</Typography>
        <Typography variant='p'>
          All components are located in{' '}
          <code className='relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm'>
            src/shared/components/
          </code>
          . Import and use them directly in your application.
        </Typography>
        <div className='rounded-lg bg-muted/50 border p-4 font-mono text-sm'>
          <span className='text-muted-foreground'>// Example usage</span>
          <br />
          <span className='text-blue-500'>import</span>
          {' { Button } '}
          <span className='text-blue-500'>from</span>
          {" '@/shared/components/button'"}
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
