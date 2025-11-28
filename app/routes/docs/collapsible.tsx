'use client'

import { useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'
import { Typography } from '@/shared/ui/typography'
import { Badge } from '@/shared/ui/badge'
import { DocsCodeBlock } from '@/shared/ui/docs-code-block'
import { DocsComponentPreview, DocsPreview } from '@/shared/ui/docs-component-preview'
import { DocsToc, type TocItem } from '@/shared/ui/docs-toc'
import { DocsBreadcrumbs } from '@/shared/ui/docs-breadcrumbs'
import { getMeta } from '@/shared/lib/get-meta'
import type { Route } from './+types/collapsible'

export const handle = {
  breadcrumb: 'Collapsible',
}

export function meta(_args: Route.MetaArgs) {
  return getMeta('uiShowcase')
}

const TOC_ITEMS: TocItem[] = [
  { id: 'basic', title: 'Basic', level: 2 },
  { id: 'usage', title: 'Usage', level: 2 },
]

function CollapsibleDemo() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-[350px] space-y-2"
    >
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">
          @radix-ui/primitives
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-3 font-mono text-sm">
        @radix-ui/react-collapsible
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          @radix-ui/react-accordion
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          @radix-ui/react-dialog
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function CollapsiblePage() {
  return (
    <div className="flex gap-10">
      <div className="flex-1 min-w-0 space-y-10">
        <header className="space-y-4">
          <DocsBreadcrumbs
            items={[
              { label: 'Components', href: '/docs/ui/button' },
              { label: 'Collapsible' },
            ]}
          />
          <div className="flex items-center gap-3">
            <Typography variant="h1">Collapsible</Typography>
            <Badge variant="brand">Component</Badge>
          </div>
          <Typography variant="lead" className="max-w-2xl">
            An interactive component which expands/collapses a panel. Built with Radix UI.
          </Typography>
        </header>

        <section id="basic" className="scroll-mt-20 space-y-4">
          <Typography variant="h2">Basic</Typography>
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
        </section>

        <section id="usage" className="scroll-mt-20 space-y-4 pt-6 border-t">
          <Typography variant="h2">Usage</Typography>
          <DocsCodeBlock
            language="tsx"
            code={`import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'

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
        </section>
      </div>
      <DocsToc items={TOC_ITEMS} className="hidden xl:block" />
    </div>
  )
}
