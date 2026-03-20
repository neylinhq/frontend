import {
  ChevronDownIcon,
  Trash01Icon
} from '@untitledui/icons-react/outline'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { MapHistoryList, RatingSystemSelector } from '@/features/map-settings'
import { useDeleteMap, useMap, useSetVisibility, useUpdateMap } from '@/entities/map'
import { type RatingSystem, useMapProgress } from '@/entities/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/shared/components/alert-dialog'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/collapsible'
import { Field } from '@/shared/components/field'
import { Input } from '@/shared/components/input'
import { Switch } from '@/shared/components/switch'
import { Textarea } from '@/shared/components/textarea'
import { toast } from '@/shared/components/toast'
import { useAutoSave } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'
import { getComplexityTier } from '@/shared/lib/rating'

interface SettingsPanelProps {
  mapId: string
  isOwner?: boolean
}

export const SettingsPanel = memo(function SettingsPanel({
  mapId,
  isOwner = true
}: SettingsPanelProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  // Local state for form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const initialDataRef = useRef({ title: '', description: '' })

  const { data: map } = useMap(mapId)
  const { data: mapProgress } = useMapProgress(mapId)
  const updateMapMutation = useUpdateMap(mapId)
  const setVisibilityMutation = useSetVisibility()
  const deleteMapMutation = useDeleteMap()

  const currentRatingSystem = (mapProgress?.preferredRatingSystem ?? 'elo') as RatingSystem

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

  // Handle field changes with autosave
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

  // Handle visibility toggle
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

  // Handle map deletion
  const handleDeleteMap = useCallback(async () => {
    try {
      await deleteMapMutation.mutateAsync(mapId)
      navigate('/dashboard')
    } catch {
      toast.error(t('errors.failedDelete'))
    }
  }, [mapId, deleteMapMutation, navigate, t])

  // Get current rating for display
  const currentRating =
    currentRatingSystem === 'elo' ? mapProgress?.eloRating : mapProgress?.glickoRating
  const tier = currentRating != null ? getComplexityTier(currentRating) : null

  // Saving indicator
  const isSaving = updateMapMutation.isPending

  return (
    <>
      <div className='flex flex-col h-full'>
        {/* Saving indicator */}
        {isSaving && (
          <div className='px-4 py-1 text-xs text-muted-foreground border-b border-border/60 shrink-0'>
            {t('common.saving')}
          </div>
        )}

        {/* Single scrollable content */}
        <div className='flex-1 overflow-y-auto [scrollbar-gutter:stable]'>
          {/* === Overview Section === */}
          <div className='p-4 space-y-4'>
            {/* Visibility Badge + Switch (only for owners) */}
            {isOwner && (
              <div className='flex items-center justify-between'>
                {map?.isPublic ? (
                  <Badge variant='info'>{t('mapSettings.visibility.public')}</Badge>
                ) : (
                  <Badge variant='secondary'>{t('mapSettings.visibility.private')}</Badge>
                )}
                <Switch
                  checked={map?.isPublic ?? false}
                  onCheckedChange={handleVisibilityChange}
                  disabled={setVisibilityMutation.isPending}
                />
              </div>
            )}

            {/* Author (for non-owners) */}
            {!isOwner && map?.authorName && (
              <div className='space-y-1.5'>
                <span className='text-xs text-muted-foreground'>
                  {t('mapSettings.overview.author')}
                </span>
                <div className='text-sm font-medium'>{map.authorName}</div>
              </div>
            )}

            {/* Title & Description with autosave */}
            <Field label={t('mapSettings.overview.mapTitle')} labelClassName='text-xs'>
              <Input
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                readOnly={!isOwner}
                disabled={!isOwner}
              />
            </Field>

            <Field label={t('mapSettings.overview.description')} labelClassName='text-xs'>
              <Textarea
                value={description}
                onChange={e => handleDescriptionChange(e.target.value)}
                placeholder={t('mapSettings.overview.descriptionPlaceholder')}
                rows={3}
                className='resize-none'
                readOnly={!isOwner}
                disabled={!isOwner}
              />
            </Field>
          </div>

          {/* Separator */}
          <div className='mx-4 border-t border-border/60' />

          {/* === Progress Section (inline) === */}
          <div className='p-4 space-y-3'>
            <h3 className='text-xs font-medium text-muted-foreground'>
              {t('mapSettings.tabs.progress', 'Progress')}
            </h3>

            {/* Rating — compact single row */}
            <div className='flex items-center justify-between'>
              <div className='flex items-baseline gap-2'>
                <span className='text-2xl font-bold tabular-nums'>{currentRating ?? '—'}</span>
                <span className='text-xs text-muted-foreground'>
                  {currentRatingSystem.toUpperCase()}
                </span>
              </div>
              {tier && (
                <span
                  className='text-xs font-medium px-2 py-0.5 rounded'
                  style={{ backgroundColor: `${tier.color}15`, color: tier.color }}
                >
                  {tier.name}
                </span>
              )}
            </div>

            {/* Stats — compact 2×2 */}
            <div className='grid grid-cols-2 gap-2'>
              <div className='flex items-baseline justify-between rounded-md bg-muted/30 px-3 py-2'>
                <span className='text-xs text-muted-foreground'>
                  {t('mapSettings.progress.nodesTotal')}
                </span>
                <span className='text-sm font-semibold tabular-nums'>{map?.nodesCount ?? 0}</span>
              </div>
              <div className='flex items-baseline justify-between rounded-md bg-muted/30 px-3 py-2'>
                <span className='text-xs text-muted-foreground'>
                  {t('mapSettings.progress.overallProgress')}
                </span>
                <span className='text-sm font-semibold tabular-nums'>
                  {Math.round((mapProgress?.overallProgress ?? 0) * 100)}%
                </span>
              </div>
              <div className='flex items-baseline justify-between rounded-md bg-muted/30 px-3 py-2'>
                <span className='text-xs text-muted-foreground'>
                  {t('mapSettings.progress.nodesMastered')}
                </span>
                <span className='text-sm font-semibold tabular-nums'>
                  {mapProgress?.nodesMastered ?? 0}
                </span>
              </div>
              <div className='flex items-baseline justify-between rounded-md bg-muted/30 px-3 py-2'>
                <span className='text-xs text-muted-foreground'>
                  {t('mapSettings.progress.nodesLearning')}
                </span>
                <span className='text-sm font-semibold tabular-nums'>
                  {mapProgress?.nodesLearning ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* === History — collapsible === */}
          <div className='px-2 py-1'>
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type='button'
                  className='flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium hover:bg-muted/50 transition-colors'
                >
                  <span>{t('mapSettings.tabs.history', 'History')}</span>
                  <ChevronDownIcon
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform duration-200',
                      historyOpen && 'rotate-180'
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='px-2 pt-1 pb-2'>
                  <MapHistoryList mapId={mapId} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* === Advanced — collapsible (rating system + danger zone) === */}
          <div className='px-2 py-1'>
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type='button'
                  className='flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium hover:bg-muted/50 transition-colors'
                >
                  <span>{t('mapSettings.tabs.settings', 'Advanced')}</span>
                  <ChevronDownIcon
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform duration-200',
                      advancedOpen && 'rotate-180'
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='px-2 pt-1 pb-2 space-y-4'>
                  <RatingSystemSelector mapId={mapId} currentSystem={currentRatingSystem} />

                  {/* Delete map — subtle, at the bottom */}
                  {isOwner && (
                    <div className='pt-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash01Icon className='mr-1.5 h-3.5 w-3.5' />
                        {t('mapSettings.dangerZone.delete')}
                      </Button>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('mapSettings.dangerZone.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('mapSettings.dangerZone.confirmDescription', {
                title: map?.title,
                nodesCount: map?.nodesCount ?? 0
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMap}
              disabled={deleteMapMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              <Trash01Icon className='mr-1.5 h-3.5 w-3.5' />
              {t('mapSettings.dangerZone.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})
