import type { Editor } from '@tiptap/react'
import { GripVertical, Plus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'

// Constants
const GUTTER_WIDTH = 60
const BLOCK_HOVER_THRESHOLD = 5
const MENU_HIDE_DELAY = 100
const THROTTLE_DELAY = 16 // ~60fps

interface FloatingMenuProps {
  editor: Editor
  onAddClick: () => void
}

// Throttle helper with cleanup support
function createThrottle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): { throttled: T; cleanup: () => void } {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const throttled = ((...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCall

    if (timeSinceLastCall >= delay) {
      lastCall = now
      fn(...args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        timeoutId = null
        fn(...args)
      }, delay - timeSinceLastCall)
    }
  }) as T

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return { throttled, cleanup }
}

export function EditorFloatingMenu({ editor, onAddClick }: FloatingMenuProps) {
  const { t } = useTranslation()
  const [position, setPosition] = useState({ top: 0, height: 0 })
  const [shouldShow, setShouldShow] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredBlock, setHoveredBlock] = useState<HTMLElement | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const isHoveringMenuRef = useRef(false)
  const dropIndicatorRef = useRef<HTMLElement | null>(null)

  // Store ProseMirror position instead of DOM ref
  const dragStartPosRef = useRef<number | null>(null)
  const dragBlockRef = useRef<HTMLElement | null>(null)

  // Drop indicator helpers (use ref instead of global singleton)
  const showDropIndicator = useCallback((container: HTMLElement, y: number, left: number, width: number) => {
    if (!dropIndicatorRef.current) {
      const indicator = document.createElement('div')
      indicator.className = 'editor-drop-indicator'
      indicator.style.cssText = `
        position: absolute;
        height: 2px;
        background: hsl(var(--primary) / 0.5);
        border-radius: 1px;
        pointer-events: none;
        z-index: 100;
        opacity: 0;
        transition: opacity 0.15s ease;
      `
      dropIndicatorRef.current = indicator
      container.appendChild(indicator)
    }
    dropIndicatorRef.current.style.top = `${y}px`
    dropIndicatorRef.current.style.left = `${left}px`
    dropIndicatorRef.current.style.width = `${width}px`
    dropIndicatorRef.current.style.opacity = '1'
  }, [])

  const removeDropIndicator = useCallback(() => {
    if (dropIndicatorRef.current?.parentNode) {
      dropIndicatorRef.current.parentNode.removeChild(dropIndicatorRef.current)
      dropIndicatorRef.current = null
    }
  }, [])

  // Handle mouse move to show menu on block hover (throttled for performance)
  useEffect(() => {
    const editorElement = editor.view.dom.closest('.tiptap-editor') as HTMLElement
    if (!editorElement) return

    const processMouseMove = (e: MouseEvent) => {
      if (isDragging || isHoveringMenuRef.current) return

      const proseMirror = editorElement.querySelector('.ProseMirror')
      if (!proseMirror) return

      const editorRect = editorElement.getBoundingClientRect()
      const mouseX = e.clientX - editorRect.left
      const mouseY = e.clientY - editorRect.top

      const target = e.target as HTMLElement
      let block: HTMLElement | null = null

      // Check if we're over a direct child of ProseMirror
      if (proseMirror.contains(target)) {
        let current: HTMLElement | null = target
        while (current && current !== proseMirror) {
          if (current.parentElement === proseMirror) {
            block = current
            break
          }
          current = current.parentElement as HTMLElement
        }
      }

      // If not directly over a block, check if we're in the left gutter area
      if (!block && mouseX < GUTTER_WIDTH) {
        const blocks = Array.from(proseMirror.children).filter(
          (el): el is HTMLElement => el instanceof HTMLElement
        )
        for (const b of blocks) {
          const blockRect = b.getBoundingClientRect()
          const blockTop = blockRect.top - editorRect.top
          const blockBottom = blockRect.bottom - editorRect.top
          if (mouseY >= blockTop - BLOCK_HOVER_THRESHOLD && mouseY <= blockBottom + BLOCK_HOVER_THRESHOLD) {
            block = b
            break
          }
        }
      }

      if (block && block !== hoveredBlock) {
        const blockRect = block.getBoundingClientRect()
        setPosition({
          top: blockRect.top - editorRect.top,
          height: blockRect.height
        })
        setHoveredBlock(block)
        setShouldShow(true)
      } else if (block && block === hoveredBlock) {
        return
      } else if (!block) {
        if (menuRef.current?.contains(target)) {
          return
        }

        if (hoveredBlock) {
          const blockRect = hoveredBlock.getBoundingClientRect()
          const blockTop = blockRect.top - editorRect.top
          const blockBottom = blockRect.bottom - editorRect.top

          if (mouseY >= blockTop - 10 && mouseY <= blockBottom + 10) {
            return
          }
        }

        setHoveredBlock(null)
        setShouldShow(false)
      }
    }

    // Throttle mouse move for better performance
    const { throttled: handleMouseMove, cleanup: cleanupThrottle } = createThrottle(
      processMouseMove,
      THROTTLE_DELAY
    )

    const handleMouseLeave = (e: MouseEvent) => {
      if (isDragging) return

      const relatedTarget = e.relatedTarget as HTMLElement | null
      if (relatedTarget && menuRef.current?.contains(relatedTarget)) {
        return
      }

      if (isHoveringMenuRef.current) {
        return
      }

      setHoveredBlock(null)
      setShouldShow(false)
    }

    editorElement.addEventListener('mousemove', handleMouseMove)
    editorElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      cleanupThrottle()
      editorElement.removeEventListener('mousemove', handleMouseMove)
      editorElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [editor, isDragging, hoveredBlock])

  // Handle drag events using ProseMirror API
  useEffect(() => {
    const view = editor.view

    const handleDragOver = (e: DragEvent) => {
      if (!isDraggingRef.current || dragStartPosRef.current === null) return

      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move'
      }

      const editorElement = view.dom.closest('.tiptap-editor') as HTMLElement
      if (!editorElement) return

      const coords = { left: e.clientX, top: e.clientY }
      const posResult = view.posAtCoords(coords)
      if (!posResult) return

      const editorRect = editorElement.getBoundingClientRect()
      const $pos = view.state.doc.resolve(posResult.pos)

      if ($pos.depth >= 1) {
        const targetPos = $pos.before(1)
        const targetDom = view.nodeDOM(targetPos) as HTMLElement
        if (targetDom) {
          const targetRect = targetDom.getBoundingClientRect()
          const insertAfter = e.clientY > targetRect.top + targetRect.height / 2

          const indicatorY = insertAfter
            ? targetRect.bottom - editorRect.top
            : targetRect.top - editorRect.top

          const indicatorLeft = targetRect.left - editorRect.left
          const indicatorWidth = targetRect.width

          showDropIndicator(editorElement, indicatorY, indicatorLeft, indicatorWidth)
        }
      }
    }

    const handleDrop = (e: DragEvent) => {
      const isOurDrag = e.dataTransfer?.types.includes('application/x-editor-block')

      if (isOurDrag) {
        e.preventDefault()
        e.stopPropagation()
      }

      if (!isDraggingRef.current || dragStartPosRef.current === null) {
        return
      }

      // Get source node using saved position
      const sourcePos = dragStartPosRef.current
      const $sourcePos = view.state.doc.resolve(sourcePos)

      // Get the source node (top-level block)
      let sourceNode: ReturnType<typeof view.state.doc.nodeAt>
      let sourceStart: number
      let sourceEnd: number

      try {
        // Resolve to get the actual block node
        if ($sourcePos.depth >= 1) {
          sourceNode = $sourcePos.node(1)
          sourceStart = $sourcePos.before(1)
          sourceEnd = $sourcePos.after(1)
        } else {
          sourceNode = view.state.doc.nodeAt(sourcePos)
          if (!sourceNode) {
            cleanupDrag()
            return
          }
          sourceStart = sourcePos
          sourceEnd = sourcePos + sourceNode.nodeSize
        }
      } catch {
        cleanupDrag()
        return
      }

      if (!sourceNode) {
        cleanupDrag()
        return
      }

      // Find target position using posAtCoords
      const coords = { left: e.clientX, top: e.clientY }
      const posResult = view.posAtCoords(coords)

      if (!posResult) {
        cleanupDrag()
        return
      }

      const $targetPos = view.state.doc.resolve(posResult.pos)

      // Find the target top-level block
      let insertPos: number

      if ($targetPos.depth >= 1) {
        const targetNode = $targetPos.node(1)
        const targetPos = $targetPos.before(1)

        // Determine if inserting before or after
        const targetDom = view.nodeDOM(targetPos) as HTMLElement
        if (targetDom) {
          const targetRect = targetDom.getBoundingClientRect()
          const insertAfter = e.clientY > targetRect.top + targetRect.height / 2
          insertPos = insertAfter ? targetPos + targetNode.nodeSize : targetPos
        } else {
          insertPos = targetPos
        }
      } else {
        insertPos = posResult.pos
      }

      // Check if dropping in same position
      if (insertPos >= sourceStart && insertPos <= sourceEnd) {
        cleanupDrag()
        return
      }

      // Execute transaction with mapping (Gemini's recommended approach)
      try {
        const tr = view.state.tr

        // Delete source first
        tr.delete(sourceStart, sourceEnd)

        // Map the insert position after deletion
        const mappedInsertPos = tr.mapping.map(insertPos)

        // Insert at mapped position
        tr.insert(mappedInsertPos, sourceNode)

        view.dispatch(tr)

        // Hide caret after drop
        const editorEl = view.dom.closest('.tiptap-editor')
        editorEl?.classList.add('just-dropped')
        setTimeout(() => editorEl?.classList.remove('just-dropped'), 500)
      } catch (err) {
        console.error('[Drop] Transaction error:', err)
      }

      cleanupDrag()
    }

    const cleanupDrag = () => {
      removeDropIndicator()
      dragBlockRef.current?.classList.remove('is-dragging')
      view.dom.closest('.tiptap-editor')?.classList.remove('dragging')
      dragBlockRef.current = null
      dragStartPosRef.current = null
      isDraggingRef.current = false
      setIsDragging(false)
    }

    const handleDragEnd = () => {
      if (isDraggingRef.current) {
        cleanupDrag()
      }
    }

    const editorElement = view.dom.closest('.tiptap-editor') as HTMLElement

    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('dragend', handleDragEnd)

    // Only register drop handler on editorElement to avoid double execution
    if (editorElement) {
      editorElement.addEventListener('drop', handleDrop, true)
    }

    return () => {
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('dragend', handleDragEnd)
      if (editorElement) {
        editorElement.removeEventListener('drop', handleDrop, true)
      }
    }
  }, [editor, showDropIndicator, removeDropIndicator])

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAddClick()
  }

  const handleMouseDownAdd = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()

    const block = hoveredBlock

    if (!block) {
      e.preventDefault()
      return
    }

    const proseMirror = editor.view.dom
    if (!proseMirror.contains(block)) {
      e.preventDefault()
      return
    }

    // Get ProseMirror position using posAtDOM (Gemini's key recommendation)
    const pos = editor.view.posAtDOM(block, 0)

    if (pos === undefined || pos === null) {
      e.preventDefault()
      return
    }

    // Store position instead of DOM ref
    dragStartPosRef.current = pos
    dragBlockRef.current = block // For visual feedback only
    isDraggingRef.current = true
    setIsDragging(true)

    // Add visual feedback
    block.classList.add('is-dragging')
    const editorElement = editor.view.dom.closest('.tiptap-editor')
    editorElement?.classList.add('dragging')

    e.dataTransfer.setData('application/x-editor-block', 'true')
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.dropEffect = 'move'

    // Create drag ghost image
    const ghost = block.cloneNode(true) as HTMLElement
    ghost.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      opacity: 0.8;
      background: hsl(var(--background));
      border: 1px solid hsl(var(--border));
      border-radius: 8px;
      padding: 8px;
      max-width: 300px;
      box-shadow: 0 4px 12px hsl(var(--foreground) / 0.15);
    `
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)

    setTimeout(() => {
      if (ghost.parentNode) {
        document.body.removeChild(ghost)
      }
    }, 0)
  }

  const handleDragEnd = () => {
    removeDropIndicator()
    dragBlockRef.current?.classList.remove('is-dragging')
    editor.view.dom.closest('.tiptap-editor')?.classList.remove('dragging')
    dragBlockRef.current = null
    dragStartPosRef.current = null
    isDraggingRef.current = false
    setIsDragging(false)
  }

  const handleMenuMouseEnter = () => {
    isHoveringMenuRef.current = true
  }

  const handleMenuMouseLeave = () => {
    isHoveringMenuRef.current = false
    if (!isDragging) {
      setTimeout(() => {
        if (!isHoveringMenuRef.current && !isDraggingRef.current) {
          setHoveredBlock(null)
          setShouldShow(false)
        }
      }, MENU_HIDE_DELAY)
    }
  }

  if (!shouldShow) {
    return null
  }

  const menuTop = position.top + 2

  return (
    <div
      ref={menuRef}
      role="toolbar"
      className="absolute -left-2 flex items-center gap-0.5 opacity-50 transition-opacity hover:opacity-100"
      style={{
        top: Math.max(0, menuTop)
      }}
      onMouseEnter={handleMenuMouseEnter}
      onMouseLeave={handleMenuMouseLeave}
    >
      <button
        type="button"
        onMouseDown={handleMouseDownAdd}
        onClick={handleAddClick}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded transition-colors',
          'text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
        title={t('editor.floating.addBlock')}
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        draggable="true"
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded transition-colors',
          'text-muted-foreground hover:bg-accent hover:text-foreground',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        title={t('editor.floating.dragToMove')}
      >
        <GripVertical className="h-4 w-4" />
      </button>
    </div>
  )
}
