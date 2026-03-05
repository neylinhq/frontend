import { create } from 'zustand'

interface PanelState {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

export const createPanelStore = () =>
  create<PanelState>(set => ({
    isOpen: false,
    toggle: () => set(state => ({ isOpen: !state.isOpen })),
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false })
  }))
