import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '..'

afterEach(() => {
  delete (globalThis as { __NEYLIN_LOGGER__?: unknown }).__NEYLIN_LOGGER__
  vi.clearAllMocks()
})

describe('logger', () => {
  it('sends errors to the configured target', () => {
    const error = vi.fn()
    ;(globalThis as { __NEYLIN_LOGGER__?: unknown }).__NEYLIN_LOGGER__ = { error }

    logger.error('boom')
    expect(error).toHaveBeenCalledWith('boom')
  })

  it('routes warn to info when warn is missing', () => {
    const info = vi.fn()
    ;(globalThis as { __NEYLIN_LOGGER__?: unknown }).__NEYLIN_LOGGER__ = { info }

    logger.warn('warning')
    if (import.meta.env.DEV) {
      expect(info).toHaveBeenCalledWith('warning')
    } else {
      expect(info).not.toHaveBeenCalled()
    }
  })
})
