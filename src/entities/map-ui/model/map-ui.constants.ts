import type { RelationType } from '@/entities/edge'
import type { NodeType } from '@/entities/node'

import type { GlobalUIPrefs, PerMapState } from './map-ui.types'

// --- Node & edge type lists ---

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

// --- Connection filter presets ---

export type ConnectionPreset = 'all' | 'leaves' | 'medium' | 'hubs'

export const CONNECTION_PRESETS: Record<ConnectionPreset, [number, number]> = {
  all: [0, Infinity],
  leaves: [0, 2],
  medium: [3, 4],
  hubs: [5, Infinity]
}

// --- Defaults ---

export const DEFAULT_PER_MAP: PerMapState = {
  activeTab: 'chat',
  viewMode: 'overview',
  focusedNodeId: null,
  focusDepth: 2,
  visibleNodeTypes: new Set(ALL_NODE_TYPES),
  visibleEdgeTypes: new Set(ALL_EDGE_TYPES),
  connectionRange: [0, Infinity],
  practiceActive: false
}

export const DEFAULT_PREFS: GlobalUIPrefs = {
  sidebarWidth: 400,
  sidebarOpen: false,
  showMinimap: true,
  nodeSpacing: 100,
  directionStrength: 0,
  animationDuration: 300
}

export const SIDEBAR_MIN_WIDTH = 360
export const SIDEBAR_MAX_WIDTH = 800
