import { create } from 'zustand'
import type { NodeType } from '@/entities/node'

export interface NodeCreationState {
  // Quick Add Dialog state
  isQuickAddOpen: boolean
  draftLabel: string
  draftType: NodeType

  // Inline creation state
  isInlineCreating: boolean
  inlinePosition: { x: number; y: number } | null

  // Actions
  openQuickAdd: () => void
  closeQuickAdd: () => void
  setDraft: (label: string, type?: NodeType) => void

  startInlineCreation: (position: { x: number; y: number }) => void
  cancelInlineCreation: () => void

  reset: () => void
}

export const useNodeCreationStore = create<NodeCreationState>(set => ({
  // Initial state
  isQuickAddOpen: false,
  draftLabel: '',
  draftType: 'concept',

  isInlineCreating: false,
  inlinePosition: null,

  // Actions
  openQuickAdd: () =>
    set({
      isQuickAddOpen: true,
      draftLabel: '',
      draftType: 'concept'
    }),

  closeQuickAdd: () =>
    set({
      isQuickAddOpen: false,
      draftLabel: '',
      draftType: 'concept'
    }),

  setDraft: (label: string, type?: NodeType) =>
    set(state => ({
      draftLabel: label,
      draftType: type ?? state.draftType
    })),

  startInlineCreation: (position: { x: number; y: number }) =>
    set({
      isInlineCreating: true,
      inlinePosition: position,
      draftLabel: '',
      draftType: 'concept'
    }),

  cancelInlineCreation: () =>
    set({
      isInlineCreating: false,
      inlinePosition: null,
      draftLabel: '',
      draftType: 'concept'
    }),

  reset: () =>
    set({
      isQuickAddOpen: false,
      isInlineCreating: false,
      inlinePosition: null,
      draftLabel: '',
      draftType: 'concept'
    })
}))
