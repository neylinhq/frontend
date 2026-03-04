import {
  AlertCircleIcon,
  ClockRewindIcon,
  InfoCircleIcon,
  Sliders04Icon,
  Trash01Icon,
  TrendUp01Icon
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
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card'
import { Field } from '@/shared/components/field'
import { Input } from '@/shared/components/input'
import { Switch } from '@/shared/components/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'
import { Textarea } from '@/shared/components/textarea'
import { toast } from '@/shared/components/toast'
import { useAutoSave } from '@/shared/hooks'
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
          <div className='px-4 py-1 text-xs text-muted-foreground border-b'>
            {t('common.saving')}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue='overview' className='flex flex-col flex-1 min-h-0'>
          <TabsList variant='underline' className='grid grid-cols-4 shrink-0'>
            <TabsTrigger variant='underline' value='overview' className='gap-1'>
              <InfoCircleIcon className='h-3 w-3' />
              <span className='text-xs sr-only sm:not-sr-only'>
                {t('mapSettings.tabs.overview')}
              </span>
            </TabsTrigger>
            <TabsTrigger variant='underline' value='progress' className='gap-1'>
              <TrendUp01Icon className='h-3 w-3' />
              <span className='text-xs sr-only sm:not-sr-only'>
                {t('mapSettings.tabs.progress')}
              </span>
            </TabsTrigger>
            <TabsTrigger variant='underline' value='history' className='gap-1'>
              <ClockRewindIcon className='h-3 w-3' />
              <span className='text-xs sr-only sm:not-sr-only'>
                {t('mapSettings.tabs.history')}
              </span>
            </TabsTrigger>
            <TabsTrigger variant='underline' value='settings' className='gap-1'>
              <Sliders04Icon className='h-3 w-3' />
              <span className='text-xs sr-only sm:not-sr-only'>
                {t('mapSettings.tabs.settings')}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='flex-1 overflow-y-auto mt-0 p-4'>
            <div className='space-y-6'>
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
              <div className='space-y-4'>
                <Field label={t('mapSettings.overview.mapTitle')}>
                  <Input
                    value={title}
                    onChange={e => handleTitleChange(e.target.value)}
                    readOnly={!isOwner}
                    disabled={!isOwner}
                  />
                </Field>

                <Field label={t('mapSettings.overview.description')}>
                  <Textarea
                    value={description}
                    onChange={e => handleDescriptionChange(e.target.value)}
                    placeholder={t('mapSettings.overview.descriptionPlaceholder')}
                    rows={4}
                    className='resize-none'
                    readOnly={!isOwner}
                    disabled={!isOwner}
                  />
                </Field>
              </div>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value='progress' className='flex-1 overflow-y-auto mt-0 p-4'>
            <div className='space-y-6'>
              {/* Your Rating */}
              <div className='p-4 rounded-lg bg-muted/30 border'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-xs text-muted-foreground'>
                    {t('mapSettings.progress.yourRating')}
                  </span>
                  {tier && (
                    <span
                      className='text-xs font-medium px-2 py-0.5 rounded'
                      style={{ backgroundColor: `${tier.color}15`, color: tier.color }}
                    >
                      {tier.name}
                    </span>
                  )}
                </div>
                <div className='flex items-baseline gap-2'>
                  <span className='text-3xl font-bold tabular-nums'>{currentRating ?? '?'}</span>
                  <span className='text-xs text-muted-foreground'>
                    {currentRatingSystem.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='p-3 rounded-lg bg-muted/30'>
                  <p className='text-xs text-muted-foreground mb-1'>
                    {t('mapSettings.progress.nodesTotal')}
                  </p>
                  <p className='text-xl font-semibold tabular-nums'>{map?.nodesCount ?? 0}</p>
                </div>
                <div className='p-3 rounded-lg bg-muted/30'>
                  <p className='text-xs text-muted-foreground mb-1'>
                    {t('mapSettings.progress.overallProgress')}
                  </p>
                  <p className='text-xl font-semibold tabular-nums'>
                    {Math.round((mapProgress?.overallProgress ?? 0) * 100)}%
                  </p>
                </div>
                <div className='p-3 rounded-lg bg-muted/30'>
                  <p className='text-xs text-muted-foreground mb-1'>
                    {t('mapSettings.progress.nodesMastered')}
                  </p>
                  <p className='text-xl font-semibold tabular-nums'>
                    {mapProgress?.nodesMastered ?? 0}
                  </p>
                </div>
                <div className='p-3 rounded-lg bg-muted/30'>
                  <p className='text-xs text-muted-foreground mb-1'>
                    {t('mapSettings.progress.nodesLearning')}
                  </p>
                  <p className='text-xl font-semibold tabular-nums'>
                    {mapProgress?.nodesLearning ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value='history' className='flex-1 overflow-y-auto mt-0 p-4'>
            <MapHistoryList mapId={mapId} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value='settings' className='flex-1 overflow-y-auto mt-0'>
            <div className='flex flex-col min-h-full'>
              <div className='p-4'>
                <RatingSystemSelector mapId={mapId} currentSystem={currentRatingSystem} />
              </div>

              {/* Danger Zone (only for owners) */}
              {isOwner && (
                <div className='p-4 mt-auto'>
                  <Card className='border-destructive/30'>
                    <CardHeader className='pb-2 pt-3 px-3'>
                      <CardTitle className='text-xs font-medium text-destructive flex items-center gap-1.5'>
                        <AlertCircleIcon className='h-3.5 w-3.5' />
                        {t('mapSettings.dangerZone.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='px-3 pb-3'>
                      <p className='text-xs text-muted-foreground mb-3'>
                        {t('mapSettings.dangerZone.warning')}
                      </p>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash01Icon className='mr-1.5 h-3.5 w-3.5' />
                        {t('mapSettings.dangerZone.delete')}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
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
