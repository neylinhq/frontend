import { useCallback, useEffect, useRef, useState } from 'react'

interface UseResizableOptions {
  /** Minimum size in pixels */
  minSize: number
  /** Maximum size in pixels */
  maxSize: number
  /** Initial size in pixels */
  initialSize: number
  /** Direction of resize */
  direction: 'horizontal' | 'vertical'
  /** Storage key for persisting size (optional) */
  storageKey?: string
  /** Which side the handle is on (for horizontal: 'left' or 'right', for vertical: 'top' or 'bottom') */
  handleSide?: 'left' | 'right' | 'top' | 'bottom'
}

interface UseResizableReturn {
  size: number
  isResizing: boolean
  handleMouseDown: (e: React.MouseEvent) => void
}

/**
 * Hook for creating resizable panels with drag handles
 */
export function useResizable({
  minSize,
  maxSize,
  initialSize,
  direction,
  storageKey,
  handleSide = direction === 'horizontal' ? 'left' : 'top'
}: UseResizableOptions): UseResizableReturn {
  // Initialize from storage or default
  const [size, setSize] = useState(() => {
    if (storageKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = parseInt(stored, 10)
        if (!isNaN(parsed) && parsed >= minSize && parsed <= maxSize) {
          return parsed
        }
      }
    }
    return initialSize
  })

  const [isResizing, setIsResizing] = useState(false)
  const startPosRef = useRef(0)
  const startSizeRef = useRef(0)

  // Persist size to storage
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, String(size))
    }
  }, [size, storageKey])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY
    startSizeRef.current = size
  }, [direction, size])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY
      const delta = startPosRef.current - currentPos

      // Calculate new size based on handle position
      let newSize: number
      if (handleSide === 'left' || handleSide === 'top') {
        // Handle on left/top: dragging left/up increases size
        newSize = startSizeRef.current + delta
      } else {
        // Handle on right/bottom: dragging right/down increases size
        newSize = startSizeRef.current - delta
      }

      // Clamp to min/max
      newSize = Math.max(minSize, Math.min(maxSize, newSize))
      setSize(newSize)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    // Add listeners to document for smooth dragging
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // Prevent text selection while dragging
    document.body.style.userSelect = 'none'
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isResizing, direction, handleSide, minSize, maxSize])

  return { size, isResizing, handleMouseDown }
}
