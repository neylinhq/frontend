import { cn } from '@/shared/lib/cn'

type FabPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/** Spacing from edge in pixels */
const EDGE_OFFSET = 24
/** Spacing between stacked items in pixels */
const STACK_GAP = 56

const getPositionStyle = (
  position: FabPosition,
  order: number
): React.CSSProperties => {
  const stackOffset = order * STACK_GAP

  switch (position) {
    case 'top-left':
      return { top: EDGE_OFFSET + stackOffset, left: EDGE_OFFSET }
    case 'top-right':
      return { top: EDGE_OFFSET + stackOffset, right: EDGE_OFFSET }
    case 'bottom-left':
      return { bottom: EDGE_OFFSET + stackOffset, left: EDGE_OFFSET }
    case 'bottom-right':
      return { bottom: EDGE_OFFSET + stackOffset, right: EDGE_OFFSET }
  }
}

interface FabRootProps {
  children: React.ReactNode
  className?: string
}

const FabRoot = ({ children, className }: FabRootProps) => (
  <div className={cn('absolute inset-0 pointer-events-none z-20', className)}>
    {children}
  </div>
)

FabRoot.displayName = 'Fab.Root'

interface FabItemProps {
  children: React.ReactNode
  /** Corner to anchor to */
  position?: FabPosition
  /** Stack order — 0 is closest to corner, higher numbers stack outward */
  order?: number
  className?: string
}

const FabItem = ({
  children,
  position = 'bottom-right',
  order = 0,
  className
}: FabItemProps) => (
  <div
    className={cn('absolute pointer-events-auto', className)}
    style={getPositionStyle(position, order)}
  >
    {children}
  </div>
)

FabItem.displayName = 'Fab.Item'

export const Fab = {
  Root: FabRoot,
  Item: FabItem
}

export { type FabPosition }
