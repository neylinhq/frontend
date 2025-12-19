'use client'

import { ArrowRightIcon, BookOpen01Icon, File01Icon, PackageIcon, PaletteIcon, SearchMdIcon, Type01Icon } from '@untitledui/icons-react/outline'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CommandPalette, type CommandPaletteItem } from '@/shared/components/command-palette'
import { cn } from '@/shared/lib/cn'
import { isMac } from '@/shared/lib/platform'

interface SearchItem extends CommandPaletteItem {
  title: string
  description?: string
  href: string
  section: string
  icon: React.ElementType
  keywords?: string[]
}

// Static documentation index
const SEARCH_INDEX: SearchItem[] = [
  // Getting Started
  {
    id: 'introduction',
    title: 'Introduction',
    description: 'Getting started with the design system',
    href: '/docs/ui',
    section: 'Getting Started',
    icon: BookOpen01Icon,
    keywords: ['start', 'begin', 'overview', 'introduction']
  },
  {
    id: 'installation',
    title: 'Installation',
    description: 'How to install and set up',
    href: '/docs/ui/installation',
    section: 'Getting Started',
    icon: File01Icon,
    keywords: ['install', 'setup', 'npm', 'yarn']
  },
  // Foundations
  {
    id: 'colors',
    title: 'Colors',
    description: 'Color palette and theming',
    href: '/docs/ui/colors',
    section: 'Foundations',
    icon: PaletteIcon,
    keywords: ['color', 'palette', 'theme', 'brand', 'primary', 'secondary']
  },
  {
    id: 'typography',
    title: 'Typography',
    description: 'Font styles and text formatting',
    href: '/docs/ui/typography',
    section: 'Foundations',
    icon: Type01Icon,
    keywords: ['font', 'text', 'heading', 'paragraph', 'size']
  },
  // Components
  {
    id: 'button',
    title: 'Button',
    description: 'Interactive button component',
    href: '/docs/ui/button',
    section: 'Components',
    icon: PackageIcon,
    keywords: ['button', 'click', 'action', 'submit', 'cta']
  },
  {
    id: 'input',
    title: 'Input',
    description: 'Text input field component',
    href: '/docs/ui/input',
    section: 'Components',
    icon: PackageIcon,
    keywords: ['input', 'text', 'field', 'form']
  },
  {
    id: 'card',
    title: 'Card',
    description: 'Container for content',
    href: '/docs/ui/card',
    section: 'Components',
    icon: PackageIcon,
    keywords: ['card', 'container', 'box', 'panel']
  },
  {
    id: 'badge',
    title: 'Badge',
    description: 'Status and label indicators',
    href: '/docs/ui/badge',
    section: 'Components',
    icon: PackageIcon,
    keywords: ['badge', 'tag', 'label', 'status', 'indicator']
  },
  {
    id: 'avatar',
    title: 'Avatar',
    description: 'User profile images',
    href: '/docs/ui/avatar',
    section: 'Components',
    icon: PackageIcon,
    keywords: ['avatar', 'user', 'profile', 'image', 'photo']
  },
  {
    id: 'dialog',
    title: 'Dialog',
    description: 'Modal dialog component',
    href: '/docs/ui/dialog',
    section: 'Components',
    icon: PackageIcon,
    keywords: ['dialog', 'modal', 'popup', 'overlay']
  },
  {
    id: 'tabs',
    title: 'Tabs',
    description: 'Tabbed navigation component',
    href: '/docs/ui/tabs',
    section: 'Components',
    icon: PackageIcon,
    keywords: ['tabs', 'navigation', 'switch', 'panel']
  }
]

// Filter function for search
const filterSearchItem = (item: SearchItem, query: string): boolean => {
  const normalizedQuery = query.toLowerCase().trim()
  const terms = normalizedQuery.split(/\s+/)

  const searchableText = [item.title, item.description, item.section, ...(item.keywords || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return terms.every(term => searchableText.includes(term))
}

// Render function for search items
const renderSearchItem = (item: SearchItem, isSelected: boolean) => {
  const Icon = item.icon

  return (
    <div className='flex items-center gap-3 px-3 py-2.5 text-left'>
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md border',
          isSelected ? 'border-accent-foreground/20 bg-background' : 'border-border bg-muted/50'
        )}
      >
        <Icon className='h-4 w-4' />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='font-medium text-sm truncate'>{item.title}</div>
        {item.description && (
          <div className='text-xs text-muted-foreground truncate'>{item.description}</div>
        )}
      </div>
      {isSelected && <ArrowRightIcon className='h-4 w-4 text-muted-foreground shrink-0' />}
    </div>
  )
}

interface DocsSearchProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const DocsSearch = ({ open, onOpenChange }: DocsSearchProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const controlled = open !== undefined
  const isDialogOpen = controlled ? open : isOpen
  const setDialogOpen = controlled && onOpenChange ? onOpenChange : setIsOpen

  const handleSelect = (item: SearchItem) => {
    navigate(item.href)
  }

  return (
    <CommandPalette
      open={isDialogOpen}
      onOpenChange={setDialogOpen}
      items={SEARCH_INDEX}
      filterFn={filterSearchItem}
      groupBy={item => item.section}
      renderItem={renderSearchItem}
      onSelect={handleSelect}
      placeholder='Search documentation...'
      emptyMessage='No results found for'
      title='Search documentation'
    />
  )
}

// Trigger component for search button
interface DocsSearchTriggerProps {
  className?: string
}

export const DocsSearchTrigger = ({ className }: DocsSearchTriggerProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          className
        )}
      >
        <SearchMdIcon className='h-4 w-4' />
        <span className='hidden sm:inline'>Search docs...</span>
        <kbd className='hidden md:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium'>
          {isMac ? '⌘' : 'Ctrl+'}K
        </kbd>
      </button>
      <DocsSearch open={open} onOpenChange={setOpen} />
    </>
  )
}
