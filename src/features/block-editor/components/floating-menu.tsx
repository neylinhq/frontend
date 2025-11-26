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
  const dragBlockRef = useRef<HTMLElement | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false) // Sync ref for immediate access
  const isHoveringMenuRef = useRef(false) // Track if hovering over floating menu

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

      // Find the block under the mouse
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
      // and find which block we're aligned with vertically
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
        // Still on same block, keep showing
        return
      } else if (!block) {
        // Check if mouse is over the floating menu itself
        if (menuRef.current?.contains(target)) {
          return // Don't hide when hovering over menu
        }

        // If we have a hovered block, check if cursor is still in its vertical range
        // This allows moving to the left menu buttons without losing the menu
        if (hoveredBlock) {
          const blockRect = hoveredBlock.getBoundingClientRect()
          const blockTop = blockRect.top - editorRect.top
          const blockBottom = blockRect.bottom - editorRect.top

          // Keep menu visible if cursor is in the block's vertical range
          // Extended range to allow easier access to floating menu buttons
          if (mouseY >= blockTop - 10 && mouseY <= blockBottom + 10) {
            return
          }
        }

        // Mouse left the block's area
        setHoveredBlock(null)
        setShouldShow(false)
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (isDragging) return

      // Check if cursor is moving to the floating menu
      const relatedTarget = e.relatedTarget as HTMLElement | null
      if (relatedTarget && menuRef.current?.contains(relatedTarget)) {
        return // Don't hide when moving to floating menu
      }

      // Also check if we're still hovering the menu (for edge cases)
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

  // Handle dragover on document to show drop indicator - always listen, check ref
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      if (!isDraggingRef.current || !dragBlockRef.current) return

      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move'
      }

      const editorElement = editor.view.dom.closest('.tiptap-editor') as HTMLElement
      if (!editorElement) return

      const editorRect = editorElement.getBoundingClientRect()
      const mouseY = e.clientY - editorRect.top

      // Find all top-level blocks in ProseMirror (direct children of .ProseMirror)
      const proseMirror = editorElement.querySelector('.ProseMirror')
      if (!proseMirror) return

      const blocks = Array.from(proseMirror.children).filter(
        (el): el is HTMLElement => el instanceof HTMLElement && el !== dragBlockRef.current
      )

      let closestBlock: HTMLElement | null = null
      let closestDistance = Infinity
      let insertBefore = true

      blocks.forEach((block) => {
        const rect = block.getBoundingClientRect()
        const blockTop = rect.top - editorRect.top
        const blockMiddle = blockTop + rect.height / 2

        const distance = Math.abs(mouseY - blockMiddle)
        if (distance < closestDistance) {
          closestDistance = distance
          closestBlock = block
          insertBefore = mouseY < blockMiddle
        }
      })

      if (closestBlock) {
        const block = closestBlock as HTMLElement
        const rect = block.getBoundingClientRect()
        const indicatorY = insertBefore
          ? rect.top - editorRect.top - 2
          : rect.bottom - editorRect.top + 2

        showDropIndicator(editorElement, indicatorY)
      }
    }

    const handleDrop = (e: DragEvent) => {
      // Check if this is our custom drag operation
      const isOurDrag = e.dataTransfer?.types.includes('application/x-editor-block')

      console.log('[Drop] handleDrop fired', {
        isOurDrag,
        isDraggingRef: isDraggingRef.current,
        hasDragBlock: !!dragBlockRef.current,
        types: e.dataTransfer?.types,
        eventPhase: e.eventPhase, // 1=capture, 2=target, 3=bubble
      })

      if (isOurDrag) {
        // Always prevent default for our drag operations to avoid text insertion
        e.preventDefault()
        e.stopPropagation()
      }

      if (!isDraggingRef.current || !dragBlockRef.current) {
        console.log('[Drop] Early exit - no active drag')
        return
      }

      console.log('[Drop] Processing drop...')

      const editorElement = editor.view.dom.closest('.tiptap-editor') as HTMLElement
      if (!editorElement) {
        console.log('[Drop] No editorElement, exiting')
        cleanupDrag()
        return
      }

      const proseMirror = editorElement.querySelector('.ProseMirror')
      if (!proseMirror) {
        console.log('[Drop] No proseMirror, exiting')
        cleanupDrag()
        return
      }

      const editorRect = editorElement.getBoundingClientRect()
      const mouseY = e.clientY - editorRect.top

      // Find source block index
      const blocks = Array.from(proseMirror.children).filter(
        (el): el is HTMLElement => el instanceof HTMLElement
      )
      console.log('[Drop] Found blocks:', blocks.length)

      // Find source index by comparing DOM nodes or by finding the dragging class
      let sourceIndex = blocks.indexOf(dragBlockRef.current)

      // Fallback: find by is-dragging class (in case ref was lost due to hot reload)
      if (sourceIndex === -1) {
        sourceIndex = blocks.findIndex(b => b.classList.contains('is-dragging'))
        console.log('[Drop] Used fallback to find source by class, sourceIndex:', sourceIndex)
      }

      console.log('[Drop] sourceIndex:', sourceIndex)
      if (sourceIndex === -1) {
        console.log('[Drop] Source block not found in blocks array')
        cleanupDrag()
        return
      }

      // Update dragBlockRef to the actual block found
      dragBlockRef.current = blocks[sourceIndex]

      // Find target index based on mouse position
      let targetIndex = 0
      let insertAfter = false

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]
        if (block === dragBlockRef.current) continue

        const rect = block.getBoundingClientRect()
        const blockTop = rect.top - editorRect.top
        const blockMiddle = blockTop + rect.height / 2

        if (mouseY > blockMiddle) {
          targetIndex = i
          insertAfter = true
        } else if (mouseY <= blockMiddle && targetIndex <= i) {
          targetIndex = i
          insertAfter = false
          break
        }
      }
      console.log('[Drop] targetIndex:', targetIndex, 'insertAfter:', insertAfter)

      // Don't do anything if dropping in the same position
      if (targetIndex === sourceIndex ||
          (insertAfter && targetIndex === sourceIndex - 1) ||
          (!insertAfter && targetIndex === sourceIndex + 1)) {
        console.log('[Drop] Same position, skipping')
        cleanupDrag()
        return
      }

      try {
        // Find positions from document structure
        const { doc } = editor.state

        console.log('[Drop] Document info:', {
          docSize: doc.nodeSize,
          childCount: doc.childCount,
          sourceIndex,
          targetIndex,
          insertAfter,
        })

        // Log all children with their positions
        const children: Array<{ index: number; offset: number; size: number; type: string }> = []
        doc.forEach((node, offset, index) => {
          children.push({
            index,
            offset,
            size: node.nodeSize,
            type: node.type.name,
          })
        })
        console.log('[Drop] Document children:', children)

        let sourceStart = 0
        let sourceEnd = 0
        let targetPos = 0

        doc.forEach((node, offset, index) => {
          if (index === sourceIndex) {
            sourceStart = offset
            sourceEnd = offset + node.nodeSize
          }
          if (insertAfter) {
            if (index === targetIndex) {
              targetPos = offset + node.nodeSize
            }
          } else {
            if (index === targetIndex) {
              targetPos = offset
            }
          }
        })

        console.log('[Drop] Calculated positions:', { sourceStart, sourceEnd, targetPos })

        // Validate positions
        if (sourceStart === sourceEnd) {
          console.error('[Drop] Invalid source positions - node not found')
          cleanupDrag()
          return
        }

        // Get the node to move
        const nodeToMove = doc.slice(sourceStart, sourceEnd)
        console.log('[Drop] nodeToMove:', {
          content: nodeToMove.content.toString(),
          size: nodeToMove.size,
        })

        // Create transaction
        const { tr } = editor.state

        // If moving down, we need to insert first, then delete
        // If moving up, we delete first, then insert
        if (sourceStart < targetPos) {
          // Moving down
          console.log('[Drop] Moving down - insert at', targetPos, 'then delete', sourceStart, '-', sourceEnd)
          tr.insert(targetPos, nodeToMove.content)
          tr.delete(sourceStart, sourceEnd)
        } else {
          // Moving up
          console.log('[Drop] Moving up - delete', sourceStart, '-', sourceEnd, 'then insert at', targetPos)
          tr.delete(sourceStart, sourceEnd)
          tr.insert(targetPos, nodeToMove.content)
        }

        console.log('[Drop] Dispatching transaction...')
        editor.view.dispatch(tr)
        console.log('[Drop] Transaction dispatched successfully')
      } catch (err) {
        console.error('[Drop] Error:', err)
      }

      cleanupDrag()
    }

    const cleanupDrag = () => {
      removeDropIndicator()
      dragBlockRef.current?.classList.remove('is-dragging')
      dragBlockRef.current = null
      isDraggingRef.current = false
      setIsDragging(false)
    }

    const handleDragEnd = () => {
      if (isDraggingRef.current) {
        console.log('[Drag] handleDragEnd from document')
        cleanupDrag()
      }
    }

    // Get editor element for capture phase listener
    const editorElement = editor.view.dom.closest('.tiptap-editor') as HTMLElement

    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)
    document.addEventListener('dragend', handleDragEnd)

    // Add capture phase listener on editor to intercept before ProseMirror
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
    // Prevent focus loss from editor for add button only
    e.preventDefault()
  }

  const handleDragStart = (e: React.DragEvent) => {
    console.log('[Drag] handleDragStart called', {
      hoveredBlock: hoveredBlock?.tagName,
      hoveredBlockText: hoveredBlock?.textContent?.slice(0, 30),
    })
    e.stopPropagation()

    // Use hoveredBlock directly instead of searching by selection
    const block = hoveredBlock

    if (!block) {
      console.log('[Drag] No hovered block, preventing drag')
      e.preventDefault()
      return
    }

    // Verify block is still in DOM and is child of ProseMirror
    const proseMirror = editor.view.dom
    if (!proseMirror.contains(block)) {
      console.log('[Drag] Block not in ProseMirror, preventing drag')
      e.preventDefault()
      return
    }

    console.log('[Drag] Starting drag:', {
      tagName: block.tagName,
      text: block.textContent?.slice(0, 50),
      parentIsProseMirror: block.parentElement === proseMirror,
    })

    dragBlockRef.current = block
    isDraggingRef.current = true
    setIsDragging(true)
    block.classList.add('is-dragging')

    // Set drag data - use custom type to prevent text insertion
    e.dataTransfer.setData('application/x-editor-block', 'true')
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.dropEffect = 'move'

    console.log('[Drag] Drag started, refs set:', {
      isDraggingRef: isDraggingRef.current,
      hasDragBlock: !!dragBlockRef.current,
    })

    // Create custom drag image
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
    console.log('[Drag] handleDragEnd called')
    removeDropIndicator()
    dragBlockRef.current?.classList.remove('is-dragging')
    dragBlockRef.current = null
    isDraggingRef.current = false
    setIsDragging(false)
  }

  // Handle floating menu hover to prevent hiding
  const handleMenuMouseEnter = () => {
    isHoveringMenuRef.current = true
  }

  const handleMenuMouseLeave = () => {
    isHoveringMenuRef.current = false
    // Hide menu when leaving floating menu area (unless dragging)
    if (!isDragging) {
      // Small delay to allow re-entering block area
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

  // Align menu to top of block with small offset for visual alignment
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
