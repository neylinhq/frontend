import type { Node } from '@/entities/map'

export function calculateDensity(nodeCount: number, edgeCount: number): number {
  if (nodeCount <= 1) return 0
  const maxPossibleEdges = (nodeCount * (nodeCount - 1)) / 2
  return (edgeCount / maxPossibleEdges) * 100
}

export function calculateGraphCenter(nodes: Node[]): { x: number; y: number } {
  if (nodes.length === 0) return { x: 0, y: 0 }

  const sum = nodes.reduce(
    (acc, node) => ({
      x: acc.x + node.position.x,
      y: acc.y + node.position.y
    }),
    { x: 0, y: 0 }
  )

  return {
    x: sum.x / nodes.length,
    y: sum.y / nodes.length
  }
}
