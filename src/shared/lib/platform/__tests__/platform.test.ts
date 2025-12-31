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
})
