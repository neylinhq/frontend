import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, KeyRound, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useActionData, useNavigation, useSubmit } from 'react-router'
import { z } from 'zod'
import { Button } from '@/shared/components/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/form'
import { Input } from '@/shared/components/input'
import { OtpInput } from '@/shared/components/otp-input'
import { toast } from '@/shared/components/toast'

type ActionData = {
  success?: boolean
  error?: string
  step?: 'code' | 'complete'
  email?: string
} | undefined

const RESEND_COOLDOWN = 60 // seconds

const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const visible = local.slice(0, 2)
  return `${visible}***@${domain}`
}

export const ResetPasswordForm = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const actionData = useActionData<ActionData>()
  const submit = useSubmit()

  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const isLoading = navigation.state === 'submitting'
  const canResend = resendCooldown === 0

  // Handle step transitions from action data
  useEffect(() => {
    if (actionData?.step === 'code' && actionData?.email) {
      setStep('code')
      setEmail(actionData.email)
      setResendCooldown(RESEND_COOLDOWN)
    }
    if (actionData?.step === 'complete') {
      toast.success(t('auth.resetPassword.successMessage'))
    }
    if (actionData?.error) {
      toast.error(t('auth.resetPassword.error'), {
        description: actionData.error
      })
    }
  }, [actionData, t])

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Email step schema
  const emailSchema = z.object({
    email: z.string().email(t('validation.email'))
  })

  // Password step schema
  const passwordSchema = z.object({
    password: z.string().min(8, t('validation.passwordMin', { min: 8 })),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: t('validation.passwordMatch'),
    path: ['confirmPassword']
  })

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' }
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  })

  const handleEmailSubmit = (data: z.infer<typeof emailSchema>) => {
    submit({ intent: 'request', email: data.email }, { method: 'post' })
  }

  const handleCodeSubmit = (data: z.infer<typeof passwordSchema>) => {
    if (code.length !== 6) {
      toast.error(t('auth.resetPassword.invalidCode'))
      return
    }
    submit(
      { intent: 'reset', email, code, password: data.password },
      { method: 'post' }
    )
  }

  const handleResend = () => {
    if (canResend && email) {
      submit({ intent: 'request', email }, { method: 'post' })
      setResendCooldown(RESEND_COOLDOWN)
    }
  }

  // Success screen
  if (actionData?.step === 'complete') {
    return (
      <div className="text-center space-y-4 flex flex-col items-center">
        <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <KeyRound className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold">{t('auth.resetPassword.successTitle')}</h3>
        <p className="text-sm text-muted-foreground">{t('auth.resetPassword.successDescription')}</p>
        <Button className="w-full" asChild>
          <a href="/auth/sign-in">{t('auth.resetPassword.backToSignIn')}</a>
        </Button>
      </div>
    )
  }

  // Code + password step
  if (step === 'code') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">
              {t('auth.resetPassword.codeTitle')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('auth.resetPassword.codeDescription')}
            </p>
            <p className="text-sm font-medium">{maskEmail(email)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <OtpInput
            value={code}
            onChange={setCode}
            length={6}
            disabled={isLoading}
            error={!!actionData?.error}
            autoFocus
          />

          <Form {...passwordForm}>
            <form
              className="grid gap-4"
              onSubmit={passwordForm.handleSubmit(handleCodeSubmit)}
            >
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.resetPassword.newPasswordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.resetPassword.confirmPasswordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={code.length !== 6 || isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('auth.resetPassword.resetButton')}
              </Button>
            </form>
          </Form>

          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              disabled={!canResend || isLoading}
              onClick={handleResend}
            >
              {!canResend ? (
                <span className="tabular-nums">{t('auth.resetPassword.resendIn', { seconds: resendCooldown })}</span>
              ) : (
                <>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  {t('auth.resetPassword.resendButton')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Email step (initial)
  return (
    <Form {...emailForm}>
      <form
        className="grid gap-4"
        onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
      >
        <FormField
          control={emailForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.resetPassword.emailLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.signIn.emailPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('auth.resetPassword.submitButton')}
        </Button>
      </form>
    </Form>
  )
}
