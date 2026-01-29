import { afterEach, describe, expect, it, vi } from 'vitest'

const originalPlatform = Object.getOwnPropertyDescriptor(navigator, 'platform')

const setPlatform = (value: string) => {
  Object.defineProperty(navigator, 'platform', {
    value,
    configurable: true
  })
}

afterEach(() => {
  if (originalPlatform) {
    Object.defineProperty(navigator, 'platform', originalPlatform)
  }
  vi.resetModules()
})

describe('platform helpers', () => {
  it('uses Mac shortcut on macOS', async () => {
    setPlatform('MacIntel')
    const mod = await import('../platform')
    expect(mod.isMac).toBe(true)
    expect(mod.getShortcut({ mac: 'cmd', win: 'ctrl' })).toBe('cmd')
  })

  it('uses Windows shortcut otherwise', async () => {
    setPlatform('Win32')
    const mod = await import('../platform')
    expect(mod.isMac).toBe(false)
    expect(mod.getShortcut({ mac: 'cmd', win: 'ctrl' })).toBe('ctrl')
  })

  it('returns null when shortcut is missing', async () => {
    setPlatform('Win32')
    const mod = await import('../platform')
    expect(mod.getShortcut()).toBeNull()
  })

  it('defaults to non-mac when window is undefined', async () => {
    vi.stubGlobal('window', undefined)
    vi.resetModules()
    const mod = await import('../platform')
    expect(mod.isMac).toBe(false)
    vi.unstubAllGlobals()
  })
})
