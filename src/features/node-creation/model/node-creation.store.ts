import { create } from 'zustand'

import type { RelationType } from '@/entities/edge'
import type { NodeType } from '@/entities/node'

export interface PendingConnection {
  targetNodeId: string
  targetNodeLabel: string
  relationType: RelationType
  direction: 'outgoing' | 'incoming'
}

export interface NodeCreationState {
  // Quick Add Dialog state
  isQuickAddOpen: boolean
  draftLabel: string
  draftType: NodeType

  // Inline creation state
  isInlineCreating: boolean
  inlinePosition: { x: number; y: number } | null

  // Pending connections for new node
  pendingConnections: PendingConnection[]

  // Actions
  openQuickAdd: () => void
  closeQuickAdd: () => void
  setDraft: (label: string, type?: NodeType) => void

  startInlineCreation: (position: { x: number; y: number }) => void
  cancelInlineCreation: () => void

  // Connection actions
  addConnection: (connection: PendingConnection) => void
  removeConnection: (targetNodeId: string) => void
  updateConnectionType: (targetNodeId: string, relationType: RelationType) => void
  clearConnections: () => void

  reset: () => void
}

export const useNodeCreationStore = create<NodeCreationState>(set => ({
  // Initial state
  isQuickAddOpen: false,
  draftLabel: '',
  draftType: 'concept',

  isInlineCreating: false,
  inlinePosition: null,

  pendingConnections: [],

  // Actions
  openQuickAdd: () =>
    set({
      isQuickAddOpen: true,
      draftLabel: '',
      draftType: 'concept',
      pendingConnections: []
    }),

  closeQuickAdd: () =>
    set({
      isQuickAddOpen: false,
      draftLabel: '',
      draftType: 'concept',
      pendingConnections: []
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
      draftType: 'concept',
      pendingConnections: []
    }),

  cancelInlineCreation: () =>
    set({
      isInlineCreating: false,
      inlinePosition: null,
      draftLabel: '',
      draftType: 'concept',
      pendingConnections: []
    }),

  addConnection: connection =>
    set(state => ({
      pendingConnections: [
        ...state.pendingConnections.filter(c => c.targetNodeId !== connection.targetNodeId),
        connection
      ]
    })),

  removeConnection: targetNodeId =>
    set(state => ({
      pendingConnections: state.pendingConnections.filter(c => c.targetNodeId !== targetNodeId)
    })),

  updateConnectionType: (targetNodeId, relationType) =>
    set(state => ({
      pendingConnections: state.pendingConnections.map(c =>
        c.targetNodeId === targetNodeId ? { ...c, relationType } : c
      )
    })),

  clearConnections: () => set({ pendingConnections: [] }),

  reset: () =>
    set({
      isQuickAddOpen: false,
      isInlineCreating: false,
      inlinePosition: null,
      draftLabel: '',
      draftType: 'concept',
      pendingConnections: []
    })
}))
