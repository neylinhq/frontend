# 06. Frontend Integration

## Overview

Интеграция WASM engine в React приложение через Feature-Sliced Design.

```
┌─────────────────────────────────────────────────────────────┐
│                    features/graph-wasm/                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  components/                                                 │
│    └── graph-wasm-visualization.tsx   ← Main component      │
│                                                              │
│  model/                                                      │
│    └── use-graph-engine.hooks.ts      ← WASM hook           │
│                                                              │
│  lib/                                                        │
│    ├── types.ts                       ← TypeScript types    │
│    ├── transform.ts                   ← Entity ↔ WASM       │
│    └── feature-detect.ts              ← Browser support     │
│                                                              │
│  pkg/                                 ← wasm-pack output    │
│    ├── graph_engine.js                                      │
│    ├── graph_engine.d.ts                                    │
│    └── graph_engine_bg.wasm                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Vite Configuration

```typescript
// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
  ],
  optimizeDeps: {
    // Exclude WASM package from pre-bundling
    exclude: ['@neylin/graph-engine']
  },
  build: {
    target: 'esnext',
  }
})
```

### Package.json scripts

```json
{
  "scripts": {
    "build:wasm": "cd ../graph-engine && wasm-pack build --target web --out-dir ../frontend/src/features/graph-wasm/pkg",
    "dev:wasm": "npm run build:wasm && npm run dev",
    "build": "npm run build:wasm && vite build"
  }
}
```

---

## Feature Detection

```typescript
// features/graph-wasm/lib/feature-detect.ts

/**
 * Check if WebAssembly is supported
 */
export const hasWasmSupport = (): boolean => {
  try {
    if (typeof WebAssembly === 'object' &&
        typeof WebAssembly.instantiate === 'function') {
      // Test with minimal module
      const module = new WebAssembly.Module(
        new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
      )
      return module instanceof WebAssembly.Module
    }
  } catch {
    // Fallback
  }
  return false
}

/**
 * Check if SIMD is supported (for future optimizations)
 */
export const hasSimdSupport = (): boolean => {
  try {
    return WebAssembly.validate(new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
      0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b,
      0x03, 0x02, 0x01, 0x00, 0x0a, 0x0a, 0x01,
      0x08, 0x00, 0x41, 0x00, 0xfd, 0x0f, 0x0b
    ]))
  } catch {
    return false
  }
}
```

---

## useGraphEngine Hook

```typescript
// features/graph-wasm/model/use-graph-engine.hooks.ts

import { useEffect, useRef, useState, useCallback } from 'react'
import type { WasmNode, WasmEdge, LayoutOptions, LayoutResult } from '../lib/types'

// Lazy import to enable code splitting
const loadWasmModule = () => import('../pkg/graph_engine')

interface UseGraphEngineResult {
  /** Whether WASM module is loaded and ready */
  isReady: boolean
  /** Loading error if any */
  error: Error | null
  /** Load graph data into engine */
  loadGraph: (nodes: WasmNode[], edges: WasmEdge[]) => void
  /** Run complete layout */
  runLayout: (options: LayoutOptions) => LayoutResult | null
  /** Start animated layout */
  initLayout: (options: LayoutOptions) => void
  /** Single animation step */
  stepLayout: (iterations?: number) => LayoutResult | null
  /** Check if animation converged */
  isConverged: () => boolean
  /** Hit test at point */
  hitTest: (x: number, y: number) => string | null
  /** Update node position (after drag) */
  updateNodePosition: (id: string, x: number, y: number) => void
  /** Get all current positions */
  getAllPositions: () => Array<{ id: string; x: number; y: number }>
}

export const useGraphEngine = (): UseGraphEngineResult => {
  const engineRef = useRef<InstanceType<typeof import('../pkg/graph_engine').GraphEngine> | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Initialize WASM module
  useEffect(() => {
    let mounted = true

    const initWasm = async () => {
      try {
        const wasm = await loadWasmModule()
        await wasm.default()  // Initialize WASM

        if (mounted) {
          engineRef.current = new wasm.GraphEngine()
          setIsReady(true)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('WASM init failed'))
        }
      }
    }

    initWasm()

    return () => {
      mounted = false
      if (engineRef.current) {
        engineRef.current.free()
        engineRef.current = null
      }
    }
  }, [])

  const loadGraph = useCallback((nodes: WasmNode[], edges: WasmEdge[]) => {
    if (!engineRef.current) return

    const json = JSON.stringify({ nodes, edges })
    engineRef.current.load_graph(json)
  }, [])

  const runLayout = useCallback((options: LayoutOptions): LayoutResult | null => {
    if (!engineRef.current) return null

    try {
      const resultJson = engineRef.current.run_layout(JSON.stringify(options))
      return JSON.parse(resultJson)
    } catch (err) {
      console.error('Layout error:', err)
      return null
    }
  }, [])

  const initLayout = useCallback((options: LayoutOptions) => {
    if (!engineRef.current) return
    engineRef.current.init_layout(JSON.stringify(options))
  }, [])

  const stepLayout = useCallback((iterations = 10): LayoutResult | null => {
    if (!engineRef.current) return null

    try {
      const resultJson = engineRef.current.step_layout(iterations)
      return JSON.parse(resultJson)
    } catch (err) {
      console.error('Step layout error:', err)
      return null
    }
  }, [])

  const isConverged = useCallback((): boolean => {
    return engineRef.current?.is_converged() ?? true
  }, [])

  const hitTest = useCallback((x: number, y: number): string | null => {
    if (!engineRef.current) return null
    return engineRef.current.hit_test(x, y) ?? null
  }, [])

  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    engineRef.current?.update_node_position(id, x, y)
  }, [])

  const getAllPositions = useCallback(() => {
    if (!engineRef.current) return []

    try {
      const json = engineRef.current.get_all_positions()
      return JSON.parse(json)
    } catch {
      return []
    }
  }, [])

  return {
    isReady,
    error,
    loadGraph,
    runLayout,
    initLayout,
    stepLayout,
    isConverged,
    hitTest,
    updateNodePosition,
    getAllPositions,
  }
}
```

---

## Animated Layout Hook

```typescript
// features/graph-wasm/model/use-animated-layout.hooks.ts

import { useCallback, useRef } from 'react'
import { useGraphEngine } from './use-graph-engine.hooks'
import type { LayoutOptions, LayoutResult } from '../lib/types'

interface UseAnimatedLayoutOptions {
  /** Iterations per frame */
  iterationsPerFrame?: number
  /** Callback on each frame */
  onFrame?: (result: LayoutResult) => void
  /** Callback when converged */
  onComplete?: (result: LayoutResult) => void
}

export const useAnimatedLayout = (options: UseAnimatedLayoutOptions = {}) => {
  const { iterationsPerFrame = 10, onFrame, onComplete } = options
  const { isReady, initLayout, stepLayout, isConverged } = useGraphEngine()

  const rafRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    isRunningRef.current = false
  }, [])

  const start = useCallback((layoutOptions: LayoutOptions) => {
    if (!isReady) return

    stop()
    initLayout(layoutOptions)
    isRunningRef.current = true

    const animate = () => {
      if (!isRunningRef.current) return

      const result = stepLayout(iterationsPerFrame)

      if (result) {
        onFrame?.(result)

        if (isConverged() || result.converged) {
          isRunningRef.current = false
          onComplete?.(result)
          return
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [isReady, initLayout, stepLayout, isConverged, iterationsPerFrame, onFrame, onComplete, stop])

  return { start, stop, isRunning: isRunningRef.current }
}
```

---

## Data Transformation

```typescript
// features/graph-wasm/lib/transform.ts

import type { Node, Edge } from '@/entities/map'
import type { WasmNode, WasmEdge, NodePosition } from './types'

/**
 * Convert entity Node to WASM format
 */
export const toWasmNode = (node: Node): WasmNode => ({
  id: node.id,
  x: node.position.x,
  y: node.position.y,
  width: 220,  // Default card width
  height: 120, // Default card height
  node_type: node.type,
  label: node.label,
  description: node.description,
  metadata: node.metadata,
})

/**
 * Convert entity Edge to WASM format
 */
export const toWasmEdge = (edge: Edge): WasmEdge => ({
  id: edge.id,
  source: edge.sourceNodeId,
  target: edge.targetNodeId,
  relation_type: edge.relationType,
  weight: edge.strength,
  bidirectional: edge.bidirectional,
})

/**
 * Apply WASM positions to ReactFlow nodes
 */
export const applyPositions = <T extends { id: string; position: { x: number; y: number } }>(
  nodes: T[],
  positions: NodePosition[]
): T[] => {
  const positionMap = new Map(positions.map(p => [p.id, p]))

  return nodes.map(node => {
    const pos = positionMap.get(node.id)
    if (pos) {
      return {
        ...node,
        position: { x: pos.x, y: pos.y }
      }
    }
    return node
  })
}

/**
 * Batch convert entities
 */
export const transformToWasm = (nodes: Node[], edges: Edge[]) => ({
  nodes: nodes.map(toWasmNode),
  edges: edges.map(toWasmEdge),
})
```

---

## Component Integration

```typescript
// features/graph-wasm/components/graph-wasm-visualization.tsx

import { memo, useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  type Node as FlowNode,
} from '@xyflow/react'
import { useGraphEngine } from '../model/use-graph-engine.hooks'
import { transformToWasm, applyPositions } from '../lib/transform'
import type { Node, Edge } from '@/entities/map'
import type { LayoutOptions } from '../lib/types'

interface GraphWasmVisualizationProps {
  nodes: Node[]
  edges: Edge[]
  layoutOptions?: LayoutOptions
  onLayoutComplete?: () => void
}

export const GraphWasmVisualization = memo(({
  nodes: entityNodes,
  edges: entityEdges,
  layoutOptions,
  onLayoutComplete,
}: GraphWasmVisualizationProps) => {
  const { isReady, loadGraph, runLayout } = useGraphEngine()

  // Transform entities to WASM format
  const wasmData = useMemo(
    () => transformToWasm(entityNodes, entityEdges),
    [entityNodes, entityEdges]
  )

  // Transform to ReactFlow format
  const initialFlowNodes = useMemo(() =>
    entityNodes.map(n => ({
      id: n.id,
      type: 'knowledgeNode',
      position: { x: n.position.x, y: n.position.y },
      data: n,
    })),
    [entityNodes]
  )

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(initialFlowNodes)
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([])

  // Load graph when data changes
  useEffect(() => {
    if (isReady) {
      loadGraph(wasmData.nodes, wasmData.edges)
    }
  }, [isReady, loadGraph, wasmData])

  // Run layout
  const handleRunLayout = useCallback(() => {
    if (!isReady) return

    const options: LayoutOptions = {
      viewMode: 'overview',
      spacingPercent: 100,
      directionStrength: 100,
      iterations: 150,
      coolingFactor: 0.97,
      theta: 0.9,
      ...layoutOptions,
    }

    const result = runLayout(options)

    if (result) {
      setFlowNodes(nodes => applyPositions(nodes, result.nodes))
      onLayoutComplete?.()
    }
  }, [isReady, runLayout, layoutOptions, setFlowNodes, onLayoutComplete])

  // Auto-run layout on mount
  useEffect(() => {
    if (isReady && entityNodes.length > 0) {
      handleRunLayout()
    }
  }, [isReady, entityNodes.length, handleRunLayout])

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
    />
  )
})

GraphWasmVisualization.displayName = 'GraphWasmVisualization'
```

---

## A/B Testing Setup

```typescript
// features/graph/components/graph-visualization-switcher.tsx

import { lazy, Suspense } from 'react'
import { hasWasmSupport } from '@/features/graph-wasm'
import { useFeatureFlag } from '@/shared/hooks'
import { Loader } from '@/shared/components/loader'

// Lazy load both implementations
const GraphVisualization = lazy(() =>
  import('./graph-visualization').then(m => ({ default: m.GraphVisualization }))
)

const GraphWasmVisualization = lazy(() =>
  import('@/features/graph-wasm').then(m => ({ default: m.GraphWasmVisualization }))
)

interface Props {
  mapId: string
  // ... other props
}

export const GraphVisualizationSwitcher = (props: Props) => {
  const useWasm = useFeatureFlag('graph-wasm') && hasWasmSupport()

  return (
    <Suspense fallback={<Loader />}>
      {useWasm ? (
        <GraphWasmVisualization {...props} />
      ) : (
        <GraphVisualization {...props} />
      )}
    </Suspense>
  )
}
```

---

## Public API

```typescript
// features/graph-wasm/index.ts

// Components
export { GraphWasmVisualization } from './components/graph-wasm-visualization'

// Hooks
export { useGraphEngine } from './model/use-graph-engine.hooks'
export { useAnimatedLayout } from './model/use-animated-layout.hooks'

// Utils
export { hasWasmSupport, hasSimdSupport } from './lib/feature-detect'
export { transformToWasm, applyPositions } from './lib/transform'

// Types
export type {
  WasmNode,
  WasmEdge,
  LayoutOptions,
  LayoutResult,
  NodePosition,
} from './lib/types'
```

---

## Error Handling

```typescript
// features/graph-wasm/model/use-graph-engine.hooks.ts

import { ErrorBoundary } from '@/shared/components/error-boundary'

// Wrap WASM calls with error boundary
export const GraphEngineErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary
    fallback={
      <div className="p-4 text-center">
        <p className="text-destructive">Graph engine failed to load</p>
        <p className="text-sm text-muted-foreground">
          Falling back to standard rendering
        </p>
      </div>
    }
    onError={(error) => {
      console.error('GraphEngine error:', error)
      // Report to monitoring
    }}
  >
    {children}
  </ErrorBoundary>
)
```
