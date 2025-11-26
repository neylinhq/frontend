import type { Editor } from '@tiptap/react'
import { GripVertical, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'

interface FloatingMenuProps {
  editor: Editor
  onAddClick: () => void
}

// Global drop indicator element
let globalDropIndicator: HTMLElement | null = null

const createDropIndicator = () => {
  const indicator = document.createElement('div')
  indicator.className = 'editor-drop-indicator'
  indicator.style.cssText = `
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    background: hsl(var(--primary));
    border-radius: 2px;
    pointer-events: none;
    z-index: 100;
    opacity: 0;
    transition: opacity 0.15s ease;
  `
  return indicator
}

const showDropIndicator = (container: HTMLElement, y: number) => {
  if (!globalDropIndicator) {
    globalDropIndicator = createDropIndicator()
    container.appendChild(globalDropIndicator)
  }
  globalDropIndicator.style.top = `${y}px`
  globalDropIndicator.style.opacity = '1'
}

const removeDropIndicator = () => {
  if (globalDropIndicator?.parentNode) {
    globalDropIndicator.parentNode.removeChild(globalDropIndicator)
    globalDropIndicator = null
  }
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

  // Store ProseMirror position instead of DOM ref (Gemini's recommendation)
  const dragStartPosRef = useRef<number | null>(null)
  const dragBlockRef = useRef<HTMLElement | null>(null) // Keep for visual feedback only

  // Handle mouse move to show menu on block hover
  useEffect(() => {
    const editorElement = editor.view.dom.closest('.tiptap-editor') as HTMLElement
    if (!editorElement) return

    const handleMouseMove = (e: MouseEvent) => {
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
      if (!block && mouseX < 60) {
        const blocks = Array.from(proseMirror.children).filter(
          (el): el is HTMLElement => el instanceof HTMLElement
        )
        for (const b of blocks) {
          const blockRect = b.getBoundingClientRect()
          const blockTop = blockRect.top - editorRect.top
          const blockBottom = blockRect.bottom - editorRect.top
          if (mouseY >= blockTop - 5 && mouseY <= blockBottom + 5) {
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

      // Use ProseMirror to find position under cursor
      const coords = { left: e.clientX, top: e.clientY }
      const posResult = view.posAtCoords(coords)

      if (!posResult) return

      const editorRect = editorElement.getBoundingClientRect()
      const $pos = view.state.doc.resolve(posResult.pos)

      // Find the top-level block (depth 1)
      if ($pos.depth >= 1) {
        const targetPos = $pos.before(1)

        // Get DOM element for this node to show indicator
        const targetDom = view.nodeDOM(targetPos) as HTMLElement
        if (targetDom) {
          const targetRect = targetDom.getBoundingClientRect()
          const insertAfter = e.clientY > targetRect.top + targetRect.height / 2

          const indicatorY = insertAfter
            ? targetRect.bottom - editorRect.top + 2
            : targetRect.top - editorRect.top - 2

          showDropIndicator(editorElement, indicatorY)
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
      } catch (err) {
        console.error('[Drop] Transaction error:', err)
      }

      cleanupDrag()
    }

    const cleanupDrag = () => {
      removeDropIndicator()
      dragBlockRef.current?.classList.remove('is-dragging')
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
    document.addEventListener('drop', handleDrop)
    document.addEventListener('dragend', handleDragEnd)

    if (editorElement) {
      editorElement.addEventListener('drop', handleDrop, true)
    }

    return () => {
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
      document.removeEventListener('dragend', handleDragEnd)
      if (editorElement) {
        editorElement.removeEventListener('drop', handleDrop, true)
      }
    }
  }, [editor])

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

    // Add visual feedback (may be removed by ProseMirror, but that's ok)
    block.classList.add('is-dragging')

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
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
      }, 100)
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
