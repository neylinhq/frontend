import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Lightbulb01Icon } from '@untitledui/icons-react/outline'
import { useCreateMapMutation } from '@/features/map-creation'
import { MAP_CREATION_CONFIG } from '@/features/map-creation/model/map-creation.constants'
import { ApiError } from '@/shared/api/client'
import { Button } from '@/shared/components/button'
import { Card, CardContent } from '@/shared/components/card'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Textarea } from '@/shared/components/textarea'
import { toast } from '@/shared/components/toast'
import { Typography } from '@/shared/components/typography'
import { DASHBOARD_ROUTES, MAPS_ROUTES } from '@/shared/config'
import { getShortcut } from '@/shared/lib/platform'

/**
 * Map Creation Page
 *
 * Design Philosophy (from design-manifesto.md):
 * - "Интерфейс исчезает, контент сияет" — минимум UI, фокус на действии
 * - "Progressive Disclosure" — показываем только необходимое
 * - "Clarity over Cleverness" — простая форма без лишних элементов
 * - "Warmth without Softness" — brand кнопка для primary action
 */
export const MapCreationPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMap = useCreateMapMutation()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showDescription, setShowDescription] = useState(false)

  const handleCreate = async () => {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

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
        description: trimmedDescription || undefined
      })

      toast.success(t('mapCreation.success'), {
        description: t('mapCreation.created', { title: trimmedTitle })
      })

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

  const handleCancel = () => {
    navigate(DASHBOARD_ROUTES.overview)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleCreate()
    }
  }

  const isTitleValid = title.trim().length >= MAP_CREATION_CONFIG.TITLE_MIN_LENGTH
  const isDescriptionValid = description.length <= MAP_CREATION_CONFIG.DESCRIPTION_MAX_LENGTH
  const canCreate = isTitleValid && isDescriptionValid && !createMap.isPending

  return (
    <div className='min-h-full flex items-start justify-center pt-16 px-4'>
      <div className='w-full max-w-lg'>
        {/* Header — minimal, purposeful */}
        <div className='mb-6'>
          <Typography variant='h1' className='text-2xl'>
            {t('mapCreation.page.title')}
          </Typography>
          <p className='text-muted-foreground text-sm mt-1'>
            {t('mapCreation.page.description')}
          </p>
        </div>

        {/* Single card — focused */}
        <Card>
          <CardContent className='pt-6 space-y-4'>
            {/* Title — the essential field */}
            <div className='space-y-2'>
              <Label htmlFor='map-title' className='text-sm font-medium'>
                {t('mapCreation.form.title.label')}
              </Label>
              <Input
                id='map-title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('mapCreation.form.title.placeholder')}
                maxLength={MAP_CREATION_CONFIG.TITLE_MAX_LENGTH}
                aria-required='true'
                autoFocus
                className='h-11'
              />
              {/* Counter only when approaching limit */}
              {title.length > MAP_CREATION_CONFIG.TITLE_MAX_LENGTH * 0.7 && (
                <p className='text-xs text-muted-foreground text-right'>
                  {title.length}/{MAP_CREATION_CONFIG.TITLE_MAX_LENGTH}
                </p>
              )}
            </div>

            {/* Description — progressive disclosure */}
            {showDescription ? (
              <div className='space-y-2'>
                <Label htmlFor='map-description' className='text-sm font-medium'>
                  {t('mapCreation.form.description.label')}
                  <span className='text-muted-foreground font-normal ml-1'>
                    ({t('common.optional')})
                  </span>
                </Label>
                <Textarea
                  id='map-description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('mapCreation.form.description.placeholder')}
                  maxLength={MAP_CREATION_CONFIG.DESCRIPTION_MAX_LENGTH}
                  rows={3}
                  className='resize-none'
                />
                {description.length > MAP_CREATION_CONFIG.DESCRIPTION_MAX_LENGTH * 0.7 && (
                  <p className='text-xs text-muted-foreground text-right'>
                    {description.length}/{MAP_CREATION_CONFIG.DESCRIPTION_MAX_LENGTH}
                  </p>
                )}
              </div>
            ) : (
              <button
                type='button'
                onClick={() => setShowDescription(true)}
                className='text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                + {t('mapCreation.addDescription')}
              </button>
            )}

            {/* Actions — clear hierarchy */}
            <div className='flex gap-3 justify-end pt-2'>
              <Button
                type='button'
                variant='ghost'
                onClick={handleCancel}
                disabled={createMap.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type='button'
                variant='brand'
                onClick={handleCreate}
                disabled={!canCreate}
              >
                {createMap.isPending ? t('common.creating') : t('common.create')}
              </Button>
            </div>

            {/* Hint — subtle, helpful */}
            <p className='text-xs text-muted-foreground text-center pt-2 flex items-center justify-center gap-1.5'>
              <Lightbulb01Icon className='h-3 w-3' />
              {getShortcut({ mac: '⌘↵', win: 'Ctrl+Enter' })} {t('mapCreation.tips.toCreate')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
