import { Loader2, Mail, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { sessionApi } from '@/entities/session'
import { ApiError } from '@/shared/api/api-client'
import { Button } from '@/shared/components/button'
import { OtpInput } from '@/shared/components/otp-input'
import { toast } from '@/shared/components/toast'

interface VerifyEmailFormProps {
  email?: string
}

const RESEND_COOLDOWN = 60 // seconds

const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const visible = local.slice(0, 2)
  return `${visible}***@${domain}`
}

export const VerifyEmailForm = ({ email }: VerifyEmailFormProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)

  const canResend = resendCooldown === 0

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleSubmit = async () => {
    if (code.length !== 6 || isSubmitting) return

    setIsSubmitting(true)
    setHasError(false)

    try {
      await sessionApi.verifyEmail({ code })
      navigate('/dashboard/overview')
    } catch (error) {
      setHasError(true)
      if (error instanceof ApiError) {
        const errorData = error.data as { error?: { message?: string } } | null
        toast.error(t('auth.verifyEmail.error'), {
          description: errorData?.error?.message || t('auth.verifyEmail.invalidCode')
        })
      } else {
        toast.error(t('auth.verifyEmail.error'), {
          description: t('auth.verifyEmail.invalidCode')
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!canResend || isSubmitting) return

    try {
      await sessionApi.resendVerification()
      setResendCooldown(RESEND_COOLDOWN)
      toast.success(t('auth.verifyEmail.resendSuccess'))
    } catch (error) {
      if (error instanceof ApiError) {
        const errorData = error.data as { error?: { message?: string } } | null
        toast.error(t('auth.verifyEmail.resendError'), {
          description: errorData?.error?.message
        })
      }
    }
  }

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !isSubmitting) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div className="grid gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('auth.verifyEmail.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('auth.verifyEmail.description')}
          </p>
          {email && (
            <p className="text-sm font-medium">
              {maskEmail(email)}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <OtpInput
          value={code}
          onChange={setCode}
          length={6}
          disabled={isSubmitting}
          error={hasError}
          autoFocus
        />

        <Button
          type="button"
          className="w-full"
          disabled={code.length !== 6 || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('auth.verifyEmail.submitButton')}
        </Button>

        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0"
            disabled={!canResend || isSubmitting}
            onClick={handleResend}
          >
            {!canResend ? (
              <span className="tabular-nums">{t('auth.verifyEmail.resendIn', { seconds: resendCooldown })}</span>
            ) : (
              <>
                <RefreshCw className="mr-1 h-3 w-3" />
                {t('auth.verifyEmail.resendButton')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
