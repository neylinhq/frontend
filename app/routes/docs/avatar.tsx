import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/avatar'
import { DocsApiTable } from '@/shared/components/docs-api-table'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
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
    <DocsPageLayout
      title='Avatar'
      description='An image element with fallback for user profile pictures. Built with Radix UI.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic' description='Avatar with image source.'>
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
      </DocsSection>

      <DocsSection id='fallback' title='Fallback' description='When no image is available, fallback content is shown.'>
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
      </DocsSection>

      <DocsSection id='sizes' title='Sizes' description='Different sizes using className.'>
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
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
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
      </DocsSection>

      <DocsSection id='api-reference' title='API Reference' bordered>
        <DocsApiTable
          variant='component'
          rows={[
            { name: 'Avatar', description: 'Container component' },
            { name: 'AvatarImage', description: 'Image element with src and alt props' },
            { name: 'AvatarFallback', description: 'Fallback content when image fails' }
          ]}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default AvatarPage
