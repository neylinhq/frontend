import { ChevronRight, type LucideIcon } from 'lucide-react'
import * as React from 'react'
import { NavLink } from 'react-router'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible'

export interface DocsSidebarItem {
  title: string
  href: string
  isNew?: boolean
  isDeprecated?: boolean
}

export interface DocsSidebarSection {
  title: string
  icon?: LucideIcon
  items: DocsSidebarItem[]
  defaultOpen?: boolean
}

interface DocsSidebarProps {
  sections: DocsSidebarSection[]
  className?: string
}

export function DocsSidebar({ sections, className }: DocsSidebarProps) {
  return (
    <nav className={cn('docs-sidebar space-y-2.5', className)}>
      {sections.map(section => (
        <DocsSidebarSectionComponent key={section.title} section={section} />
      ))}
    </nav>
  )
}

function DocsSidebarSectionComponent({ section }: { section: DocsSidebarSection }) {
  const [isOpen, setIsOpen] = React.useState(section.defaultOpen ?? true)
  const Icon = section.icon

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="docs-nav-section-header w-full">
        <div className="flex items-center gap-2 flex-1">
          {Icon && <Icon className="h-4 w-4 opacity-70" />}
          <span>{section.title}</span>
        </div>
        <ChevronRight
          className={cn(
            'h-4 w-4 opacity-50 transition-transform duration-200',
            isOpen && 'rotate-90'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1">
        <div className="space-y-0.5">
          {section.items.map(item => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/docs/ui'}
              className={({ isActive }) => cn('docs-nav-item', isActive && 'active')}
            >
              <span className="flex-1 truncate">{item.title}</span>
              {item.isNew && (
                <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">
                  New
                </Badge>
              )}
              {item.isDeprecated && (
                <Badge
                  variant="outline"
                  className="ml-auto text-[10px] h-5 px-1.5 text-muted-foreground"
                >
                  Deprecated
                </Badge>
              )}
            </NavLink>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
