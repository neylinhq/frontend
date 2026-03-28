import { AlertCircleIcon, Trash01Icon } from '@untitledui/icons-react/outline'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

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
import { Textarea } from '@/shared/components/textarea'

export interface MapSettingsFormContentProps {
  title: string
  description: string
  isPublic: boolean
  authorName?: string
  nodesCount: number
  mapTitle?: string
  isOwner: boolean
  isSaving: boolean
  isVisibilityPending: boolean
  isDeletePending: boolean
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onVisibilityChange: (isPublic: boolean) => void
  onDelete: () => void
  /** Additional class for the title Field label */
  labelClassName?: string
  /** Number of rows for the description textarea */
  descriptionRows?: number
}

export const MapSettingsFormContent = memo(function MapSettingsFormContent({
  title,
  description,
  isPublic,
  authorName,
  nodesCount,
  mapTitle,
  isOwner,
  isVisibilityPending,
  isDeletePending,
  deleteDialogOpen,
  setDeleteDialogOpen,
  onTitleChange,
  onDescriptionChange,
  onVisibilityChange,
  onDelete,
  labelClassName,
  descriptionRows = 4,
}: MapSettingsFormContentProps) {
  const { t } = useTranslation()

  return (
    <>
      {/* Visibility Badge + Switch (only for owners) */}
      {isOwner && (
        <div className='flex items-center justify-between'>
          {isPublic ? (
            <Badge variant='info'>{t('mapSettings.visibility.public')}</Badge>
          ) : (
            <Badge variant='secondary'>{t('mapSettings.visibility.private')}</Badge>
          )}
          <Switch
            checked={isPublic}
            onCheckedChange={onVisibilityChange}
            disabled={isVisibilityPending}
          />
        </div>
      )}

      {/* Author (for non-owners) */}
      {!isOwner && authorName && (
        <div className='space-y-1.5'>
          <span className='text-xs text-muted-foreground'>
            {t('mapSettings.overview.author')}
          </span>
          <div className='text-sm font-medium'>{authorName}</div>
        </div>
      )}

      {/* Title & Description with autosave */}
      <Field label={t('mapSettings.overview.mapTitle')} labelClassName={labelClassName}>
        <Input
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          readOnly={!isOwner}
          disabled={!isOwner}
        />
      </Field>

      <Field label={t('mapSettings.overview.description')} labelClassName={labelClassName}>
        <Textarea
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          placeholder={t('mapSettings.overview.descriptionPlaceholder')}
          rows={descriptionRows}
          className='resize-none'
          readOnly={!isOwner}
          disabled={!isOwner}
        />
      </Field>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('mapSettings.dangerZone.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('mapSettings.dangerZone.confirmDescription', {
                title: mapTitle,
                nodesCount
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isDeletePending}
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

/** Danger zone card — extracted for reuse in different layouts. */
export const MapSettingsDangerZone = memo(function MapSettingsDangerZone({
  onRequestDelete
}: {
  onRequestDelete: () => void
}) {
  const { t } = useTranslation()

  return (
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
          onClick={onRequestDelete}
        >
          <Trash01Icon className='mr-1.5 h-3.5 w-3.5' />
          {t('mapSettings.dangerZone.delete')}
        </Button>
      </CardContent>
    </Card>
  )
})
