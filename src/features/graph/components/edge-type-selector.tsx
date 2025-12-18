import { ArrowRight, Check, X } from 'lucide-react'
import { memo, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { RelationTypeEnum } from '@/entities/edge'
import { useCreateEdge } from '@/entities/map'
import { Button } from '@/shared/components/button'
import { EdgeTypeButton } from '@/shared/components/edge-type-button'
import { useEdgeManagementStore } from '../model/graph.edge.store'

const ALL_RELATION_TYPES = RelationTypeEnum.options

interface EdgeTypeSelectorProps {
  mapId: string
  onComplete?: () => void
  onCancel?: () => void
}

export const EdgeTypeSelector = memo(({ mapId, onComplete, onCancel }: EdgeTypeSelectorProps) => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)

  const { pendingEdge, selectedRelationType, setRelationType, cancelEdgeCreation } =
    useEdgeManagementStore()

  const createEdge = useCreateEdge(mapId || '')

  // Focus container on open
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        cancelEdgeCreation()
        onCancel?.()
      }
    }

    // Delay to avoid immediate close from the click that opened it
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [cancelEdgeCreation, onCancel])

  const handleConfirm = useCallback(async () => {
    if (!pendingEdge || !mapId) {
      return
    }

    try {
      await createEdge.mutateAsync({
        sourceNodeId: pendingEdge.sourceId,
        targetNodeId: pendingEdge.targetId,
        relationType: selectedRelationType,
        strength: 1.0,
        bidirectional: false
      })
      cancelEdgeCreation()
      onComplete?.()
    } catch (_error) {
      // Error handled by mutation
    }
  }, [pendingEdge, mapId, selectedRelationType, createEdge, cancelEdgeCreation, onComplete])

  const handleCancel = useCallback(() => {
    cancelEdgeCreation()
    onCancel?.()
  }, [cancelEdgeCreation, onCancel])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelEdgeCreation()
        onCancel?.()
      } else if (e.key === 'Enter') {
        handleConfirm()
      }
    },
    [cancelEdgeCreation, onCancel, handleConfirm]
  )

  if (!pendingEdge) {
    return null
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className='fixed z-50 w-[280px] rounded-lg border bg-popover p-3'
      style={{
        left: pendingEdge.position.x,
        top: pendingEdge.position.y,
        transform: 'translate(-50%, -100%) translateY(-8px)'
      }}
    >
      {/* Header */}
      <div className='mb-3 flex items-center gap-2 text-sm'>
        <span className='max-w-[80px] truncate font-medium'>{pendingEdge.sourceLabel}</span>
        <ArrowRight className='h-3 w-3 shrink-0 text-muted-foreground' />
        <span className='max-w-[80px] truncate font-medium'>{pendingEdge.targetLabel}</span>
      </div>

      {/* Relation Type Grid */}
      <div className='mb-3 grid grid-cols-2 gap-1'>
        {ALL_RELATION_TYPES.map(type => (
          <EdgeTypeButton
            key={type}
            type={type}
            label={t(`graph.edgeTypes.${type}`, type)}
            isSelected={selectedRelationType === type}
            onClick={() => setRelationType(type)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className='flex justify-end gap-2'>
        <Button variant='ghost' size='sm' onClick={handleCancel}>
          <X className='mr-1 h-3.5 w-3.5' />
          {t('common.cancel')}
        </Button>
        <Button size='sm' onClick={handleConfirm} disabled={createEdge.isPending}>
          <Check className='mr-1 h-3.5 w-3.5' />
          {t('common.create')}
        </Button>
      </div>
    </div>
  )
})

EdgeTypeSelector.displayName = 'EdgeTypeSelector'
