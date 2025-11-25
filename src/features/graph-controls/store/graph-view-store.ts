import { create } from 'zustand'
import type { RelationType } from '@/entities/edge'

export type LayoutAlgorithm = 'elk' | 'dagre' | 'force' | 'radial' | 'grid'
export type LayoutDirection = 'TB' | 'LR' | 'BT' | 'RL'

export interface FilterState {
  // Focus mode
  focusNodeId: string | null
  focusDepth: number | null
  showUnconnected: boolean

  // Node filters
  visibleNodeTypes: Set<string>
  searchQuery: string
  minConfidence: number
  maxConfidence: number
  showIsolated: boolean

  // Edge filters
  visibleEdgeTypes: Set<RelationType>
  edgeDirection: 'all' | 'incoming' | 'outgoing'

  // Topology filters
  minConnections: number | null
  maxConnections: number | null
}

export interface LayoutState {
  algorithm: LayoutAlgorithm
  direction: LayoutDirection
  animated: boolean
  nodeSpacing: number
  rankSpacing: number
}

export interface GraphViewState {
  // State
  filters: FilterState
  layout: LayoutState
  isFilterPanelOpen: boolean

  // Filter actions
  setFocusMode: (nodeId: string | null, depth?: number) => void
  setSearchQuery: (query: string) => void
  toggleNodeType: (type: string) => void
  toggleEdgeType: (type: RelationType) => void
  setConfidenceRange: (min: number, max: number) => void
  setConnectionRange: (min: number | null, max: number | null) => void
  toggleShowIsolated: () => void
  toggleShowUnconnected: () => void
  setEdgeDirection: (direction: 'all' | 'incoming' | 'outgoing') => void
  resetFilters: () => void

  // Layout actions
  setLayout: (algorithm: LayoutAlgorithm) => void
  setLayoutDirection: (direction: LayoutDirection) => void
  toggleAnimation: () => void
  setSpacing: (nodeSpacing: number, rankSpacing: number) => void

  // UI actions
  toggleFilterPanel: () => void

  // Presets
  savePreset: (name: string) => void
  loadPreset: (name: string) => void
  getPresets: () => string[]
}

const defaultFilters: FilterState = {
  focusNodeId: null,
  focusDepth: null,
  showUnconnected: true,
  visibleNodeTypes: new Set(),
  searchQuery: '',
  minConfidence: 0,
  maxConfidence: 100,
  showIsolated: true,
  visibleEdgeTypes: new Set([
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
  ]),
  edgeDirection: 'all',
  minConnections: null,
  maxConnections: null
}

const defaultLayout: LayoutState = {
  algorithm: 'elk',
  direction: 'TB',
  animated: true,
  nodeSpacing: 50,
  rankSpacing: 80
}

export const useGraphViewStore = create<GraphViewState>((set, get) => ({
  // Initial state
  filters: defaultFilters,
  layout: defaultLayout,
  isFilterPanelOpen: false,

  // Filter actions
  setFocusMode: (nodeId, depth = 1) =>
    set((state) => ({
      filters: {
        ...state.filters,
        focusNodeId: nodeId,
        focusDepth: nodeId ? depth : null,
        showUnconnected: nodeId ? false : true
      }
    })),

  setSearchQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query }
    })),

  toggleNodeType: (type) =>
    set((state) => {
      const newTypes = new Set(state.filters.visibleNodeTypes)
      if (newTypes.has(type)) {
        newTypes.delete(type)
      } else {
        newTypes.add(type)
      }
      return { filters: { ...state.filters, visibleNodeTypes: newTypes } }
    }),

  toggleEdgeType: (type) =>
    set((state) => {
      const newTypes = new Set(state.filters.visibleEdgeTypes)
      if (newTypes.has(type)) {
        newTypes.delete(type)
      } else {
        newTypes.add(type)
      }
      return { filters: { ...state.filters, visibleEdgeTypes: newTypes } }
    }),

  setConfidenceRange: (min, max) =>
    set((state) => ({
      filters: { ...state.filters, minConfidence: min, maxConfidence: max }
    })),

  setConnectionRange: (min, max) =>
    set((state) => ({
      filters: { ...state.filters, minConnections: min, maxConnections: max }
    })),

  toggleShowIsolated: () =>
    set((state) => ({
      filters: { ...state.filters, showIsolated: !state.filters.showIsolated }
    })),

  toggleShowUnconnected: () =>
    set((state) => ({
      filters: { ...state.filters, showUnconnected: !state.filters.showUnconnected }
    })),

  setEdgeDirection: (direction) =>
    set((state) => ({
      filters: { ...state.filters, edgeDirection: direction }
    })),

  resetFilters: () =>
    set(() => ({
      filters: defaultFilters
    })),

  // Layout actions
  setLayout: (algorithm) =>
    set((state) => ({
      layout: { ...state.layout, algorithm }
    })),

  setLayoutDirection: (direction) =>
    set((state) => ({
      layout: { ...state.layout, direction }
    })),

  toggleAnimation: () =>
    set((state) => ({
      layout: { ...state.layout, animated: !state.layout.animated }
    })),

  setSpacing: (nodeSpacing, rankSpacing) =>
    set((state) => ({
      layout: { ...state.layout, nodeSpacing, rankSpacing }
    })),

  // UI actions
  toggleFilterPanel: () =>
    set((state) => ({
      isFilterPanelOpen: !state.isFilterPanelOpen
    })),

  // Presets (simplified, could store in localStorage)
  savePreset: (name) => {
    const { filters } = get()
    const presets = JSON.parse(localStorage.getItem('graph-filter-presets') || '{}')
    presets[name] = filters
    localStorage.setItem('graph-filter-presets', JSON.stringify(presets))
  },

  loadPreset: (name) => {
    const presets = JSON.parse(localStorage.getItem('graph-filter-presets') || '{}')
    if (presets[name]) {
      set(() => ({
        filters: {
          ...presets[name],
          visibleNodeTypes: new Set(presets[name].visibleNodeTypes),
          visibleEdgeTypes: new Set(presets[name].visibleEdgeTypes)
        }
      }))
    }
  },

  getPresets: () => {
    const presets = JSON.parse(localStorage.getItem('graph-filter-presets') || '{}')
    return Object.keys(presets)
  }
}))
