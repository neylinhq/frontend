import { describe, expect, it, vi } from 'vitest'
import { GraphEngine } from '../lib/wasm-adapter'

describe('GraphEngine', () => {
  it('throws when used before init', () => {
    const engine = new GraphEngine()
    expect(() => engine.loadGraph([], [])).toThrow('Engine not initialized')
    expect(engine.nodeCount()).toBe(0)
  })

  it('loads graph data into wasm engine', () => {
    const engine = new GraphEngine() as GraphEngine & { wasmEngine: { load_graph: (json: string) => void } }
    const load_graph = vi.fn()
    engine.wasmEngine = { load_graph }

    const nodes = [
      {
        id: 'node-1',
        mapId: 'map-1',
        label: 'Node 1',
        type: 'concept',
        position: { x: 1, y: 2 },
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]

    const edges = [
      {
        id: 'edge-1',
        mapId: 'map-1',
        sourceNodeId: 'node-1',
        targetNodeId: 'node-2',
        relationType: 'related-to',
        strength: 0.5,
        bidirectional: false,
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]

    engine.loadGraph(nodes, edges)
    expect(load_graph).toHaveBeenCalled()
  })

  it('disposes internal state', () => {
    const engine = new GraphEngine() as GraphEngine & { wasmEngine: unknown }
    engine.wasmEngine = {}
    engine.dispose()
    expect(engine.wasmEngine).toBeNull()
  })
})
