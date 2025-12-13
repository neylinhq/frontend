import * as React from 'react'
import { cn } from '@/shared/lib/cn'
import { DocsHeader } from '@/widgets/docs-header'

interface DocsLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

const TocContext = React.createContext<{
  setToc: (toc: React.ReactNode) => void
}>({ setToc: () => {} })

export const useTocContext = () => React.useContext(TocContext)

export const DocsLayout = ({ children, sidebar, className }: DocsLayoutProps) => {
  const [toc, setToc] = React.useState<React.ReactNode>(null)

  return (
    <TocContext.Provider value={{ setToc }}>
      <div className='h-screen flex flex-col overflow-hidden bg-background text-foreground'>
        <DocsHeader mobileNav={sidebar} />

        <div className='flex-1 min-h-0 overflow-hidden flex'>
          {/* Left Sidebar - Navigation */}
          {sidebar && (
            <aside className='hidden lg:flex w-[260px] flex-shrink-0 border-r flex-col overflow-y-auto py-6 px-4'>
              {sidebar}
            </aside>
          )}

          {/* Main Content - scrollable */}
          <main className='flex-1 min-w-0 overflow-y-auto scroll-smooth'>
            <div className={cn('max-w-4xl mx-auto px-6 py-8 lg:px-8', className)}>
              {children}
            </div>
          </main>

          {/* Right TOC */}
          {toc}
        </div>
      </div>
    </TocContext.Provider>
  )
}
