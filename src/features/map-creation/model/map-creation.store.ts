import { create } from 'zustand'

export interface MapCreationState {
  isDialogOpen: boolean
  draftTitle: string
  draftDescription: string
  openDialog: () => void
  closeDialog: () => void
  setDraft: (title: string, description: string) => void
  resetDraft: () => void
}

export const useMapCreationStore = create<MapCreationState>(set => ({
  isDialogOpen: false,
  draftTitle: '',
  draftDescription: '',

  openDialog: () => set({ isDialogOpen: true }),

  closeDialog: () =>
    set({
      isDialogOpen: false,
      draftTitle: '',
      draftDescription: ''
    }),

  setDraft: (title: string, description: string) =>
    set({ draftTitle: title, draftDescription: description }),

  resetDraft: () => set({ draftTitle: '', draftDescription: '' })
}))
