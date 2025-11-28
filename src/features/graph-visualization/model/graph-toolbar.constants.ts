import { Focus, type LucideIcon, Network, Route } from 'lucide-react'
import type { RelationType } from '@/entities/edge'
import type { NodeType } from '@/entities/node'
import type { ViewMode } from '@/features/graph-view'

// View mode icons and labels
export const VIEW_MODE_CONFIG: Record<ViewMode, { icon: typeof Network; labelKey: string }> = {
  overview: { icon: Network, labelKey: 'graph.viewModes.overview' },
  focus: { icon: Focus, labelKey: 'graph.viewModes.focus' },
  path: { icon: Route, labelKey: 'graph.viewModes.path' }
}

// Node type display names
export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  concept: 'graph.nodeTypes.concept',
  fact: 'graph.nodeTypes.fact',
  theory: 'graph.nodeTypes.theory',
  example: 'graph.nodeTypes.example',
  question: 'graph.nodeTypes.question',
  hypothesis: 'graph.nodeTypes.hypothesis',
  person: 'graph.nodeTypes.person',
  school: 'graph.nodeTypes.school'
}

// Edge type display names - use same keys as knowledge-edge.tsx
export const EDGE_TYPE_LABELS: Record<RelationType, string> = {
  'is-a': 'graph.edgeTypes.is-a',
  'has-a': 'graph.edgeTypes.has-a',
  causes: 'graph.edgeTypes.causes',
  explains: 'graph.edgeTypes.explains',
  'related-to': 'graph.edgeTypes.related-to',
  influences: 'graph.edgeTypes.influences',
  'part-of': 'graph.edgeTypes.part-of',
  prerequisite: 'graph.edgeTypes.prerequisite',
  contradicts: 'graph.edgeTypes.contradicts',
  'similar-to': 'graph.edgeTypes.similar-to'
}
