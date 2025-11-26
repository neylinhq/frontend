import type { Editor } from '@tiptap/react'
import {
  Bold,
  CheckSquare,
  ChevronDown,
  Code,
  Copy,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link,
  List,
  ListOrdered,
  MoreHorizontal,
  Palette,
  Quote,
  Sigma,
  Strikethrough,
  Subscript,
  Superscript,
  Trash2,
  Type,
  Underline
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'

// Block types for Turn Into dropdown
const BLOCK_TYPES = [
  { name: 'text', label: 'Text', icon: Type, command: (editor: Editor) => editor.chain().focus().setParagraph().run() },
  { name: 'heading1', label: 'Heading 1', icon: Heading1, command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
  { name: 'heading2', label: 'Heading 2', icon: Heading2, command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { name: 'heading3', label: 'Heading 3', icon: Heading3, command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  { name: 'bulletList', label: 'Bullet List', icon: List, command: (editor: Editor) => editor.chain().focus().toggleBulletList().run() },
  { name: 'numberedList', label: 'Numbered List', icon: ListOrdered, command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run() },
  { name: 'todoList', label: 'To-do List', icon: CheckSquare, command: (editor: Editor) => editor.chain().focus().toggleTaskList().run() },
  { name: 'quote', label: 'Quote', icon: Quote, command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run() }
]

const TEXT_COLORS = [
  { name: 'Default', color: null },
  { name: 'Gray', color: '#6b7280' },
  { name: 'Brown', color: '#92400e' },
  { name: 'Orange', color: '#ea580c' },
  { name: 'Yellow', color: '#ca8a04' },
  { name: 'Green', color: '#16a34a' },
  { name: 'Blue', color: '#2563eb' },
  { name: 'Purple', color: '#9333ea' },
  { name: 'Pink', color: '#db2777' },
  { name: 'Red', color: '#dc2626' }
]

const HIGHLIGHT_COLORS = [
  { name: 'Default', color: null },
  { name: 'Gray', color: '#e5e7eb' },
  { name: 'Brown', color: '#fef3c7' },
  { name: 'Orange', color: '#ffedd5' },
  { name: 'Yellow', color: '#fef9c3' },
  { name: 'Green', color: '#dcfce7' },
  { name: 'Blue', color: '#dbeafe' },
  { name: 'Purple', color: '#f3e8ff' },
  { name: 'Pink', color: '#fce7f3' },
  { name: 'Red', color: '#fee2e2' }
]

interface EditorBubbleMenuProps {
  editor: Editor
  onOpenMathDialog?: (mode: 'block' | 'inline') => void
}

export function EditorBubbleMenu({ editor, onOpenMathDialog }: EditorBubbleMenuProps) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isTurnIntoOpen, setIsTurnIntoOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isLinkInputOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLinkInputOpen])

  useEffect(() => {
    const updateMenu = () => {
      const { selection } = editor.state
      const { empty, from, to } = selection

      // Hide menu if selection is empty or is a node selection
      if (empty || from === to) {
        setIsVisible(false)
        setIsColorPickerOpen(false)
        setIsTurnIntoOpen(false)
        setIsMoreMenuOpen(false)
        return
      }

      // Get the selection coordinates
      const { view } = editor
      const start = view.coordsAtPos(from)
      const end = view.coordsAtPos(to)

      // Calculate position (center above selection)
      const left = (start.left + end.left) / 2
      const top = start.top - 10

      setPosition({ top, left })
      setIsVisible(true)
    }

    editor.on('selectionUpdate', updateMenu)
    editor.on('transaction', updateMenu)

    return () => {
      editor.off('selectionUpdate', updateMenu)
      editor.off('transaction', updateMenu)
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    setLinkUrl('')
    setIsLinkInputOpen(false)
  }, [editor, linkUrl])

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setLink()
    }
    if (e.key === 'Escape') {
      setIsLinkInputOpen(false)
      setLinkUrl('')
    }
  }

  // Get current block type for Turn Into label
  const getCurrentBlockType = () => {
    if (editor.isActive('heading', { level: 1 })) return BLOCK_TYPES.find(b => b.name === 'heading1')
    if (editor.isActive('heading', { level: 2 })) return BLOCK_TYPES.find(b => b.name === 'heading2')
    if (editor.isActive('heading', { level: 3 })) return BLOCK_TYPES.find(b => b.name === 'heading3')
    if (editor.isActive('bulletList')) return BLOCK_TYPES.find(b => b.name === 'bulletList')
    if (editor.isActive('orderedList')) return BLOCK_TYPES.find(b => b.name === 'numberedList')
    if (editor.isActive('taskList')) return BLOCK_TYPES.find(b => b.name === 'todoList')
    if (editor.isActive('blockquote')) return BLOCK_TYPES.find(b => b.name === 'quote')
    return BLOCK_TYPES.find(b => b.name === 'text')
  }

  const currentBlockType = getCurrentBlockType()
  const CurrentBlockIcon = currentBlockType?.icon || Type

  if (!isVisible) {
    return null
  }

  if (isLinkInputOpen) {
    return (
      <div
        ref={menuRef}
        className="fixed z-50 flex items-center gap-1 rounded-lg border border-border bg-popover p-1 shadow-lg"
        style={{
          top: position.top,
          left: position.left,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={handleLinkKeyDown}
          placeholder={t('editor.bubble.urlPlaceholder')}
          className="h-8 w-48 rounded-md border-none bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button variant="ghost" size="sm" onClick={setLink} className="h-8 px-2 text-xs">
          {t('editor.bubble.save')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsLinkInputOpen(false)
            setLinkUrl('')
          }}
          className="h-8 px-2 text-xs"
        >
          {t('editor.bubble.cancel')}
        </Button>
      </div>
    )
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {/* Turn Into Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsTurnIntoOpen(!isTurnIntoOpen)
            setIsColorPickerOpen(false)
          }}
          className={cn(
            'flex h-8 items-center gap-1 rounded-md px-2 transition-colors',
            isTurnIntoOpen
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          )}
        >
          <CurrentBlockIcon className="h-4 w-4" />
          <span className="text-xs">{t(`editor.bubble.blockTypes.${currentBlockType?.name || 'text'}`)}</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {isTurnIntoOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-lg">
            {BLOCK_TYPES.map((blockType) => {
              const Icon = blockType.icon
              const isActive = currentBlockType?.name === blockType.name
              return (
                <button
                  key={blockType.name}
                  type="button"
                  onClick={() => {
                    blockType.command(editor)
                    setIsTurnIntoOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(`editor.bubble.blockTypes.${blockType.name}`)}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
      >
        <Highlighter className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        isActive={editor.isActive('subscript')}
      >
        <Subscript className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        isActive={editor.isActive('superscript')}
      >
        <Superscript className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      {/* Color Picker */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
          isActive={isColorPickerOpen}
        >
          <Palette className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </ToolbarButton>

        {isColorPickerOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 min-w-[200px] rounded-lg border border-border bg-popover p-2 shadow-lg">
            <div className="mb-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('editor.bubble.textColor')}</p>
              <div className="flex flex-wrap gap-1">
                {TEXT_COLORS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      if (item.color) {
                        editor.chain().focus().setColor(item.color).run()
                      } else {
                        editor.chain().focus().unsetColor().run()
                      }
                      setIsColorPickerOpen(false)
                    }}
                    className={cn(
                      'h-6 w-6 rounded border border-border transition-transform hover:scale-110',
                      item.color === null && 'bg-foreground'
                    )}
                    style={{ backgroundColor: item.color || undefined }}
                    title={item.name}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('editor.bubble.highlight')}</p>
              <div className="flex flex-wrap gap-1">
                {HIGHLIGHT_COLORS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      if (item.color) {
                        editor.chain().focus().toggleHighlight({ color: item.color }).run()
                      } else {
                        editor.chain().focus().unsetHighlight().run()
                      }
                      setIsColorPickerOpen(false)
                    }}
                    className={cn(
                      'h-6 w-6 rounded border border-border transition-transform hover:scale-110',
                      item.color === null && 'bg-transparent'
                    )}
                    style={{ backgroundColor: item.color || undefined }}
                    title={item.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mx-1 h-6 w-px bg-border" />

      <ToolbarButton
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href
          setLinkUrl(previousUrl || '')
          setIsLinkInputOpen(true)
        }}
        isActive={editor.isActive('link')}
      >
        <Link className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => onOpenMathDialog?.('inline')}
        isActive={editor.isActive('mathInline')}
      >
        <Sigma className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-border" />

      {/* More Menu */}
      <div className="relative">
        <ToolbarButton
          onClick={() => {
            setIsMoreMenuOpen(!isMoreMenuOpen)
            setIsColorPickerOpen(false)
            setIsTurnIntoOpen(false)
          }}
          isActive={isMoreMenuOpen}
        >
          <MoreHorizontal className="h-4 w-4" />
        </ToolbarButton>

        {isMoreMenuOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                const { from, to } = editor.state.selection
                const text = editor.state.doc.textBetween(from, to, ' ')
                navigator.clipboard.writeText(text)
                setIsMoreMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent/50 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span>{t('editor.bubble.more.copy')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().deleteSelection().run()
                setIsMoreMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('editor.bubble.more.delete')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive: boolean
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}
