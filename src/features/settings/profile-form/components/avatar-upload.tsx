import { Loader2, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/avatar'
import { Button } from '@/shared/components/button'
import { ImageCropDialog } from '@/shared/components/image-crop-dialog'

interface AvatarUploadProps {
  currentUrl?: string
  fallback?: string
  onUpload: (file: File) => void
  onDelete?: () => void
  isPending: boolean
  isDeleting?: boolean
}

export const AvatarUpload = ({
  currentUrl,
  fallback,
  onUpload,
  onDelete,
  isPending,
  isDeleting
}: AvatarUploadProps) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create object URL for cropping
      const imageUrl = URL.createObjectURL(file)
      setSelectedImage(imageUrl)
      setCropDialogOpen(true)
    }
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    // Convert blob to file
    const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })
    onUpload(file)

    // Cleanup
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage)
      setSelectedImage(null)
    }
  }

  const handleCropDialogClose = (open: boolean) => {
    setCropDialogOpen(open)
    if (!open && selectedImage) {
      URL.revokeObjectURL(selectedImage)
      setSelectedImage(null)
    }
  }

  return (
    <>
      <div className='flex items-center gap-4'>
        <Avatar className='h-20 w-20'>
          <AvatarImage src={currentUrl} alt='Avatar' />
          <AvatarFallback className='text-lg'>{fallback || 'U'}</AvatarFallback>
        </Avatar>
        <div className='space-y-2'>
          <input
            ref={inputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleChange}
          />
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleClick}
              disabled={isPending || isDeleting}
            >
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {t('common.uploading')}
                </>
              ) : (
                t('settings.profile.avatar.upload')
              )}
            </Button>
            {currentUrl && onDelete && (
              <Button
                variant='ghost'
                size='icon'
                onClick={onDelete}
                disabled={isPending || isDeleting}
                className='h-8 w-8'
              >
                {isDeleting ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Trash2 className='h-4 w-4' />
                )}
              </Button>
            )}
          </div>
          <p className='text-xs text-muted-foreground'>
            {t('settings.profile.avatar.requirements')}
          </p>
        </div>
      </div>

      {selectedImage && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={handleCropDialogClose}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          title={t('settings.profile.avatar.crop.title')}
          description={t('settings.profile.avatar.crop.description')}
        />
      )}
    </>
  )
}
