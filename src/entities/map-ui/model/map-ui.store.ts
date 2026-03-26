import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { RelationType } from '@/entities/edge'
import type { NodeType } from '@/entities/node'

import {
  ALL_EDGE_TYPES,
  ALL_NODE_TYPES,
  DEFAULT_PER_MAP,
  DEFAULT_PREFS,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH
} from './map-ui.constants'
import type { GlobalUIPrefs, MapSidebarTab, PerMapState, ViewMode } from './map-ui.types'

// --- Store shape ---

interface MapUIState {
  maps: Record<string, PerMapState>
  prefs: GlobalUIPrefs
}

interface MapUIActions {
  // Read helper
  getMapState: (mapId: string) => PerMapState

  // Per-map setters — every action takes mapId explicitly
  setActiveTab: (mapId: string, tab: MapSidebarTab) => void
  setViewMode: (mapId: string, mode: ViewMode) => void
  focusNode: (mapId: string, nodeId: string) => void
  clearFocus: (mapId: string) => void
  setFocusDepth: (mapId: string, depth: number) => void
  toggleNodeType: (mapId: string, type: NodeType) => void
  toggleEdgeType: (mapId: string, type: RelationType) => void
  setAllNodeTypesVisible: (mapId: string, visible: boolean) => void
  setAllEdgeTypesVisible: (mapId: string, visible: boolean) => void
  setConnectionRange: (mapId: string, range: [number, number]) => void
  resetFilters: (mapId: string) => void
  // Global preference setters
  setSidebarWidth: (width: number) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  toggleMinimap: () => void
  setNodeSpacing: (spacing: number) => void
  setDirectionStrength: (strength: number) => void
  setAnimationDuration: (duration: number) => void
}

// --- Helpers ---

/** Stable default per-map state — reused for all maps that have no entry yet. */
const STABLE_DEFAULT: PerMapState = {
  ...DEFAULT_PER_MAP,
  visibleNodeTypes: new Set(ALL_NODE_TYPES),
  visibleEdgeTypes: new Set(ALL_EDGE_TYPES)
}

/**
 * Resolve per-map state. Returns stored entry directly (stable reference)
 * or the shared default object (also stable). Never creates new objects.
 */
function resolve(maps: Record<string, PerMapState>, mapId: string): PerMapState {
  return maps[mapId] ?? STABLE_DEFAULT
}

/** Create a full PerMapState from a partial (used during deserialization). */
function materialize(partial: Partial<PerMapState>): PerMapState {
  return {
    activeTab: partial.activeTab ?? DEFAULT_PER_MAP.activeTab,
    viewMode: partial.viewMode ?? DEFAULT_PER_MAP.viewMode,
    focusedNodeId: partial.focusedNodeId ?? DEFAULT_PER_MAP.focusedNodeId,
    focusDepth: partial.focusDepth ?? DEFAULT_PER_MAP.focusDepth,
    visibleNodeTypes: partial.visibleNodeTypes ?? new Set(ALL_NODE_TYPES),
    visibleEdgeTypes: partial.visibleEdgeTypes ?? new Set(ALL_EDGE_TYPES),
    connectionRange: partial.connectionRange ?? DEFAULT_PER_MAP.connectionRange
  }
}

function patchMap(
  state: MapUIState,
  mapId: string,
  patch: Partial<PerMapState>
): Pick<MapUIState, 'maps'> {
  const current = state.maps[mapId] ?? STABLE_DEFAULT
  return {
    maps: { ...state.maps, [mapId]: { ...current, ...patch } }
  }
}

// --- Serialization (Sets → Arrays, Infinity → string) ---

interface SerializedPerMap {
  activeTab?: MapSidebarTab
  focusDepth?: number
  visibleNodeTypes?: string[]
  visibleEdgeTypes?: string[]
  connectionRange?: [number, string | number]
}

function serializeMap(m: PerMapState): SerializedPerMap {
  return {
    activeTab: m.activeTab,
    focusDepth: m.focusDepth,
    visibleNodeTypes: Array.from(m.visibleNodeTypes),
    visibleEdgeTypes: Array.from(m.visibleEdgeTypes),
    connectionRange: [
      m.connectionRange[0],
      m.connectionRange[1] === Infinity ? 'Infinity' : m.connectionRange[1]
    ]
    // viewMode, focusedNodeId: session-only, not persisted
  }
}

function deserializeMap(s: SerializedPerMap): PerMapState {
  const partial: Partial<PerMapState> = {}
  if (s.activeTab) {
    partial.activeTab = s.activeTab
  }
  if (s.focusDepth) {
    partial.focusDepth = s.focusDepth
  }
  if (s.visibleNodeTypes?.length) {
    partial.visibleNodeTypes = new Set(s.visibleNodeTypes as NodeType[])
  }
  if (s.visibleEdgeTypes?.length) {
    partial.visibleEdgeTypes = new Set(s.visibleEdgeTypes as RelationType[])
  }
  if (s.connectionRange) {
    const max = s.connectionRange[1] === 'Infinity' ? Infinity : (s.connectionRange[1] as number)
    partial.connectionRange = [s.connectionRange[0] as number, max]
  }
  return materialize(partial)
}

// --- Store ---

export const useMapUIStore = create<MapUIState & MapUIActions>()(
  persist(
    (set, get) => ({
      maps: {},
      prefs: { ...DEFAULT_PREFS },

      getMapState: (mapId) => resolve(get().maps, mapId),

      // --- Per-map actions ---

      setActiveTab: (mapId, tab) => set((s) => patchMap(s, mapId, { activeTab: tab })),

      setViewMode: (mapId, mode) => {
        const patch: Partial<PerMapState> = { viewMode: mode }
        if (mode !== 'focus') {
          patch.focusedNodeId = null
        }
        set((s) => patchMap(s, mapId, patch))
      },

      focusNode: (mapId, nodeId) =>
        set((s) => patchMap(s, mapId, { focusedNodeId: nodeId, viewMode: 'focus' })),

      clearFocus: (mapId) =>
        set((s) => patchMap(s, mapId, { focusedNodeId: null, viewMode: 'overview' })),

      setFocusDepth: (mapId, depth) =>
        set((s) => patchMap(s, mapId, { focusDepth: Math.max(1, Math.min(5, depth)) })),

      toggleNodeType: (mapId, type) => {
        const current = resolve(get().maps, mapId)
        const next = new Set(current.visibleNodeTypes)
        if (next.has(type)) {
          if (next.size > 1) {
            next.delete(type)
          }
        } else {
          next.add(type)
        }
        set((s) => patchMap(s, mapId, { visibleNodeTypes: next }))
      },

      toggleEdgeType: (mapId, type) => {
        const current = resolve(get().maps, mapId)
        const next = new Set(current.visibleEdgeTypes)
        if (next.has(type)) {
          next.delete(type)
        } else {
          next.add(type)
        }
        set((s) => patchMap(s, mapId, { visibleEdgeTypes: next }))
      },

      setAllNodeTypesVisible: (mapId, visible) =>
        set((s) => patchMap(s, mapId, {
          visibleNodeTypes: visible ? new Set(ALL_NODE_TYPES) : new Set(['concept'] as NodeType[])
        })),

      setAllEdgeTypesVisible: (mapId, visible) =>
        set((s) => patchMap(s, mapId, {
          visibleEdgeTypes: visible ? new Set(ALL_EDGE_TYPES) : new Set<RelationType>()
        })),

      setConnectionRange: (mapId, range) =>
        set((s) => patchMap(s, mapId, { connectionRange: range })),

      resetFilters: (mapId) =>
        set((s) => patchMap(s, mapId, {
          visibleNodeTypes: new Set(ALL_NODE_TYPES),
          visibleEdgeTypes: new Set(ALL_EDGE_TYPES),
          connectionRange: [0, Infinity]
        })),

      // --- Global preference actions ---

      setSidebarWidth: (width) =>
        set((s) => ({ prefs: { ...s.prefs, sidebarWidth: Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width)) } })),

      setSidebarOpen: (open) =>
        set((s) => ({ prefs: { ...s.prefs, sidebarOpen: open } })),

      toggleSidebar: () =>
        set((s) => ({ prefs: { ...s.prefs, sidebarOpen: !s.prefs.sidebarOpen } })),

      toggleMinimap: () =>
        set((s) => ({ prefs: { ...s.prefs, showMinimap: !s.prefs.showMinimap } })),

      setNodeSpacing: (spacing) =>
        set((s) => ({ prefs: { ...s.prefs, nodeSpacing: Math.max(50, Math.min(300, spacing)) } })),

      setDirectionStrength: (strength) =>
        set((s) => ({ prefs: { ...s.prefs, directionStrength: Math.max(0, Math.min(200, strength)) } })),

      setAnimationDuration: (duration) =>
        set((s) => ({ prefs: { ...s.prefs, animationDuration: Math.max(0, Math.min(750, duration)) } }))
    }),
    {
      name: 'map-ui-v1',
      partialize: (state) => ({
        maps: Object.fromEntries(
          Object.entries(state.maps).map(([id, m]) => [id, serializeMap(m)])
        ),
        prefs: state.prefs
      }),
      merge: (persisted, current) => {
        const p = persisted as { maps?: Record<string, SerializedPerMap>; prefs?: GlobalUIPrefs } | undefined
        if (!p) {
          return current
        }
        const maps: Record<string, PerMapState> = {}
        if (p.maps) {
          for (const [id, s] of Object.entries(p.maps)) {
            maps[id] = deserializeMap(s)
          }
        }
        return {
          ...current,
          maps,
          prefs: p.prefs ? { ...DEFAULT_PREFS, ...p.prefs } : current.prefs
        }
      }
    }
  )
)
