import { Handle, Position } from '@xyflow/react'
import { memo } from 'react'

import type { Node } from '@/entities/map'
import { getNodeBorderColor, getNodeIcon, getRatingColor } from '@/entities/node'
import type { MasteryLevel } from '@/entities/progress'
import { Badge } from '@/shared/components/badge'
import { Card } from '@/shared/components/card'
import { cn } from '@/shared/lib/cn'
import { getComplexityTier } from '@/shared/lib/rating'

interface KnowledgeNodeProps {
  data: Node & {
    selected?: boolean
    onSelect?: (id: string) => void
    isDimmed?: boolean
    isFocused?: boolean
    zoom?: number
    /** Practice mode overlay */
    masteryLevel?: MasteryLevel
    isDue?: boolean
    isPracticeMode?: boolean
  }
  id: string
}

const MASTERY_RING_CLASSES: Record<MasteryLevel, string> = {
  mastered: 'ring-2 ring-[var(--color-mastery-mastered)]',
  practicing: 'ring-2 ring-[var(--color-mastery-practicing)]',
  learning: 'ring-2 ring-[var(--color-mastery-learning)]',
  not_started: ''
}

const MASTERY_OPACITY_CLASSES: Record<MasteryLevel, string> = {
  mastered: 'opacity-100',
  practicing: 'opacity-90',
  learning: 'opacity-80',
  not_started: 'opacity-45'
}

/** Zoom threshold for showing description and rating tier badge */
const DETAIL_ZOOM_THRESHOLD = 0.2

/**
 * KnowledgeNode - Custom node component for graph visualization
 *
 * PERFORMANCE: Uses custom memo comparator to prevent unnecessary re-renders.
 * No useViewport/useStore hooks - component is pure and only re-renders on data changes.
 */
const KnowledgeNodeComponent = ({ data }: KnowledgeNodeProps) => {
  const Icon = getNodeIcon(data.type)
  const isSelected = data.selected
  const isDimmed = data.isDimmed
  const isFocused = data.isFocused
  const zoom = data.zoom ?? 1
  const isPracticeMode = data.isPracticeMode
  const masteryLevel = data.masteryLevel ?? 'not_started'
  const isDue = data.isDue

  // LOD: Show description and rating tier only at high zoom (> 20%)
  const showDetails = zoom >= DETAIL_ZOOM_THRESHOLD

  // Calculate tier from complexity value
  const complexityTier = getComplexityTier(data.complexity)

  return (
    <Card
      className={cn(
        'rounded-lg',
        'min-w-56 max-w-72 cursor-grab active:cursor-grabbing',
        'bg-card border border-border',
        'border-l-2',
        getNodeBorderColor(data.type),
        'transition-all duration-200',
        // Dimmed state - reduced opacity
        isDimmed && 'opacity-40',
        // Dimmed removes focus/select visuals
        !isDimmed && !isFocused && isSelected && 'ring-2 ring-primary',
        // Practice mode mastery overlay
        isPracticeMode && !isDimmed && MASTERY_OPACITY_CLASSES[masteryLevel],
        isPracticeMode && !isDimmed && !isSelected && MASTERY_RING_CLASSES[masteryLevel],
        isPracticeMode && isDue && 'animate-due-pulse'
      )}
    >
      <Handle
        type='target'
        position={Position.Top}
        className='w-3 h-3 bg-border border-2 border-background'
      />

      <Handle
        type='source'
        position={Position.Bottom}
        className='w-3 h-3 bg-border border-2 border-background'
      />

      <div className='py-4 px-5 flex flex-col'>
        {/* Icon + Title (always visible) */}
        <div className='flex items-start gap-3'>
          <Icon className='w-5 h-5 flex-shrink-0 text-muted-foreground' />
          <h3 className='text-base font-semibold leading-snug break-words'>{data.label}</h3>
        </div>

        {/* Tags - under title, LOD: hidden at low zoom */}
        {showDetails && data.metadata.tags?.length > 0 && (
          <div className='flex flex-wrap gap-1 mt-2'>
            {data.metadata.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant='outline' className='text-xs pointer-events-none'>
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Complexity tier badge - pinned to bottom, LOD: hidden at low zoom */}
        {showDetails && complexityTier && (
          <div className='mt-auto pt-1.5'>
            <Badge
              variant='secondary'
              className={cn('text-xs pointer-events-none', getRatingColor(complexityTier))}
            >
              {complexityTier}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  )
}

// PERFORMANCE: Custom memo comparator - only re-render when data actually changes
export const KnowledgeNode = memo(KnowledgeNodeComponent, (prevProps, nextProps) => {
  // Quick reference check first
  if (prevProps.data === nextProps.data && prevProps.id === nextProps.id) {
    return true // Props are the same, don't re-render
  }

  // Deep check for data changes that matter
  const prevData = prevProps.data
  const nextData = nextProps.data

  // LOD optimization: only care about zoom crossing the threshold
  const prevShowDetails = (prevData.zoom ?? 1) >= DETAIL_ZOOM_THRESHOLD
  const nextShowDetails = (nextData.zoom ?? 1) >= DETAIL_ZOOM_THRESHOLD

  // Compare tags (shallow array compare since tags are strings)
  const prevTags = prevData.metadata?.tags
  const nextTags = nextData.metadata?.tags
  const tagsEqual =
    prevTags === nextTags ||
    (prevTags?.length === nextTags?.length && prevTags?.every((t, i) => t === nextTags?.[i]))

  return (
    prevProps.id === nextProps.id &&
    prevData.id === nextData.id &&
    prevData.label === nextData.label &&
    prevData.type === nextData.type &&
    prevData.selected === nextData.selected &&
    prevData.isDimmed === nextData.isDimmed &&
    prevData.isFocused === nextData.isFocused &&
    prevData.complexity === nextData.complexity &&
    prevData.isPracticeMode === nextData.isPracticeMode &&
    prevData.masteryLevel === nextData.masteryLevel &&
    prevData.isDue === nextData.isDue &&
    tagsEqual &&
    prevShowDetails === nextShowDetails
  )
})

KnowledgeNode.displayName = 'KnowledgeNode'
