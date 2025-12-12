import { api } from '@/shared/api/client'

// Types
export interface TwoFactorStatus {
  totpEnabled: boolean
  emailOtpEnabled: boolean
  backupCodesRemaining: number
  lastEnabledAt?: string
}

export interface SetupTOTPResponse {
  secret: string
  qrCodeUri: string
}

export interface EnableTOTPResponse {
  backupCodes: string[]
}

export interface EnableEmailOTPResponse {
  backupCodes?: string[]
}

export interface RegenerateBackupCodesResponse {
  backupCodes: string[]
}

interface StatusResponse {
  success: boolean
  data: TwoFactorStatus
}

interface SetupResponse {
  success: boolean
  data: SetupTOTPResponse
}

interface EnableResponse {
  success: boolean
  data: EnableTOTPResponse
}

interface EnableEmailResponse {
  success: boolean
  data: EnableEmailOTPResponse
}

interface DisableResponse {
  success: boolean
  data: { disabled: boolean }
}

interface RegenerateResponse {
  success: boolean
  data: RegenerateBackupCodesResponse
}

export const twoFactorApi = {
  // Get 2FA status for current user
  getStatus: async () => {
    const response = await api.get<StatusResponse>('/2fa/status')
    return response.data
  },

  // Setup TOTP - returns secret and QR code URI
  setupTOTP: async () => {
    const response = await api.post<SetupResponse>('/2fa/totp/setup', {})
    return response.data
  },

  // Enable TOTP after verifying code - returns backup codes
  enableTOTP: async (code: string) => {
    const response = await api.post<EnableResponse>('/2fa/totp/enable', { code })
    return response.data
  },

  // Enable email OTP as 2FA method
  enableEmailOTP: async () => {
    const response = await api.post<EnableEmailResponse>('/2fa/email/enable', {})
    return response.data
  },

  // Disable all 2FA
  disable: async (code: string, password?: string) => {
    const response = await api.post<DisableResponse>('/2fa/disable', { code, password })
    return response.data
  },

  // Regenerate backup codes (requires valid TOTP code)
  regenerateBackupCodes: async (code: string) => {
    const response = await api.post<RegenerateResponse>('/2fa/backup-codes/regenerate', { code })
    return response.data
  }
}
