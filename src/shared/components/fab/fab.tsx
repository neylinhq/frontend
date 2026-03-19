import { cn } from '@/shared/lib/cn'

type FabPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const POSITION_CLASSES: Record<FabPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-6 left-6',
  'bottom-right': 'bottom-6 right-6'
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
  className?: string
}

const FabItem = ({
  children,
  position = 'bottom-right',
  className
}: FabItemProps) => (
  <div className={cn('absolute pointer-events-auto', POSITION_CLASSES[position], className)}>
    {children}
  </div>
)

FabItem.displayName = 'Fab.Item'

export const Fab = {
  Root: FabRoot,
  Item: FabItem
}

export { type FabPosition }
