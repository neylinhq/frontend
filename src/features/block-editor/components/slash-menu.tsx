import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CheckSquare,
  ChevronRight,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Info,
  Lightbulb,
  List,
  ListOrdered,
  Minus,
  Quote,
  Table,
  Type
} from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import type { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'

interface SlashMenuItem {
  title: string
  description: string
  icon: React.ReactNode
  command: () => void
  category: string
}

interface SlashMenuProps {
  items: SlashMenuItem[]
  command: (item: SlashMenuItem) => void
}

export interface SlashMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean
}

// Category order for sorting
const CATEGORY_ORDER = ['basic', 'lists', 'media', 'advanced']

export const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = items[index]
    if (item) {
      command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [items])

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }
      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }
      if (event.key === 'Enter') {
        enterHandler()
        return true
      }
      return false
    }
  }))

  if (items.length === 0) {
    return null
  }

  // Group items by category
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, SlashMenuItem[]>
  )

  // Sort categories according to CATEGORY_ORDER
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a)
    const indexB = CATEGORY_ORDER.indexOf(b)
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  // Calculate global index for each item
  let globalIndex = 0

  return (
    <div className="z-50 max-h-[400px] min-w-[320px] overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-xl">
      {sortedCategories.map((category, categoryIndex) => {
        const categoryItems = groupedItems[category]
        return (
          <div key={category} className={cn(categoryIndex > 0 && 'mt-2')}>
            <div className="mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {category}
            </div>
            {categoryItems.map((item) => {
              const currentIndex = globalIndex++
              return (
                <button
                  type="button"
                  key={`${category}-${item.title}`}
                  onClick={() => selectItem(items.indexOf(item))}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors',
                    currentIndex === selectedIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background shadow-sm">
                    {item.icon}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{item.title}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
})

SlashMenu.displayName = 'SlashMenu'

// Slash menu items configuration with categories
export const getSlashMenuItems = (
  editor: ReturnType<typeof import('@tiptap/react').useEditor>,
  t: ReturnType<typeof useTranslation>['t']
): SlashMenuItem[] => {
  if (!editor) return []

  return [
    // Basic blocks
    {
      title: t('editor.slash.text.title'),
      description: t('editor.slash.text.description'),
      icon: <Type className="h-5 w-5" />,
      command: () => editor.chain().focus().setParagraph().run(),
      category: t('editor.slash.categories.basic')
    },
    {
      title: t('editor.slash.heading1.title'),
      description: t('editor.slash.heading1.description'),
      icon: <Heading1 className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      category: t('editor.slash.categories.basic')
    },
    {
      title: t('editor.slash.heading2.title'),
      description: t('editor.slash.heading2.description'),
      icon: <Heading2 className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      category: t('editor.slash.categories.basic')
    },
    {
      title: t('editor.slash.heading3.title'),
      description: t('editor.slash.heading3.description'),
      icon: <Heading3 className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      category: t('editor.slash.categories.basic')
    },
    {
      title: t('editor.slash.quote.title'),
      description: t('editor.slash.quote.description'),
      icon: <Quote className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleBlockquote().run(),
      category: t('editor.slash.categories.basic')
    },
    {
      title: t('editor.slash.divider.title'),
      description: t('editor.slash.divider.description'),
      icon: <Minus className="h-5 w-5" />,
      command: () => editor.chain().focus().setHorizontalRule().run(),
      category: t('editor.slash.categories.basic')
    },

    // Lists
    {
      title: t('editor.slash.bulletList.title'),
      description: t('editor.slash.bulletList.description'),
      icon: <List className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleBulletList().run(),
      category: t('editor.slash.categories.lists')
    },
    {
      title: t('editor.slash.numberedList.title'),
      description: t('editor.slash.numberedList.description'),
      icon: <ListOrdered className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleOrderedList().run(),
      category: t('editor.slash.categories.lists')
    },
    {
      title: t('editor.slash.todoList.title'),
      description: t('editor.slash.todoList.description'),
      icon: <CheckSquare className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleTaskList().run(),
      category: t('editor.slash.categories.lists')
    },
    {
      title: t('editor.slash.toggle.title'),
      description: t('editor.slash.toggle.description'),
      icon: <ChevronRight className="h-5 w-5" />,
      command: () => editor.chain().focus().setDetails().run(),
      category: t('editor.slash.categories.lists')
    },

    // Media
    {
      title: t('editor.slash.image.title'),
      description: t('editor.slash.image.description'),
      icon: <Image className="h-5 w-5" />,
      command: () => {
        const url = window.prompt(t('editor.slash.imagePrompt'))
        if (url) {
          editor.chain().focus().setImage({ src: url }).run()
        }
      },
      category: t('editor.slash.categories.media')
    },
    {
      title: t('editor.slash.code.title'),
      description: t('editor.slash.code.description'),
      icon: <Code className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleCodeBlock().run(),
      category: t('editor.slash.categories.media')
    },
    {
      title: t('editor.slash.table.title'),
      description: t('editor.slash.table.description'),
      icon: <Table className="h-5 w-5" />,
      command: () =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      category: t('editor.slash.categories.media')
    },

    // Advanced - Callouts
    {
      title: t('editor.slash.calloutInfo.title'),
      description: t('editor.slash.calloutInfo.description'),
      icon: <Info className="h-5 w-5 text-blue-500" />,
      command: () => editor.chain().focus().setCallout({ type: 'info' }).run(),
      category: t('editor.slash.categories.advanced')
    },
    {
      title: t('editor.slash.calloutWarning.title'),
      description: t('editor.slash.calloutWarning.description'),
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      command: () => editor.chain().focus().setCallout({ type: 'warning' }).run(),
      category: t('editor.slash.categories.advanced')
    },
    {
      title: t('editor.slash.calloutSuccess.title'),
      description: t('editor.slash.calloutSuccess.description'),
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      command: () => editor.chain().focus().setCallout({ type: 'success' }).run(),
      category: t('editor.slash.categories.advanced')
    },
    {
      title: t('editor.slash.calloutError.title'),
      description: t('editor.slash.calloutError.description'),
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      command: () => editor.chain().focus().setCallout({ type: 'error' }).run(),
      category: t('editor.slash.categories.advanced')
    },
    {
      title: t('editor.slash.calloutTip.title'),
      description: t('editor.slash.calloutTip.description'),
      icon: <Lightbulb className="h-5 w-5 text-purple-500" />,
      command: () => editor.chain().focus().setCallout({ type: 'tip' }).run(),
      category: t('editor.slash.categories.advanced')
    }
  ]
}
