import { memo } from 'react'
import { getEdgeTextClass, type RelationType } from '@/entities/edge'
import { cn } from '@/shared/lib/cn'

interface EdgeTypeButtonProps {
  type: RelationType
  label: string
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Unified edge type button used in:
 * - EdgeTypeSelector (create edge)
 * - EdgeEditPopover (edit edge)
 *
 * Uses OKLCH color with opacity for background:
 * - Unselected: 15% opacity
 * - Hover: 25% opacity
 * - Selected: 25% opacity
 */
export const EdgeTypeButton = memo(
  ({ type, label, isSelected = false, onClick, className }: EdgeTypeButtonProps) => {
    const textClass = getEdgeTextClass(type)
    // Use CSS variable for the edge color (OKLCH format)
    const edgeColor = `var(--edge-${type})`

    return (
      <button
        type='button'
        onClick={onClick}
        className={cn(
          'rounded-sm px-2 py-1 text-left text-xs transition-colors',
          textClass,
          className
        )}
        style={{
          backgroundColor: `oklch(${edgeColor} / ${isSelected ? 0.25 : 0.15})`
        }}
        onMouseEnter={e => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = `oklch(${edgeColor} / 0.25)`
          }
        }}
        onMouseLeave={e => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = `oklch(${edgeColor} / 0.15)`
          }
        }}
      >
        {label}
      </button>
    )
  }
)

EdgeTypeButton.displayName = 'EdgeTypeButton'
