import { Loading02Icon } from '@untitledui/icons-react/outline'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type TwoFactorStatus, useEnableEmailOTP, useTwoFactorStatus } from '@/entities/two-factor'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/card'
import { Skeleton } from '@/shared/components/skeleton'
import { toast } from '@/shared/components/toast'

import { BackupCodesDialog } from './backup-codes-dialog'
import { DisableTwoFactorDialog } from './disable-two-factor-dialog'
import { TotpSetupDialog } from './totp-setup-dialog'

interface TwoFactorSectionProps {
  initialStatus?: TwoFactorStatus | null
}

export const TwoFactorSection = ({ initialStatus }: TwoFactorSectionProps) => {
  const { t } = useTranslation()
  const { data: status, isLoading } = useTwoFactorStatus(initialStatus)
  const enableEmailOTP = useEnableEmailOTP()

  const [showTotpSetup, setShowTotpSetup] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showDisable, setShowDisable] = useState(false)

  const isEnabled = status?.totpEnabled || status?.emailOtpEnabled
  const activeMethod = status?.totpEnabled ? 'totp' : status?.emailOtpEnabled ? 'email' : null

  const handleEnableEmailOTP = () => {
    enableEmailOTP.mutate(undefined, {
      onSuccess: data => {
        toast.success(t('settings.security.twoFactor.emailEnabled'))
        if (data.backupCodes && data.backupCodes.length > 0) {
          setBackupCodes(data.backupCodes)
          setShowBackupCodes(true)
        }
      },
      onError: error => {
        toast.error(error.message || t('settings.security.twoFactor.enableError'))
      }
    })
  }

  const handleTotpEnabled = (codes: string[]) => {
    setBackupCodes(codes)
    setShowTotpSetup(false)
    setShowBackupCodes(true)
  }

  // Fallback skeleton if SSR data not available (rare edge case)
  if (isLoading && !initialStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.security.twoFactor.title')}</CardTitle>
          <Skeleton className='h-4 w-64 mt-2' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-20 w-full' />
          <Skeleton className='h-20 w-full' />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.security.twoFactor.title')}</CardTitle>
          <CardDescription>{t('settings.security.twoFactor.description')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* TOTP Method */}
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div>
              <p className='text-sm font-medium'>{t('settings.security.twoFactor.totp.title')}</p>
              <p className='text-xs text-muted-foreground'>
                {t('settings.security.twoFactor.totp.description')}
              </p>
            </div>
            {status?.totpEnabled ? (
              <Badge variant='outline' className='text-success border-success'>
                {t('settings.security.twoFactor.active')}
              </Badge>
            ) : activeMethod === 'email' ? (
              <span className='text-xs text-muted-foreground'>
                {t('settings.security.twoFactor.disableOtherFirst')}
              </span>
            ) : (
              <Button variant='ghost' size='sm' onClick={() => setShowTotpSetup(true)}>
                {t('settings.security.twoFactor.setup')}
              </Button>
            )}
          </div>

          {/* Email OTP Method */}
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div>
              <p className='text-sm font-medium'>{t('settings.security.twoFactor.email.title')}</p>
              <p className='text-xs text-muted-foreground'>
                {t('settings.security.twoFactor.email.description')}
              </p>
            </div>
            {status?.emailOtpEnabled ? (
              <Badge variant='outline' className='text-success border-success'>
                {t('settings.security.twoFactor.active')}
              </Badge>
            ) : activeMethod === 'totp' ? (
              <span className='text-xs text-muted-foreground'>
                {t('settings.security.twoFactor.disableOtherFirst')}
              </span>
            ) : (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleEnableEmailOTP}
                disabled={enableEmailOTP.isPending}
              >
                {enableEmailOTP.isPending && (
                  <Loading02Icon className='mr-2 h-4 w-4 animate-spin' />
                )}
                {t('settings.security.twoFactor.enable')}
              </Button>
            )}
          </div>

          {/* Backup Codes Status */}
          {isEnabled && (
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div>
                <p className='text-sm font-medium'>
                  {t('settings.security.twoFactor.backup.title')}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('settings.security.twoFactor.backup.remaining', {
                    count: status?.backupCodesRemaining ?? 0
                  })}
                </p>
              </div>
              <Button variant='ghost' size='sm' onClick={() => setShowBackupCodes(true)}>
                {t('settings.security.twoFactor.backup.regenerate')}
              </Button>
            </div>
          )}

          {/* Disable 2FA */}
          {isEnabled && (
            <div className='flex justify-end'>
              <Button
                variant='ghost'
                size='sm'
                className='text-destructive hover:text-destructive hover:bg-destructive/10'
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

      <DisableTwoFactorDialog open={showDisable} onOpenChange={setShowDisable} />
    </>
  )
}
