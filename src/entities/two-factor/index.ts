export type {
  EnableEmailOTPResponse,
  EnableTOTPResponse,
  RegenerateBackupCodesResponse,
  SetupTOTPResponse,
  TwoFactorStatus
} from './two-factor.api'
export { twoFactorApi } from './two-factor.api'

export {
  twoFactorKeys,
  useDisableTwoFactor,
  useEnableEmailOTP,
  useEnableTOTP,
  useRegenerateBackupCodes,
  useSendEmailCode,
  useSetupTOTP,
  useTwoFactorStatus
} from './two-factor.queries'
