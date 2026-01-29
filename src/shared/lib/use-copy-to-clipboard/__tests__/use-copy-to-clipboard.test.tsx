import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCopyToClipboard } from '..'

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')

afterEach(() => {
  if (originalClipboard) {
    Object.defineProperty(navigator, 'clipboard', originalClipboard)
  } else {
    delete (navigator as { clipboard?: unknown }).clipboard
  }
  vi.useRealTimers()
})

describe('useCopyToClipboard', () => {
  it('copies text using the Clipboard API and resets state', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    const { result } = renderHook(() => useCopyToClipboard({ timeout: 50 }))

    let success = false
    await act(async () => {
      success = await result.current.copy('hello')
    })

    expect(success).toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
    expect(result.current.copied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(50)
    })

    expect(result.current.copied).toBe(false)
  })

  it('falls back to execCommand when Clipboard API is unavailable', async () => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true
    })

    const execCommand = vi.fn().mockReturnValue(true)
    const originalExecCommand = document.execCommand
    document.execCommand = execCommand

    const { result } = renderHook(() => useCopyToClipboard({ timeout: 10 }))

    let success = false
    await act(async () => {
      success = await result.current.copy('fallback')
    })

    expect(success).toBe(true)
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(result.current.copied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(10)
    })

    expect(result.current.copied).toBe(false)

    document.execCommand = originalExecCommand
  })

  it('returns false when execCommand fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true
    })

    const execCommand = vi.fn().mockReturnValue(false)
    const originalExecCommand = document.execCommand
    document.execCommand = execCommand

    const { result } = renderHook(() => useCopyToClipboard())
    let success = true
    await act(async () => {
      success = await result.current.copy('fallback')
    })

    expect(success).toBe(false)
    document.execCommand = originalExecCommand
  })

  it('returns false when clipboard copy throws', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('fail'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    })

    const { result } = renderHook(() => useCopyToClipboard())
    let success = true
    await act(async () => {
      success = await result.current.copy('boom')
    })

    expect(success).toBe(false)
  })
})
