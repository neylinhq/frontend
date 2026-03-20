import { ArrowRightIcon, CheckIcon, XCloseIcon } from '@untitledui/icons-react/outline'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { EdgeTypeButton, RelationTypeEnum } from '@/entities/edge'
import { useCreateEdge } from '@/entities/map'
import { Button } from '@/shared/components/button'

import { useEdgeManagementStore } from '../model/graph.edge.store'

const ALL_RELATION_TYPES = RelationTypeEnum.options

const DIALOG_WIDTH = 288  // w-72
const DIALOG_HEIGHT = 340 // approximate rendered height
const GAP = 12
const PADDING = 8

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

  // Synchronous position: compute at render time so no "fly-in" artifact
  const floatingStyle = useMemo(() => {
    if (!pendingEdge) { return {} }
    const { x, y } = pendingEdge.position
    const vw = window.innerWidth

    // Flip: prefer top, fall back to bottom if not enough space
    const placeAbove = y - GAP >= DIALOG_HEIGHT + PADDING
    const top = placeAbove ? y - GAP : y + GAP
    const transformY = placeAbove ? '-100%' : '0%'

    // Shift: clamp horizontally so dialog stays inside viewport
    const half = DIALOG_WIDTH / 2
    const left = Math.min(Math.max(x, half + PADDING), vw - half - PADDING)

    return {
      left,
      top,
      transform: `translateX(-50%) translateY(${transformY})`,
    }
  }, [pendingEdge])

  // Focus on open
  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!pendingEdge || !mapId) { return }
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
    <>
      {/* Transparent backdrop — captures clicks outside the dialog */}
      <div
        className='fixed inset-0 z-40'
        onMouseDown={handleCancel}
      />

      {/* Dialog — above backdrop */}
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className='fixed z-50 w-72 rounded-lg border bg-popover p-3 shadow-md animate-in fade-in zoom-in-95 duration-150'
        style={floatingStyle}
      >
        {/* Header */}
        <div className='mb-2.5 flex items-center gap-2 text-xs'>
          <span className='max-w-20 truncate font-medium'>{pendingEdge.sourceLabel}</span>
          <ArrowRightIcon className='h-3 w-3 shrink-0 text-muted-foreground' />
          <span className='max-w-20 truncate font-medium'>{pendingEdge.targetLabel}</span>
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
          <Button variant='ghost' size='sm' className='h-7 px-2.5 text-xs' onClick={handleCancel}>
            <XCloseIcon className='mr-1 h-3.5 w-3.5' />
            {t('common.cancel')}
          </Button>
          <Button
            size='sm'
            className='h-7 px-2.5 text-xs'
            onClick={handleConfirm}
            disabled={createEdge.isPending}
          >
            <CheckIcon className='mr-1 h-3.5 w-3.5' />
            {t('common.create')}
          </Button>
        </div>
      </div>
    </>
  )
})

EdgeTypeSelector.displayName = 'EdgeTypeSelector'
