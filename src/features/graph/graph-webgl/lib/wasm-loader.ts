type WasmModuleLike = {
  default?: () => Promise<unknown>
  init?: () => void
}

export const initWasmModule = async (module: WasmModuleLike) => {
  if (typeof module.default === 'function') {
    await module.default()
    return
  }

  if (typeof module.init === 'function') {
    module.init()
  }
}
