import { Copy, Download, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegenerateBackupCodes } from '@/entities/two-factor'
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

interface BackupCodesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  codes: string[]
  isRegenerate?: boolean
}

export const BackupCodesDialog = ({ open, onOpenChange, codes, isRegenerate = false }: BackupCodesDialogProps) => {
  const { t } = useTranslation()
  const regenerate = useRegenerateBackupCodes()

  const [step, setStep] = useState<'verify' | 'codes'>('codes')
  const [verifyCode, setVerifyCode] = useState('')
  const [newCodes, setNewCodes] = useState<string[]>([])
  const [hasError, setHasError] = useState(false)

  const displayCodes = newCodes.length > 0 ? newCodes : codes

  useEffect(() => {
    if (open) {
      setStep(isRegenerate && codes.length === 0 ? 'verify' : 'codes')
      setVerifyCode('')
      setNewCodes([])
      setHasError(false)
    }
  }, [open, isRegenerate, codes])

  const handleRegenerate = () => {
    if (verifyCode.length !== 6) return

    setHasError(false)
    regenerate.mutate(verifyCode, {
      onSuccess: (data) => {
        setNewCodes(data.backupCodes)
        setStep('codes')
        toast.success(t('settings.security.twoFactor.backup.regenerated'))
      },
      onError: (error) => {
        setHasError(true)
        setVerifyCode('')
        toast.error(error.message || t('settings.security.twoFactor.backup.invalidCode'))
      }
    })
  }

  useEffect(() => {
    if (verifyCode.length === 6 && step === 'verify' && !regenerate.isPending) {
      handleRegenerate()
    }
  }, [verifyCode])

  const copyAllCodes = () => {
    navigator.clipboard.writeText(displayCodes.join('\n'))
    toast.success(t('settings.security.twoFactor.backup.copied'))
  }

  const downloadCodes = () => {
    const text = `Neylin Backup Codes\n${'='.repeat(20)}\n\n${displayCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\nStore these codes in a safe place.\nEach code can only be used once.`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'neylin-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t('settings.security.twoFactor.backup.downloaded'))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'verify'
              ? t('settings.security.twoFactor.backup.regenerateTitle')
              : t('settings.security.twoFactor.backup.title')}
          </DialogTitle>
          <DialogDescription>
            {step === 'verify'
              ? t('settings.security.twoFactor.backup.enterCodeToRegenerate')
              : t('settings.security.twoFactor.backup.saveWarning')}
          </DialogDescription>
        </DialogHeader>

        {step === 'verify' ? (
          <div className="flex justify-center py-4">
            <OtpInput
              value={verifyCode}
              onChange={setVerifyCode}
              length={6}
              disabled={regenerate.isPending}
              error={hasError}
              autoFocus
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
              {displayCodes.map((code, index) => (
                <div
                  key={index}
                  className="rounded bg-muted px-3 py-1.5 font-mono text-sm text-center"
                >
                  {code}
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {t('settings.security.twoFactor.backup.oneTimeWarning')}
            </p>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={copyAllCodes}>
                <Copy className="mr-2 h-4 w-4" />
                {t('settings.security.twoFactor.backup.copy')}
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={downloadCodes}>
                <Download className="mr-2 h-4 w-4" />
                {t('settings.security.twoFactor.backup.download')}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'codes' && isRegenerate && newCodes.length === 0 && (
            <Button variant="ghost" onClick={() => setStep('verify')} className="mr-auto">
              {t('settings.security.twoFactor.backup.regenerate')}
            </Button>
          )}
          {step === 'verify' ? (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleRegenerate}
                disabled={verifyCode.length !== 6 || regenerate.isPending}
              >
                {regenerate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('settings.security.twoFactor.backup.regenerate')}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>
              {t('settings.security.twoFactor.backup.done')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
