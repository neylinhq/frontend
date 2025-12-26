import { ChevronRightIcon } from '@untitledui/icons-react/outline'
import type { ComponentType, SVGProps } from 'react'
import * as React from 'react'
import { NavLink } from 'react-router'
import { Badge } from '@/shared/components/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/collapsible'
import { cn } from '@/shared/lib/cn'
import styles from './docs-sidebar.module.css'

export interface DocsSidebarItem {
  title: string
  href: string
  /** Date when component was created (YYYY-MM-DD) */
  createdAt?: string
  /** Date when component was last updated (YYYY-MM-DD) */
  updatedAt?: string
  isDeprecated?: boolean
}

export interface DocsSidebarSection {
  title: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  items: DocsSidebarItem[]
  defaultOpen?: boolean
}

interface DocsSidebarProps {
  sections: DocsSidebarSection[]
  className?: string
}

export const DocsSidebar = ({ sections, className }: DocsSidebarProps) => {
  return (
    <nav className={cn(styles.sidebar, 'space-y-2.5', className)}>
      {sections.map(section => (
        <DocsSidebarSectionComponent key={section.title} section={section} />
      ))}
    </nav>
  )
}

/**
 * Calculate badge status based on createdAt/updatedAt dates
 * - "New" if created within last 30 days
 * - "Updated" if updated within last 30 days (and not new)
 * - null otherwise
 */
const getItemBadge = (item: DocsSidebarItem): 'new' | 'updated' | null => {
  if (item.isDeprecated) return null

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  if (item.createdAt) {
    const createdDate = new Date(item.createdAt)
    if (createdDate > thirtyDaysAgo) {
      return 'new'
    }
  }

  if (item.updatedAt) {
    const updatedDate = new Date(item.updatedAt)
    if (updatedDate > thirtyDaysAgo) {
      return 'updated'
    }
  }

  return null
}

const DocsSidebarSectionComponent = ({ section }: { section: DocsSidebarSection }) => {
  const [isOpen, setIsOpen] = React.useState(section.defaultOpen ?? true)
  const Icon = section.icon

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className={cn(styles.sectionHeader, 'w-full')}>
        <div className='flex items-center gap-2 flex-1'>
          {Icon && <Icon className='h-4 w-4 opacity-70' />}
          <span>{section.title}</span>
        </div>
        <ChevronRightIcon
          className={cn(
            'h-4 w-4 opacity-50 transition-transform duration-200',
            isOpen && 'rotate-90'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className='pt-1'>
        <div className='space-y-0.5'>
          {section.items.map(item => {
            const badge = getItemBadge(item)

            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/docs/ui'}
                className={({ isActive }) => cn(styles.navItem, isActive && styles.navItemActive)}
              >
                <span className='flex-1 truncate'>{item.title}</span>
                {badge === 'new' && (
                  <Badge variant='secondary' className='ml-auto text-xs h-5 px-1.5'>
                    New
                  </Badge>
                )}
                {badge === 'updated' && (
                  <Badge variant='brand' className='ml-auto text-xs h-5 px-1.5'>
                    Updated
                  </Badge>
                )}
                {item.isDeprecated && (
                  <Badge
                    variant='outline'
                    className='ml-auto text-xs h-5 px-1.5 text-muted-foreground'
                  >
                    Deprecated
                  </Badge>
                )}
              </NavLink>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
