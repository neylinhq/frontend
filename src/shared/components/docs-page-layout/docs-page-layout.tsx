import { useEffect } from 'react'
import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import type { TocItem } from '@/shared/components/docs-toc'
import { DocsToc } from '@/shared/components/docs-toc'
import { Typography } from '@/shared/components/typography'
import { useTocContext } from '@/widgets/docs-layout'

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
}: DocsPageLayoutProps) => {
  const { setToc } = useTocContext()

  useEffect(() => {
    if (tocItems.length > 0) {
      setToc(
        <aside className='hidden xl:flex w-[220px] flex-shrink-0 border-l flex-col py-6 px-4'>
          <div className='sticky top-8'>
            <DocsToc items={tocItems} />
          </div>
        </aside>
      )
    }
    return () => setToc(null)
  }, [tocItems, setToc])

  return (
    <div className='space-y-10'>
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
  )
}
