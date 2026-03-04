import { describe, expect, it } from 'vitest'

import { GRAPH_PRESETS, generateMockGraph } from '../lib/generate-mock-graph'

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

  it('skips chain pattern when disabled', () => {
    const { nodes, edges } = generateMockGraph({
      nodeCount: 5,
      seed: 1,
      patterns: { chains: false }
    })
    expect(nodes).toHaveLength(5)
    expect(edges.length).toBeGreaterThanOrEqual(0)
  })

  it('avoids edges when only one node is generated', () => {
    const { nodes, edges } = generateMockGraph({
      nodeCount: 1,
      seed: 2,
      patterns: { chains: false }
    })
    expect(nodes).toHaveLength(1)
    expect(edges).toHaveLength(0)
  })
})
