'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '@/app/theme'
import { cn } from '@/shared/lib/cn'

import { createExtensions } from '../lib/extensions'
import type { BlockEditorProps } from '../model/block-editor.types'

import { EditorBubbleMenu } from './bubble-menu'
import { EditorFloatingMenu } from './floating-menu'
import { MathInputDialog } from './math-input-dialog'
import { MediaInsertDialog, type MediaType } from './media-insert-dialog'
import { getSlashMenuItems, SlashMenu } from './slash-menu'

// Slash menu dimensions for boundary checking
const SLASH_MENU_HEIGHT = 400
const SLASH_MENU_WIDTH = 320
const VIEWPORT_PADDING = 8

export const BlockEditor = ({
  initialContent,
  onChange,
  onEditorUpdate,
  editable = true,
  className,
  placeholder
}: BlockEditorProps) => {
  const { resolvedMode } = useTheme()
  const { t } = useTranslation()
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
  const [slashMenuQuery, setSlashMenuQuery] = useState('')
  const [mathDialogOpen, setMathDialogOpen] = useState(false)
  const [mathDialogMode, setMathDialogMode] = useState<'block' | 'inline'>('block')
  const [mathDialogInitialValue, setMathDialogInitialValue] = useState('')
  const [mathEditPosition, setMathEditPosition] = useState<number | null>(null)
  // UX-1: Media insert dialog state (replaces window.prompt)
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false)
  const [mediaDialogType, setMediaDialogType] = useState<MediaType>('image')
  const slashMenuRef = useRef<{ onKeyDown: (event: KeyboardEvent) => boolean }>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)

  // FIX: Use ref to avoid re-registering click-outside listener on every showSlashMenu change
  const showSlashMenuRef = useRef(showSlashMenu)

  const editor = useEditor({
    extensions: createExtensions(placeholder),
    content: initialContent,
    editable,
    immediatelyRender: false,
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

      // Call onEditorUpdate if provided (for advanced use cases like HTML serialization)
      if (onEditorUpdate) {
        onEditorUpdate(editor)
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
          let top = coords.bottom - editorRect.top + 8
          let left = coords.left - editorRect.left

          // Viewport boundary checking
          const viewportHeight = window.innerHeight
          const viewportWidth = window.innerWidth

          // Check if menu would go below viewport
          const menuBottom = editorRect.top + top + SLASH_MENU_HEIGHT
          if (menuBottom > viewportHeight - VIEWPORT_PADDING) {
            // Position above cursor instead
            top = coords.top - editorRect.top - SLASH_MENU_HEIGHT - 8

            // Ensure menu doesn't go above editor or viewport
            const menuTop = editorRect.top + top
            if (menuTop < VIEWPORT_PADDING) {
              top = VIEWPORT_PADDING - editorRect.top
            }
          }

          // Check if menu would go off the right edge
          const menuRight = editorRect.left + left + SLASH_MENU_WIDTH
          if (menuRight > viewportWidth - VIEWPORT_PADDING) {
            left = viewportWidth - editorRect.left - SLASH_MENU_WIDTH - VIEWPORT_PADDING
          }

          // Ensure menu doesn't go off the left edge
          if (left < VIEWPORT_PADDING) {
            left = VIEWPORT_PADDING
          }

          setSlashMenuPosition({ top, left })
        }

        setShowSlashMenu(true)
      } else {
        setShowSlashMenu(false)
      }
    }
  })

  // FIX: Explicit editor cleanup for defense-in-depth
  // TipTap's useEditor handles this internally, but we add explicit cleanup as safety net
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy()
      }
    }
  }, [editor])

  // Keep ref in sync with state
  useEffect(() => {
    showSlashMenuRef.current = showSlashMenu
  }, [showSlashMenu])

  // Close slash menu when clicking outside
  // FIX: Use ref to check showSlashMenu instead of capturing it in closure
  // This prevents re-registering the listener on every showSlashMenu change
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSlashMenuRef.current &&
        editorRef.current &&
        !editorRef.current.contains(event.target as Node)
      ) {
        setShowSlashMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, []) // Empty deps - runs once!

  const openMathDialog = useCallback(
    (mode: 'block' | 'inline', initialValue = '', editPos: number | null = null) => {
      setMathDialogMode(mode)
      setMathDialogInitialValue(initialValue)
      setMathEditPosition(editPos)
      setMathDialogOpen(true)
    },
    []
  )

  // UX-1: Open media insert dialog (replaces window.prompt)
  const openMediaDialog = useCallback((type: MediaType) => {
    setMediaDialogType(type)
    setMediaDialogOpen(true)
  }, [])

  // Listen for edit-math events from the math extension
  useEffect(() => {
    const handleEditMath = (
      event: CustomEvent<{ latex: string; pos: number | null; mode: 'block' | 'inline' }>
    ) => {
      const { latex, pos, mode } = event.detail
      openMathDialog(mode, latex, pos)
    }

    document.addEventListener('edit-math', handleEditMath as EventListener)
    return () => document.removeEventListener('edit-math', handleEditMath as EventListener)
  }, [openMathDialog])

  // Memoize full slash menu items (avoids recreation on every render)
  const allSlashItems = useMemo(
    () => (editor ? getSlashMenuItems(editor, t, openMathDialog, openMediaDialog) : []),
    [editor, t, openMathDialog, openMediaDialog]
  )

  // Memoize filtered items (only recompute when query or items change)
  const slashItems = useMemo(() => {
    if (!slashMenuQuery) {
      return allSlashItems
    }
    const query = slashMenuQuery.toLowerCase()
    return allSlashItems.filter(item => item.title.toLowerCase().includes(query))
  }, [allSlashItems, slashMenuQuery])

  // Handle slash menu command
  const handleSlashCommand = useCallback(
    (item: { command: () => void }) => {
      if (!editor) {
        return
      }

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
    if (!editor) {
      return
    }
    // Insert slash to trigger the menu
    editor.chain().focus().insertContent('/').run()
  }, [editor])

  const handleMathSubmit = useCallback(
    (latex: string) => {
      if (!editor) {
        return
      }

      // If we're editing an existing math node
      if (mathEditPosition !== null) {
        editor
          .chain()
          .focus()
          .command(({ tr }) => {
            tr.setNodeMarkup(mathEditPosition, undefined, { latex })
            return true
          })
          .run()
      } else {
        // Creating a new math node
        if (mathDialogMode === 'block') {
          editor.chain().focus().setMathBlock({ latex }).run()
        } else {
          editor.chain().focus().setMathInline({ latex }).run()
        }
      }
    },
    [editor, mathDialogMode, mathEditPosition]
  )

  // UX-1: Handle media submit from dialog
  const handleMediaSubmit = useCallback(
    (url: string) => {
      if (!editor) {
        return
      }

      switch (mediaDialogType) {
        case 'image':
          editor.chain().focus().setImage({ src: url }).run()
          break
        case 'imageFigure':
          editor.chain().focus().setImageFigure({ src: url }).run()
          break
        case 'video':
          editor.chain().focus().setVideoEmbed({ src: url }).run()
          break
      }
    },
    [editor, mediaDialogType]
  )

  // Loading state while editor initializes
  if (!editor) {
    return (
      <div className={cn('tiptap-editor', className)}>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-muted rounded w-3/4' />
          <div className='h-4 bg-muted rounded w-full' />
          <div className='h-4 bg-muted rounded w-5/6' />
          <div className='h-4 bg-muted rounded w-4/5' />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={editorWrapperRef}
      className={cn(
        'tiptap-editor-wrapper relative',
        'md:-ml-12 md:pl-12', // Extend left into gutter for hover detection
        className
      )}
    >
      <div
        ref={editorRef}
        className={cn('tiptap-editor group/editor relative', resolvedMode === 'dark' && 'dark')}
      >
        <EditorBubbleMenu editor={editor} onOpenMathDialog={openMathDialog} />

        <MathInputDialog
          isOpen={mathDialogOpen}
          onClose={() => setMathDialogOpen(false)}
          onSubmit={handleMathSubmit}
          initialValue={mathDialogInitialValue}
          mode={mathDialogMode}
        />

        {/* UX-1: Media insert dialog (replaces window.prompt) */}
        <MediaInsertDialog
          isOpen={mediaDialogOpen}
          onClose={() => setMediaDialogOpen(false)}
          onSubmit={handleMediaSubmit}
          type={mediaDialogType}
        />

        <EditorContent editor={editor} />

        {/* Slash Menu */}
        {showSlashMenu && slashItems.length > 0 && (
          <div
            className='absolute z-50'
            style={{
              top: slashMenuPosition.top,
              left: slashMenuPosition.left
            }}
          >
            <SlashMenu ref={slashMenuRef} items={slashItems} command={handleSlashCommand} />
          </div>
        )}
      </div>

      {/* FloatingMenu positioned from wrapper (left:0 = gutter zone) */}
      <EditorFloatingMenu
        editor={editor}
        onAddClick={handleAddBlock}
        containerRef={editorWrapperRef}
      />
    </div>
  )
}
