'use client'
import { ChevronRightIcon, Home01Icon } from '@untitledui/icons-react/outline'
import { Link, useMatches } from 'react-router'

import { DOCS_ROUTES } from '@/shared/config'
import { cn } from '@/shared/lib/cn'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface DocsBreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export const DocsBreadcrumbs = ({ items, className }: DocsBreadcrumbsProps) => {
  const matches = useMatches()

  // Auto-generate breadcrumbs from route if items not provided
  const breadcrumbs: BreadcrumbItem[] = items || generateBreadcrumbs(matches)

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <nav aria-label='Breadcrumb' className={cn('flex items-center text-sm', className)}>
      <ol className='flex items-center gap-1.5'>
        <li>
          <Link
            to={DOCS_ROUTES.ui}
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            <Home01Icon className='h-4 w-4' />
            <span className='sr-only'>Docs Home</span>
          </Link>
        </li>

        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <li key={item.label} className='flex items-center gap-1.5'>
              <ChevronRightIcon className='h-3.5 w-3.5 text-muted-foreground/50' />
              {isLast || !item.href ? (
                <span
                  className={cn(
                    'font-medium',
                    isLast ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

const generateBreadcrumbs = (matches: ReturnType<typeof useMatches>) => {
  const breadcrumbs: BreadcrumbItem[] = []

  for (const match of matches) {
    const handle = match.handle as { breadcrumb?: string } | undefined

    if (handle?.breadcrumb) {
      breadcrumbs.push({
        label: handle.breadcrumb,
        href: match.pathname
      })
    }
  }

  return breadcrumbs
}
