'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/dialog'

interface CropArea {
  x: number
  y: number
  size: number
}

interface ImageCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  onCropComplete: (croppedImage: Blob) => void
  title?: string
  description?: string
  outputSize?: number
}

export const ImageCropDialog = ({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  title,
  description,
  outputSize = 512
}: ImageCropDialogProps) => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, size: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Initialize crop area when image loads
  const handleImageLoad = useCallback(() => {
    const img = imageRef.current
    const container = containerRef.current
    if (!img || !container) return

    const containerRect = container.getBoundingClientRect()
    const imgAspect = img.naturalWidth / img.naturalHeight
    const containerAspect = containerRect.width / containerRect.height

    let displayWidth: number
    let displayHeight: number

    if (imgAspect > containerAspect) {
      displayWidth = containerRect.width
      displayHeight = containerRect.width / imgAspect
    } else {
      displayHeight = containerRect.height
      displayWidth = containerRect.height * imgAspect
    }

    setImageDimensions({ width: displayWidth, height: displayHeight })

    // Initial crop area - centered square, 70% of smaller dimension
    const minDim = Math.min(displayWidth, displayHeight)
    const initialSize = minDim * 0.7
    setCropArea({
      x: (displayWidth - initialSize) / 2,
      y: (displayHeight - initialSize) / 2,
      size: initialSize
    })
    setImageLoaded(true)
  }, [])

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setImageLoaded(false)
      setIsProcessing(false)
    }
  }, [open])

  const getPointerPosition = (e: React.PointerEvent | PointerEvent) => {
    const container = containerRef.current
    if (!container) return { x: 0, y: 0 }

    const rect = container.getBoundingClientRect()
    const offsetX = (rect.width - imageDimensions.width) / 2
    const offsetY = (rect.height - imageDimensions.height) / 2

    return {
      x: e.clientX - rect.left - offsetX,
      y: e.clientY - rect.top - offsetY
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    const pos = getPointerPosition(e)
    const { x, y, size } = cropArea

    // Check if clicking on resize handle (bottom-right corner)
    const handleSize = 20
    const isOnHandle =
      pos.x >= x + size - handleSize &&
      pos.x <= x + size + handleSize &&
      pos.y >= y + size - handleSize &&
      pos.y <= y + size + handleSize

    if (isOnHandle) {
      setIsResizing(true)
      setDragStart(pos)
    } else if (pos.x >= x && pos.x <= x + size && pos.y >= y && pos.y <= y + size) {
      // Inside crop area - start dragging
      setIsDragging(true)
      setDragStart({ x: pos.x - x, y: pos.y - y })
    }

    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging && !isResizing) return

    const pos = getPointerPosition(e)
    const { width, height } = imageDimensions
    const minSize = 50

    if (isDragging) {
      let newX = pos.x - dragStart.x
      let newY = pos.y - dragStart.y

      // Constrain to image bounds
      newX = Math.max(0, Math.min(newX, width - cropArea.size))
      newY = Math.max(0, Math.min(newY, height - cropArea.size))

      setCropArea(prev => ({ ...prev, x: newX, y: newY }))
    }

    if (isResizing) {
      const deltaX = pos.x - dragStart.x
      const deltaY = pos.y - dragStart.y
      const delta = Math.max(deltaX, deltaY)

      let newSize = cropArea.size + delta
      newSize = Math.max(minSize, newSize)

      // Constrain to image bounds
      const maxSize = Math.min(width - cropArea.x, height - cropArea.y)
      newSize = Math.min(newSize, maxSize)

      setCropArea(prev => ({ ...prev, size: newSize }))
      setDragStart(pos)
    }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  const handleSave = async () => {
    const img = imageRef.current
    if (!img || !imageLoaded) return

    setIsProcessing(true)

    try {
      // Calculate crop coordinates relative to original image
      const scaleX = img.naturalWidth / imageDimensions.width
      const scaleY = img.naturalHeight / imageDimensions.height

      const sourceX = cropArea.x * scaleX
      const sourceY = cropArea.y * scaleY
      const sourceSize = cropArea.size * Math.min(scaleX, scaleY)

      // Create canvas and crop
      const canvas = document.createElement('canvas')
      canvas.width = outputSize
      canvas.height = outputSize
      const ctx = canvas.getContext('2d')

      if (!ctx) throw new Error('No 2d context')

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        outputSize,
        outputSize
      )

      canvas.toBlob(
        blob => {
          if (blob) {
            onCropComplete(blob)
            onOpenChange(false)
          }
          setIsProcessing(false)
        },
        'image/jpeg',
        0.9
      )
    } catch (error) {
      console.error('Error cropping image:', error)
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title || t('imageCrop.title')}</DialogTitle>
          <DialogDescription>{description || t('imageCrop.description')}</DialogDescription>
        </DialogHeader>

        <div
          ref={containerRef}
          className='relative h-80 w-full overflow-hidden rounded-md bg-muted flex items-center justify-center select-none touch-none'
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt='Crop preview'
            className='max-h-full max-w-full object-contain'
            onLoad={handleImageLoad}
            draggable={false}
          />

          {imageLoaded && (
            <div
              className='absolute border-2 border-white rounded-full cursor-move pointer-events-none'
              style={{
                left: `calc(50% - ${imageDimensions.width / 2}px + ${cropArea.x}px)`,
                top: `calc(50% - ${imageDimensions.height / 2}px + ${cropArea.y}px)`,
                width: cropArea.size,
                height: cropArea.size,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
              }}
            >
              {/* Resize handle */}
              <div
                className='absolute -right-2 -bottom-2 w-5 h-5 bg-white rounded-full border-2 border-primary cursor-se-resize shadow-md pointer-events-auto'
              />
            </div>
          )}

          {!imageLoaded && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            </div>
          )}
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={handleCancel} disabled={isProcessing}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isProcessing || !imageLoaded}>
            {isProcessing ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('common.processing')}
              </>
            ) : (
              t('common.save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
