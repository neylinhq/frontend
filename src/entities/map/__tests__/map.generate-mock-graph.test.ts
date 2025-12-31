import { describe, expect, it } from 'vitest'
import { generateMockGraph, GRAPH_PRESETS } from '../lib/generate-mock-graph'

describe('generateMockGraph', () => {
  it('creates the requested number of nodes', () => {
    const { nodes, edges } = generateMockGraph({ nodeCount: 12, seed: 12345 })
    expect(nodes).toHaveLength(12)
    expect(edges.length).toBeGreaterThan(0)
  })

  it('ensures edges reference existing nodes', () => {
    const { nodes, edges } = generateMockGraph({ nodeCount: 8, seed: 999 })
    const ids = new Set(nodes.map(node => node.id))
    edges.forEach(edge => {
      expect(ids.has(edge.sourceNodeId)).toBe(true)
      expect(ids.has(edge.targetNodeId)).toBe(true)
    })
  })

  it('supports graph presets', () => {
    const { nodes } = generateMockGraph(GRAPH_PRESETS.small)
    expect(nodes).toHaveLength(10)
  })
})
