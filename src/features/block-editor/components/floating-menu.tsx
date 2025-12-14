import type { Editor } from '@tiptap/react'
import { GripVertical, Plus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UI_DELAYS } from '@/shared/config/api-delays'
import { cn } from '@/shared/lib/cn'
import { GUTTER, THRESHOLD } from '../model/block-editor.constants'
import styles from '../styles/floating-menu.module.css'

interface FloatingMenuProps {
  editor: Editor
  onAddClick: () => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

const createThrottle = <T extends (...args: never[]) => unknown>(fn: T, delayMs: number) => {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const throttled = ((...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCall

    if (timeSinceLastCall >= delayMs) {
      lastCall = now
      fn(...args)
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        timeoutId = null
        fn(...args)
      }, delayMs - timeSinceLastCall)
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

export const EditorFloatingMenu = ({ editor, onAddClick, containerRef }: FloatingMenuProps) => {
  const { t } = useTranslation()
  const [position, setPosition] = useState({ top: 0, height: 0 })
  const [shouldShow, setShouldShow] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredBlock, setHoveredBlock] = useState<HTMLElement | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const isHoveringMenuRef = useRef(false)
  const dropIndicatorRef = useRef<HTMLElement | null>(null)
  const ghostCleanupTimeoutRef = useRef<number | null>(null)
  const menuHideTimeoutRef = useRef<number | null>(null)
  const dropFeedbackTimeoutRef = useRef<number | null>(null)

  // Store ProseMirror position instead of DOM ref
  const dragStartPosRef = useRef<number | null>(null)
  const dragBlockRef = useRef<HTMLElement | null>(null)

  // Store drop target info for nested list support
  const dropTargetRef = useRef<{
    pos: number
    insertAfter: boolean
    isNested: boolean
    listItemDepth: number
  } | null>(null)


  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (ghostCleanupTimeoutRef.current) {
        clearTimeout(ghostCleanupTimeoutRef.current)
      }
      if (menuHideTimeoutRef.current) {
        clearTimeout(menuHideTimeoutRef.current)
      }
      if (dropFeedbackTimeoutRef.current) {
        clearTimeout(dropFeedbackTimeoutRef.current)
      }
    }
  }, [])

  // Hide menu on scroll (position becomes stale)
  useEffect(() => {
    if (!shouldShow) {
      return
    }

    const handleScroll = () => {
      if (!isDraggingRef.current) {
        setHoveredBlock(null)
        setShouldShow(false)
      }
    }

    // Listen for scroll on window and any scrollable ancestor
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [shouldShow])

  // Hide menu on click outside
  useEffect(() => {
    if (!shouldShow) {
      return
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        return
      }

      const target = e.target as HTMLElement
      if (menuRef.current?.contains(target)) {
        return
      }

      setHoveredBlock(null)
      setShouldShow(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [shouldShow])

  // Drop indicator helpers (use ref instead of global singleton)
  const showDropIndicator = useCallback(
    (
      container: HTMLElement,
      y: number,
      left: number,
      width: number,
      options: { nestingLevel?: number; isNested?: boolean } = {}
    ) => {
      const { nestingLevel = 0, isNested = false } = options
      const indent = nestingLevel * 24

      if (!dropIndicatorRef.current) {
        const indicator = document.createElement('div')
        indicator.className = isNested ? styles.dropIndicatorNested : styles.dropIndicator
        dropIndicatorRef.current = indicator
        container.appendChild(indicator)
      } else {
        // Update class if nesting changed
        dropIndicatorRef.current.className = isNested
          ? styles.dropIndicatorNested
          : styles.dropIndicator
      }

      // Position styles (dynamic, must be inline)
      // No transition - instant positioning for clarity
      dropIndicatorRef.current.style.cssText = `
        position: absolute;
        top: ${y}px;
        left: ${left + indent}px;
        width: ${width - indent}px;
      `
    },
    []
  )

  const removeDropIndicator = useCallback(() => {
    if (dropIndicatorRef.current?.parentNode) {
      dropIndicatorRef.current.parentNode.removeChild(dropIndicatorRef.current)
      dropIndicatorRef.current = null
    }
  }, [])

  // Handle mouse move to show menu on block hover (throttled for performance)
  useEffect(() => {
    // Guard: editor view must be mounted before accessing DOM
    if (!editor.view?.dom || editor.isDestroyed) {
      return
    }

    // Use wrapper for hover detection (includes gutter area outside editor)
    const container = containerRef.current
    if (!container) {
      return
    }

    const editorElement = container.querySelector('.tiptap-editor') as HTMLElement
    if (!editorElement) {
      return
    }

    const processMouseMove = (e: MouseEvent) => {
      if (isDragging || isHoveringMenuRef.current || editor.isDestroyed) {
        return
      }

      const proseMirror = editorElement.querySelector('.ProseMirror')
      if (!proseMirror) {
        return
      }

      const editorRect = editorElement.getBoundingClientRect()
      const mouseY = e.clientY - editorRect.top
      const target = e.target as HTMLElement

      // Recursively find the most specific block at Y coordinate
      // This handles nested structures like lists where we want to target individual <li> elements
      const findBlockAtY = (element: Element): HTMLElement | null => {
        for (const child of element.children) {
          if (!(child instanceof HTMLElement)) {
            continue
          }

          const childRect = child.getBoundingClientRect()
          const childTop = childRect.top - editorRect.top
          const childBottom = childRect.bottom - editorRect.top

          if (
            mouseY >= childTop - THRESHOLD.BLOCK_HOVER &&
            mouseY <= childBottom + THRESHOLD.BLOCK_HOVER
          ) {
            // If this is a list item, return it directly (Notion-like behavior)
            if (child.tagName === 'LI') {
              return child
            }
            // If this is a list container, search inside for specific list item
            if (child.tagName === 'UL' || child.tagName === 'OL') {
              const nested = findBlockAtY(child)
              if (nested) {
                return nested
              }
              // Fallback to the list itself if no specific item found
              return child
            }
            // For other blocks, return as-is
            return child
          }
        }
        return null
      }

      const block = findBlockAtY(proseMirror)

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

          if (
            mouseY >= blockTop - THRESHOLD.HOVER_GRACE &&
            mouseY <= blockBottom + THRESHOLD.HOVER_GRACE
          ) {
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
      UI_DELAYS.EDITOR_THROTTLE
    )

    const handleMouseLeave = (e: MouseEvent) => {
      if (isDragging) {
        return
      }

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

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      cleanupThrottle()
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [editor, isDragging, hoveredBlock, containerRef])

  // Handle drag events using ProseMirror API
  useEffect(() => {
    // Guard: editor view must be mounted before accessing DOM
    if (!editor.view?.dom || editor.isDestroyed) {
      return
    }

    const view = editor.view

    const handleDragOver = (e: DragEvent) => {
      if (!isDraggingRef.current || dragStartPosRef.current === null || editor.isDestroyed) {
        return
      }

      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move'
      }

      const editorElement = view.dom.closest('.tiptap-editor') as HTMLElement
      if (!editorElement) {
        return
      }

      const editorRect = editorElement.getBoundingClientRect()
      const mouseY = e.clientY

      // Simple DOM-based approach: find the block at mouse Y position
      const proseMirror = view.dom

      // Collect all blocks with their positions
      const collectBlocks = (element: Element): Array<{ el: HTMLElement; top: number; bottom: number }> => {
        const blocks: Array<{ el: HTMLElement; top: number; bottom: number }> = []

        for (const child of element.children) {
          if (!(child instanceof HTMLElement)) continue

          // If it's a list, collect its items instead
          if (child.tagName === 'UL' || child.tagName === 'OL') {
            blocks.push(...collectBlocks(child))
          } else {
            const rect = child.getBoundingClientRect()
            blocks.push({ el: child, top: rect.top, bottom: rect.bottom })
          }
        }
        return blocks
      }

      const blocks = collectBlocks(proseMirror)
      if (blocks.length === 0) return

      // Find the nearest gap between blocks
      // Gaps are: before first block, between blocks, after last block
      let bestGapY = blocks[0].top // default: before first block
      let bestDistance = Math.abs(mouseY - bestGapY)
      let targetBlockIndex = 0
      let insertAfter = false

      // Check gap before first block
      const firstGapY = blocks[0].top
      const firstDist = Math.abs(mouseY - firstGapY)
      if (firstDist < bestDistance) {
        bestDistance = firstDist
        bestGapY = firstGapY
        targetBlockIndex = 0
        insertAfter = false
      }

      // Check gaps between blocks and after each block
      for (let i = 0; i < blocks.length; i++) {
        const gapY = blocks[i].bottom
        const dist = Math.abs(mouseY - gapY)
        if (dist < bestDistance) {
          bestDistance = dist
          bestGapY = gapY
          targetBlockIndex = i
          insertAfter = true
        }
      }

      const targetBlock = blocks[targetBlockIndex].el
      const indicatorY = bestGapY - editorRect.top

      // Use ProseMirror container width
      const proseMirrorRect = proseMirror.getBoundingClientRect()

      showDropIndicator(
        editorElement,
        indicatorY,
        proseMirrorRect.left - editorRect.left,
        proseMirrorRect.width
      )

      // Get ProseMirror position for the block
      const pos = view.posAtDOM(targetBlock, 0)
      if (pos === undefined || pos === null) {
        return
      }

      const $pos = view.state.doc.resolve(pos)

      // Find the correct depth (listItem for LI, or top-level block)
      let blockDepth = 1
      let listItemDepth = -1

      for (let d = $pos.depth; d >= 1; d--) {
        const node = $pos.node(d)
        if (node.type.name === 'listItem' || node.type.name === 'taskItem') {
          listItemDepth = d
          blockDepth = d
          break
        }
      }

      const blockPos = $pos.before(blockDepth)

      // Save for handleDrop
      dropTargetRef.current = {
        pos: blockPos,
        insertAfter,
        isNested: false,
        listItemDepth
      }
    }

    const handleDrop = (e: DragEvent) => {
      const isOurDrag = e.dataTransfer?.types.includes('application/x-editor-block')

      if (isOurDrag) {
        e.preventDefault()
        e.stopPropagation()
      }

      if (!isDraggingRef.current || dragStartPosRef.current === null || editor.isDestroyed) {
        return
      }

      const target = dropTargetRef.current
      if (!target) {
        cleanupDrag()
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
        // Find the correct depth for source node
        // For list items, we want the listItem node, not the whole list
        let sourceDepth = 1
        for (let d = $sourcePos.depth; d >= 1; d--) {
          const node = $sourcePos.node(d)
          if (node.type.name === 'listItem' || node.type.name === 'taskItem') {
            sourceDepth = d
            break
          }
        }

        // Resolve to get the actual block node at correct depth
        if ($sourcePos.depth >= sourceDepth) {
          sourceNode = $sourcePos.node(sourceDepth)
          sourceStart = $sourcePos.before(sourceDepth)
          sourceEnd = $sourcePos.after(sourceDepth)
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

      const { pos: targetPos, insertAfter } = target

      try {
        const tr = view.state.tr

        // Helper: find parent list info before deletion
        const findParentListInfo = (pos: number) => {
          const $pos = view.state.doc.resolve(pos)
          for (let d = $pos.depth; d >= 1; d--) {
            const node = $pos.node(d)
            if (
              node.type.name === 'bulletList' ||
              node.type.name === 'orderedList' ||
              node.type.name === 'taskList'
            ) {
              return {
                pos: $pos.before(d),
                depth: d,
                node,
                childCount: node.childCount
              }
            }
          }
          return null
        }

        // Get parent list info BEFORE any modifications
        const sourceParentListInfo = findParentListInfo(sourceStart)

        // Standard before/after insertion
        const $targetPos = view.state.doc.resolve(targetPos)
        const targetNode = $targetPos.nodeAfter || $targetPos.nodeBefore
        const targetNodeSize = targetNode?.nodeSize || 0

        let insertPos: number
        if (insertAfter) {
          insertPos = targetPos + targetNodeSize
        } else {
          insertPos = targetPos
        }

        // Check if dropping in same position
        if (insertPos >= sourceStart && insertPos <= sourceEnd) {
          cleanupDrag()
          return
        }

        // Determine what to insert BEFORE deleting (to access original structure)
        let nodeToInsert = sourceNode

        // Check if source is a listItem
        const isSourceListItem =
          sourceNode.type.name === 'listItem' || sourceNode.type.name === 'taskItem'

        // Find source's parent list type
        let sourceListType: string | null = null
        if (isSourceListItem) {
          for (let d = $sourcePos.depth - 1; d >= 0; d--) {
            const node = $sourcePos.node(d)
            if (
              node.type.name === 'bulletList' ||
              node.type.name === 'orderedList' ||
              node.type.name === 'taskList'
            ) {
              sourceListType = node.type.name
              break
            }
          }
        }

        // Check if target is inside a list of the SAME type
        // If so, we insert the listItem directly without wrapping
        let targetListType: string | null = null
        for (let d = $targetPos.depth; d >= 1; d--) {
          const node = $targetPos.node(d)
          if (
            node.type.name === 'bulletList' ||
            node.type.name === 'orderedList' ||
            node.type.name === 'taskList'
          ) {
            targetListType = node.type.name
            break
          }
        }

        // Only wrap in list if:
        // 1. Source is a listItem
        // 2. Target is NOT inside a list of the same type
        const shouldWrap = isSourceListItem && targetListType !== sourceListType

        if (shouldWrap && sourceListType) {
          const listType = view.state.schema.nodes[sourceListType]
          if (listType) {
            nodeToInsert = listType.create(null, sourceNode)
          }
        }

        // Order of operations depends on direction to avoid position mapping issues
        const movingUp = insertPos < sourceStart

        if (movingUp) {
          // Moving up: insert first, then delete (source position shifts down after insert)
          tr.insert(insertPos, nodeToInsert)
          // After insert, source positions shift by nodeToInsert size
          const shiftedSourceStart = sourceStart + nodeToInsert.nodeSize
          const shiftedSourceEnd = sourceEnd + nodeToInsert.nodeSize
          tr.delete(shiftedSourceStart, shiftedSourceEnd)
        } else {
          // Moving down: delete first, then insert (insert position shifts up after delete)
          tr.delete(sourceStart, sourceEnd)
          const mappedInsertPos = tr.mapping.map(insertPos)
          tr.insert(mappedInsertPos, nodeToInsert)
        }

        // Cleanup: find and remove empty list items and lists (max 10 passes)
        const listTypes = ['bulletList', 'orderedList', 'taskList']
        for (let pass = 0; pass < 10; pass++) {
          const toDelete: Array<{ from: number; to: number }> = []

          tr.doc.descendants((node, pos) => {
            // Remove empty list items (no content or only empty paragraph)
            if (node.type.name === 'listItem' || node.type.name === 'taskItem') {
              // Check if listItem is empty or has only whitespace content
              const textContent = node.textContent.trim()
              const isEmpty = node.childCount === 0 || textContent === ''
              if (isEmpty) {
                toDelete.push({ from: pos, to: pos + node.nodeSize })
                return false // Don't descend
              }
            }
            // Remove empty lists (no children)
            if (listTypes.includes(node.type.name) && node.childCount === 0) {
              toDelete.push({ from: pos, to: pos + node.nodeSize })
              return false
            }
            return true
          })

          if (toDelete.length === 0) break

          // Delete in reverse order to preserve positions
          for (let i = toDelete.length - 1; i >= 0; i--) {
            const { from, to } = toDelete[i]
            tr.delete(from, to)
          }
        }

        // Try to join adjacent lists of the same type
        let joined = true
        while (joined) {
          joined = false
          tr.doc.descendants((node, pos) => {
            if (listTypes.includes(node.type.name)) {
              const afterPos = pos + node.nodeSize
              if (afterPos < tr.doc.content.size) {
                const $pos = tr.doc.resolve(afterPos)
                const after = $pos.nodeAfter
                if (after && after.type.name === node.type.name) {
                  tr.join(afterPos)
                  joined = true
                  return false
                }
              }
            }
            return true
          })
        }

        view.dispatch(tr)

        // Hide caret after drop (tracked timeout for cleanup)
        if (!editor.isDestroyed && view.dom) {
          const editorEl = view.dom.closest('.tiptap-editor')
          editorEl?.classList.add('just-dropped')
          if (dropFeedbackTimeoutRef.current) {
            clearTimeout(dropFeedbackTimeoutRef.current)
          }
          dropFeedbackTimeoutRef.current = window.setTimeout(() => {
            editorEl?.classList.remove('just-dropped')
          }, UI_DELAYS.EDITOR_DROP_FEEDBACK)
        }
      } catch {
        // Transaction error - ignore
      }

      cleanupDrag()
    }

    const cleanupDrag = () => {
      removeDropIndicator()
      dragBlockRef.current?.classList.remove('is-dragging')
      if (!editor.isDestroyed && view.dom) {
        view.dom.closest('.tiptap-editor')?.classList.remove('dragging')
      }
      dragBlockRef.current = null
      dragStartPosRef.current = null
      dropTargetRef.current = null
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

    if (!block || editor.isDestroyed || !editor.view?.dom) {
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
      background: oklch(var(--background));
      border: 1px solid oklch(var(--border));
      border-radius: 8px;
      padding: 8px;
      max-width: 300px;
      box-shadow: 0 4px 12px oklch(var(--foreground) / 0.15);
    `

    // FIX: Use try-finally to guarantee ghost cleanup even if setDragImage throws
    try {
      document.body.appendChild(ghost)
      e.dataTransfer.setDragImage(ghost, 0, 0)
    } finally {
      // Schedule cleanup - runs after drag image is captured (tracked for unmount cleanup)
      if (ghostCleanupTimeoutRef.current) {
        clearTimeout(ghostCleanupTimeoutRef.current)
      }
      ghostCleanupTimeoutRef.current = window.setTimeout(() => {
        if (ghost.parentNode) {
          document.body.removeChild(ghost)
        }
      }, UI_DELAYS.EDITOR_GHOST_CLEANUP)
    }
  }

  const handleDragEnd = () => {
    removeDropIndicator()
    dragBlockRef.current?.classList.remove('is-dragging')
    if (!editor.isDestroyed && editor.view?.dom) {
      editor.view.dom.closest('.tiptap-editor')?.classList.remove('dragging')
    }
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
      // Tracked timeout for cleanup on unmount
      if (menuHideTimeoutRef.current) {
        clearTimeout(menuHideTimeoutRef.current)
      }
      menuHideTimeoutRef.current = window.setTimeout(() => {
        if (!isHoveringMenuRef.current && !isDraggingRef.current) {
          setHoveredBlock(null)
          setShouldShow(false)
        }
      }, UI_DELAYS.EDITOR_MENU_HIDE)
    }
  }

  if (!shouldShow) {
    return null
  }

  const menuTop = position.top + 2

  return (
    <div
      ref={menuRef}
      role='toolbar'
      className={cn(styles.container, styles.containerVisible, GUTTER.MENU_POSITION_CLASS)}
      style={{
        top: Math.max(0, menuTop)
      }}
      onMouseEnter={handleMenuMouseEnter}
      onMouseLeave={handleMenuMouseLeave}
    >
      <button
        type='button'
        onMouseDown={handleMouseDownAdd}
        onClick={handleAddClick}
        aria-label={t('editor.floating.addBlock')}
        className={styles.addButton}
        title={t('editor.floating.addBlock')}
      >
        <Plus className='h-4 w-4' />
      </button>
      <button
        type='button'
        draggable='true'
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        aria-label={t('editor.floating.dragToMove')}
        className={cn(styles.dragButton, isDragging && styles.dragButtonDragging)}
        title={t('editor.floating.dragToMove')}
      >
        <GripVertical className='h-4 w-4' />
      </button>
    </div>
  )
}
