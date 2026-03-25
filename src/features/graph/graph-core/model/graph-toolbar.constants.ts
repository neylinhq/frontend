import { Dataflow03Icon, RouteIcon, Target01Icon } from '@untitledui/icons-react/outline'
import type { ComponentType, SVGProps } from 'react'

import type { RelationType } from '@/entities/edge'
import type { ViewMode } from '@/entities/map-ui'
import type { NodeType } from '@/entities/node'

// View mode icons and labels
export const VIEW_MODE_CONFIG: Record<
  ViewMode,
  { icon: ComponentType<SVGProps<SVGSVGElement>>; labelKey: string }
> = {
  overview: { icon: Dataflow03Icon, labelKey: 'graph.viewModes.overview' },
  focus: { icon: Target01Icon, labelKey: 'graph.viewModes.focus' },
  path: { icon: RouteIcon, labelKey: 'graph.viewModes.path' }
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
