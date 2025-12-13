import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CheckSquare,
  ChevronRight,
  Code,
  Columns,
  FileImage,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Info,
  Lightbulb,
  List,
  ListOrdered,
  ListTree,
  Minus,
  Quote,
  Sigma,
  SquareSigma,
  Table,
  Type,
  Youtube
} from 'lucide-react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'

import type { SlashMenuItem } from '../model/block-editor.types'
import styles from '../styles/slash-menu.module.css'

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
  const prevItemsLengthRef = useRef(items.length)

  const selectItem = useCallback(
    (index: number) => {
      // Guard against invalid index
      if (index < 0 || index >= items.length) {
        return
      }
      const item = items[index]
      if (item) {
        command(item)
      }
    },
    [items, command]
  )

  const upHandler = useCallback(() => {
    // Use callback form to avoid stale closure
    setSelectedIndex(prev => {
      if (items.length === 0) {
        return 0
      }
      return (prev + items.length - 1) % items.length
    })
  }, [items.length])

  const downHandler = useCallback(() => {
    // Use callback form to avoid stale closure
    setSelectedIndex(prev => {
      if (items.length === 0) {
        return 0
      }
      return (prev + 1) % items.length
    })
  }, [items.length])

  const enterHandler = useCallback(() => {
    selectItem(selectedIndex)
  }, [selectItem, selectedIndex])

  // Reset selection when items list changes
  useEffect(() => {
    if (prevItemsLengthRef.current !== items.length) {
      setSelectedIndex(0)
      prevItemsLengthRef.current = items.length
    }
  }, [items.length])

  useImperativeHandle(
    ref,
    () => ({
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
    }),
    [upHandler, downHandler, enterHandler]
  )

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
    if (indexA === -1 && indexB === -1) {
      return 0
    }
    if (indexA === -1) {
      return 1
    }
    if (indexB === -1) {
      return -1
    }
    return indexA - indexB
  })

  // Calculate global index for each item
  let globalIndex = 0

  return (
    <div className={styles.container}>
      {sortedCategories.map((category, _categoryIndex) => {
        const categoryItems = groupedItems[category]
        return (
          <div key={category} className={styles.category}>
            <div className={styles.categoryTitle}>
              {category}
            </div>
            {categoryItems.map(item => {
              const currentIndex = globalIndex++
              return (
                <button
                  type='button'
                  key={`${category}-${item.title}`}
                  onClick={() => selectItem(currentIndex)}
                  className={cn(
                    styles.item,
                    currentIndex === selectedIndex && styles.itemSelected
                  )}
                >
                  <div className={styles.iconContainer}>
                    {item.icon}
                  </div>
                  <div className={styles.itemContent}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemDescription}>
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

// Media type for dialog
type MediaType = 'image' | 'imageFigure' | 'video'

// Slash menu items configuration with categories
export const getSlashMenuItems = (
  editor: ReturnType<typeof import('@tiptap/react').useEditor>,
  t: ReturnType<typeof useTranslation>['t'],
  openMathDialog?: (mode: 'block' | 'inline') => void,
  openMediaDialog?: (type: MediaType) => void
): SlashMenuItem[] => {
  if (!editor) {
    return []
  }

  return [
    // Basic blocks
    {
      title: t('editor.slash.text.title'),
      description: t('editor.slash.text.description'),
      icon: <Type className='h-5 w-5' />,
      command: () => editor.chain().focus().setParagraph().run(),
      category: t('editor.slash.categories.basic')
    },
    {
      title: t('editor.slash.heading1.title'),
      description: t('editor.slash.heading1.description'),
      icon: <Heading1 className='h-5 w-5' />,
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      category: t('editor.slash.categories.basic')
    },
    {
      title: t('editor.slash.heading2.title'),
      description: t('editor.slash.heading2.description'),
      icon: <Heading2 className='h-5 w-5' />,
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      category: t('editor.slash.categories.basic')
    },
    {
      title: t('editor.slash.heading3.title'),
      description: t('editor.slash.heading3.description'),
      icon: <Heading3 className='h-5 w-5' />,
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      category: t('editor.slash.categories.basic')
    },
    {
      title: t('editor.slash.quote.title'),
      description: t('editor.slash.quote.description'),
      icon: <Quote className='h-5 w-5' />,
      command: () => editor.chain().focus().toggleBlockquote().run(),
      category: t('editor.slash.categories.basic')
    },
    {
      title: t('editor.slash.divider.title'),
      description: t('editor.slash.divider.description'),
      icon: <Minus className='h-5 w-5' />,
      command: () => editor.chain().focus().setHorizontalRule().run(),
      category: t('editor.slash.categories.basic')
    },

    // Lists
    {
      title: t('editor.slash.bulletList.title'),
      description: t('editor.slash.bulletList.description'),
      icon: <List className='h-5 w-5' />,
      command: () => editor.chain().focus().toggleBulletList().run(),
      category: t('editor.slash.categories.lists')
    },
    {
      title: t('editor.slash.numberedList.title'),
      description: t('editor.slash.numberedList.description'),
      icon: <ListOrdered className='h-5 w-5' />,
      command: () => editor.chain().focus().toggleOrderedList().run(),
      category: t('editor.slash.categories.lists')
    },
    {
      title: t('editor.slash.todoList.title'),
      description: t('editor.slash.todoList.description'),
      icon: <CheckSquare className='h-5 w-5' />,
      command: () => editor.chain().focus().toggleTaskList().run(),
      category: t('editor.slash.categories.lists')
    },
    {
      title: t('editor.slash.toggle.title'),
      description: t('editor.slash.toggle.description'),
      icon: <ChevronRight className='h-5 w-5' />,
      command: () => editor.chain().focus().setDetails().run(),
      category: t('editor.slash.categories.lists')
    },

    // Media
    {
      title: t('editor.slash.image.title'),
      description: t('editor.slash.image.description'),
      icon: <Image className='h-5 w-5' />,
      // UX-1: Use dialog instead of window.prompt
      command: () => openMediaDialog?.('image'),
      category: t('editor.slash.categories.media')
    },
    {
      title: t('editor.slash.imageFigure.title'),
      description: t('editor.slash.imageFigure.description'),
      icon: <FileImage className='h-5 w-5' />,
      // UX-1: Use dialog instead of window.prompt
      command: () => openMediaDialog?.('imageFigure'),
      category: t('editor.slash.categories.media')
    },
    {
      title: t('editor.slash.video.title'),
      description: t('editor.slash.video.description'),
      icon: <Youtube className='h-5 w-5' />,
      // UX-1: Use dialog instead of window.prompt
      command: () => openMediaDialog?.('video'),
      category: t('editor.slash.categories.media')
    },
    {
      title: t('editor.slash.code.title'),
      description: t('editor.slash.code.description'),
      icon: <Code className='h-5 w-5' />,
      command: () => editor.chain().focus().toggleCodeBlock().run(),
      category: t('editor.slash.categories.media')
    },
    {
      title: t('editor.slash.table.title'),
      description: t('editor.slash.table.description'),
      icon: <Table className='h-5 w-5' />,
      command: () =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      category: t('editor.slash.categories.media')
    },
    {
      title: t('editor.slash.mathBlock.title'),
      description: t('editor.slash.mathBlock.description'),
      icon: <SquareSigma className='h-5 w-5' />,
      command: () => openMathDialog?.('block'),
      category: t('editor.slash.categories.media')
    },
    {
      title: t('editor.slash.mathInline.title'),
      description: t('editor.slash.mathInline.description'),
      icon: <Sigma className='h-5 w-5' />,
      command: () => openMathDialog?.('inline'),
      category: t('editor.slash.categories.media')
    },

    // Advanced - Callouts
    {
      title: t('editor.slash.calloutInfo.title'),
      description: t('editor.slash.calloutInfo.description'),
      icon: <Info className='h-5 w-5' />,
      command: () => editor.chain().focus().setCallout({ type: 'info' }).run(),
      category: t('editor.slash.categories.advanced')
    },
    {
      title: t('editor.slash.calloutWarning.title'),
      description: t('editor.slash.calloutWarning.description'),
      icon: <AlertTriangle className='h-5 w-5' />,
      command: () => editor.chain().focus().setCallout({ type: 'warning' }).run(),
      category: t('editor.slash.categories.advanced')
    },
    {
      title: t('editor.slash.calloutSuccess.title'),
      description: t('editor.slash.calloutSuccess.description'),
      icon: <CheckCircle className='h-5 w-5' />,
      command: () => editor.chain().focus().setCallout({ type: 'success' }).run(),
      category: t('editor.slash.categories.advanced')
    },
    {
      title: t('editor.slash.calloutError.title'),
      description: t('editor.slash.calloutError.description'),
      icon: <AlertCircle className='h-5 w-5' />,
      command: () => editor.chain().focus().setCallout({ type: 'error' }).run(),
      category: t('editor.slash.categories.advanced')
    },
    {
      title: t('editor.slash.calloutTip.title'),
      description: t('editor.slash.calloutTip.description'),
      icon: <Lightbulb className='h-5 w-5' />,
      command: () => editor.chain().focus().setCallout({ type: 'tip' }).run(),
      category: t('editor.slash.categories.advanced')
    },
    {
      title: t('editor.slash.columns2.title'),
      description: t('editor.slash.columns2.description'),
      icon: <Columns className='h-5 w-5' />,
      command: () => editor.chain().focus().setColumns(2).run(),
      category: t('editor.slash.categories.advanced')
    },
    {
      title: t('editor.slash.columns3.title'),
      description: t('editor.slash.columns3.description'),
      icon: <Columns className='h-5 w-5' />,
      command: () => editor.chain().focus().setColumns(3).run(),
      category: t('editor.slash.categories.advanced')
    },
    {
      title: t('editor.slash.toc.title'),
      description: t('editor.slash.toc.description'),
      icon: <ListTree className='h-5 w-5' />,
      command: () => editor.chain().focus().insertTableOfContents().run(),
      category: t('editor.slash.categories.advanced')
    }
  ]
}
