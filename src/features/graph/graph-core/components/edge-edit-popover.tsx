import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type RelationType, RelationTypeEnum } from '@/entities/edge'
import { useDeleteEdge, useUpdateEdge } from '@/entities/map'
import { Button } from '@/shared/components/button'
import { EdgeTypeButton } from '@/entities/edge'
import { Input } from '@/shared/components/input'
import { Popover, SmartPopoverContent } from '@/shared/components/smart-popover'

import { useEdgeManagementStore } from '../model/graph.edge.store'

const ALL_RELATION_TYPES = RelationTypeEnum.options

interface EdgeEditPopoverProps {
  mapId: string
}

export const EdgeEditPopover = memo(({ mapId }: EdgeEditPopoverProps) => {
  const { t } = useTranslation()

  const { editingEdge, editPosition, cancelEdgeEditing } = useEdgeManagementStore()

  // Local state for editable fields (optimistic UI)
  const [localRelationType, setLocalRelationType] = useState(
    editingEdge?.relationType || 'related-to'
  )
  const [localLabel, setLocalLabel] = useState(editingEdge?.label || '')

  const updateEdge = useUpdateEdge(mapId || '')
  const deleteEdge = useDeleteEdge(mapId || '')

  // Refs for debounce - keep current values accessible in timeout callback
  const labelSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editingEdgeRef = useRef(editingEdge)
  const localLabelRef = useRef(localLabel)

  // Keep refs in sync
  useEffect(() => {
    editingEdgeRef.current = editingEdge
  }, [editingEdge])

  useEffect(() => {
    localLabelRef.current = localLabel
  }, [localLabel])

  // Sync local state when editingEdge changes (new edge selected)
  useEffect(() => {
    if (editingEdge) {
      setLocalRelationType(editingEdge.relationType)
      setLocalLabel(editingEdge.label || '')
    }
  }, [editingEdge?.id, editingEdge?.label, editingEdge])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (labelSaveTimerRef.current) {
        clearTimeout(labelSaveTimerRef.current)
      }
    }
  }, [])

  const handleTypeChange = useCallback(
    (relationType: RelationType) => {
      if (!editingEdge || !mapId) {
        return
      }
      // Optimistic update
      setLocalRelationType(relationType)
      updateEdge.mutate({
        id: editingEdge.id,
        data: { relationType }
      })
    },
    [editingEdge, mapId, updateEdge]
  )

  // Save label with debounce (500ms)
  const handleLabelChange = useCallback(
    (value: string) => {
      setLocalLabel(value)

      // Clear previous timer
      if (labelSaveTimerRef.current) {
        clearTimeout(labelSaveTimerRef.current)
      }

      // Set new debounced save - use refs to get current values in callback
      labelSaveTimerRef.current = setTimeout(() => {
        const currentEdge = editingEdgeRef.current
        if (!currentEdge || !mapId) {
          return
        }

        const trimmedLabel = value.trim()
        if (trimmedLabel !== (currentEdge.label || '')) {
          updateEdge.mutate({
            id: currentEdge.id,
            data: { label: trimmedLabel || undefined }
          })
        }
      }, 500)
    },
    [mapId, updateEdge]
  )

  const handleDelete = useCallback(async () => {
    if (!editingEdge || !mapId) {
      return
    }

    try {
      await deleteEdge.mutateAsync(editingEdge.id)
      cancelEdgeEditing()
    } catch {
      // Error handled by mutation
    }
  }, [editingEdge, mapId, deleteEdge, cancelEdgeEditing])

  if (!editingEdge || !editPosition) {
    return null
  }

  return (
    <Popover open={true} onOpenChange={open => !open && cancelEdgeEditing()}>
      <SmartPopoverContent
        className='w-72 p-3'
        mode='fixed'
        position={editPosition}
        offset={{ y: 8 }}
        viewportPadding={16}
        onOpenAutoFocus={e => e.preventDefault()}
        onInteractOutside={cancelEdgeEditing}
        onEscapeKeyDown={cancelEdgeEditing}
      >
        {/* Relation Type */}
        <div className='mb-3'>
          <div className='grid grid-cols-2 gap-1'>
            {ALL_RELATION_TYPES.map(type => (
              <EdgeTypeButton
                key={type}
                type={type}
                label={t(`graph.edgeTypes.${type}`, type)}
                isSelected={localRelationType === type}
                onClick={() => handleTypeChange(type)}
              />
            ))}
          </div>
        </div>

        {/* Label */}
        <div className='mb-3'>
          <Input
            value={localLabel}
            onChange={e => handleLabelChange(e.target.value)}
            placeholder={t('edgeEdit.labelPlaceholder')}
            aria-label={t('edgeEdit.label', 'Label')}
            className='h-8 text-sm rounded-sm'
          />
        </div>

        {/* Delete Button - compact, ghost style per Design Manifesto */}
        <div className='flex justify-end'>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 px-2.5 text-xs text-muted-foreground rounded-xs hover:text-destructive hover:bg-destructive/10'
            onClick={handleDelete}
            disabled={deleteEdge.isPending}
          >
            {t('common.remove', 'Remove')}
          </Button>
        </div>
      </SmartPopoverContent>
    </Popover>
  )
})

EdgeEditPopover.displayName = 'EdgeEditPopover'
