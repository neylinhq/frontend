'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowRight,
  BookOpen,
  FileText,
  Hash,
  Package,
  Palette,
  Search,
  Type,
} from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import './docs-search.styles.css'
import { isMac } from '@/shared/lib/platform'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/ui/dialog'

interface SearchItem {
  id: string
  title: string
  description?: string
  href: string
  section: string
  icon: React.ElementType
  keywords?: string[]
}

// Статический индекс документации
const SEARCH_INDEX: SearchItem[] = [
  // Getting Started
  {
    id: 'introduction',
    title: 'Introduction',
    description: 'Getting started with the design system',
    href: '/docs/ui',
    section: 'Getting Started',
    icon: BookOpen,
    keywords: ['start', 'begin', 'overview', 'introduction'],
  },
  {
    id: 'installation',
    title: 'Installation',
    description: 'How to install and set up',
    href: '/docs/ui/installation',
    section: 'Getting Started',
    icon: FileText,
    keywords: ['install', 'setup', 'npm', 'yarn'],
  },
  // Foundations
  {
    id: 'colors',
    title: 'Colors',
    description: 'Color palette and theming',
    href: '/docs/ui/colors',
    section: 'Foundations',
    icon: Palette,
    keywords: ['color', 'palette', 'theme', 'brand', 'primary', 'secondary'],
  },
  {
    id: 'typography',
    title: 'Typography',
    description: 'Font styles and text formatting',
    href: '/docs/ui/typography',
    section: 'Foundations',
    icon: Type,
    keywords: ['font', 'text', 'heading', 'paragraph', 'size'],
  },
  // Components
  {
    id: 'button',
    title: 'Button',
    description: 'Interactive button component',
    href: '/docs/ui/button',
    section: 'Components',
    icon: Package,
    keywords: ['button', 'click', 'action', 'submit', 'cta'],
  },
  {
    id: 'input',
    title: 'Input',
    description: 'Text input field component',
    href: '/docs/ui/input',
    section: 'Components',
    icon: Package,
    keywords: ['input', 'text', 'field', 'form'],
  },
  {
    id: 'card',
    title: 'Card',
    description: 'Container for content',
    href: '/docs/ui/card',
    section: 'Components',
    icon: Package,
    keywords: ['card', 'container', 'box', 'panel'],
  },
  {
    id: 'badge',
    title: 'Badge',
    description: 'Status and label indicators',
    href: '/docs/ui/badge',
    section: 'Components',
    icon: Package,
    keywords: ['badge', 'tag', 'label', 'status', 'indicator'],
  },
  {
    id: 'avatar',
    title: 'Avatar',
    description: 'User profile images',
    href: '/docs/ui/avatar',
    section: 'Components',
    icon: Package,
    keywords: ['avatar', 'user', 'profile', 'image', 'photo'],
  },
  {
    id: 'dialog',
    title: 'Dialog',
    description: 'Modal dialog component',
    href: '/docs/ui/dialog',
    section: 'Components',
    icon: Package,
    keywords: ['dialog', 'modal', 'popup', 'overlay'],
  },
  {
    id: 'tabs',
    title: 'Tabs',
    description: 'Tabbed navigation component',
    href: '/docs/ui/tabs',
    section: 'Components',
    icon: Package,
    keywords: ['tabs', 'navigation', 'switch', 'panel'],
  },
]

interface DocsSearchProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DocsSearch({ open, onOpenChange }: DocsSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  const controlled = open !== undefined
  const isDialogOpen = controlled ? open : isOpen
  const setDialogOpen = controlled ? onOpenChange! : setIsOpen

  // Фильтрация результатов
  const results = useMemo(() => {
    if (!query.trim()) return SEARCH_INDEX

    const normalizedQuery = query.toLowerCase().trim()
    const terms = normalizedQuery.split(/\s+/)

    return SEARCH_INDEX.filter((item) => {
      const searchableText = [
        item.title,
        item.description,
        item.section,
        ...(item.keywords || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return terms.every((term) => searchableText.includes(term))
    })
  }, [query])

  // Группировка по секциям
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {}
    for (const item of results) {
      if (!groups[item.section]) {
        groups[item.section] = []
      }
      groups[item.section].push(item)
    }
    return groups
  }, [results])

  // Плоский список для навигации
  const flatResults = useMemo(() => results, [results])

  // Обработка выбора
  const handleSelect = useCallback(
    (item: SearchItem) => {
      navigate(item.href)
      setDialogOpen(false)
      setQuery('')
    },
    [navigate, setDialogOpen]
  )

  // Клавиатурная навигация
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => (i + 1) % flatResults.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => (i - 1 + flatResults.length) % flatResults.length)
          break
        case 'Enter':
          e.preventDefault()
          if (flatResults[selectedIndex]) {
            handleSelect(flatResults[selectedIndex])
          }
          break
      }
    },
    [flatResults, selectedIndex, handleSelect]
  )

  // Глобальный хоткей Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setDialogOpen(!isDialogOpen)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [isDialogOpen, setDialogOpen])

  // Сброс выбора при изменении запроса
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Search documentation</DialogTitle>

        {/* Search Input */}
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-14 px-3 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {flatResults.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            Object.entries(groupedResults).map(([section, items]) => (
              <div key={section} className="mb-4 last:mb-0">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {section}
                </div>
                {items.map((item) => {
                  const globalIndex = flatResults.indexOf(item)
                  const Icon = item.icon

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        globalIndex === selectedIndex
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent/50'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-md border',
                          globalIndex === selectedIndex
                            ? 'border-accent-foreground/20 bg-background'
                            : 'border-border bg-muted/50'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {globalIndex === selectedIndex && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px]">
                ↓
              </kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px]">
                ↵
              </kbd>
              <span className="ml-1">Select</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            <span>{flatResults.length} results</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Компонент-триггер для поисковой строки
interface DocsSearchTriggerProps {
  className?: string
}

export function DocsSearchTrigger({ className }: DocsSearchTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'docs-search-trigger inline-flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          className
        )}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search docs...</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
          {isMac ? '⌘' : 'Ctrl+'}K
        </kbd>
      </button>
      <DocsSearch open={open} onOpenChange={setOpen} />
    </>
  )
}
