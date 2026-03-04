import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { createQueryWrapper, createTestQueryClient } from '@/shared/tests'

vi.mock('../two-factor.api', () => ({
  twoFactorApi: {
    getStatus: vi.fn(),
    setupTOTP: vi.fn(),
    enableTOTP: vi.fn(),
    enableEmailOTP: vi.fn(),
    disable: vi.fn(),
    regenerateBackupCodes: vi.fn(),
    sendEmailCode: vi.fn()
  }
}))

import { twoFactorApi } from '../two-factor.api'
import {
  twoFactorKeys,
  useDisableTwoFactor,
  useEnableEmailOTP,
  useEnableTOTP,
  useRegenerateBackupCodes,
  useSendEmailCode,
  useSetupTOTP,
  useTwoFactorStatus
} from '../two-factor.queries'

describe('two-factor queries', () => {
  it('fetches status with initial data', async () => {
    const status = {
      totpEnabled: false,
      emailOtpEnabled: false,
      backupCodesRemaining: 5
    }
    vi.mocked(twoFactorApi.getStatus).mockResolvedValue(status)

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useTwoFactorStatus(status), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual(status))
    expect(twoFactorApi.getStatus).not.toHaveBeenCalled()
    expect(twoFactorKeys.status()).toEqual(['two-factor', 'status'])
  })

  it('invalidates status after mutations', async () => {
    vi.mocked(twoFactorApi.setupTOTP).mockResolvedValue({ secret: 'secret', qrCodeUri: 'uri' })
    vi.mocked(twoFactorApi.enableTOTP).mockResolvedValue({ backupCodes: ['code'] })
    vi.mocked(twoFactorApi.enableEmailOTP).mockResolvedValue({ backupCodes: ['code'] })
    vi.mocked(twoFactorApi.disable).mockResolvedValue({ disabled: true })
    vi.mocked(twoFactorApi.regenerateBackupCodes).mockResolvedValue({ backupCodes: ['code'] })
    vi.mocked(twoFactorApi.sendEmailCode).mockResolvedValue({ sent: true })

    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = createQueryWrapper(queryClient)

    const { result: setup } = renderHook(() => useSetupTOTP(), { wrapper })
    await act(async () => {
      await setup.current.mutateAsync()
    })

    const { result: enable } = renderHook(() => useEnableTOTP(), { wrapper })
    await act(async () => {
      await enable.current.mutateAsync('123456')
    })

    const { result: enableEmail } = renderHook(() => useEnableEmailOTP(), { wrapper })
    await act(async () => {
      await enableEmail.current.mutateAsync()
    })

    const { result: disable } = renderHook(() => useDisableTwoFactor(), { wrapper })
    await act(async () => {
      await disable.current.mutateAsync({ code: '123456', password: 'password' })
    })

    const { result: regenerate } = renderHook(() => useRegenerateBackupCodes(), { wrapper })
    await act(async () => {
      await regenerate.current.mutateAsync('123456')
    })

    const { result: sendEmail } = renderHook(() => useSendEmailCode(), { wrapper })
    await act(async () => {
      await sendEmail.current.mutateAsync()
    })

    expect(twoFactorApi.enableTOTP).toHaveBeenCalledWith('123456')
    expect(twoFactorApi.disable).toHaveBeenCalledWith('123456', 'password')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: twoFactorKeys.status() })
  })

  it('fetches status when initial data is null', async () => {
    const status = {
      totpEnabled: true,
      emailOtpEnabled: false,
      backupCodesRemaining: 2
    }
    vi.mocked(twoFactorApi.getStatus).mockResolvedValue(status)

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useTwoFactorStatus(null), { wrapper })
    await waitFor(() => expect(result.current.data).toEqual(status))
    expect(twoFactorApi.getStatus).toHaveBeenCalled()
  })

  it('disables two-factor without password', async () => {
    vi.mocked(twoFactorApi.disable).mockResolvedValue({ disabled: true })

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useDisableTwoFactor(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ code: '654321' })
    })

    expect(twoFactorApi.disable).toHaveBeenCalledWith('654321', undefined)
  })
})
