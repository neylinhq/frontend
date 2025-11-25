import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { sessionApi } from './session.api'
import { useSessionStore } from './session.store'

const sessionKeys = {
  root: ['session'],
  currentUser: () => [...sessionKeys.root, 'currentUser']
}

export const useLoginMutation = () => {
  const login = useSessionStore(s => s.login)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionApi.login,
    onSuccess: ({ user, token }) => {
      login(user, token)
      queryClient.setQueryData(sessionKeys.currentUser(), user)
      navigate('/dashboard/overview')
    }
  })
}

export const useRegisterMutation = () => {
  const login = useSessionStore(s => s.login)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionApi.register,
    onSuccess: ({ user, token }) => {
      login(user, token)
      queryClient.setQueryData(sessionKeys.currentUser(), user)
      navigate('/dashboard/overview')
    }
  })
}

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: sessionApi.resetPassword,
    onSuccess: () => {
      // Show toast or navigate
    }
  })
}
