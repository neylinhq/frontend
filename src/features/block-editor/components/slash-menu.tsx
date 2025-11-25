import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Quote,
  Type
} from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import { cn } from '@/shared/lib/cn'

interface SlashMenuItem {
  title: string
  description: string
  icon: React.ReactNode
  command: () => void
}

interface SlashMenuProps {
  items: SlashMenuItem[]
  command: (item: SlashMenuItem) => void
}

export interface SlashMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean
}

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

  return (
    <div className="z-50 min-w-[280px] overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg">
      {items.map((item, index) => (
        <button
          type="button"
          key={item.title}
          onClick={() => selectItem(index)}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
            index === selectedIndex
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent/50'
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background">
            {item.icon}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{item.title}</span>
            <span className="text-xs text-muted-foreground">{item.description}</span>
          </div>
        </button>
      ))}
    </div>
  )
})

SlashMenu.displayName = 'SlashMenu'

// Slash menu items configuration
export const getSlashMenuItems = (editor: ReturnType<typeof import('@tiptap/react').useEditor>) => {
  if (!editor) return []

  return [
    {
      title: 'Text',
      description: 'Just start writing with plain text',
      icon: <Type className="h-5 w-5" />,
      command: () => editor.chain().focus().setParagraph().run()
    },
    {
      title: 'Heading 1',
      description: 'Big section heading',
      icon: <Heading1 className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run()
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: <Heading2 className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run()
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: <Heading3 className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run()
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list',
      icon: <List className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleBulletList().run()
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: <ListOrdered className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleOrderedList().run()
    },
    {
      title: 'To-do List',
      description: 'Track tasks with a to-do list',
      icon: <CheckSquare className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleTaskList().run()
    },
    {
      title: 'Quote',
      description: 'Capture a quote',
      icon: <Quote className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleBlockquote().run()
    },
    {
      title: 'Code',
      description: 'Capture a code snippet',
      icon: <Code className="h-5 w-5" />,
      command: () => editor.chain().focus().toggleCodeBlock().run()
    },
    {
      title: 'Divider',
      description: 'Visually divide blocks',
      icon: <Minus className="h-5 w-5" />,
      command: () => editor.chain().focus().setHorizontalRule().run()
    }
  ]
}
