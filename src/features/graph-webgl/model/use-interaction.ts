/**
 * Hook for handling canvas interactions (mouse, touch, keyboard)
 */

import { useCallback, useRef, useEffect, useState } from 'react'
import type { InteractionState } from '../lib/types'

interface UseInteractionOptions {
  canvas: HTMLCanvasElement | null
  onPan: (dx: number, dy: number) => void
  onZoom: (screenX: number, screenY: number, factor: number) => void
  onNodeClick: (nodeId: string | null) => void
  onNodeDoubleClick?: (nodeId: string) => void
  onNodeDragStart?: (nodeId: string, x: number, y: number) => void
  onNodeDrag?: (nodeId: string, x: number, y: number) => void
  onNodeDragEnd?: (nodeId: string, x: number, y: number) => void
  hitTest: (screenX: number, screenY: number) => string | null
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number }
}

export function useInteraction({
  canvas,
  onPan,
  onZoom,
  onNodeClick,
  onNodeDoubleClick,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragEnd,
  hitTest,
  screenToWorld,
}: UseInteractionOptions) {
  const [state, setState] = useState<InteractionState>({
    selectedNodeId: null,
    focusedNodeId: null,
    hoveredNodeId: null,
    isDragging: false,
    isPanning: false,
    dragStartX: 0,
    dragStartY: 0,
  })

  // Refs for current state in event handlers
  const stateRef = useRef(state)
  stateRef.current = state

  const lastPointerRef = useRef({ x: 0, y: 0 })
  const draggedNodeRef = useRef<string | null>(null)

  // Get canvas-relative coordinates
  const getCanvasCoords = useCallback((e: MouseEvent | Touch) => {
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [canvas])

  // Mouse down
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!canvas) return

    const { x, y } = getCanvasCoords(e)
    lastPointerRef.current = { x, y }

    // Check for node hit
    const nodeId = hitTest(x, y)

    if (e.button === 0) {
      // Left click
      if (nodeId) {
        // Start drag
        draggedNodeRef.current = nodeId
        setState(s => ({
          ...s,
          isDragging: true,
          dragStartX: x,
          dragStartY: y,
          selectedNodeId: nodeId,
        }))
        onNodeClick(nodeId)
        const world = screenToWorld(x, y)
        onNodeDragStart?.(nodeId, world.x, world.y)
      } else {
        // Start pan
        setState(s => ({
          ...s,
          isPanning: true,
          dragStartX: x,
          dragStartY: y,
        }))
        onNodeClick(null)
      }
    } else if (e.button === 2) {
      // Right click - context menu (handled by React)
    }
  }, [canvas, getCanvasCoords, hitTest, onNodeClick, onNodeDragStart, screenToWorld])

  // Mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvas) return

    const { x, y } = getCanvasCoords(e)
    const dx = x - lastPointerRef.current.x
    const dy = y - lastPointerRef.current.y
    lastPointerRef.current = { x, y }

    const current = stateRef.current

    if (current.isDragging && draggedNodeRef.current) {
      // Dragging node
      const world = screenToWorld(x, y)
      onNodeDrag?.(draggedNodeRef.current, world.x, world.y)
    } else if (current.isPanning) {
      // Panning viewport
      onPan(dx, dy)
    } else {
      // Hovering
      const nodeId = hitTest(x, y)
      if (nodeId !== current.hoveredNodeId) {
        setState(s => ({ ...s, hoveredNodeId: nodeId }))
        // Update cursor
        canvas.style.cursor = nodeId ? 'grab' : 'default'
      }
    }
  }, [canvas, getCanvasCoords, hitTest, onNodeDrag, onPan, screenToWorld])

  // Mouse up
  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!canvas) return

    const { x, y } = getCanvasCoords(e)
    const current = stateRef.current

    if (current.isDragging && draggedNodeRef.current) {
      const world = screenToWorld(x, y)
      onNodeDragEnd?.(draggedNodeRef.current, world.x, world.y)
    }

    draggedNodeRef.current = null
    setState(s => ({
      ...s,
      isDragging: false,
      isPanning: false,
    }))
  }, [canvas, getCanvasCoords, onNodeDragEnd, screenToWorld])

  // Double click
  const handleDoubleClick = useCallback((e: MouseEvent) => {
    if (!canvas) return

    const { x, y } = getCanvasCoords(e)
    const nodeId = hitTest(x, y)

    if (nodeId && onNodeDoubleClick) {
      onNodeDoubleClick(nodeId)
    }
  }, [canvas, getCanvasCoords, hitTest, onNodeDoubleClick])

  // Wheel (zoom)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!canvas) return

    e.preventDefault()
    const { x, y } = getCanvasCoords(e)

    // Zoom factor based on delta
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    onZoom(x, y, factor)
  }, [canvas, getCanvasCoords, onZoom])

  // Touch events
  const touchStartRef = useRef<{ x: number; y: number; distance?: number } | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!canvas || e.touches.length === 0) return

    e.preventDefault()

    if (e.touches.length === 1) {
      // Single touch - treat like mouse
      const touch = e.touches[0]
      const { x, y } = getCanvasCoords(touch)
      touchStartRef.current = { x, y }
      lastPointerRef.current = { x, y }

      const nodeId = hitTest(x, y)
      if (nodeId) {
        draggedNodeRef.current = nodeId
        setState(s => ({
          ...s,
          isDragging: true,
          selectedNodeId: nodeId,
        }))
        onNodeClick(nodeId)
        const world = screenToWorld(x, y)
        onNodeDragStart?.(nodeId, world.x, world.y)
      } else {
        setState(s => ({ ...s, isPanning: true }))
        onNodeClick(null)
      }
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = getCanvasCoords(e.touches[0])
      const touch2 = getCanvasCoords(e.touches[1])
      const distance = Math.hypot(touch2.x - touch1.x, touch2.y - touch1.y)
      const centerX = (touch1.x + touch2.x) / 2
      const centerY = (touch1.y + touch2.y) / 2
      touchStartRef.current = { x: centerX, y: centerY, distance }
    }
  }, [canvas, getCanvasCoords, hitTest, onNodeClick, onNodeDragStart, screenToWorld])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!canvas || e.touches.length === 0) return

    e.preventDefault()

    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const { x, y } = getCanvasCoords(touch)
      const dx = x - lastPointerRef.current.x
      const dy = y - lastPointerRef.current.y
      lastPointerRef.current = { x, y }

      const current = stateRef.current
      if (current.isDragging && draggedNodeRef.current) {
        const world = screenToWorld(x, y)
        onNodeDrag?.(draggedNodeRef.current, world.x, world.y)
      } else if (current.isPanning) {
        onPan(dx, dy)
      }
    } else if (e.touches.length === 2 && touchStartRef.current?.distance) {
      const touch1 = getCanvasCoords(e.touches[0])
      const touch2 = getCanvasCoords(e.touches[1])
      const distance = Math.hypot(touch2.x - touch1.x, touch2.y - touch1.y)
      const centerX = (touch1.x + touch2.x) / 2
      const centerY = (touch1.y + touch2.y) / 2

      const factor = distance / touchStartRef.current.distance
      onZoom(centerX, centerY, factor)

      touchStartRef.current = { x: centerX, y: centerY, distance }
    }
  }, [canvas, getCanvasCoords, onNodeDrag, onPan, onZoom, screenToWorld])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!canvas) return

    if (stateRef.current.isDragging && draggedNodeRef.current) {
      const world = screenToWorld(lastPointerRef.current.x, lastPointerRef.current.y)
      onNodeDragEnd?.(draggedNodeRef.current, world.x, world.y)
    }

    draggedNodeRef.current = null
    touchStartRef.current = null
    setState(s => ({
      ...s,
      isDragging: false,
      isPanning: false,
    }))
  }, [canvas, onNodeDragEnd, screenToWorld])

  // Keyboard shortcuts
  useEffect(() => {
    if (!canvas) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape - deselect
      if (e.key === 'Escape') {
        setState(s => ({ ...s, selectedNodeId: null }))
        onNodeClick(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canvas, onNodeClick])

  // Attach event listeners
  useEffect(() => {
    if (!canvas) return

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('dblclick', handleDoubleClick)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)

    // Prevent context menu on canvas
    const handleContextMenu = (e: Event) => e.preventDefault()
    canvas.addEventListener('contextmenu', handleContextMenu)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('dblclick', handleDoubleClick)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [
    canvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ])

  // Public setters
  const setSelectedNodeId = useCallback((nodeId: string | null) => {
    setState(s => ({ ...s, selectedNodeId: nodeId }))
  }, [])

  const setFocusedNodeId = useCallback((nodeId: string | null) => {
    setState(s => ({ ...s, focusedNodeId: nodeId }))
  }, [])

  return {
    state,
    setSelectedNodeId,
    setFocusedNodeId,
  }
}
