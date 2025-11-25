'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useTheme } from '@/app/theme'
import { cn } from '@/shared/lib/cn'

import { createExtensions } from '../lib/extensions'
import type { BlockEditorProps } from '../model/block-editor.types'
import { EditorBubbleMenu } from './bubble-menu'
import { EditorFloatingMenu } from './floating-menu'
import { getSlashMenuItems, SlashMenu } from './slash-menu'

export function BlockEditor({
  initialContent,
  onChange,
  editable = true,
  className,
  placeholder
}: BlockEditorProps) {
  const { theme } = useTheme()
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
  const [slashMenuQuery, setSlashMenuQuery] = useState('')
  const slashMenuRef = useRef<{ onKeyDown: (event: KeyboardEvent) => boolean }>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: createExtensions(placeholder),
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[200px]'
      },
      handleKeyDown: (_view, event) => {
        // Handle slash menu keyboard navigation
        if (showSlashMenu && slashMenuRef.current) {
          const handled = slashMenuRef.current.onKeyDown(event)
          if (handled) {
            event.preventDefault()
            return true
          }
        }

        // Close slash menu on Escape
        if (event.key === 'Escape' && showSlashMenu) {
          setShowSlashMenu(false)
          return true
        }

        return false
      }
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON())
      }

      // Check for slash command trigger
      const { selection } = editor.state
      const { $from } = selection
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset)

      // Check if we're at the start of a line with just "/"
      const slashMatch = textBefore.match(/\/([a-zA-Z]*)$/)

      if (slashMatch) {
        const query = slashMatch[1] || ''
        setSlashMenuQuery(query)

        // Get cursor position for menu
        const coords = editor.view.coordsAtPos(selection.from)
        const editorRect = editorRef.current?.getBoundingClientRect()

        if (editorRect) {
          setSlashMenuPosition({
            top: coords.bottom - editorRect.top + 8,
            left: coords.left - editorRect.left
          })
        }

        setShowSlashMenu(true)
      } else {
        setShowSlashMenu(false)
      }
    }
  })

  // Close slash menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSlashMenu && editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setShowSlashMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSlashMenu])

  // Get filtered slash menu items
  const slashItems = getSlashMenuItems(editor).filter((item) =>
    item.title.toLowerCase().includes(slashMenuQuery.toLowerCase())
  )

  // Handle slash menu command
  const handleSlashCommand = useCallback(
    (item: { command: () => void }) => {
      if (!editor) return

      // Delete the slash command text
      const { selection } = editor.state
      const { $from } = selection
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset)
      const slashMatch = textBefore.match(/\/([a-zA-Z]*)$/)

      if (slashMatch) {
        const deleteFrom = selection.from - slashMatch[0].length
        editor.chain().focus().deleteRange({ from: deleteFrom, to: selection.from }).run()
      }

      // Execute command
      item.command()
      setShowSlashMenu(false)
    },
    [editor]
  )

  const handleAddBlock = useCallback(() => {
    if (!editor) return
    // Insert slash to trigger the menu
    editor.chain().focus().insertContent('/').run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div
      ref={editorRef}
      className={cn(
        'tiptap-editor group/editor relative pl-12',
        theme === 'dark' && 'dark',
        className
      )}
    >
      <EditorBubbleMenu editor={editor} />
      <EditorFloatingMenu editor={editor} onAddClick={handleAddBlock} />

      <EditorContent editor={editor} />

      {/* Slash Menu */}
      {showSlashMenu && slashItems.length > 0 && (
        <div
          className="absolute z-50"
          style={{
            top: slashMenuPosition.top,
            left: slashMenuPosition.left
          }}
        >
          <SlashMenu
            ref={slashMenuRef}
            items={slashItems}
            command={handleSlashCommand}
          />
        </div>
      )}
    </div>
  )
}
