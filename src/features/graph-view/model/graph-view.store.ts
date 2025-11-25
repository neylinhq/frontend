import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { NodeType } from '@/entities/node'
import type { RelationType } from '@/entities/edge'

// View modes
export type ViewMode = 'overview' | 'focus' | 'path'

// All available types
export const ALL_NODE_TYPES: NodeType[] = ['concept', 'fact', 'theory', 'example', 'question', 'hypothesis', 'person', 'school']
export const ALL_EDGE_TYPES: RelationType[] = ['is-a', 'has-a', 'causes', 'explains', 'related-to', 'influences', 'part-of', 'prerequisite', 'contradicts', 'similar-to']

export interface GraphViewState {
  // View mode
  viewMode: ViewMode

  // Focus mode
  focusedNodeId: string | null
  focusDepth: number // 1-5

  // Filters
  visibleNodeTypes: Set<NodeType>
  visibleEdgeTypes: Set<RelationType>

  // UI
  showMinimap: boolean
}

interface GraphViewActions {
  // View mode
  setViewMode: (mode: ViewMode) => void

  // Focus
  focusNode: (nodeId: string) => void
  clearFocus: () => void
  setFocusDepth: (depth: number) => void

  // Filters
  toggleNodeType: (type: NodeType) => void
  toggleEdgeType: (type: RelationType) => void
  setAllNodeTypesVisible: (visible: boolean) => void
  setAllEdgeTypesVisible: (visible: boolean) => void
  resetFilters: () => void

  // UI
  toggleMinimap: () => void

  // Helpers
  getActiveFiltersCount: () => number
  isNodeTypeVisible: (type: NodeType) => boolean
  isEdgeTypeVisible: (type: RelationType) => boolean
}

const initialState: GraphViewState = {
  viewMode: 'overview',
  focusedNodeId: null,
  focusDepth: 2,
  visibleNodeTypes: new Set(ALL_NODE_TYPES),
  visibleEdgeTypes: new Set(ALL_EDGE_TYPES),
  showMinimap: true,
}

// Custom serializer for Sets
const setSerializer = {
  serialize: (state: GraphViewState) => ({
    ...state,
    visibleNodeTypes: Array.from(state.visibleNodeTypes),
    visibleEdgeTypes: Array.from(state.visibleEdgeTypes),
  }),
  deserialize: (stored: Record<string, unknown>): GraphViewState => ({
    viewMode: (stored.viewMode as ViewMode) || 'overview',
    focusedNodeId: (stored.focusedNodeId as string | null) || null,
    focusDepth: (stored.focusDepth as number) || 2,
    visibleNodeTypes: new Set((stored.visibleNodeTypes as NodeType[]) || ALL_NODE_TYPES),
    visibleEdgeTypes: new Set((stored.visibleEdgeTypes as RelationType[]) || ALL_EDGE_TYPES),
    showMinimap: stored.showMinimap !== false,
  }),
}

// Event for triggering layout recalculation
export const layoutEvent = new EventTarget()
export const triggerLayout = () => layoutEvent.dispatchEvent(new Event('layout'))

export const useGraphViewStore = create<GraphViewState & GraphViewActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // View mode
      setViewMode: (mode) => {
        set({ viewMode: mode })
        // Clear focus when switching away from focus mode
        if (mode !== 'focus') {
          set({ focusedNodeId: null })
        }
        triggerLayout()
      },

      // Focus actions
      focusNode: (nodeId) => {
        set({
          focusedNodeId: nodeId,
          viewMode: 'focus', // Auto-switch to focus mode
        })
        triggerLayout()
      },

      clearFocus: () => {
        set({ focusedNodeId: null })
        triggerLayout()
      },

      setFocusDepth: (depth) => {
        set({ focusDepth: Math.max(1, Math.min(5, depth)) })
        triggerLayout()
      },

      // Filter actions
      toggleNodeType: (type) => {
        const { visibleNodeTypes } = get()
        const newSet = new Set(visibleNodeTypes)
        if (newSet.has(type)) {
          // Don't allow removing all types
          if (newSet.size > 1) {
            newSet.delete(type)
          }
        } else {
          newSet.add(type)
        }
        set({ visibleNodeTypes: newSet })
      },

      toggleEdgeType: (type) => {
        const { visibleEdgeTypes } = get()
        const newSet = new Set(visibleEdgeTypes)
        if (newSet.has(type)) {
          newSet.delete(type)
        } else {
          newSet.add(type)
        }
        set({ visibleEdgeTypes: newSet })
      },

      setAllNodeTypesVisible: (visible) => {
        set({ visibleNodeTypes: visible ? new Set(ALL_NODE_TYPES) : new Set(['concept']) })
      },

      setAllEdgeTypesVisible: (visible) => {
        set({ visibleEdgeTypes: visible ? new Set(ALL_EDGE_TYPES) : new Set() })
      },

      resetFilters: () => {
        set({
          visibleNodeTypes: new Set(ALL_NODE_TYPES),
          visibleEdgeTypes: new Set(ALL_EDGE_TYPES),
        })
      },

      // UI
      toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),

      // Helpers
      getActiveFiltersCount: () => {
        const state = get()
        let count = 0
        if (state.visibleNodeTypes.size < ALL_NODE_TYPES.length) count++
        if (state.visibleEdgeTypes.size < ALL_EDGE_TYPES.length) count++
        return count
      },

      isNodeTypeVisible: (type) => get().visibleNodeTypes.has(type),
      isEdgeTypeVisible: (type) => get().visibleEdgeTypes.has(type),
    }),
    {
      name: 'graph-view-storage-v2', // New version to avoid conflicts with old storage
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          try {
            const parsed = JSON.parse(str)
            return {
              ...parsed,
              state: setSerializer.deserialize(parsed.state || {}),
            }
          } catch {
            return null
          }
        },
        setItem: (name, value) => {
          const serialized = {
            ...value,
            state: setSerializer.serialize(value.state as GraphViewState),
          }
          localStorage.setItem(name, JSON.stringify(serialized))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)

// Selector hooks (using useShallow to prevent infinite re-renders)
export const useViewMode = () => useGraphViewStore(
  useShallow((s) => ({
    viewMode: s.viewMode,
    setViewMode: s.setViewMode,
  }))
)

export const useFocusMode = () => useGraphViewStore(
  useShallow((s) => ({
    focusedNodeId: s.focusedNodeId,
    focusDepth: s.focusDepth,
    viewMode: s.viewMode,
    focusNode: s.focusNode,
    clearFocus: s.clearFocus,
    setFocusDepth: s.setFocusDepth,
  }))
)

export const useFilters = () => useGraphViewStore(
  useShallow((s) => ({
    visibleNodeTypes: s.visibleNodeTypes,
    visibleEdgeTypes: s.visibleEdgeTypes,
    toggleNodeType: s.toggleNodeType,
    toggleEdgeType: s.toggleEdgeType,
    setAllNodeTypesVisible: s.setAllNodeTypesVisible,
    setAllEdgeTypesVisible: s.setAllEdgeTypesVisible,
    resetFilters: s.resetFilters,
    getActiveFiltersCount: s.getActiveFiltersCount,
    isNodeTypeVisible: s.isNodeTypeVisible,
    isEdgeTypeVisible: s.isEdgeTypeVisible,
  }))
)

export const useGraphUI = () => useGraphViewStore(
  useShallow((s) => ({
    showMinimap: s.showMinimap,
    toggleMinimap: s.toggleMinimap,
  }))
)
