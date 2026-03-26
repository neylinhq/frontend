import { cn } from '@/shared/lib/cn'

type FloatingLayerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const POSITION_CLASSES: Record<FloatingLayerPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-6 left-6',
  'bottom-right': 'bottom-6 right-6'
}

interface FloatingLayerRootProps {
  children: React.ReactNode
  className?: string
}

const FloatingLayerRoot = ({ children, className }: FloatingLayerRootProps) => (
  <div className={cn('absolute inset-0 pointer-events-none z-20', className)}>
    {children}
  </div>
)

FloatingLayerRoot.displayName = 'FloatingLayer.Root'

interface FloatingLayerItemProps {
  children: React.ReactNode
  /** Corner to anchor to */
  position?: FloatingLayerPosition
  className?: string
}

const FloatingLayerItem = ({
  children,
  position = 'bottom-right',
  className
}: FloatingLayerItemProps) => (
  <div className={cn('absolute pointer-events-auto', POSITION_CLASSES[position], className)}>
    {children}
  </div>
)

FloatingLayerItem.displayName = 'FloatingLayer.Item'

export const FloatingLayer = {
  Root: FloatingLayerRoot,
  Item: FloatingLayerItem
}

export { type FloatingLayerPosition }
