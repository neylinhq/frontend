import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useDeleteMap, useMap, useSetVisibility, useUpdateMap } from '@/entities/map'
import { toast } from '@/shared/components/toast'
import { useAutoSave } from '@/shared/hooks'

export interface UseMapSettingsFormOptions {
  mapId: string
  /** Called after successful map deletion (e.g. close drawer). */
  onDeleted?: () => void
}

export function useMapSettingsForm({ mapId, onDeleted }: UseMapSettingsFormOptions) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const initialDataRef = useRef({ title: '', description: '' })

  const { data: map } = useMap(mapId)
  const updateMapMutation = useUpdateMap(mapId)
  const setVisibilityMutation = useSetVisibility()
  const deleteMapMutation = useDeleteMap()

  // Sync local state when map data loads
  useEffect(() => {
    if (map) {
      setTitle(map.title)
      setDescription(map.description ?? '')
      initialDataRef.current = {
        title: map.title,
        description: map.description ?? ''
      }
    }
  }, [map])

  // Autosave callback
  const saveChanges = useCallback(
    (data: { title: string; description: string }) => {
      if (
        data.title === initialDataRef.current.title &&
        data.description === initialDataRef.current.description
      ) {
        return
      }

      updateMapMutation.mutate(
        {
          title: data.title,
          description: data.description || undefined
        },
        {
          onSuccess: () => {
            initialDataRef.current = data
          },
          onError: () => {
            toast.error(t('errors.failedSave'))
          }
        }
      )
    },
    [updateMapMutation, t]
  )

  const debouncedSave = useAutoSave(saveChanges, 1500)

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value)
      debouncedSave({ title: value, description })
    },
    [description, debouncedSave]
  )

  const handleDescriptionChange = useCallback(
    (value: string) => {
      setDescription(value)
      debouncedSave({ title, description: value })
    },
    [title, debouncedSave]
  )

  const handleVisibilityChange = useCallback(
    (isPublic: boolean) => {
      setVisibilityMutation.mutate(
        { mapId, isPublic },
        {
          onError: () => {
            toast.error(t('errors.failedSave'))
          }
        }
      )
    },
    [mapId, setVisibilityMutation, t]
  )

  const handleDeleteMap = useCallback(async () => {
    try {
      await deleteMapMutation.mutateAsync(mapId)
      onDeleted?.()
      navigate('/dashboard')
    } catch {
      toast.error(t('errors.failedDelete'))
    }
  }, [mapId, deleteMapMutation, onDeleted, navigate, t])

  return {
    map,
    title,
    description,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isSaving: updateMapMutation.isPending,
    isVisibilityPending: setVisibilityMutation.isPending,
    isDeletePending: deleteMapMutation.isPending,
    handleTitleChange,
    handleDescriptionChange,
    handleVisibilityChange,
    handleDeleteMap,
  }
}
