import { useQueryClient } from '@tanstack/react-query'
import { Key01Icon, Loading02Icon, Mail01Icon, RefreshCw01Icon, Shield01Icon } from '@untitledui/icons-react/outline'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { sessionApi, type TwoFactorChallengeData } from '@/entities/session'
import { ApiError } from '@/shared/api/client'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { OtpInput } from '@/shared/components/otp-input'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/tabs'
import { toast } from '@/shared/components/toast'

interface TwoFactorFormProps {
  challengeData: TwoFactorChallengeData
  returnUrl?: string
}

const RESEND_COOLDOWN = 60 // seconds
const RESEND_COOLDOWN_TICK_MS = 1000

type TwoFactorMethod = 'totp' | 'email' | 'backup'

export const TwoFactorForm = ({
  challengeData,
  returnUrl = '/dashboard/overview'
}: TwoFactorFormProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { challengeToken, twoFactorMethods } = challengeData

  // Determine initial tab based on available methods (prefer TOTP)
  const getInitialMethod = (): TwoFactorMethod => {
    if (twoFactorMethods.includes('totp')) {
      return 'totp'
    }
    if (twoFactorMethods.includes('email')) {
      return 'email'
    }
    return 'backup'
  }

  const [method, setMethod] = useState<TwoFactorMethod>(getInitialMethod())
  const [code, setCode] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)

  const canResend = resendCooldown === 0 && method === 'email'

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), RESEND_COOLDOWN_TICK_MS)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Reset code when switching methods
  useEffect(() => {
    setCode('')
    setBackupCode('')
    setHasError(false)
  }, [])

  const handleSubmit = async (completedCode?: string) => {
    const codeToSubmit = completedCode || (method === 'backup' ? backupCode : code)

    if (method === 'backup') {
      if (codeToSubmit.length < 8) {
        return
      }
    } else {
      if (codeToSubmit.length !== 6) {
        return
      }
    }

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setHasError(false)

    try {
      const _result = await sessionApi.verifyTwoFactor({
        challengeToken,
        code: codeToSubmit,
        method
      })

      // Clear cached data from previous user to prevent data leakage
      queryClient.clear()

      navigate(returnUrl)
    } catch (error) {
      setHasError(true)
      if (error instanceof ApiError) {
        const errorData = error.data as { error?: { message?: string } } | null
        toast.error(t('auth.twoFactor.error'), {
          description: errorData?.error?.message || t('auth.twoFactor.invalidCode')
        })
      } else {
        toast.error(t('auth.twoFactor.error'), {
          description: t('auth.twoFactor.invalidCode')
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!canResend || isSubmitting) {
      return
    }

    try {
      await sessionApi.resendTwoFactorEmail({ challengeToken })
      setResendCooldown(RESEND_COOLDOWN)
      toast.success(t('auth.twoFactor.resendSuccess'))
    } catch (error) {
      if (error instanceof ApiError) {
        const errorData = error.data as { error?: { message?: string } } | null
        toast.error(t('auth.twoFactor.resendError'), {
          description: errorData?.error?.message
        })
      }
    }
  }

  const getIcon = () => {
    switch (method) {
      case 'totp':
        return <Shield01Icon className='h-8 w-8 text-primary' />
      case 'email':
        return <Mail01Icon className='h-8 w-8 text-primary' />
      case 'backup':
        return <Key01Icon className='h-8 w-8 text-primary' />
    }
  }

  const hasMultipleMethods = twoFactorMethods.length > 1

  return (
    <div className='grid gap-6'>
      <div className='flex flex-col items-center gap-4 text-center'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/5'>
          {getIcon()}
        </div>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold tracking-tight'>{t('auth.twoFactor.title')}</h1>
          <p className='text-sm text-muted-foreground'>
            {method === 'totp' && t('auth.twoFactor.totpDescription')}
            {method === 'email' && t('auth.twoFactor.emailDescription')}
            {method === 'backup' && t('auth.twoFactor.backupDescription')}
          </p>
        </div>
      </div>

      {hasMultipleMethods && (
        <Tabs
          value={method}
          onValueChange={v => setMethod(v as TwoFactorMethod)}
          className='w-full'
        >
          <TabsList
            className='grid w-full'
            style={{ gridTemplateColumns: `repeat(${twoFactorMethods.length}, 1fr)` }}
          >
            {twoFactorMethods.includes('totp') && (
              <TabsTrigger value='totp'>
                <Shield01Icon className='mr-2 h-4 w-4' />
                {t('auth.twoFactor.totpTab')}
              </TabsTrigger>
            )}
            {twoFactorMethods.includes('email') && (
              <TabsTrigger value='email'>
                <Mail01Icon className='mr-2 h-4 w-4' />
                {t('auth.twoFactor.emailTab')}
              </TabsTrigger>
            )}
            {twoFactorMethods.includes('backup') && (
              <TabsTrigger value='backup'>
                <Key01Icon className='mr-2 h-4 w-4' />
                {t('auth.twoFactor.backupTab')}
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      )}

      <div className='space-y-4'>
        {method === 'backup' ? (
          <Input
            value={backupCode}
            onChange={e => setBackupCode(e.target.value.toUpperCase())}
            placeholder={t('auth.twoFactor.backupPlaceholder')}
            disabled={isSubmitting}
            className={hasError ? 'border-destructive' : ''}
            maxLength={10}
          />
        ) : (
          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={handleSubmit}
            length={6}
            disabled={isSubmitting}
            error={hasError}
            autoFocus
          />
        )}

        {method === 'backup' ? (
          <Button
            type='button'
            className='w-full'
            disabled={backupCode.length < 8 || isSubmitting}
            onClick={() => handleSubmit()}
          >
            {isSubmitting && <Loading02Icon className='mr-2 h-4 w-4 animate-spin' />}
            {t('auth.twoFactor.submitButton')}
          </Button>
        ) : (
          isSubmitting && (
            <div className='flex justify-center'>
              <Loading02Icon className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          )
        )}

        {method === 'email' && twoFactorMethods.includes('email') && (
          <div className='flex items-center justify-center text-sm text-muted-foreground'>
            <Button
              type='button'
              variant='link'
              size='sm'
              className='h-auto p-0'
              disabled={!canResend || isSubmitting}
              onClick={handleResend}
            >
              {!canResend && resendCooldown > 0 ? (
                <span className='tabular-nums'>
                  {t('auth.twoFactor.resendIn', { seconds: resendCooldown })}
                </span>
              ) : (
                <>
                  <RefreshCw01Icon className='mr-1 h-3 w-3' />
                  {t('auth.twoFactor.resendButton')}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
