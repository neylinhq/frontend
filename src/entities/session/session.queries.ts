import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { sessionApi } from './session.api'
import { useSessionStore } from './session.store'

export const useLoginMutation = () => {
  const login = useSessionStore(s => s.login)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: sessionApi.login,
    onSuccess: ({ user, token }) => {
      login(user, token)
      navigate('/dashboard/overview')
    }
  })
}

export const useRegisterMutation = () => {
  const login = useSessionStore(s => s.login)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: sessionApi.register,
    onSuccess: ({ user, token }) => {
      login(user, token)
      navigate('/dashboard/overview')
    }
  })
}

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: sessionApi.resetPassword
  })
}
