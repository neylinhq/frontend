import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { RelationType } from '@/entities/edge'
import type { NodeType } from '@/entities/node'

// View modes
export type ViewMode = 'overview' | 'focus' | 'path'

// All available types
export const ALL_NODE_TYPES: NodeType[] = [
  'concept',
  'fact',
  'theory',
  'example',
  'question',
  'hypothesis',
  'person',
  'school'
]
export const ALL_EDGE_TYPES: RelationType[] = [
  'is-a',
  'has-a',
  'causes',
  'explains',
  'related-to',
  'influences',
  'part-of',
  'prerequisite',
  'contradicts',
  'similar-to'
]

// Connection filter presets
export type ConnectionPreset = 'all' | 'leaves' | 'medium' | 'hubs'

export const CONNECTION_PRESETS: Record<ConnectionPreset, [number, number]> = {
  all: [0, Infinity],
  leaves: [0, 2],
  medium: [3, 4],
  hubs: [5, Infinity]
}

export interface GraphViewState {
  // View mode
  viewMode: ViewMode

  // Focus mode
  focusedNodeId: string | null
  focusDepth: number // 1-5

  // Filters
  visibleNodeTypes: Set<NodeType>
  visibleEdgeTypes: Set<RelationType>
  connectionRange: [number, number] // [min, max] connections filter

  // UI
  showMinimap: boolean

  // Layout
  nodeSpacing: number // 50-200%, default 100
  directionStrength: number // 0-200, default 100
  animationDuration: number // 0-750ms, default 300
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
  setConnectionRange: (range: [number, number]) => void
  setConnectionPreset: (preset: ConnectionPreset) => void
  resetFilters: () => void

  // UI
  toggleMinimap: () => void

  // Layout
  setNodeSpacing: (spacing: number) => void
  setDirectionStrength: (strength: number) => void
  setAnimationDuration: (duration: number) => void

  // Helpers
  getActiveFiltersCount: () => number
  isNodeTypeVisible: (type: NodeType) => boolean
  isEdgeTypeVisible: (type: RelationType) => boolean
  getActiveConnectionPreset: () => ConnectionPreset | null
}

const initialState: GraphViewState = {
  viewMode: 'overview',
  focusedNodeId: null,
  focusDepth: 2,
  visibleNodeTypes: new Set(ALL_NODE_TYPES),
  visibleEdgeTypes: new Set(ALL_EDGE_TYPES),
  connectionRange: [0, Infinity],
  showMinimap: true,
  nodeSpacing: 100,
  directionStrength: 0, // 0 = no directional bias, 100 = full hierarchy
  animationDuration: 300
}

// Custom serializer for Sets and Infinity values
const setSerializer = {
  serialize: (state: GraphViewState) => ({
    ...state,
    visibleNodeTypes: Array.from(state.visibleNodeTypes),
    visibleEdgeTypes: Array.from(state.visibleEdgeTypes),
    // Serialize Infinity as string since JSON doesn't support it
    connectionRange: [
      state.connectionRange[0],
      state.connectionRange[1] === Infinity ? 'Infinity' : state.connectionRange[1]
    ]
  }),
  deserialize: (stored: Record<string, unknown>): GraphViewState => {
    // Parse connectionRange, handling "Infinity" string and null/undefined
    const storedRange = stored.connectionRange as [number, string | number | null] | undefined
    let connectionRange: [number, number] = [0, Infinity]
    if (storedRange) {
      const min = typeof storedRange[0] === 'number' ? storedRange[0] : 0
      const max =
        storedRange[1] === 'Infinity' || storedRange[1] === null || storedRange[1] === undefined
          ? Infinity
          : (storedRange[1] as number)
      connectionRange = [min, max]
    }

    return {
      viewMode: (stored.viewMode as ViewMode) || 'overview',
      focusedNodeId: (stored.focusedNodeId as string | null) || null,
      focusDepth: (stored.focusDepth as number) || 2,
      visibleNodeTypes: new Set(
        (stored.visibleNodeTypes as NodeType[])?.length
          ? (stored.visibleNodeTypes as NodeType[])
          : ALL_NODE_TYPES
      ),
      visibleEdgeTypes: new Set(
        (stored.visibleEdgeTypes as RelationType[])?.length
          ? (stored.visibleEdgeTypes as RelationType[])
          : ALL_EDGE_TYPES
      ),
      connectionRange,
      showMinimap: stored.showMinimap !== false,
      nodeSpacing: (stored.nodeSpacing as number) || 100,
      directionStrength: (stored.directionStrength as number) ?? 0,
      animationDuration: (stored.animationDuration as number) || 300
    }
  }
}

// Event for triggering layout recalculation
export const layoutEvent = new EventTarget()
export const triggerLayout = (options?: {
  fitView?: boolean
  useAnchor?: boolean
  animated?: boolean
}) => {
  const event = new CustomEvent('layout', {
    detail: {
      fitView: options?.fitView ?? true,
      useAnchor: options?.useAnchor ?? false,
      animated: options?.animated ?? false
    }
  })
  layoutEvent.dispatchEvent(event)
}

export const useGraphViewStore = create<GraphViewState & GraphViewActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // View mode
      setViewMode: mode => {
        set({ viewMode: mode })
        // Clear focus when switching away from focus mode
        if (mode !== 'focus') {
          set({ focusedNodeId: null })
        }
        // Trigger layout recalculation when switching modes
        // Different modes use different layout algorithms
        // Don't fitView - preserve current zoom level
        setTimeout(() => triggerLayout({ fitView: false, useAnchor: true, animated: true }), 0)
      },

      // Focus actions - no auto layout, sync effect handles visual updates
      focusNode: nodeId => {
        set({
          focusedNodeId: nodeId,
          viewMode: 'focus' // Auto-switch to focus mode
        })
      },

      clearFocus: () => {
        set({ focusedNodeId: null })
        triggerLayout()
      },

      setFocusDepth: depth => {
        // Just update state - the graph component's useEffect handles
        // re-layout when the visible node set changes
        set({ focusDepth: Math.max(1, Math.min(5, depth)) })
      },

      // Filter actions
      toggleNodeType: type => {
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

      toggleEdgeType: type => {
        const { visibleEdgeTypes } = get()
        const newSet = new Set(visibleEdgeTypes)
        if (newSet.has(type)) {
          newSet.delete(type)
        } else {
          newSet.add(type)
        }
        set({ visibleEdgeTypes: newSet })
      },

      setAllNodeTypesVisible: visible => {
        set({ visibleNodeTypes: visible ? new Set(ALL_NODE_TYPES) : new Set(['concept']) })
      },

      setAllEdgeTypesVisible: visible => {
        set({ visibleEdgeTypes: visible ? new Set(ALL_EDGE_TYPES) : new Set() })
      },

      setConnectionRange: range => {
        set({ connectionRange: range })
      },

      setConnectionPreset: preset => {
        set({ connectionRange: CONNECTION_PRESETS[preset] })
      },

      resetFilters: () => {
        set({
          visibleNodeTypes: new Set(ALL_NODE_TYPES),
          visibleEdgeTypes: new Set(ALL_EDGE_TYPES),
          connectionRange: [0, Infinity]
        })
      },

      // UI
      toggleMinimap: () => set(s => ({ showMinimap: !s.showMinimap })),

      // Layout - defer triggerLayout to next tick so React can update refs first
      // anchorToCenter: true to keep focus on the node closest to viewport center
      // animated: true for smooth transition when slider changes
      setNodeSpacing: spacing => {
        set({ nodeSpacing: Math.max(50, Math.min(300, spacing)) })
        setTimeout(() => triggerLayout({ fitView: false, useAnchor: true, animated: true }), 0)
      },

      setDirectionStrength: strength => {
        set({ directionStrength: Math.max(0, Math.min(200, strength)) })
        setTimeout(() => triggerLayout({ fitView: false, useAnchor: true, animated: true }), 0)
      },

      setAnimationDuration: duration => {
        set({ animationDuration: Math.max(0, Math.min(750, duration)) })
      },

      // Helpers
      getActiveFiltersCount: () => {
        const state = get()
        let count = 0
        if (state.visibleNodeTypes.size < ALL_NODE_TYPES.length) {
          count++
        }
        if (state.visibleEdgeTypes.size < ALL_EDGE_TYPES.length) {
          count++
        }
        // Connection filter is active if not "all"
        if (state.connectionRange[0] !== 0 || state.connectionRange[1] !== Infinity) {
          count++
        }
        return count
      },

      isNodeTypeVisible: type => get().visibleNodeTypes.has(type),
      isEdgeTypeVisible: type => get().visibleEdgeTypes.has(type),

      getActiveConnectionPreset: () => {
        const { connectionRange } = get()
        for (const [preset, range] of Object.entries(CONNECTION_PRESETS) as [
          ConnectionPreset,
          [number, number]
        ][]) {
          if (connectionRange[0] === range[0] && connectionRange[1] === range[1]) {
            return preset
          }
        }
        return null
      }
    }),
    {
      name: 'graph-view-storage-v3', // v3: Fix Infinity serialization in connectionRange
      storage: {
        getItem: name => {
          const str = localStorage.getItem(name)
          if (!str) {
            return null
          }
          try {
            const parsed = JSON.parse(str)
            return {
              ...parsed,
              state: setSerializer.deserialize(parsed.state || {})
            }
          } catch {
            return null
          }
        },
        setItem: (name, value) => {
          const serialized = {
            ...value,
            state: setSerializer.serialize(value.state as GraphViewState)
          }
          localStorage.setItem(name, JSON.stringify(serialized))
        },
        removeItem: name => localStorage.removeItem(name)
      }
    }
  )
)

// Selector hooks (using useShallow to prevent infinite re-renders)
export const useViewMode = () =>
  useGraphViewStore(
    useShallow(s => ({
      viewMode: s.viewMode,
      setViewMode: s.setViewMode
    }))
  )

export const useFocusMode = () =>
  useGraphViewStore(
    useShallow(s => ({
      focusedNodeId: s.focusedNodeId,
      focusDepth: s.focusDepth,
      viewMode: s.viewMode,
      focusNode: s.focusNode,
      clearFocus: s.clearFocus,
      setFocusDepth: s.setFocusDepth
    }))
  )

export const useFilters = () =>
  useGraphViewStore(
    useShallow(s => ({
      visibleNodeTypes: s.visibleNodeTypes,
      visibleEdgeTypes: s.visibleEdgeTypes,
      connectionRange: s.connectionRange,
      toggleNodeType: s.toggleNodeType,
      toggleEdgeType: s.toggleEdgeType,
      setAllNodeTypesVisible: s.setAllNodeTypesVisible,
      setAllEdgeTypesVisible: s.setAllEdgeTypesVisible,
      setConnectionRange: s.setConnectionRange,
      setConnectionPreset: s.setConnectionPreset,
      resetFilters: s.resetFilters,
      getActiveFiltersCount: s.getActiveFiltersCount,
      isNodeTypeVisible: s.isNodeTypeVisible,
      isEdgeTypeVisible: s.isEdgeTypeVisible,
      getActiveConnectionPreset: s.getActiveConnectionPreset
    }))
  )

export const useGraphUI = () =>
  useGraphViewStore(
    useShallow(s => ({
      showMinimap: s.showMinimap,
      toggleMinimap: s.toggleMinimap
    }))
  )

export const useNodeSpacing = () =>
  useGraphViewStore(
    useShallow(s => ({
      nodeSpacing: s.nodeSpacing,
      setNodeSpacing: s.setNodeSpacing,
      directionStrength: s.directionStrength,
      setDirectionStrength: s.setDirectionStrength,
      animationDuration: s.animationDuration,
      setAnimationDuration: s.setAnimationDuration
    }))
  )
