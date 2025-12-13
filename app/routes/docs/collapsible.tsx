'use client'
import { ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/collapsible'
import { DocsCodeBlock } from '@/shared/components/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/components/docs-component-preview'
import { DocsPageLayout } from '@/shared/components/docs-page-layout'
import { DocsSection } from '@/shared/components/docs-section'
import type { TocItem } from '@/shared/components/docs-toc'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/collapsible'

export const handle = {
  breadcrumb: 'Collapsible'
}

export const meta = (_args: Route.MetaArgs) => {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 }
]

const CollapsibleDemo = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className='w-[350px] space-y-2'>
      <div className='flex items-center justify-between space-x-4 px-4'>
        <h4 className='text-sm font-semibold'>@radix-ui/primitives</h4>
        <CollapsibleTrigger asChild>
          <Button variant='ghost' size='sm' className='w-9 p-0'>
            <ChevronsUpDown className='h-4 w-4' />
            <span className='sr-only'>Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className='rounded-md border px-4 py-3 font-mono text-sm'>
        @radix-ui/react-collapsible
      </div>
      <CollapsibleContent className='space-y-2'>
        <div className='rounded-md border px-4 py-3 font-mono text-sm'>
          @radix-ui/react-accordion
        </div>
        <div className='rounded-md border px-4 py-3 font-mono text-sm'>@radix-ui/react-dialog</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

const CollapsiblePage = () => {
  return (
    <DocsPageLayout
      title='Collapsible'
      description='An interactive component which expands/collapses a panel. Built with Radix UI.'
      tocItems={TOC_ITEMS}
    >
      <DocsSection id='basic' title='Basic'>
        <DocsComponentPreview
          code={`<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" size="sm">
      <ChevronsUpDown className="h-4 w-4" />
      Toggle
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div className="rounded-md border p-4">
      Hidden content here
    </div>
  </CollapsibleContent>
</Collapsible>`}
        >
          <DocsPreview>
            <CollapsibleDemo />
          </DocsPreview>
        </DocsComponentPreview>
      </DocsSection>

      <DocsSection id='usage' title='Usage' bordered>
        <DocsCodeBlock
          language='tsx'
          code={`import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/collapsible'

export function FAQ({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium">
        {question}
        <ChevronDown className={cn("h-4 w-4", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 text-muted-foreground">
        {answer}
      </CollapsibleContent>
    </Collapsible>
  )
}`}
        />
      </DocsSection>
    </DocsPageLayout>
  )
}

export default CollapsiblePage
