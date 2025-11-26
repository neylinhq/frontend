import type { Node } from '@/entities/node'
import type { Edge, RelationType } from '@/entities/edge'

// All available types
const NODE_TYPES: Node['type'][] = [
  'concept', 'fact', 'theory', 'example',
  'question', 'hypothesis', 'person', 'school'
]

const EDGE_TYPES: RelationType[] = [
  'is-a', 'has-a', 'causes', 'explains', 'related-to',
  'influences', 'part-of', 'prerequisite', 'contradicts', 'similar-to'
]

const COMPLEXITIES: Node['metadata']['complexity'][] = ['basic', 'intermediate', 'advanced']

interface GeneratorOptions {
  nodeCount?: number
  mapId?: string
  seed?: number // For reproducible randomness
  patterns?: {
    chains?: boolean      // Linear sequences
    trees?: boolean       // Hierarchical structures
    cycles?: boolean      // Circular dependencies
    stars?: boolean       // Hub nodes with many connections
    diamonds?: boolean    // Converging/diverging paths
    isolated?: boolean    // Nodes without connections
    bidirectional?: boolean // Two-way edges
    dense?: boolean       // Highly connected clusters
  }
}

// Simple seeded random for reproducibility
function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

function pick<T>(arr: T[], random: () => number): T {
  return arr[Math.floor(random() * arr.length)]
}

function shuffle<T>(arr: T[], random: () => number): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function generateMockGraph(options: GeneratorOptions = {}): { nodes: Node[]; edges: Edge[] } {
  const {
    nodeCount = 30,
    mapId = 'test',
    seed = Date.now(),
    patterns = {
      chains: true,
      trees: true,
      cycles: true,
      stars: true,
      diamonds: true,
      isolated: true,
      bidirectional: true,
      dense: true,
    }
  } = options

  const random = createRandom(seed)
  const nodes: Node[] = []
  const edges: Edge[] = []
  const usedNodeIds = new Set<string>()

  let nodeIndex = 0
  let edgeIndex = 0

  const createNode = (label: string, type?: Node['type']): Node => {
    const id = `gen-${mapId}-${nodeIndex++}`
    usedNodeIds.add(id)

    const nodeType = type ?? pick(NODE_TYPES, random)
    const complexity = pick(COMPLEXITIES, random)

    return {
      id,
      mapId,
      label,
      description: `Описание для "${label}"`,
      type: nodeType,
      position: { x: 0, y: 0 }, // Layout will position
      metadata: {
        confidence: 0.5 + random() * 0.5,
        complexity,
        tags: [`tag-${Math.floor(random() * 5)}`],
        reviewCount: Math.floor(random() * 10),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  const createEdge = (
    sourceId: string,
    targetId: string,
    relationType?: RelationType,
    bidirectional = false
  ): Edge => {
    const id = `gen-edge-${mapId}-${edgeIndex++}`
    const type = relationType ?? pick(EDGE_TYPES, random)

    return {
      id,
      mapId,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      relationType: type,
      label: type,
      strength: 0.5 + random() * 0.5,
      bidirectional,
      metadata: {
        confidence: 0.7 + random() * 0.3,
        createdBy: 'ai',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  // Track remaining nodes to create
  let remaining = nodeCount

  // === PATTERN: Chain (linear sequence) ===
  if (patterns.chains && remaining >= 4) {
    const chainLength = Math.min(4, remaining)
    const chainNodes: Node[] = []

    for (let i = 0; i < chainLength; i++) {
      chainNodes.push(createNode(`Цепочка ${i + 1}`, 'concept'))
    }
    nodes.push(...chainNodes)
    remaining -= chainLength

    for (let i = 0; i < chainNodes.length - 1; i++) {
      edges.push(createEdge(chainNodes[i].id, chainNodes[i + 1].id, 'prerequisite'))
    }
  }

  // === PATTERN: Tree (hierarchical) ===
  if (patterns.trees && remaining >= 7) {
    const root = createNode('Корень дерева', 'theory')
    nodes.push(root)
    remaining--

    const children: Node[] = []
    for (let i = 0; i < 3 && remaining > 0; i++) {
      const child = createNode(`Ветка ${i + 1}`, 'concept')
      children.push(child)
      nodes.push(child)
      remaining--
      edges.push(createEdge(root.id, child.id, 'has-a'))
    }

    // Add grandchildren
    for (const child of children) {
      if (remaining <= 0) break
      const grandchild = createNode(`Лист от ${child.label}`, 'fact')
      nodes.push(grandchild)
      remaining--
      edges.push(createEdge(child.id, grandchild.id, 'is-a'))
    }
  }

  // === PATTERN: Cycle (circular) ===
  if (patterns.cycles && remaining >= 3) {
    const cycleLength = Math.min(3, remaining)
    const cycleNodes: Node[] = []

    for (let i = 0; i < cycleLength; i++) {
      cycleNodes.push(createNode(`Цикл ${i + 1}`, 'concept'))
    }
    nodes.push(...cycleNodes)
    remaining -= cycleLength

    for (let i = 0; i < cycleNodes.length; i++) {
      const next = (i + 1) % cycleNodes.length
      edges.push(createEdge(cycleNodes[i].id, cycleNodes[next].id, 'related-to'))
    }
  }

  // === PATTERN: Star (hub with spokes) ===
  if (patterns.stars && remaining >= 5) {
    const hub = createNode('Центр звезды', 'theory')
    nodes.push(hub)
    remaining--

    const spokeCount = Math.min(4, remaining)
    for (let i = 0; i < spokeCount; i++) {
      const spoke = createNode(`Луч ${i + 1}`, pick(['example', 'fact'], random))
      nodes.push(spoke)
      remaining--
      edges.push(createEdge(hub.id, spoke.id, pick(['explains', 'has-a', 'causes'], random)))
    }
  }

  // === PATTERN: Diamond (converging paths) ===
  if (patterns.diamonds && remaining >= 4) {
    const top = createNode('Вершина ромба', 'theory')
    const left = createNode('Левый путь', 'concept')
    const right = createNode('Правый путь', 'concept')
    const bottom = createNode('Низ ромба', 'example')

    nodes.push(top, left, right, bottom)
    remaining -= 4

    edges.push(createEdge(top.id, left.id, 'causes'))
    edges.push(createEdge(top.id, right.id, 'causes'))
    edges.push(createEdge(left.id, bottom.id, 'influences'))
    edges.push(createEdge(right.id, bottom.id, 'influences'))
  }

  // === PATTERN: Bidirectional edges ===
  if (patterns.bidirectional && remaining >= 2) {
    const nodeA = createNode('Взаимосвязь A', 'concept')
    const nodeB = createNode('Взаимосвязь B', 'concept')
    nodes.push(nodeA, nodeB)
    remaining -= 2

    edges.push(createEdge(nodeA.id, nodeB.id, 'similar-to', true))
  }

  // === PATTERN: Dense cluster ===
  if (patterns.dense && remaining >= 4) {
    const clusterSize = Math.min(4, remaining)
    const clusterNodes: Node[] = []

    for (let i = 0; i < clusterSize; i++) {
      clusterNodes.push(createNode(`Кластер ${i + 1}`, pick(NODE_TYPES, random)))
    }
    nodes.push(...clusterNodes)
    remaining -= clusterSize

    // Connect each node to 2-3 others
    for (let i = 0; i < clusterNodes.length; i++) {
      for (let j = i + 1; j < clusterNodes.length; j++) {
        if (random() > 0.3) { // 70% chance of edge
          edges.push(createEdge(
            clusterNodes[i].id,
            clusterNodes[j].id,
            pick(EDGE_TYPES, random)
          ))
        }
      }
    }
  }

  // === PATTERN: Isolated nodes ===
  if (patterns.isolated && remaining >= 2) {
    const isolatedCount = Math.min(2, remaining)
    for (let i = 0; i < isolatedCount; i++) {
      nodes.push(createNode(`Изолированный ${i + 1}`, 'hypothesis'))
      remaining--
    }
  }

  // === Fill remaining with random connections ===
  while (remaining > 0) {
    const node = createNode(`Узел ${nodeIndex}`, pick(NODE_TYPES, random))
    nodes.push(node)
    remaining--

    // Connect to 1-2 random existing nodes
    if (nodes.length > 1) {
      const connectCount = Math.min(1 + Math.floor(random() * 2), nodes.length - 1)
      const targets = shuffle(nodes.slice(0, -1), random).slice(0, connectCount)

      for (const target of targets) {
        if (random() > 0.5) {
          edges.push(createEdge(node.id, target.id, pick(EDGE_TYPES, random)))
        } else {
          edges.push(createEdge(target.id, node.id, pick(EDGE_TYPES, random)))
        }
      }
    }
  }

  return { nodes, edges }
}

// Preset configurations for common test scenarios
export const GRAPH_PRESETS = {
  small: { nodeCount: 10, seed: 12345 },
  medium: { nodeCount: 30, seed: 12345 },
  large: { nodeCount: 100, seed: 12345 },

  hierarchyOnly: {
    nodeCount: 15,
    seed: 12345,
    patterns: { trees: true, chains: true }
  },

  cyclesOnly: {
    nodeCount: 12,
    seed: 12345,
    patterns: { cycles: true, bidirectional: true }
  },

  denseCluster: {
    nodeCount: 20,
    seed: 12345,
    patterns: { dense: true, stars: true }
  },

  mixed: {
    nodeCount: 50,
    seed: 12345,
    patterns: {
      chains: true,
      trees: true,
      cycles: true,
      stars: true,
      diamonds: true,
      isolated: true,
      bidirectional: true,
      dense: true,
    }
  }
} as const
