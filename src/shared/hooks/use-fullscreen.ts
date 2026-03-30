import { create } from 'zustand'

interface FullscreenState {
  isFullscreen: boolean
  toggleFullscreen: () => void
}

export const useFullscreen = create<FullscreenState>()((set) => ({
  isFullscreen: false,
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
}))
