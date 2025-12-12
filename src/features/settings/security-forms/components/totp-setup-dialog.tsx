import { Check, Copy, Loader2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSetupTOTP, useEnableTOTP } from '@/entities/two-factor'
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
import { OtpInput } from '@/shared/components/otp-input'
import { toast } from '@/shared/components/toast'
import { useCopyToClipboard } from '@/shared/lib/use-copy-to-clipboard'

interface TotpSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (backupCodes: string[]) => void
}

type Step = 'qr' | 'verify'

export const TotpSetupDialog = ({ open, onOpenChange, onSuccess }: TotpSetupDialogProps) => {
  const { t } = useTranslation()
  const setupTOTP = useSetupTOTP()
  const enableTOTP = useEnableTOTP()

  const [step, setStep] = useState<Step>('qr')
  const [code, setCode] = useState('')
  const [hasError, setHasError] = useState(false)
  const { copied, copy } = useCopyToClipboard()

  useEffect(() => {
    if (open) {
      setStep('qr')
      setCode('')
      setHasError(false)
      setupTOTP.mutate()
    }
  }, [open])

  const handleVerify = (completedCode?: string) => {
    const codeToUse = completedCode || code
    if (codeToUse.length !== 6) return

    setHasError(false)
    enableTOTP.mutate(codeToUse, {
      onSuccess: (data) => {
        toast.success(t('settings.security.twoFactor.totp.enabled'))
        onSuccess(data.backupCodes)
      },
      onError: (error) => {
        setHasError(true)
        setCode('')
        toast.error(error.message || t('settings.security.twoFactor.totp.invalidCode'))
      }
    })
  }

  const copySecret = () => {
    if (setupTOTP.data?.secret) {
      copy(setupTOTP.data.secret)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('settings.security.twoFactor.totp.setupTitle')}</DialogTitle>
          <DialogDescription>
            {step === 'qr'
              ? t('settings.security.twoFactor.totp.setupStep1')
              : t('settings.security.twoFactor.totp.setupStep2')}
          </DialogDescription>
        </DialogHeader>

        {setupTOTP.isPending ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : step === 'qr' ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-lg border bg-white p-3">
                {setupTOTP.data?.qrCodeUri && (
                  <QRCodeSVG value={setupTOTP.data.qrCodeUri} size={180} level="M" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                {t('settings.security.twoFactor.totp.manualEntry')}
              </p>
              <div className="flex gap-2">
                <Input
                  value={setupTOTP.data?.secret || ''}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button variant="ghost" size="icon" onClick={copySecret}>
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center py-4">
              <OtpInput
                value={code}
                onChange={setCode}
                onComplete={handleVerify}
                length={6}
                disabled={enableTOTP.isPending}
                error={hasError}
                autoFocus
              />
            </div>
            {enableTOTP.isPending && (
              <div className="flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'verify' && (
            <Button
              variant="ghost"
              onClick={() => {
                setStep('qr')
                setCode('')
                setHasError(false)
              }}
              className="mr-auto"
            >
              {t('common.back')}
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          {step === 'qr' && (
            <Button onClick={() => setStep('verify')}>
              {t('common.continue')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
