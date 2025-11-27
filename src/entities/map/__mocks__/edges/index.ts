export { NEURAL_NETWORKS_EDGES } from './neural-networks-edges.mock'
export { PHILOSOPHY_EDGES } from './philosophy-edges.mock'
export { GRAPH_THEORY_EDGES } from './graph-theory-edges.mock'

import { NEURAL_NETWORKS_EDGES } from './neural-networks-edges.mock'
import { PHILOSOPHY_EDGES } from './philosophy-edges.mock'
import { GRAPH_THEORY_EDGES } from './graph-theory-edges.mock'
import type { Edge } from '../../map.schema'

export const ALL_EDGES: Edge[] = [
  ...NEURAL_NETWORKS_EDGES,
  ...PHILOSOPHY_EDGES,
  ...GRAPH_THEORY_EDGES
]
