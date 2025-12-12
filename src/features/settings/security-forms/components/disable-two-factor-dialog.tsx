import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDisableTwoFactor, useSendEmailCode, useTwoFactorStatus } from '@/entities/two-factor'
import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  const [emailCodeSent, setEmailCodeSent] = useState(false)

  const isEmailMethod = status?.emailOtpEnabled && !status?.totpEnabled

  useEffect(() => {
    if (open) {
      setCode('')
      setHasError(false)
      setEmailCodeSent(false)
    }
  }, [open])

  const handleSendEmailCode = () => {
    sendEmailCode.mutate(undefined, {
      onSuccess: () => {
        setEmailCodeSent(true)
        toast.success(t('settings.security.twoFactor.codeSent'))
      },
      onError: (error) => {
        toast.error(error.message || t('settings.security.twoFactor.sendCodeError'))
      }
    })
  }

  const handleDisable = () => {
    if (code.length !== 6) return

    setHasError(false)
    disable.mutate({ code }, {
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

  useEffect(() => {
    if (code.length === 6 && !disable.isPending) {
      handleDisable()
    }
  }, [code])

  const showOtpInput = !isEmailMethod || emailCodeSent

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('settings.security.twoFactor.disableTitle')}</DialogTitle>
          <DialogDescription>
            {isEmailMethod && !emailCodeSent
              ? t('settings.security.twoFactor.sendCodeToDisable')
              : t('settings.security.twoFactor.enterCodeToDisable')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          {showOtpInput ? (
            <OtpInput
              value={code}
              onChange={setCode}
              length={6}
              disabled={disable.isPending}
              error={hasError}
              autoFocus
            />
          ) : (
            <Button
              onClick={handleSendEmailCode}
              disabled={sendEmailCode.isPending}
            >
              {sendEmailCode.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('settings.security.twoFactor.sendCode')}
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          {showOtpInput && (
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={code.length !== 6 || disable.isPending}
            >
              {disable.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('settings.security.twoFactor.disable')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
