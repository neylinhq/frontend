import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/dialog'
import { Label } from '@/shared/components/label'
import { TIMING } from '../lib/constants'

export type MediaType = 'image' | 'imageFigure' | 'video'

interface MediaInsertDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (url: string) => void
  type: MediaType
}

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const getDialogConfig = (type: MediaType, t: (key: string) => string) => {
  switch (type) {
    case 'image':
      return {
        title: t('editor.mediaDialog.image.title'),
        description: t('editor.mediaDialog.image.description'),
        placeholder: 'https://example.com/image.png'
      }
    case 'imageFigure':
      return {
        title: t('editor.mediaDialog.imageFigure.title'),
        description: t('editor.mediaDialog.imageFigure.description'),
        placeholder: 'https://example.com/image.png'
      }
    case 'video':
      return {
        title: t('editor.mediaDialog.video.title'),
        description: t('editor.mediaDialog.video.description'),
        placeholder: 'https://youtube.com/watch?v=...'
      }
  }
}

export const MediaInsertDialog = ({ isOpen, onClose, onSubmit, type }: MediaInsertDialogProps) => {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const config = getDialogConfig(type, t)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      return
    }

    setUrl('')
    setError('')
    // Focus input after dialog animation (with cleanup)
    const timeoutId = setTimeout(() => inputRef.current?.focus(), TIMING.FOCUS_DELAY)

    return () => clearTimeout(timeoutId)
  }, [isOpen])

  const handleSubmit = useCallback(() => {
    const trimmedUrl = url.trim()

    if (!trimmedUrl) {
      setError(t('editor.mediaDialog.errors.empty'))
      return
    }

    if (!isValidUrl(trimmedUrl)) {
      setError(t('editor.mediaDialog.errors.invalid'))
      return
    }

    onSubmit(trimmedUrl)
    setUrl('')
    setError('')
    onClose()
  }, [url, onSubmit, onClose, t])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(e.target.value)
      if (error) {
        setError('')
      }
    },
    [error]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='media-url-input'>{t('editor.mediaDialog.urlLabel')}</Label>
            <input
              id='media-url-input'
              ref={inputRef}
              type='url'
              value={url}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={config.placeholder}
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              autoComplete='off'
            />
            {error && <p className='text-sm text-destructive'>{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            {t('editor.mediaDialog.cancel')}
          </Button>
          <Button onClick={handleSubmit}>{t('editor.mediaDialog.insert')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
