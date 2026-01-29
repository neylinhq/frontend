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

  it('logs debug and info when enabled', () => {
    const debug = vi.fn()
    const info = vi.fn()
    ;(globalThis as { __NEYLIN_LOGGER__?: unknown }).__NEYLIN_LOGGER__ = { debug, info }

    logger.debug('dbg')
    logger.info('info')

    if (import.meta.env.DEV) {
      expect(debug).toHaveBeenCalledWith('dbg')
      expect(info).toHaveBeenCalledWith('info')
    } else {
      expect(debug).not.toHaveBeenCalled()
      expect(info).not.toHaveBeenCalled()
    }
  })

  it('does nothing when no target is configured', () => {
    expect(() => logger.error('boom')).not.toThrow()
  })

  it('skips handlers when none are provided', () => {
    const target = {}
    ;(globalThis as { __NEYLIN_LOGGER__?: unknown }).__NEYLIN_LOGGER__ = target
    expect(() => logger.error('noop')).not.toThrow()
  })

  it('skips debug/info/warn in production mode', async () => {
    vi.resetModules()
    vi.doMock('@/shared/config/env', () => ({ IS_DEV: false }))
    const { logger: prodLogger } = await import('../logger')
    const handler = vi.fn()
    ;(globalThis as { __NEYLIN_LOGGER__?: unknown }).__NEYLIN_LOGGER__ = {
      debug: handler,
      info: handler,
      warn: handler
    }

    prodLogger.debug('dbg')
    prodLogger.info('info')
    prodLogger.warn('warn')

    expect(handler).not.toHaveBeenCalled()
    vi.doUnmock('@/shared/config/env')
    vi.resetModules()
  })
})
