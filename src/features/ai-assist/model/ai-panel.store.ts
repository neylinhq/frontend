import { create } from 'zustand'

interface AIPanelState {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

export const useAIPanelStore = create<AIPanelState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false })
}))
