import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router'
import { useEffect } from 'react'
import { TwoFactorForm } from '@/features/auth/two-factor-form'
import { AUTH_ROUTES } from '@/shared/config'
import type { TwoFactorChallengeData } from '@/entities/session'

interface LocationState {
  challengeToken: string
  twoFactorMethods: ('totp' | 'email' | 'backup')[]
  returnUrl?: string
}

export const TwoFactorPage = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const state = location.state as LocationState | null

  // Redirect to sign-in if no challenge data
  useEffect(() => {
    if (!state?.challengeToken || !state?.twoFactorMethods) {
      navigate(AUTH_ROUTES.signIn, { replace: true })
    }
  }, [state, navigate])

  if (!state?.challengeToken || !state?.twoFactorMethods) {
    return null
  }

  const challengeData: TwoFactorChallengeData = {
    requiresTwoFactor: true,
    challengeToken: state.challengeToken,
    twoFactorMethods: state.twoFactorMethods
  }

  return (
    <div className="space-y-6">
      <TwoFactorForm
        challengeData={challengeData}
        returnUrl={state.returnUrl || '/dashboard/overview'}
      />

      <div className="text-center text-sm text-muted-foreground">
        {t('auth.twoFactor.backToSignIn')}{' '}
        <Link
          to={AUTH_ROUTES.signIn}
          className="underline underline-offset-4 hover:text-primary"
          prefetch="intent"
        >
          {t('auth.twoFactor.signInLink')}
        </Link>
      </div>
    </div>
  )
}
