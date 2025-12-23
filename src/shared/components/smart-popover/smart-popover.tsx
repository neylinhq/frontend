import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'
import { cn } from '@/shared/lib/cn'
import { constrainToViewport, getViewportBounds } from '@/shared/lib/viewport'

interface SmartPopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  /** Manual position for fixed positioning mode */
  position?: { x: number; y: number } | null
  /** Padding from viewport edges */
  viewportPadding?: number
  /** Offset from position (default: center horizontally, 8px below) */
  offset?: { x?: number; y?: number }
  /** Positioning mode: 'auto' uses Radix collision handling, 'fixed' uses manual position */
  mode?: 'auto' | 'fixed'
}

const SmartPopoverContent = React.forwardRef<HTMLDivElement, SmartPopoverContentProps>(
  (
    { className, position, viewportPadding = 16, offset = {}, mode = 'auto', style, ...props },
    ref
  ) => {
    const [measuredSize, setMeasuredSize] = React.useState({ width: 300, height: 200 })
    const contentRef = React.useRef<HTMLDivElement>(null)
    const hasMeasured = React.useRef(false)

    // Measure content size once after initial render
    React.useLayoutEffect(() => {
      if (contentRef.current && !hasMeasured.current) {
        const rect = contentRef.current.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          hasMeasured.current = true
          setMeasuredSize({ width: rect.width, height: rect.height })
        }
      }
    })

    // Calculate constrained position for fixed mode
    const computedStyle = React.useMemo(() => {
      if (mode !== 'fixed' || !position) {
        return style
      }

      const viewport = getViewportBounds()

      // Apply offset: default centers horizontally and adds 8px vertical offset
      const offsetX = offset.x ?? -measuredSize.width / 2
      const offsetY = offset.y ?? 8

      const rawPosition = {
        x: position.x + offsetX,
        y: position.y + offsetY
      }

      const constrained = constrainToViewport(rawPosition, measuredSize, viewport, viewportPadding)

      return {
        ...style,
        position: 'fixed' as const,
        left: constrained.x,
        top: constrained.y,
        transform: 'none'
      }
    }, [mode, position, offset, measuredSize, viewportPadding, style])

    // For auto mode, use Radix's built-in collision handling
    if (mode === 'auto') {
      return (
        <PopoverPrimitive.Content
          ref={ref}
          collisionPadding={viewportPadding}
          className={cn(
            'z-50 rounded-xl border border-border/60 bg-background p-0 text-foreground outline-none overflow-hidden',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className
          )}
          {...props}
        />
      )
    }

    // For fixed mode, use computed position with viewport constraints
    return (
      <PopoverPrimitive.Content
        ref={node => {
          // Combine refs
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
          contentRef.current = node
        }}
        className={cn(
          'z-50 rounded-xl border border-border/60 bg-background p-0 text-foreground outline-none overflow-hidden',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className
        )}
        style={computedStyle}
        {...props}
      />
    )
  }
)

SmartPopoverContent.displayName = 'SmartPopoverContent'

export { SmartPopoverContent }
export { Popover, PopoverTrigger } from '@/shared/components/popover'
