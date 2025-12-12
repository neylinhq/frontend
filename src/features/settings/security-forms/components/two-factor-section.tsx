import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useTwoFactorStatus,
  useEnableEmailOTP,
  useDisableTwoFactor
} from '@/entities/two-factor'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { toast } from '@/shared/components/toast'
import { TotpSetupDialog } from './totp-setup-dialog'
import { BackupCodesDialog } from './backup-codes-dialog'
import { DisableTwoFactorDialog } from './disable-two-factor-dialog'

export const TwoFactorSection = () => {
  const { t } = useTranslation()
  const { data: status, isLoading } = useTwoFactorStatus()
  const enableEmailOTP = useEnableEmailOTP()

  const [showTotpSetup, setShowTotpSetup] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showDisable, setShowDisable] = useState(false)

  const isEnabled = status?.totpEnabled || status?.emailOtpEnabled

  const handleEnableEmailOTP = () => {
    enableEmailOTP.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(t('settings.security.twoFactor.emailEnabled'))
        if (data.backupCodes && data.backupCodes.length > 0) {
          setBackupCodes(data.backupCodes)
          setShowBackupCodes(true)
        }
      },
      onError: (error) => {
        toast.error(error.message || t('settings.security.twoFactor.enableError'))
      }
    })
  }

  const handleTotpEnabled = (codes: string[]) => {
    setBackupCodes(codes)
    setShowTotpSetup(false)
    setShowBackupCodes(true)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.security.twoFactor.title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.security.twoFactor.title')}</CardTitle>
          <CardDescription>
            {t('settings.security.twoFactor.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* TOTP Method */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">{t('settings.security.twoFactor.totp.title')}</p>
              <p className="text-xs text-muted-foreground">
                {t('settings.security.twoFactor.totp.description')}
              </p>
            </div>
            {status?.totpEnabled ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                {t('settings.security.twoFactor.active')}
              </Badge>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTotpSetup(true)}
              >
                {t('settings.security.twoFactor.setup')}
              </Button>
            )}
          </div>

          {/* Email OTP Method */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">{t('settings.security.twoFactor.email.title')}</p>
              <p className="text-xs text-muted-foreground">
                {t('settings.security.twoFactor.email.description')}
              </p>
            </div>
            {status?.emailOtpEnabled ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                {t('settings.security.twoFactor.active')}
              </Badge>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEnableEmailOTP}
                disabled={enableEmailOTP.isPending}
              >
                {enableEmailOTP.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('settings.security.twoFactor.enable')}
              </Button>
            )}
          </div>

          {/* Backup Codes Status */}
          {isEnabled && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">{t('settings.security.twoFactor.backup.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('settings.security.twoFactor.backup.remaining', { count: status?.backupCodesRemaining ?? 0 })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBackupCodes(true)}
              >
                {t('settings.security.twoFactor.backup.regenerate')}
              </Button>
            </div>
          )}

          {/* Disable 2FA */}
          {isEnabled && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDisable(true)}
              >
                {t('settings.security.twoFactor.disable')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TotpSetupDialog
        open={showTotpSetup}
        onOpenChange={setShowTotpSetup}
        onSuccess={handleTotpEnabled}
      />

      <BackupCodesDialog
        open={showBackupCodes}
        onOpenChange={setShowBackupCodes}
        codes={backupCodes}
        isRegenerate={backupCodes.length === 0}
      />

      <DisableTwoFactorDialog
        open={showDisable}
        onOpenChange={setShowDisable}
      />
    </>
  )
}
