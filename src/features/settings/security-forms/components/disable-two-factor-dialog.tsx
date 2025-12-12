import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDisableTwoFactor, useSendEmailCode, useTwoFactorStatus } from '@/entities/two-factor'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/components/dialog'
import { OtpInput } from '@/shared/components/otp-input'
import { toast } from '@/shared/components/toast'

interface DisableTwoFactorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DisableTwoFactorDialog = ({ open, onOpenChange }: DisableTwoFactorDialogProps) => {
  const { t } = useTranslation()
  const { data: status } = useTwoFactorStatus()
  const disable = useDisableTwoFactor()
  const sendEmailCode = useSendEmailCode()

  const [code, setCode] = useState('')
  const [hasError, setHasError] = useState(false)

  const isEmailMethod = status?.emailOtpEnabled && !status?.totpEnabled

  // Auto-send email code when dialog opens for Email OTP method
  useEffect(() => {
    if (open) {
      setCode('')
      setHasError(false)

      // Send email code in background for Email OTP method
      if (isEmailMethod) {
        sendEmailCode.mutate(undefined, {
          onSuccess: () => {
            toast.success(t('settings.security.twoFactor.codeSent'))
          },
          onError: (error) => {
            toast.error(error.message || t('settings.security.twoFactor.sendCodeError'))
          }
        })
      }
    }
  }, [open])

  const handleDisable = (completedCode?: string) => {
    const codeToUse = completedCode || code
    if (codeToUse.length !== 6) return

    setHasError(false)
    disable.mutate({ code: codeToUse }, {
      onSuccess: () => {
        toast.success(t('settings.security.twoFactor.disabled'))
        onOpenChange(false)
      },
      onError: (error) => {
        setHasError(true)
        setCode('')
        toast.error(error.message || t('settings.security.twoFactor.disableError'))
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('settings.security.twoFactor.disableTitle')}</DialogTitle>
          <DialogDescription className="text-balance">
            {t('settings.security.twoFactor.enterCodeToDisable')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={handleDisable}
            length={6}
            disabled={disable.isPending}
            error={hasError}
            autoFocus
          />
        </div>

        {disable.isPending && (
          <div className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
