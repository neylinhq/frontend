import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { ApiError } from '@/shared/api/client'
import { toast } from '@/shared/components/toast'
import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/dialog'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Textarea } from '@/shared/components/textarea'
import { MAPS_ROUTES } from '@/shared/config'
import { MAP_CREATION_CONFIG } from '../model/map-creation.constants'
import { useMapCreationStore } from '../model/map-creation.store'
import { useCreateMapMutation } from '../model/map-creation.hooks'

export const CreateMapDialog = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const titleInputRef = useRef<HTMLInputElement>(null)

  const { isDialogOpen, draftTitle, draftDescription, closeDialog, setDraft } =
    useMapCreationStore()
  const createMap = useCreateMapMutation()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Sync local state with store
  useEffect(() => {
    setDraft(title, description)
  }, [title, description, setDraft])

  // Auto-focus title input when dialog opens
  useEffect(() => {
    if (isDialogOpen && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), MAP_CREATION_CONFIG.FOCUS_DELAY_MS)
    }
  }, [isDialogOpen])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setTitle('')
      setDescription('')
    }
  }, [isDialogOpen])

  const handleCreate = async () => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      toast.error(t('mapCreation.validation.titleRequired'))
      return
    }

    if (trimmedTitle.length > MAP_CREATION_CONFIG.TITLE_MAX_LENGTH) {
      toast.error(
        t('mapCreation.validation.titleTooLong', { max: MAP_CREATION_CONFIG.TITLE_MAX_LENGTH })
      )
      return
    }

    try {
      const newMap = await createMap.mutateAsync({
        title: trimmedTitle,
        description: description.trim() || undefined
      })

      toast.success(t('mapCreation.success'), {
        description: t('mapCreation.created', { title: trimmedTitle })
      })

      closeDialog()

      // Navigate to the new map
      navigate(MAPS_ROUTES.view(newMap.id))
    } catch (error) {
      if (error instanceof ApiError) {
        const errorData = error.data as { error?: { message?: string } } | null
        toast.error(t('mapCreation.error'), {
          description: errorData?.error?.message
        })
      } else {
        toast.error(t('mapCreation.error'))
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl/Cmd + Enter
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleCreate()
    }
  }

  const isTitleValid = title.trim().length >= MAP_CREATION_CONFIG.TITLE_MIN_LENGTH
  const isDescriptionValid = description.length <= MAP_CREATION_CONFIG.DESCRIPTION_MAX_LENGTH

  return (
    <Dialog open={isDialogOpen} onOpenChange={open => !open && closeDialog()}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{t('mapCreation.dialog.title')}</DialogTitle>
          <DialogDescription>{t('mapCreation.dialog.description')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Title Input */}
          <div className='space-y-2'>
            <Label htmlFor='map-title'>
              {t('mapCreation.form.title.label')} <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='map-title'
              ref={titleInputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('mapCreation.form.title.placeholder')}
              maxLength={MAP_CREATION_CONFIG.TITLE_MAX_LENGTH}
              aria-required='true'
              aria-invalid={!isTitleValid && title.length > 0}
            />
            <p className='text-xs text-muted-foreground'>
              {title.length}/{MAP_CREATION_CONFIG.TITLE_MAX_LENGTH}
            </p>
          </div>

          {/* Description Textarea */}
          <div className='space-y-2'>
            <Label htmlFor='map-description'>{t('mapCreation.form.description.label')}</Label>
            <Textarea
              id='map-description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('mapCreation.form.description.placeholder')}
              maxLength={MAP_CREATION_CONFIG.DESCRIPTION_MAX_LENGTH}
              rows={4}
              aria-invalid={!isDescriptionValid}
            />
            <p className='text-xs text-muted-foreground'>
              {description.length}/{MAP_CREATION_CONFIG.DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          {/* Preview */}
          {title.trim() && (
            <div className='rounded-md border bg-muted/50 p-3'>
              <div className='space-y-1'>
                <p className='font-semibold text-sm'>{title.trim()}</p>
                {description.trim() && (
                  <p className='text-xs text-muted-foreground'>{description.trim()}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={closeDialog} disabled={createMap.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isTitleValid || !isDescriptionValid || createMap.isPending}
          >
            {createMap.isPending ? t('common.creating') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
