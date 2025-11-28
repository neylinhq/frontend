import { Loader2 } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'

interface AvatarUploadProps {
  currentUrl?: string
  fallback?: string
  onUpload: (file: File) => void
  isPending: boolean
}

export function AvatarUpload({ currentUrl, fallback, onUpload, isPending }: AvatarUploadProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={currentUrl} alt="Avatar" />
        <AvatarFallback className="text-lg">{fallback || 'U'}</AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
        <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.uploading')}
            </>
          ) : (
            t('settings.profile.avatar.upload')
          )}
        </Button>
        <p className="text-xs text-muted-foreground">{t('settings.profile.avatar.requirements')}</p>
      </div>
    </div>
  )
}
