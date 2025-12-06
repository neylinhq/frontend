import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/avatar'
import { Badge } from '@/shared/components/badge'
import { DocsBreadcrumbs } from '@/shared/components/docs-breadcrumbs'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/components/docs-toc'
import { Typography } from '@/shared/components/typography'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/avatar'

export const handle = {
  breadcrumb: 'Avatar'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'fallback', title: 'Fallback', level: 2 },
  { id: 'sizes', title: 'Sizes', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
  { id: 'api-reference', title: 'API Reference', level: 2 }
]

const AvatarPage = () => {
  return (
    <div className='flex gap-10'>
      <div className='flex-1 min-w-0 space-y-10'>
        <header className='space-y-4'>
          <DocsBreadcrumbs
            items={[{ label: 'Components', href: '/docs/ui/button' }, { label: 'Avatar' }]}
          />
          <div className='flex items-center gap-3'>
            <Typography variant='h1'>Avatar</Typography>
            <Badge variant='brand'>Component</Badge>
          </div>
          <Typography variant='lead' className='max-w-2xl'>
            An image element with fallback for user profile pictures. Built with Radix UI.
          </Typography>
        </header>

        <section id='basic' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Basic</Typography>
          <Typography variant='muted'>Avatar with image source.</Typography>

          <DocsComponentPreview
            code={`<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`}
          >
            <DocsPreview>
              <Avatar>
                <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='fallback' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Fallback</Typography>
          <Typography variant='muted'>
            When no image is available, fallback content is shown.
          </Typography>

          <DocsComponentPreview
            code={`<Avatar>
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

<Avatar>
  <AvatarFallback>AB</AvatarFallback>
</Avatar>`}
          >
            <DocsPreview className='flex gap-4'>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>MK</AvatarFallback>
              </Avatar>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='sizes' className='scroll-mt-20 space-y-4'>
          <Typography variant='h2'>Sizes</Typography>
          <Typography variant='muted'>Different sizes using className.</Typography>

          <DocsComponentPreview
            code={`<Avatar className="h-8 w-8">
  <AvatarFallback>SM</AvatarFallback>
</Avatar>
<Avatar className="h-12 w-12">
  <AvatarFallback>MD</AvatarFallback>
</Avatar>
<Avatar className="h-16 w-16">
  <AvatarFallback>LG</AvatarFallback>
</Avatar>`}
          >
            <DocsPreview className='flex items-center gap-4'>
              <Avatar className='h-8 w-8'>
                <AvatarFallback className='text-xs'>SM</AvatarFallback>
              </Avatar>
              <Avatar className='h-12 w-12'>
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <Avatar className='h-16 w-16'>
                <AvatarFallback className='text-lg'>LG</AvatarFallback>
              </Avatar>
            </DocsPreview>
          </DocsComponentPreview>
        </section>

        <section id='usage' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>Usage</Typography>

          <DocsCodeBlock
            language='tsx'
            code={`import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/avatar'

export function UserAvatar({ user }: { user: { name: string; avatar?: string } }) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <Avatar>
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}`}
          />
        </section>

        <section id='api-reference' className='scroll-mt-20 space-y-4 pt-6 border-t'>
          <Typography variant='h2'>API Reference</Typography>

          <div className='rounded-lg border overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='text-left px-4 py-3 font-medium'>Component</th>
                  <th className='text-left px-4 py-3 font-medium'>Description</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>Avatar</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>Container component</code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>AvatarImage</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>
                      Image element with src and alt props
                    </code>
                  </td>
                </tr>
                <tr>
                  <td className='px-4 py-3'>
                    <code className='text-sm font-semibold text-brand'>AvatarFallback</code>
                  </td>
                  <td className='px-4 py-3'>
                    <code className='text-xs text-muted-foreground'>
                      Fallback content when image fails
                    </code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <DocsToc items={TOC_ITEMS} className='hidden xl:block' />
    </div>
  )
}

export default AvatarPage
