import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useSessionStore } from '@/entities/session'
import { authApi } from './auth.api'

export const useLoginMutation = () => {
  const login = useSessionStore(s => s.login)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user, token }) => {
      login(user, token)
      navigate('/dashboard/overview') // Или куда-то еще
    }
  })
}

export const useRegisterMutation = () => {
  const login = useSessionStore(s => s.login)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ user, token }) => {
      login(user, token)
      navigate('/dashboard/overview')
    }
  })
}
