import type { RelationType } from '@/entities/edge'
import type { NodeType } from '@/entities/node'

// --- View modes ---

export type ViewMode = 'overview' | 'focus' | 'path'

export type MapSidebarTab = 'node' | 'chat' | 'practice' | 'settings'

// --- Per-map state ---

/**
 * UI state unique to each map. Keyed by mapId in the store.
 * When switching maps, each map restores its own state.
 */
export interface PerMapState {
  // Sidebar
  activeTab: MapSidebarTab

  // Graph view mode
  viewMode: ViewMode
  focusedNodeId: string | null
  focusDepth: number // 1-5

  // Graph filters
  visibleNodeTypes: Set<NodeType>
  visibleEdgeTypes: Set<RelationType>
  connectionRange: [number, number] // [min, max]

  // Practice
  practiceActive: boolean
}

// --- Global preferences ---

/**
 * User preferences shared across all maps.
 */
export interface GlobalUIPrefs {
  sidebarWidth: number
  sidebarOpen: boolean
  showMinimap: boolean
  nodeSpacing: number // 50-300
  directionStrength: number // 0-200
  animationDuration: number // 0-750
}
