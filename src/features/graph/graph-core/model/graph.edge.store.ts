import { create } from 'zustand'

import type { Edge, RelationType } from '@/entities/map'

export interface PendingEdgeCreation {
  sourceId: string
  targetId: string
  sourceLabel: string
  targetLabel: string
  position: { x: number; y: number }
}

interface EdgeManagementState {
  // Edge creation state
  pendingEdge: PendingEdgeCreation | null
  selectedRelationType: RelationType

  // Edge editing state
  editingEdge: Edge | null
  editPosition: { x: number; y: number } | null

  // Actions
  startEdgeCreation: (pending: PendingEdgeCreation) => void
  cancelEdgeCreation: () => void
  setRelationType: (type: RelationType) => void

  startEdgeEditing: (edge: Edge, position: { x: number; y: number }) => void
  cancelEdgeEditing: () => void

  reset: () => void
}

export const useEdgeManagementStore = create<EdgeManagementState>(set => ({
  pendingEdge: null,
  selectedRelationType: 'related-to',
  editingEdge: null,
  editPosition: null,

  startEdgeCreation: pending =>
    set({
      pendingEdge: pending,
      selectedRelationType: 'related-to',
      editingEdge: null,
      editPosition: null
    }),

  cancelEdgeCreation: () =>
    set({
      pendingEdge: null,
      selectedRelationType: 'related-to'
    }),

  setRelationType: type => set({ selectedRelationType: type }),

  startEdgeEditing: (edge, position) =>
    set({
      editingEdge: edge,
      editPosition: position,
      pendingEdge: null
    }),

  cancelEdgeEditing: () =>
    set({
      editingEdge: null,
      editPosition: null
    }),

  reset: () =>
    set({
      pendingEdge: null,
      selectedRelationType: 'related-to',
      editingEdge: null,
      editPosition: null
    })
}))
