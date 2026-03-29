import { zodResolver } from '@hookform/resolvers/zod'
import { Key01Icon, Loading02Icon, RefreshCw01Icon } from '@untitledui/icons-react/outline'
import { type Dispatch, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { z } from 'zod'

import type { Step } from '@/pages/auth/reset-password-page'
import { sessionApi } from '@/entities/session'
import { ApiError } from '@/shared/api/client'
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
import { maskEmail } from '@/shared/lib/mask-email'

const RESEND_COOLDOWN = 60 // seconds
const RESEND_COOLDOWN_TICK_MS = 1000

interface Props {
  step: Step
  setStep: Dispatch<Step>
}

export const ResetPasswordForm = ({ step, setStep }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const canResend = resendCooldown === 0

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), RESEND_COOLDOWN_TICK_MS)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Email step schema
  const emailSchema = z.object({
    email: z.string().email(t('validation.email'))
  })

  // Password step schema
  const passwordSchema = z
    .object({
      password: z.string().min(8, t('validation.passwordMin', { min: 8 })),
      confirmPassword: z.string()
    })
    .refine(data => data.password === data.confirmPassword, {
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

  const handleEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    setIsLoading(true)
    try {
      await sessionApi.forgotPassword(data.email)
      setEmail(data.email)
      setStep('code')
      setResendCooldown(RESEND_COOLDOWN)
    } catch (error) {
      if (error instanceof ApiError) {
        const errorData = error.data as { error?: { message?: string } } | null
        toast.error(t('auth.resetPassword.error'), {
          description: errorData?.error?.message
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (data: z.infer<typeof passwordSchema>) => {
    if (code.length !== 6) {
      toast.error(t('auth.resetPassword.invalidCode'))
      return
    }

    setIsLoading(true)
    setHasError(false)

    try {
      await sessionApi.resetPassword({ email, code, password: data.password })
      setStep('complete')
      toast.success(t('auth.resetPassword.successMessage'))
    } catch (error) {
      setHasError(true)
      if (error instanceof ApiError) {
        const errorData = error.data as { error?: { message?: string } } | null
        toast.error(t('auth.resetPassword.error'), {
          description: errorData?.error?.message
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend || !email) {
      return
    }

    try {
      await sessionApi.forgotPassword(email)
      setResendCooldown(RESEND_COOLDOWN)
      toast.success(t('auth.resetPassword.codeSent'))
    } catch (error) {
      if (error instanceof ApiError) {
        const errorData = error.data as { error?: { message?: string } } | null
        toast.error(t('auth.resetPassword.resendError'), {
          description: errorData?.error?.message
        })
      }
    }
  }

  // Success screen
  if (step === 'complete') {
    return (
      <div className='text-center space-y-4 flex flex-col items-center'>
        {/* <div className='h-16 w-16 bg-success/10 rounded-full flex items-center justify-center mb-4'>
          <Key01Icon className='h-8 w-8 text-success' />
        </div>
        <h3 className='text-xl font-semibold'>{t('auth.resetPassword.successTitle')}</h3>
        <p className='text-sm text-muted-foreground'>
          {t('auth.resetPassword.successDescription')}
        </p> */}
        <Button className='w-full' onClick={() => navigate('/auth/sign-in')}>
          {t('auth.resetPassword.backToSignIn')}
        </Button>
      </div>
    )
  }

  // Code + password step
  if (step === 'code') {
    return (
      <div className='space-y-6'>
        <div className='flex flex-col items-center gap-4 text-center'>
          {/* <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/5'>
            <Key01Icon className='h-8 w-8 text-primary' />
          </div> */}
          <div className='space-y-2'>
            {/* <h1 className='text-xl font-semibold'>{t('auth.resetPassword.codeTitle')}</h1> */}
            {/* <p className='text-sm text-muted-foreground'>
              {t('auth.resetPassword.codeDescription')}
            </p> */}
            <p className='text-sm font-medium'>{maskEmail(email)}</p>
          </div>
        </div>

        <div className='space-y-4'>
          <OtpInput
            value={code}
            onChange={setCode}
            length={6}
            disabled={isLoading}
            error={hasError}
            autoFocus
          />

          <Form {...passwordForm}>
            <form className='grid gap-4' onSubmit={passwordForm.handleSubmit(handleCodeSubmit)}>
              <FormField
                control={passwordForm.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.resetPassword.newPasswordLabel')}</FormLabel>
                    <FormControl>
                      <Input type='password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.resetPassword.confirmPasswordLabel')}</FormLabel>
                    <FormControl>
                      <Input type='password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full' disabled={code.length !== 6 || isLoading}>
                {isLoading && <Loading02Icon className='mr-2 h-4 w-4 animate-spin' />}
                {t('auth.resetPassword.resetButton')}
              </Button>
            </form>
          </Form>

          <div className='flex items-center justify-center text-sm text-muted-foreground'>
            <Button
              type='button'
              variant='link'
              size='sm'
              className='h-auto p-0'
              disabled={!canResend || isLoading}
              onClick={handleResend}
            >
              {!canResend ? (
                <span className='tabular-nums'>
                  {t('auth.resetPassword.resendIn', { seconds: resendCooldown })}
                </span>
              ) : (
                <>
                  <RefreshCw01Icon className='mr-1 h-3 w-3' />
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
      <form className='grid gap-4' onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
        <FormField
          control={emailForm.control}
          name='email'
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
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading && <Loading02Icon className='mr-2 h-4 w-4 animate-spin' />}
          {t('auth.resetPassword.submitButton')}
        </Button>
      </form>
    </Form>
  )
}
