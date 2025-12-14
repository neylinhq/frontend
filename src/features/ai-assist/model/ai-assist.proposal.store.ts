import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

const MAX_ACTIONS = 30

export interface ProposalAction {
  id: string
  type: 'apply' | 'reject'
  previewId: string
  messageId: string
  sessionId: string
  entityType: 'node' | 'edge' | 'exercise'
  entityId: string
  previousState: Record<string, unknown>
  newState: Record<string, unknown>
  timestamp: number
}

interface ProposalHistoryState {
  actions: ProposalAction[]
  currentIndex: number
}

interface ProposalHistoryActions {
  recordAction: (action: Omit<ProposalAction, 'id' | 'timestamp'>) => string
  undo: () => ProposalAction | null
  redo: () => ProposalAction | null
  canUndo: () => boolean
  canRedo: () => boolean
  canUndoAction: (actionId: string) => boolean
  getAction: (actionId: string) => ProposalAction | undefined
  getActionsForSession: (sessionId: string) => ProposalAction[]
  clear: () => void
  clearForSession: (sessionId: string) => void
}

export const useProposalHistoryStore = create<ProposalHistoryState & ProposalHistoryActions>()(
  persist(
    (set, get) => ({
      actions: [],
      currentIndex: -1,

      recordAction: actionData => {
        const { actions, currentIndex } = get()
        const actionId = uuidv4()

        // Truncate forward history if not at end
        const newActions =
          currentIndex < actions.length - 1 ? actions.slice(0, currentIndex + 1) : [...actions]

        const newAction: ProposalAction = {
          ...actionData,
          id: actionId,
          timestamp: Date.now()
        }
        newActions.push(newAction)

        // Limit to max actions
        while (newActions.length > MAX_ACTIONS) {
          newActions.shift()
        }

        set({
          actions: newActions,
          currentIndex: newActions.length - 1
        })

        return actionId
      },

      undo: () => {
        const { actions, currentIndex } = get()
        if (currentIndex < 0) {
          return null
        }

        const action = actions[currentIndex]
        set({ currentIndex: currentIndex - 1 })
        return action
      },

      redo: () => {
        const { actions, currentIndex } = get()
        if (currentIndex >= actions.length - 1) {
          return null
        }

        const newIndex = currentIndex + 1
        set({ currentIndex: newIndex })
        return actions[newIndex]
      },

      canUndo: () => get().currentIndex >= 0,

      canRedo: () => {
        const { actions, currentIndex } = get()
        return currentIndex < actions.length - 1
      },

      canUndoAction: (actionId: string) => {
        const { actions, currentIndex } = get()
        const actionIndex = actions.findIndex(a => a.id === actionId)
        // Can undo if action exists and is at or before current index
        return actionIndex !== -1 && actionIndex <= currentIndex
      },

      getAction: (actionId: string) => {
        return get().actions.find(a => a.id === actionId)
      },

      getActionsForSession: (sessionId: string) => {
        return get().actions.filter(a => a.sessionId === sessionId)
      },

      clear: () => {
        set({ actions: [], currentIndex: -1 })
      },

      clearForSession: (sessionId: string) => {
        set(state => {
          const filtered = state.actions.filter(a => a.sessionId !== sessionId)
          return {
            actions: filtered,
            currentIndex: Math.min(state.currentIndex, filtered.length - 1)
          }
        })
      }
    }),
    {
      name: 'neylin:proposal-history-v1',
      partialize: state => ({
        actions: state.actions.slice(-MAX_ACTIONS),
        currentIndex: state.currentIndex
      })
    }
  )
)

// Selector hooks
export const useProposalHistory = () => {
  const recordAction = useProposalHistoryStore(s => s.recordAction)
  const undo = useProposalHistoryStore(s => s.undo)
  const redo = useProposalHistoryStore(s => s.redo)
  const canUndo = useProposalHistoryStore(s => s.canUndo)
  const canRedo = useProposalHistoryStore(s => s.canRedo)
  const canUndoAction = useProposalHistoryStore(s => s.canUndoAction)
  const getAction = useProposalHistoryStore(s => s.getAction)

  return {
    recordAction,
    undo,
    redo,
    canUndo,
    canRedo,
    canUndoAction,
    getAction
  }
}
