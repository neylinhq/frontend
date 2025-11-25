import type { Node, Edge } from '@xyflow/react'
import ELK from 'elkjs/lib/elk.bundled'
import dagre from 'dagre'
import type { LayoutState } from '../store/graph-view-store'

const elk = new ELK()

/**
 * Apply ELK hierarchical layout
 */
export async function applyElkLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutState
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': options.direction,
      'elk.spacing.nodeNode': String(options.nodeSpacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(options.rankSpacing),
      'elk.edgeRouting': 'ORTHOGONAL'
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: node.width ?? 200,
      height: node.height ?? 100
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target]
    }))
  }

  const layout = await elk.layout(graph)

  const layoutedNodes = nodes.map((node) => {
    const layoutedNode = layout.children?.find((n) => n.id === node.id)
    return {
      ...node,
      position: {
        x: layoutedNode?.x ?? node.position.x,
        y: layoutedNode?.y ?? node.position.y
      }
    }
  })

  return { nodes: layoutedNodes, edges }
}

/**
 * Apply Dagre hierarchical layout
 */
export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutState
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: options.direction,
    nodesep: options.nodeSpacing,
    ranksep: options.rankSpacing
  })

  nodes.forEach((node) => {
    g.setNode(node.id, { width: node.width ?? 200, height: node.height ?? 100 })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id)
    return {
      ...node,
      position: {
        x: dagreNode.x - (node.width ?? 200) / 2,
        y: dagreNode.y - (node.height ?? 100) / 2
      }
    }
  })

  return { nodes: layoutedNodes, edges }
}

/**
 * Apply simple grid layout
 */
export function applyGridLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutState
): { nodes: Node[]; edges: Edge[] } {
  const cols = Math.ceil(Math.sqrt(nodes.length))
  const cellWidth = 250
  const cellHeight = 150

  const layoutedNodes = nodes.map((node, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)

    return {
      ...node,
      position: {
        x: col * cellWidth,
        y: row * cellHeight
      }
    }
  })

  return { nodes: layoutedNodes, edges }
}

/**
 * Apply radial layout (focus node in center)
 */
export function applyRadialLayout(
  nodes: Node[],
  edges: Edge[],
  focusNodeId: string | null,
  options: LayoutState
): { nodes: Node[]; edges: Edge[] } {
  if (!focusNodeId) {
    return applyGridLayout(nodes, edges, options)
  }

  const centerNode = nodes.find((n) => n.id === focusNodeId)
  if (!centerNode) {
    return applyGridLayout(nodes, edges, options)
  }

  // Build adjacency list
  const adjacency = new Map<string, string[]>()
  nodes.forEach((node) => adjacency.set(node.id, []))
  edges.forEach((edge) => {
    adjacency.get(edge.source)?.push(edge.target)
    adjacency.get(edge.target)?.push(edge.source)
  })

  // BFS to calculate distances from center
  const distances = new Map<string, number>()
  const queue: string[] = [focusNodeId]
  distances.set(focusNodeId, 0)

  while (queue.length > 0) {
    const current = queue.shift()!
    const currentDist = distances.get(current)!

    adjacency.get(current)?.forEach((neighbor) => {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, currentDist + 1)
        queue.push(neighbor)
      }
    })
  }

  // Group nodes by distance
  const layers = new Map<number, string[]>()
  nodes.forEach((node) => {
    const dist = distances.get(node.id) ?? 999
    if (!layers.has(dist)) {
      layers.set(dist, [])
    }
    layers.get(dist)?.push(node.id)
  })

  // Layout nodes in concentric circles
  const layoutedNodes = nodes.map((node) => {
    if (node.id === focusNodeId) {
      return {
        ...node,
        position: { x: 0, y: 0 }
      }
    }

    const dist = distances.get(node.id) ?? 999
    const layer = layers.get(dist) ?? []
    const index = layer.indexOf(node.id)
    const total = layer.length

    const radius = dist * 300
    const angle = (index / total) * 2 * Math.PI

    return {
      ...node,
      position: {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      }
    }
  })

  return { nodes: layoutedNodes, edges }
}

/**
 * Apply layout based on algorithm
 */
export async function applyLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutState,
  focusNodeId: string | null = null
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  switch (options.algorithm) {
    case 'elk':
      return applyElkLayout(nodes, edges, options)
    case 'dagre':
      return applyDagreLayout(nodes, edges, options)
    case 'radial':
      return applyRadialLayout(nodes, edges, focusNodeId, options)
    case 'grid':
      return applyGridLayout(nodes, edges, options)
    case 'force':
      // Force-directed is handled by reactflow itself
      return { nodes, edges }
    default:
      return { nodes, edges }
  }
}
