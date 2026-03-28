import {
  AlertCircleIcon,
  ClockRewindIcon,
  InfoCircleIcon,
  Sliders04Icon,
  Trash01Icon,
  TrendUp01Icon,
  XCloseIcon
} from '@untitledui/icons-react/outline'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useMapProgress } from '@/entities/progress'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/shared/components/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'
import { cn } from '@/shared/lib/cn'
import { useMapSettingsForm } from '../model/use-map-settings-form'
import { MapSettingsFormContent } from './map-settings-form-content'
import { MapHistoryList } from './map-history-list'

interface MapSettingsDrawerProps {
  mapId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Whether the current user owns this map */
  isOwner?: boolean
  className?: string
}

export const MapSettingsDrawer = memo(
  ({ mapId, open, onOpenChange, isOwner = true, className }: MapSettingsDrawerProps) => {
    const { t } = useTranslation()
    const [isMobile, setIsMobile] = useState(false)

    const handleClose = useCallback(() => {
      onOpenChange(false)
    }, [onOpenChange])

    const form = useMapSettingsForm({
      mapId,
      onDeleted: handleClose,
    })

    const { data: mapProgress } = useMapProgress(mapId)

    // Check mobile via matchMedia
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }

      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
      <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
        <DrawerContent
          side={isMobile ? 'bottom' : 'right'}
          size={isMobile ? '85vh' : '420px'}
          showOverlay={isMobile}
          showClose={false}
          className={cn('p-0 flex flex-col', className)}
          onInteractOutside={e => e.preventDefault()}
        >
          {/* Minimal header */}
          <DrawerHeader className='px-4 py-2.5 shrink-0'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <DrawerTitle className='text-sm font-medium'>
                  {t('mapSettings.title')}
                </DrawerTitle>
                {form.isSaving && (
                  <span className='text-xs text-muted-foreground'>{t('common.saving')}</span>
                )}
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 rounded-sm -mr-1'
                onClick={handleClose}
              >
                <XCloseIcon className='h-4 w-4' />
              </Button>
            </div>
          </DrawerHeader>

          {/* Tabs */}
          <Tabs defaultValue='overview' className='flex flex-col flex-1 min-h-0'>
            <TabsList
              variant='underline'
              className='shrink-0 grid grid-cols-4 bg-background px-4'
            >
              <TabsTrigger
                variant='underline'
                value='overview'
                title={t('mapSettings.tabs.overview')}
                className='h-10 w-full text-muted-foreground data-[state=active]:text-foreground'
              >
                <InfoCircleIcon className='h-4 w-4' />
              </TabsTrigger>
              <TabsTrigger
                variant='underline'
                value='progress'
                title={t('mapSettings.tabs.progress')}
                className='h-10 w-full text-muted-foreground data-[state=active]:text-foreground'
              >
                <TrendUp01Icon className='h-4 w-4' />
              </TabsTrigger>
              <TabsTrigger
                variant='underline'
                value='history'
                title={t('mapSettings.tabs.history')}
                className='h-10 w-full text-muted-foreground data-[state=active]:text-foreground'
              >
                <ClockRewindIcon className='h-4 w-4' />
              </TabsTrigger>
              <TabsTrigger
                variant='underline'
                value='settings'
                title={t('mapSettings.tabs.settings')}
                className='h-10 w-full text-muted-foreground data-[state=active]:text-foreground'
              >
                <Sliders04Icon className='h-4 w-4' />
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - Title, Description, Visibility, Author */}
            <TabsContent value='overview' className='flex-1 overflow-y-auto mt-0 p-4'>
              <div className='space-y-6'>
                <MapSettingsFormContent
                  title={form.title}
                  description={form.description}
                  isPublic={form.map?.isPublic ?? false}
                  authorName={form.map?.authorName}
                  nodesCount={form.map?.nodesCount ?? 0}
                  mapTitle={form.map?.title}
                  isOwner={isOwner}
                  isSaving={form.isSaving}
                  isVisibilityPending={form.isVisibilityPending}
                  isDeletePending={form.isDeletePending}
                  deleteDialogOpen={form.deleteDialogOpen}
                  setDeleteDialogOpen={form.setDeleteDialogOpen}
                  onTitleChange={form.handleTitleChange}
                  onDescriptionChange={form.handleDescriptionChange}
                  onVisibilityChange={form.handleVisibilityChange}
                  onDelete={form.handleDeleteMap}
                />
              </div>
            </TabsContent>

            {/* Progress Tab - Stats + Rating */}
            <TabsContent value='progress' className='flex-1 overflow-y-auto mt-0 p-4'>
              <div className='space-y-6'>
                {/* Stats Grid */}
                <div className='grid grid-cols-2 gap-3'>
                  <div className='p-3 rounded-md bg-muted/30'>
                    <p className='text-xs text-muted-foreground mb-1'>
                      {t('mapSettings.progress.nodesTotal')}
                    </p>
                    <p className='text-xl font-semibold tabular-nums'>{form.map?.nodesCount ?? 0}</p>
                  </div>
                  <div className='p-3 rounded-md bg-muted/30'>
                    <p className='text-xs text-muted-foreground mb-1'>
                      {t('mapSettings.progress.overallProgress')}
                    </p>
                    <p className='text-xl font-semibold tabular-nums'>
                      {Math.round((mapProgress?.overallProgress ?? 0) * 100)}%
                    </p>
                  </div>
                  <div className='p-3 rounded-md bg-muted/30'>
                    <p className='text-xs text-muted-foreground mb-1'>
                      {t('mapSettings.progress.nodesMastered')}
                    </p>
                    <p className='text-xl font-semibold tabular-nums'>
                      {mapProgress?.nodesMastered ?? 0}
                    </p>
                  </div>
                  <div className='p-3 rounded-md bg-muted/30'>
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

            {/* History Tab - Change history */}
            <TabsContent value='history' className='flex-1 overflow-y-auto mt-0 p-4'>
              <MapHistoryList mapId={mapId} />
            </TabsContent>

            {/* Settings Tab - Rating System + Danger Zone */}
            <TabsContent value='settings' className='flex-1 overflow-y-auto mt-0'>
              <div className='flex flex-col min-h-full'>
                <div className='p-4' />

                {/* Danger Zone - mt-auto pushes to bottom (only for owners) */}
                {isOwner && (
                  <div className='p-4 mt-auto'>
                    <Card className='border-destructive/30 rounded-md'>
                      <CardHeader className='py-2.5 px-3'>
                        <CardTitle className='text-xs font-medium text-destructive flex items-center gap-1.5'>
                          <AlertCircleIcon className='h-3.5 w-3.5' />
                          {t('mapSettings.dangerZone.title')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='px-3 pb-2.5'>
                        <p className='text-xs text-muted-foreground mb-3'>
                          {t('mapSettings.dangerZone.warning')}
                        </p>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                          onClick={() => form.setDeleteDialogOpen(true)}
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
        </DrawerContent>
      </Drawer>
    )
  }
)

MapSettingsDrawer.displayName = 'MapSettingsDrawer'
