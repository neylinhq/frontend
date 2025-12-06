import { Loader2, Mail, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useActionData, useNavigation, useSubmit } from 'react-router'
import { Button } from '@/shared/components/button'
import { OtpInput } from '@/shared/components/otp-input'
import { toast } from '@/shared/components/toast'

type ActionData = { error?: string; success?: boolean } | undefined

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
  const navigation = useNavigation()
  const actionData = useActionData<ActionData>()
  const submit = useSubmit()

  const [code, setCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const isSubmitting = navigation.state === 'submitting'
  const canResend = resendCooldown === 0

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Show toast on error/success from action
  useEffect(() => {
    if (actionData?.error) {
      toast.error(t('auth.verifyEmail.error'), {
        description: actionData.error
      })
    }
  }, [actionData, t])

  const handleSubmit = () => {
    if (code.length === 6) {
      submit({ code, intent: 'verify' }, { method: 'post' })
    }
  }

  const handleResend = () => {
    if (canResend) {
      submit({ intent: 'resend' }, { method: 'post' })
      setResendCooldown(RESEND_COOLDOWN)
      toast.success(t('auth.verifyEmail.resendSuccess'))
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
          error={!!actionData?.error}
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
