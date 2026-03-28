import { ChevronDownIcon } from '@untitledui/icons-react/outline'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MapHistoryList, MapSettingsDangerZone, MapSettingsFormContent, useMapSettingsForm } from '@/features/map-settings'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/collapsible'
import { cn } from '@/shared/lib/cn'

interface SettingsPanelProps {
  mapId: string
  isOwner?: boolean
}

export const SettingsPanel = memo(function SettingsPanel({
  mapId,
  isOwner = true
}: SettingsPanelProps) {
  const { t } = useTranslation()
  const [historyOpen, setHistoryOpen] = useState(false)

  const form = useMapSettingsForm({ mapId })

  return (
      <div className='flex flex-col h-full'>
        {/* Saving indicator */}
        {form.isSaving && (
          <div className='px-panel py-1 text-xs text-muted-foreground border-b border-border/60 shrink-0'>
            {t('common.saving')}
          </div>
        )}

        {/* Single scrollable content */}
        <div className='flex-1 overflow-y-auto [scrollbar-gutter:stable]'>
          {/* === Overview Section === */}
          <div className='p-panel space-y-4'>
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
              labelClassName='text-xs'
              descriptionRows={3}
            />
          </div>

          {/* Separator */}
          <div className='mx-4 border-t border-border/60' />

          {/* === History — collapsible === */}
          <div className='px-panel-sm py-1'>
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
                <div className='px-panel-sm pb-2'>
                  <MapHistoryList mapId={mapId} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Danger Zone — pinned to bottom */}
        {isOwner && (
          <div className='shrink-0 p-4 mt-auto'>
            <MapSettingsDangerZone onRequestDelete={() => form.setDeleteDialogOpen(true)} />
          </div>
        )}
      </div>
  )
})
