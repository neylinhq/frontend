import { create } from 'zustand'

export interface LayoutSnapshot {
  positions: Map<string, { x: number; y: number }>
  timestamp: number
}

interface LayoutHistoryState {
  snapshots: LayoutSnapshot[]
  currentIndex: number
  maxSnapshots: number
}

interface LayoutHistoryActions {
  saveSnapshot: (positions: Map<string, { x: number; y: number }>) => void
  undo: () => LayoutSnapshot | null
  redo: () => LayoutSnapshot | null
  canUndo: () => boolean
  canRedo: () => boolean
  clear: () => void
  getHistoryInfo: () => { current: number; total: number }
}

const MAX_SNAPSHOTS = 30

export const useLayoutHistoryStore = create<LayoutHistoryState & LayoutHistoryActions>()(
  (set, get) => ({
    snapshots: [],
    currentIndex: -1,
    maxSnapshots: MAX_SNAPSHOTS,

    saveSnapshot: positions => {
      const { snapshots, currentIndex } = get()

      // If we're not at the end, truncate forward history
      const newSnapshots =
        currentIndex < snapshots.length - 1 ? snapshots.slice(0, currentIndex + 1) : [...snapshots]

      // Add new snapshot
      const newSnapshot: LayoutSnapshot = {
        positions: new Map(positions),
        timestamp: Date.now()
      }
      newSnapshots.push(newSnapshot)

      // Limit to max snapshots
      while (newSnapshots.length > MAX_SNAPSHOTS) {
        newSnapshots.shift()
      }

      set({
        snapshots: newSnapshots,
        currentIndex: newSnapshots.length - 1
      })
    },

    undo: () => {
      const { snapshots, currentIndex } = get()
      if (currentIndex <= 0) {
        return null
      }

      const newIndex = currentIndex - 1
      set({ currentIndex: newIndex })
      return snapshots[newIndex]
    },

    redo: () => {
      const { snapshots, currentIndex } = get()
      if (currentIndex >= snapshots.length - 1) {
        return null
      }

      const newIndex = currentIndex + 1
      set({ currentIndex: newIndex })
      return snapshots[newIndex]
    },

    canUndo: () => {
      const { currentIndex } = get()
      return currentIndex > 0
    },

    canRedo: () => {
      const { snapshots, currentIndex } = get()
      return currentIndex < snapshots.length - 1
    },

    clear: () => {
      set({ snapshots: [], currentIndex: -1 })
    },

    getHistoryInfo: () => {
      const { snapshots, currentIndex } = get()
      return {
        current: currentIndex + 1,
        total: snapshots.length
      }
    }
  })
)

// Selector hooks
export const useLayoutHistory = () => {
  const saveSnapshot = useLayoutHistoryStore(s => s.saveSnapshot)
  const undo = useLayoutHistoryStore(s => s.undo)
  const redo = useLayoutHistoryStore(s => s.redo)
  const canUndo = useLayoutHistoryStore(s => s.canUndo)
  const canRedo = useLayoutHistoryStore(s => s.canRedo)
  const getHistoryInfo = useLayoutHistoryStore(s => s.getHistoryInfo)

  return { saveSnapshot, undo, redo, canUndo, canRedo, getHistoryInfo }
}
