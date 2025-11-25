import type { Editor } from '@tiptap/react'
import {
  Bold,
  Code,
  Highlighter,
  Italic,
  Link,
  Strikethrough,
  Underline
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'

interface EditorBubbleMenuProps {
  editor: Editor
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false)
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
          placeholder="Enter URL..."
          className="h-8 w-48 rounded-md border-none bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button variant="ghost" size="sm" onClick={setLink} className="h-8 px-2 text-xs">
          Save
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
          Cancel
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
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href
          setLinkUrl(previousUrl || '')
          setIsLinkInputOpen(true)
        }}
        isActive={editor.isActive('link')}
      >
        <Link className="h-4 w-4" />
      </ToolbarButton>
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
