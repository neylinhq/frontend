import type { Editor } from '@tiptap/react'
import { GripVertical, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/shared/lib/cn'

interface FloatingMenuProps {
  editor: Editor
  onAddClick: () => void
}

export function EditorFloatingMenu({ editor, onAddClick }: FloatingMenuProps) {
  const [position, setPosition] = useState({ top: 0 })
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    const updateMenu = () => {
      const { selection } = editor.state
      const { $from } = selection

      // Check if we're at an empty paragraph or at the start of a block
      const isEmptyParagraph =
        $from.parent.type.name === 'paragraph' &&
        $from.parent.content.size === 0

      const isAtBlockStart = $from.parentOffset === 0

      if (isEmptyParagraph || isAtBlockStart) {
        const { view } = editor
        const coords = view.coordsAtPos(selection.from)
        const editorElement = view.dom.closest('.tiptap-editor')

        if (editorElement) {
          const editorRect = editorElement.getBoundingClientRect()
          setPosition({
            top: coords.top - editorRect.top
          })
          setShouldShow(true)
        }
      } else {
        setShouldShow(false)
      }
    }

    // Initial update
    updateMenu()

    editor.on('selectionUpdate', updateMenu)
    editor.on('transaction', updateMenu)

    return () => {
      editor.off('selectionUpdate', updateMenu)
      editor.off('transaction', updateMenu)
    }
  }, [editor])

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAddClick()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent focus loss from editor
    e.preventDefault()
  }

  if (!shouldShow) {
    return null
  }

  return (
    <div
      className="absolute left-2 flex items-center gap-0.5 opacity-50 transition-opacity hover:opacity-100"
      style={{
        top: position.top
      }}
    >
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={handleAddClick}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded transition-colors',
          'text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
        title="Add block"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onMouseDown={handleMouseDown}
        className={cn(
          'flex h-6 w-6 cursor-grab items-center justify-center rounded transition-colors',
          'text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
        title="Drag to move"
      >
        <GripVertical className="h-4 w-4" />
      </button>
    </div>
  )
}
