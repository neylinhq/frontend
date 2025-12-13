import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import type { TocItem } from '@/shared/components/docs-toc'
import { DocsToc } from '@/shared/components/docs-toc'
import { Typography } from '@/shared/components/typography'

interface DocsPageLayoutProps {
  title: string
  description: string
  badge?: string
  tocItems: TocItem[]
  children: React.ReactNode
}

export const DocsPageLayout = ({
  title,
  description,
  badge = 'Component',
  tocItems,
  children
}: DocsPageLayoutProps) => (
  <div className='flex gap-10'>
    <div className='flex-1 min-w-0 space-y-10'>
      <header className='space-y-4'>
        <DocsBreadcrumbs items={[{ label: 'Components', href: '/docs/ui' }, { label: title }]} />
        <div className='flex items-center gap-3'>
          <Typography variant='h1'>{title}</Typography>
          <Badge variant='brand'>{badge}</Badge>
        </div>
        <Typography variant='lead' className='max-w-2xl'>
          {description}
        </Typography>
      </header>
      {children}
    </div>
    <div className='hidden xl:block w-56 flex-shrink-0'>
      <DocsToc items={tocItems} className='sticky top-10' />
    </div>
  </div>
)
