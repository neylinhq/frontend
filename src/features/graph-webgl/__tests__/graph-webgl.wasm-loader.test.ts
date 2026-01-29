import { describe, expect, it, vi } from 'vitest'
import { initWasmModule } from '../lib/wasm-loader'

describe('initWasmModule', () => {
  it('invokes default init when available', async () => {
    const module = { default: vi.fn().mockResolvedValue(undefined) }
    await initWasmModule(module)
    expect(module.default).toHaveBeenCalled()
  })

  it('invokes init when default is missing', async () => {
    const module = { init: vi.fn() }
    await initWasmModule(module)
    expect(module.init).toHaveBeenCalled()
  })

  it('prefers default over init when both are present', async () => {
    const module = { default: vi.fn().mockResolvedValue(undefined), init: vi.fn() }
    await initWasmModule(module)
    expect(module.default).toHaveBeenCalled()
    expect(module.init).not.toHaveBeenCalled()
  })

  it('does nothing when no init functions exist', async () => {
    await expect(initWasmModule({})).resolves.toBeUndefined()
  })
})
