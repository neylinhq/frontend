# Graph Engine — Rust + WASM Architecture

## Overview

Высокопроизводительный движок для визуализации графов знаний. Rust core компилируется в WebAssembly, интегрируется с существующим React приложением через гибридный подход (WASM для layout + DOM для рендеринга).

## Project Structure

```
c:\2025\arbor\
├── frontend/                    # Существующий React проект
│   └── src/
│       ├── features/graph/      # Текущая xyflow реализация (сохраняем)
│       └── features/graph-wasm/ # Новый React wrapper над WASM
│
└── graph-engine/                # Новый Rust+WASM проект
    ├── Cargo.toml
    ├── src/
    │   ├── lib.rs               # WASM entry point
    │   ├── graph/
    │   │   ├── mod.rs
    │   │   ├── node.rs          # Node структура
    │   │   ├── edge.rs          # Edge структура
    │   │   └── graph.rs         # Graph container
    │   ├── layout/
    │   │   ├── mod.rs
    │   │   ├── force_directed.rs
    │   │   ├── quadtree.rs      # Barnes-Hut optimization
    │   │   └── path_layout.rs
    │   ├── spatial/
    │   │   ├── mod.rs
    │   │   ├── viewport.rs      # Camera, pan, zoom
    │   │   └── hit_test.rs      # Point-in-node detection
    │   └── bindings/
    │       ├── mod.rs
    │       └── js_types.rs      # wasm-bindgen exports
    ├── tests/
    └── pkg/                     # wasm-pack output (gitignore)
```

---

## Phase 1: Layout Engine (Гибрид DOM)

### Цель
Rust вычисляет позиции нод, React рендерит DOM-элементы. Минимальный риск, максимальный выигрыш в layout performance.

### Rust API (wasm-bindgen exports)

```rust
// src/lib.rs
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[wasm_bindgen]
pub struct GraphEngine {
    graph: Graph,
    viewport: Viewport,
}

#[wasm_bindgen]
impl GraphEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self { ... }

    /// Загрузить граф из JSON
    pub fn load_graph(&mut self, json: &str) -> Result<(), JsValue> { ... }

    /// Запустить force-directed layout
    /// Возвращает JSON с новыми позициями
    pub fn run_layout(&mut self, options: &str) -> String { ... }

    /// Инкрементальный layout (для анимации)
    /// iterations: сколько итераций за один кадр
    pub fn step_layout(&mut self, iterations: u32) -> String { ... }

    /// Hit testing: какая нода под курсором?
    pub fn hit_test(&self, x: f64, y: f64) -> Option<String> { ... }

    /// Обновить позицию ноды (после drag)
    pub fn update_node_position(&mut self, id: &str, x: f64, y: f64) { ... }

    /// Viewport operations
    pub fn set_viewport(&mut self, x: f64, y: f64, zoom: f64) { ... }
    pub fn get_visible_nodes(&self) -> String { ... } // JSON array of node IDs
}
```

### TypeScript Types (frontend integration)

```typescript
// src/features/graph-wasm/lib/types.ts

export interface WasmNode {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: 'concept' | 'theory' | 'fact' | 'example' | 'definition'
  label: string
  description?: string
  metadata: Record<string, unknown>
}

export interface WasmEdge {
  id: string
  source: string
  target: string
  relationType: string
  weight: number
}

export interface LayoutOptions {
  viewMode: 'overview' | 'focus' | 'path'
  focusedNodeId?: string
  spacingPercent: number      // 50-200, default 100
  directionStrength: number   // 0-100, default 100
  iterations: number          // default 150
}

export interface LayoutResult {
  nodes: Array<{ id: string; x: number; y: number }>
  elapsed_ms: number
  iterations_run: number
}
```

### React Hook

```typescript
// src/features/graph-wasm/hooks/use-graph-engine.ts

import { useEffect, useRef, useState } from 'react'
import init, { GraphEngine } from '@arbor/graph-engine'

export function useGraphEngine() {
  const engineRef = useRef<GraphEngine | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    init().then(() => {
      engineRef.current = new GraphEngine()
      setIsReady(true)
    })
    return () => {
      engineRef.current?.free()
    }
  }, [])

  const loadGraph = (nodes: WasmNode[], edges: WasmEdge[]) => {
    if (!engineRef.current) return
    engineRef.current.load_graph(JSON.stringify({ nodes, edges }))
  }

  const runLayout = (options: LayoutOptions): LayoutResult | null => {
    if (!engineRef.current) return null
    const json = engineRef.current.run_layout(JSON.stringify(options))
    return JSON.parse(json)
  }

  const stepLayout = (iterations = 10): LayoutResult | null => {
    if (!engineRef.current) return null
    const json = engineRef.current.step_layout(iterations)
    return JSON.parse(json)
  }

  const hitTest = (x: number, y: number): string | null => {
    if (!engineRef.current) return null
    return engineRef.current.hit_test(x, y) ?? null
  }

  return {
    isReady,
    loadGraph,
    runLayout,
    stepLayout,
    hitTest,
    engine: engineRef.current
  }
}
```

---

## Phase 2: WebGL Rendering (опционально)

### Цель
Рендеринг карточек через WebGL для 1000+ нод. Текст через DOM overlay.

### Архитектура рендеринга

```
┌─────────────────────────────────────────────────────┐
│                   React Container                    │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐  │
│  │              WebGL Canvas (z-index: 0)        │  │
│  │  - Node backgrounds (rounded rects)           │  │
│  │  - Edges (bezier curves)                      │  │
│  │  - Shadows                                    │  │
│  │  - Selection highlights                       │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │           DOM Overlay (z-index: 1)            │  │
│  │  - Text labels (positioned divs)              │  │
│  │  - Icons                                      │  │
│  │  - Badges                                     │  │
│  │  - Interactive elements                       │  │
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│                    UI Controls                       │
│  - Toolbar, minimap, zoom controls (React)          │
└─────────────────────────────────────────────────────┘
```

### Rust WebGL Types

```rust
// src/render/mod.rs

pub struct Renderer {
    context: WebGl2RenderingContext,
    node_shader: ShaderProgram,
    edge_shader: ShaderProgram,
    node_batch: BatchBuffer,
    edge_batch: BatchBuffer,
}

impl Renderer {
    pub fn new(canvas_id: &str) -> Result<Self, JsValue> { ... }

    pub fn render(&mut self, graph: &Graph, viewport: &Viewport) { ... }

    pub fn resize(&mut self, width: u32, height: u32) { ... }
}

// Batch buffer for instanced rendering
pub struct BatchBuffer {
    vao: WebGlVertexArrayObject,
    vbo: WebGlBuffer,
    instance_buffer: WebGlBuffer,
    instance_count: usize,
}
```

---

## Data Structures (Rust)

### Node

```rust
// src/graph/node.rs

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub node_type: NodeType,
    pub label: String,
    pub description: Option<String>,
    pub metadata: serde_json::Value,

    // Layout state (not serialized to JS)
    #[serde(skip)]
    pub vx: f64,
    #[serde(skip)]
    pub vy: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum NodeType {
    Concept,
    Theory,
    Fact,
    Example,
    Definition,
}

impl Node {
    pub fn center(&self) -> (f64, f64) {
        (self.x + self.width / 2.0, self.y + self.height / 2.0)
    }

    pub fn contains_point(&self, px: f64, py: f64) -> bool {
        px >= self.x && px <= self.x + self.width &&
        py >= self.y && py <= self.y + self.height
    }
}
```

### Edge

```rust
// src/graph/edge.rs

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Edge {
    pub id: String,
    pub source: String,
    pub target: String,
    pub relation_type: RelationType,
    pub weight: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum RelationType {
    Prerequisite,
    IsA,
    PartOf,
    Explains,
    Causes,
    Influences,
    HasA,
    SimilarTo,
    RelatedTo,
    Contradicts,
}

impl RelationType {
    pub fn weight(&self) -> f64 {
        match self {
            Self::Prerequisite => 1.0,
            Self::IsA | Self::PartOf => 0.8,
            Self::Explains | Self::Causes => 0.6,
            Self::Influences | Self::HasA => 0.5,
            Self::SimilarTo => 0.4,
            Self::RelatedTo => 0.3,
            Self::Contradicts => 0.2,
        }
    }
}
```

### Graph

```rust
// src/graph/graph.rs

use std::collections::HashMap;

pub struct Graph {
    pub nodes: HashMap<String, Node>,
    pub edges: Vec<Edge>,

    // Adjacency for fast traversal
    outgoing: HashMap<String, Vec<usize>>,  // node_id -> edge indices
    incoming: HashMap<String, Vec<usize>>,
}

impl Graph {
    pub fn new() -> Self { ... }

    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> { ... }

    pub fn add_node(&mut self, node: Node) { ... }

    pub fn add_edge(&mut self, edge: Edge) { ... }

    pub fn get_node(&self, id: &str) -> Option<&Node> { ... }

    pub fn get_node_mut(&mut self, id: &str) -> Option<&mut Node> { ... }

    pub fn neighbors(&self, id: &str) -> impl Iterator<Item = &str> { ... }

    pub fn nodes_within_depth(&self, start: &str, depth: usize) -> HashSet<String> { ... }
}
```

---

## Layout Algorithm (Barnes-Hut)

### QuadTree

```rust
// src/layout/quadtree.rs

pub struct QuadTree {
    root: Option<Box<QuadNode>>,
    bounds: Rect,
}

struct QuadNode {
    bounds: Rect,
    center_of_mass: (f64, f64),
    total_mass: f64,
    body: Option<usize>,  // Index into positions array
    children: Option<[Box<QuadNode>; 4]>,
}

impl QuadTree {
    pub fn build(positions: &[(f64, f64)]) -> Self { ... }

    pub fn calculate_repulsion(
        &self,
        px: f64,
        py: f64,
        theta: f64,
        ideal_distance_sq: f64,
    ) -> (f64, f64) { ... }
}
```

### Force-Directed Layout

```rust
// src/layout/force_directed.rs

pub struct ForceDirectedLayout {
    iterations: usize,
    ideal_distance: f64,
    cooling_factor: f64,
    theta: f64,  // Barnes-Hut approximation threshold
    direction_strength: f64,
}

impl ForceDirectedLayout {
    pub fn new(options: &LayoutOptions) -> Self { ... }

    pub fn run(&self, graph: &mut Graph) -> LayoutResult {
        let mut temperature = self.ideal_distance * 0.5;

        for iter in 0..self.iterations {
            // 1. Build quadtree
            let positions: Vec<_> = graph.nodes.values()
                .map(|n| n.center())
                .collect();
            let tree = QuadTree::build(&positions);

            // 2. Repulsive forces (Barnes-Hut)
            for node in graph.nodes.values_mut() {
                let (fx, fy) = tree.calculate_repulsion(
                    node.x, node.y,
                    self.theta,
                    self.ideal_distance * self.ideal_distance
                );
                node.vx += fx;
                node.vy += fy;
            }

            // 3. Attractive forces (edges)
            for edge in &graph.edges {
                let source = graph.nodes.get(&edge.source);
                let target = graph.nodes.get(&edge.target);
                if let (Some(s), Some(t)) = (source, target) {
                    let dx = t.x - s.x;
                    let dy = t.y - s.y;
                    let dist = (dx * dx + dy * dy).sqrt().max(0.01);

                    let weight = edge.relation_type.weight();
                    let force = (dist * dist / self.ideal_distance) * weight;
                    let fx = (dx / dist) * force;
                    let fy = (dy / dist) * force;

                    // Apply to both nodes (will need RefCell or indices)
                }
            }

            // 4. Direction forces (vertical hierarchy)
            if self.direction_strength > 0.0 {
                for edge in &graph.edges {
                    // Push source up, target down
                    let vertical_force = self.ideal_distance * 1.2 * self.direction_strength;
                    // source.vy -= vertical_force
                    // target.vy += vertical_force
                }
            }

            // 5. Center gravity
            let (cx, cy) = calculate_center(&graph.nodes);
            for node in graph.nodes.values_mut() {
                node.vx -= (node.x - cx) * 0.01;
                node.vy -= (node.y - cy) * 0.01;
            }

            // 6. Apply velocities with temperature limiting
            for node in graph.nodes.values_mut() {
                let speed = (node.vx * node.vx + node.vy * node.vy).sqrt();
                if speed > temperature {
                    node.vx = node.vx / speed * temperature;
                    node.vy = node.vy / speed * temperature;
                }
                node.x += node.vx;
                node.y += node.vy;
                node.vx = 0.0;
                node.vy = 0.0;
            }

            temperature *= self.cooling_factor;
        }

        LayoutResult { ... }
    }

    /// Incremental step for animated layout
    pub fn step(&self, graph: &mut Graph, iterations: usize) -> LayoutResult { ... }
}
```

---

## Vite Integration

```typescript
// vite.config.ts additions

import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    // ... existing plugins
  ],
  optimizeDeps: {
    exclude: ['@arbor/graph-engine']
  }
})
```

### Build Script

```json
// package.json
{
  "scripts": {
    "build:wasm": "cd ../graph-engine && wasm-pack build --target web --out-dir ../frontend/src/features/graph-wasm/pkg",
    "dev:wasm": "bun run build:wasm && bun dev"
  }
}
```

---

## Cargo.toml

```toml
[package]
name = "graph-engine"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
wasm-bindgen = "0.2"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
js-sys = "0.3"
web-sys = { version = "0.3", features = [
    "console",
    "Window",
    "Performance",
] }

# For Phase 2 WebGL (optional)
# web-sys = { version = "0.3", features = [
#     "WebGl2RenderingContext",
#     "WebGlProgram",
#     "WebGlShader",
#     "WebGlBuffer",
#     "WebGlVertexArrayObject",
# ] }

[dev-dependencies]
wasm-bindgen-test = "0.3"

[profile.release]
opt-level = 3
lto = true
```

---

## Implementation Order

### Step 1: Project Setup
- [ ] Создать `graph-engine/` директорию
- [ ] Инициализировать Cargo.toml
- [ ] Базовая структура модулей (lib.rs, graph/, layout/)
- [ ] Настроить wasm-pack

### Step 2: Core Data Structures
- [ ] Node, Edge, NodeType, RelationType
- [ ] Graph container с HashMap + adjacency
- [ ] JSON serialization/deserialization
- [ ] Unit tests

### Step 3: Layout Algorithm
- [ ] QuadTree implementation
- [ ] Barnes-Hut repulsion
- [ ] Force-directed с attraction + direction forces
- [ ] LayoutOptions parsing
- [ ] Benchmark tests

### Step 4: WASM Bindings
- [ ] GraphEngine struct
- [ ] load_graph, run_layout, step_layout
- [ ] hit_test, update_node_position
- [ ] Viewport management
- [ ] Error handling (Result → JsValue)

### Step 5: Frontend Integration
- [ ] Vite WASM плагин
- [ ] TypeScript types
- [ ] useGraphEngine hook
- [ ] Компонент GraphWasmVisualization
- [ ] A/B toggle между xyflow и WASM

### Step 6: Testing & Optimization
- [ ] Benchmark: WASM vs current TS implementation
- [ ] Memory profiling
- [ ] Edge cases (empty graph, single node, disconnected)

---

## Performance Expectations

| Metric | Current (TS) | Expected (WASM) |
|--------|--------------|-----------------|
| 500 nodes layout | ~300ms | ~30-50ms |
| 1000 nodes layout | ~1.5s | ~100-150ms |
| 2000 nodes layout | ~5s | ~300-500ms |
| Memory (1000 nodes) | ~50MB | ~10-15MB |
| Hit testing | O(n) | O(log n) with spatial index |

---

## Migration Path

1. **Phase 1 Complete**: Можно использовать WASM layout с текущими React компонентами
2. **Validation**: A/B тестирование, убедиться что layout идентичен
3. **Phase 2** (опционально): WebGL рендер если нужно 5000+ нод
4. **Deprecate xyflow**: Когда WASM стабилен, можно удалить старую реализацию

---

## Notes for Implementation

1. **Координаты**: Rust использует f64, JS - number. Без потерь.
2. **ID ноды**: String в обоих. Не u32 — сохраняем совместимость с backend UUID.
3. **Детерминизм**: Убрать Math.random() из layout, использовать hash-based jitter для воспроизводимости.
4. **Анимация**: `step_layout(10)` в requestAnimationFrame для плавности.
5. **Memory**: WASM linear memory растёт, но не уменьшается. При больших графах звать `free()` и пересоздавать.

---

## Reference: Current TS Implementation

Текущая реализация layout находится в:
- `frontend/src/features/graph/lib/layout-algorithms-optimized.ts`

Ключевые параметры для совместимости:
- `DEFAULT_NODE_SPACING = 200`
- `DEFAULT_LEVEL_SPACING = 300`
- `iterations = 150`
- `coolingFactor = 0.97`
- `theta = 0.9` (Barnes-Hut threshold)
- Edge weights по типу связи (prerequisite: 1.0, related-to: 0.3, и т.д.)
