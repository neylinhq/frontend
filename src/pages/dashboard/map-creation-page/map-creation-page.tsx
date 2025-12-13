import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from '@/shared/components/toast'
import { useCreateMapMutation } from '@/features/map-creation'
import { MAP_CREATION_CONFIG } from '@/features/map-creation/model/map-creation.constants'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Textarea } from '@/shared/components/textarea'
import { Typography } from '@/shared/components/typography'
import { DASHBOARD_ROUTES, MAPS_ROUTES } from '@/shared/config'
import { getShortcut } from '@/shared/lib/platform'

export const MapCreationPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createMap = useCreateMapMutation()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

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
    } catch {
      toast.error(t('mapCreation.error'))
    }
  }

  const handleCancel = () => {
    navigate(DASHBOARD_ROUTES.overview)
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
    <div className='container mx-auto py-8 px-4 md:px-8'>
      {/* Header - full width */}
      <div className='mb-8 max-w-4xl'>
        <Typography variant='h1'>{t('mapCreation.page.title')}</Typography>
        <p className='text-muted-foreground mt-1'>{t('mapCreation.page.description')}</p>
      </div>

      {/* Two-column layout on desktop */}
      <div className='grid lg:grid-cols-[1fr_400px] gap-6 max-w-6xl'>
        {/* Left: Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('mapCreation.card.title')}</CardTitle>
            <CardDescription>{t('mapCreation.card.description')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Title Input */}
            <div className='space-y-2'>
              <Label htmlFor='map-title'>
                {t('mapCreation.form.title.label')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='map-title'
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('mapCreation.form.title.placeholder')}
                maxLength={MAP_CREATION_CONFIG.TITLE_MAX_LENGTH}
                aria-required='true'
                aria-invalid={!isTitleValid && title.length > 0}
                autoFocus
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
                rows={6}
                aria-invalid={!isDescriptionValid}
              />
              <p className='text-xs text-muted-foreground'>
                {description.length}/{MAP_CREATION_CONFIG.DESCRIPTION_MAX_LENGTH}
              </p>
            </div>

            {/* Actions */}
            <div className='flex gap-3 justify-end pt-4'>
              <Button variant='outline' onClick={handleCancel} disabled={createMap.isPending}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!isTitleValid || !isDescriptionValid || createMap.isPending}
              >
                {createMap.isPending ? t('common.creating') : t('common.create')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Preview */}
        <div className='space-y-4'>
          {title.trim() ? (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>{t('mapCreation.preview')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='text-xs text-muted-foreground mb-1'>
                    {t('mapCreation.form.title.label')}
                  </p>
                  <p className='font-semibold'>{title.trim()}</p>
                </div>
                {description.trim() && (
                  <div>
                    <p className='text-xs text-muted-foreground mb-1'>
                      {t('mapCreation.form.description.label')}
                    </p>
                    <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                      {description.trim()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className='border-dashed'>
              <CardContent className='py-8 text-center'>
                <p className='text-sm text-muted-foreground'>{t('mapCreation.emptyPreview')}</p>
              </CardContent>
            </Card>
          )}

          {/* Helpful tips card */}
          <Card className='bg-muted/30'>
            <CardContent className='py-4 space-y-2'>
              <p className='text-xs font-medium'>{t('mapCreation.tips.title')}</p>
              <ul className='text-xs text-muted-foreground space-y-1.5 list-disc list-inside'>
                <li>
                  {t('mapCreation.tips.keyboard', {
                    shortcut: getShortcut({ mac: '⌘↵', win: 'Ctrl+Enter' })
                  })}
                </li>
                <li>{t('mapCreation.tips.description')}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
