import { useCallback, useEffect, useRef, useState } from 'react'
import { Drawer as VaulDrawer } from 'vaul'

import { cn } from '@/shared/lib/cn'

const DEFAULT_WIDTH = 400
const MIN_WIDTH = 360
const MAX_WIDTH = 800
const MOBILE_BREAKPOINT = 768

interface ResizableSidebarProps {
  /** Whether the sidebar is visible */
  open: boolean
  /** Callback when sidebar should close (mobile drawer dismiss) */
  onClose?: () => void
  /** Controlled width in pixels */
  width?: number
  /** Callback when width changes via resize handle */
  onWidthChange?: (width: number) => void
  /** Minimum width in pixels */
  minWidth?: number
  /** Maximum width in pixels */
  maxWidth?: number
  /** Breakpoint for switching to mobile drawer (default 768) */
  mobileBreakpoint?: number
  /** Content */
  children: React.ReactNode
  className?: string
}

export const ResizableSidebar = ({
  open,
  onClose,
  width: controlledWidth,
  onWidthChange,
  minWidth = MIN_WIDTH,
  maxWidth = MAX_WIDTH,
  mobileBreakpoint = MOBILE_BREAKPOINT,
  children,
  className
}: ResizableSidebarProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(controlledWidth ?? DEFAULT_WIDTH)

  const width = controlledWidth ?? DEFAULT_WIDTH

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < mobileBreakpoint)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [mobileBreakpoint])

  // Resize handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
      startXRef.current = e.clientX
      startWidthRef.current = width
    },
    [width]
  )

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startXRef.current - e.clientX
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta))
      onWidthChange?.(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, minWidth, maxWidth, onWidthChange])

  if (!open) return null

  // Mobile: Vaul drawer from bottom
  if (isMobile) {
    return (
      <VaulDrawer.Root open={open} onOpenChange={isOpen => !isOpen && onClose?.()}>
        <VaulDrawer.Portal>
          <VaulDrawer.Overlay className='fixed inset-0 z-40 bg-overlay' />
          <VaulDrawer.Content className='fixed inset-x-0 bottom-0 z-(--z-modal) flex h-[calc(100vh-6rem)] flex-col rounded-t-xl bg-background'>
            <div className='mx-auto mt-3 h-1 w-12 shrink-0 rounded-full bg-muted-foreground/30' />
            {children}
          </VaulDrawer.Content>
        </VaulDrawer.Portal>
      </VaulDrawer.Root>
    )
  }

  // Desktop: overlay resizable sidebar (cover mode)
  return (
    <aside
      className={cn(
        'absolute right-0 top-0 bottom-0 z-(--z-overlay)',
        'flex flex-col border-l border-border/60 overflow-hidden bg-background',
        'transition-[width] duration-200',
        isResizing && 'select-none',
        className
      )}
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10',
          'hover:bg-primary/20 active:bg-primary/30 transition-colors',
          isResizing && 'bg-primary/30'
        )}
      />

      {children}
    </aside>
  )
}
