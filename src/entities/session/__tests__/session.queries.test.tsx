import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createQueryWrapper, createTestQueryClient } from '@/shared/tests'

vi.mock('../session.api', () => ({
  sessionApi: {
    verifyEmail: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    resendVerification: vi.fn()
  }
}))

import { sessionApi } from '../session.api'
import {
  useForgotPasswordMutation,
  useResendVerificationMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation
} from '../session.queries'

describe('session queries', () => {
  it('calls session mutations', async () => {
    vi.mocked(sessionApi.verifyEmail).mockResolvedValue({ message: 'ok' })
    vi.mocked(sessionApi.forgotPassword).mockResolvedValue({ message: 'ok' })
    vi.mocked(sessionApi.resetPassword).mockResolvedValue({ message: 'ok' })
    vi.mocked(sessionApi.resendVerification).mockResolvedValue({ message: 'ok' })

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result: verify } = renderHook(() => useVerifyEmailMutation(), { wrapper })
    await act(async () => {
      await verify.current.mutateAsync({ code: '123456' })
    })

    const { result: forgot } = renderHook(() => useForgotPasswordMutation(), { wrapper })
    await act(async () => {
      await forgot.current.mutateAsync('test@example.com')
    })

    const { result: reset } = renderHook(() => useResetPasswordMutation(), { wrapper })
    await act(async () => {
      await reset.current.mutateAsync({
        email: 'test@example.com',
        code: '123456',
        password: 'password123'
      })
    })

    const { result: resend } = renderHook(() => useResendVerificationMutation(), { wrapper })
    await act(async () => {
      await resend.current.mutateAsync()
    })

    expect(sessionApi.verifyEmail).toHaveBeenCalledWith({ code: '123456' }, expect.any(Object))
    expect(sessionApi.forgotPassword).toHaveBeenCalledWith('test@example.com', expect.any(Object))
    expect(sessionApi.resetPassword).toHaveBeenCalledWith(
      {
        email: 'test@example.com',
        code: '123456',
        password: 'password123'
      },
      expect.any(Object)
    )
    expect(sessionApi.resendVerification).toHaveBeenCalledWith(undefined, expect.any(Object))
  })
})
