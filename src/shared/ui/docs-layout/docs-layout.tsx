import type * as React from 'react'
import { cn } from '@/shared/lib/cn'
import { DocsHeader } from '@/shared/ui/docs-header'

export interface TocItem {
  id: string
  title: string
  level: 2 | 3
}

interface DocsLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  toc?: React.ReactNode
  className?: string
}

export function DocsLayout({ children, sidebar, toc, className }: DocsLayoutProps) {
  return (
    <div className='h-screen flex flex-col overflow-hidden bg-background text-foreground'>
      <DocsHeader mobileNav={sidebar} />

      <div className='flex-1 min-h-0 overflow-hidden'>
        <div className='max-w-[1400px] mx-auto h-full flex'>
          {/* Left Sidebar - Navigation */}
          {sidebar && (
            <aside className='hidden lg:flex w-[260px] flex-shrink-0 border-r flex-col overflow-y-auto py-6 px-4'>
              {sidebar}
            </aside>
          )}

          {/* Main Content - scrollable */}
          <main className='flex-1 min-w-0 overflow-y-auto scroll-smooth border-r'>
            <div className={cn('max-w-3xl mx-auto px-6 py-8 lg:px-8', className)}>{children}</div>
          </main>

          {/* Right Sidebar - TOC */}
          {toc && (
            <aside className='hidden xl:flex w-[220px] flex-shrink-0 flex-col overflow-y-auto py-6 pl-6'>
              {toc}
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
