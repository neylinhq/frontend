import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { twoFactorApi, type TwoFactorStatus } from './two-factor.api'

export const twoFactorKeys = {
  all: ['two-factor'] as const,
  status: () => [...twoFactorKeys.all, 'status'] as const
}

// Query: Get 2FA status
export function useTwoFactorStatus() {
  return useQuery({
    queryKey: twoFactorKeys.status(),
    queryFn: () => twoFactorApi.getStatus(),
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

// Mutation: Setup TOTP
export function useSetupTOTP() {
  return useMutation({
    mutationFn: () => twoFactorApi.setupTOTP()
  })
}

// Mutation: Enable TOTP
export function useEnableTOTP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => twoFactorApi.enableTOTP(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.status() })
    }
  })
}

// Mutation: Enable Email OTP
export function useEnableEmailOTP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => twoFactorApi.enableEmailOTP(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.status() })
    }
  })
}

// Mutation: Disable 2FA
export function useDisableTwoFactor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ code, password }: { code: string; password?: string }) =>
      twoFactorApi.disable(code, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.status() })
    }
  })
}

// Mutation: Regenerate backup codes
export function useRegenerateBackupCodes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => twoFactorApi.regenerateBackupCodes(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twoFactorKeys.status() })
    }
  })
}
