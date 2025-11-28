export { GRAPH_THEORY_NODES } from './graph-theory.mock'
export { NEURAL_NETWORKS_NODES } from './neural-networks.mock'
export { PHILOSOPHY_NODES } from './philosophy.mock'

import type { Node } from '../../map.schema'
import { GRAPH_THEORY_NODES } from './graph-theory.mock'
import { NEURAL_NETWORKS_NODES } from './neural-networks.mock'
import { PHILOSOPHY_NODES } from './philosophy.mock'

export const ALL_NODES: Node[] = [
  ...NEURAL_NETWORKS_NODES,
  ...PHILOSOPHY_NODES,
  ...GRAPH_THEORY_NODES
]
