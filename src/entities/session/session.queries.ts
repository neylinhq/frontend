import { useMutation } from '@tanstack/react-query'
import { sessionApi } from './session.api'

// Note: Login and Register are handled via SSR actions (app/routes/auth/*)
// These client-side mutations are only for API calls that don't require session updates

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: sessionApi.verifyEmail
  })
}

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: sessionApi.forgotPassword
  })
}

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: sessionApi.resetPassword
  })
}

export const useResendVerificationMutation = () => {
  return useMutation({
    mutationFn: sessionApi.resendVerification
  })
}
