import { describe, expect, it, vi } from 'vitest'

const loadGraphEngine = async () => {
  const mod = await import('../lib/wasm-adapter')
  return mod.GraphEngine
}

describe('GraphEngine', () => {
  it('throws when used before init', async () => {
    const GraphEngine = await loadGraphEngine()
    const engine = new GraphEngine()

    const actions = [
      () => engine.loadGraph([], []),
      () => engine.runLayout('{}'),
      () => engine.render(),
      () => engine.pan(1, 1),
      () => engine.zoomAt(1, 1, 1),
      () => engine.getZoom(),
      () => engine.fitView(1),
      () => engine.resize(1, 1),
      () => engine.setSelected(null),
      () => engine.setFocused('node-1'),
      () => engine.setDimmed(['node-1']),
      () => engine.hitTest(1, 1),
      () => engine.setTheme('{}'),
      () => engine.loadFontAtlasData(new Uint8Array(), 1, 1, '{}'),
      () => engine.loadIconAtlasData(new Uint8Array(), 1, 1, '{}')
    ]

    actions.forEach(action => expect(action).toThrow('Engine not initialized'))
    expect(engine.nodeCount()).toBe(0)
    expect(engine.edgeCount()).toBe(0)
  })

  it('initializes wasm engine', async () => {
    vi.resetModules()
    const initWasmModule = vi.fn().mockResolvedValue(undefined)
    const init_renderer = vi.fn()
    const GraphEngineCtor = vi.fn(function GraphEngineCtor(this: {
      init_renderer: typeof init_renderer
    }) {
      this.init_renderer = init_renderer
    })

    vi.doMock('../lib/wasm-loader', () => ({ initWasmModule }))
    vi.doMock('../wasm/graph_engine', () => ({
      default: vi.fn().mockResolvedValue(undefined),
      GraphEngine: GraphEngineCtor
    }))

    const { GraphEngine } = await import('../lib/wasm-adapter')
    const engine = new GraphEngine()
    const canvas = document.createElement('canvas')

    await engine.init(canvas)

    expect(initWasmModule).toHaveBeenCalled()
    expect(GraphEngineCtor).toHaveBeenCalled()
    expect(init_renderer).toHaveBeenCalledWith(canvas)
  })

  it('throws on init errors', async () => {
    vi.resetModules()
    vi.doMock('../lib/wasm-loader', () => ({
      initWasmModule: vi.fn().mockRejectedValue(new Error('boom'))
    }))
    vi.doMock('../wasm/graph_engine', () => ({
      default: vi.fn().mockResolvedValue(undefined),
      GraphEngine: vi.fn()
    }))

    const { GraphEngine } = await import('../lib/wasm-adapter')
    const engine = new GraphEngine()

    await expect(engine.init(document.createElement('canvas'))).rejects.toThrow(
      'Failed to initialize WASM engine:'
    )
  })

  it('delegates to wasm engine when initialized', async () => {
    const GraphEngine = await loadGraphEngine()
    const engine = new GraphEngine() as GraphEngine & { wasmEngine: unknown }

    const wasmEngine = {
      load_graph: vi.fn(),
      run_layout: vi.fn().mockReturnValue('layout'),
      render: vi.fn(),
      pan: vi.fn(),
      zoom_at: vi.fn(),
      get_zoom: vi.fn().mockReturnValue(2),
      fit_view: vi.fn(),
      resize: vi.fn().mockReturnValue(true),
      set_selected: vi.fn(),
      set_focused: vi.fn(),
      set_dimmed: vi.fn(),
      hit_test: vi.fn().mockReturnValue('node-1'),
      node_count: vi.fn().mockReturnValue(3),
      edge_count: vi.fn().mockReturnValue(2),
      set_theme: vi.fn(),
      load_font_atlas_data: vi.fn(),
      load_icon_atlas_data: vi.fn()
    }

    engine.wasmEngine = wasmEngine

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
        strength: 0.7,
        bidirectional: true,
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'edge-2',
        mapId: 'map-1',
        sourceNodeId: 'node-2',
        targetNodeId: 'node-3',
        relationType: 'related-to',
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]

    engine.loadGraph(nodes, edges)
    const payload = JSON.parse(wasmEngine.load_graph.mock.calls[0][0]) as {
      nodes: Array<{ size: { width: number; height: number } }>
      edges: Array<{ strength: number; bidirectional: boolean }>
    }
    expect(payload.nodes[0].size).toEqual({ width: 180, height: 100 })
    expect(payload.edges[0].strength).toBe(0.7)
    expect(payload.edges[0].bidirectional).toBe(true)
    expect(payload.edges[1].strength).toBe(0.5)
    expect(payload.edges[1].bidirectional).toBe(false)

    expect(engine.runLayout('{}')).toBe('layout')
    engine.render()
    engine.pan(1, 2)
    engine.zoomAt(1, 2, 1.1)
    expect(engine.getZoom()).toBe(2)
    engine.fitView(10)
    expect(engine.resize(100, 200)).toBe(true)
    engine.setSelected('node-1')
    engine.setFocused('node-2')
    engine.setDimmed(['node-1', 'node-2'])
    expect(engine.hitTest(1, 1)).toBe('node-1')
    expect(engine.nodeCount()).toBe(3)
    expect(engine.edgeCount()).toBe(2)
    engine.setTheme('{}')
    engine.loadFontAtlasData(new Uint8Array([1]), 1, 1, '{}')
    engine.loadIconAtlasData(new Uint8Array([1]), 1, 1, '{}')

    expect(wasmEngine.set_dimmed).toHaveBeenCalledWith(JSON.stringify(['node-1', 'node-2']))
  })

  it('disposes internal state', async () => {
    const GraphEngine = await loadGraphEngine()
    const engine = new GraphEngine() as GraphEngine & {
      wasmEngine: unknown
      wasmModule: unknown
      canvas: unknown
    }
    engine.wasmEngine = {}
    engine.wasmModule = {}
    engine.canvas = {}
    engine.dispose()
    expect(engine.wasmEngine).toBeNull()
    expect(engine.wasmModule).toBeNull()
    expect(engine.canvas).toBeNull()
  })
})
