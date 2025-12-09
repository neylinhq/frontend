# 05. WASM Bindings

## Overview

wasm-bindgen обеспечивает интеграцию между Rust и JavaScript.

```
┌─────────────────────────────────────────────────────────────┐
│                     JavaScript                               │
│                                                              │
│  const engine = new GraphEngine()                           │
│  engine.load_graph(jsonString)                              │
│  const result = engine.run_layout(optionsJson)              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    wasm-bindgen                              │
│                                                              │
│  #[wasm_bindgen]                                            │
│  pub struct GraphEngine { ... }                             │
│                                                              │
│  #[wasm_bindgen]                                            │
│  impl GraphEngine {                                          │
│      pub fn load_graph(&mut self, json: &str) { ... }       │
│  }                                                           │
├─────────────────────────────────────────────────────────────┤
│                       Rust                                   │
│                                                              │
│  struct Graph { nodes, edges, ... }                         │
│  struct ForceDirectedLayout { ... }                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## GraphEngine Struct

```rust
// src/bindings/mod.rs

use wasm_bindgen::prelude::*;
use crate::graph::Graph;
use crate::layout::{ForceDirectedLayout, LayoutOptions, LayoutResult};
use crate::spatial::Viewport;

#[wasm_bindgen]
pub struct GraphEngine {
    graph: Graph,
    viewport: Viewport,
    layout: Option<ForceDirectedLayout>,
    temperature: f64,
}

#[wasm_bindgen]
impl GraphEngine {
    /// Create new engine instance
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        // Enable better panic messages in browser console
        #[cfg(feature = "console_error_panic_hook")]
        console_error_panic_hook::set_once();

        Self {
            graph: Graph::new(),
            viewport: Viewport::default(),
            layout: None,
            temperature: 100.0,
        }
    }

    /// Load graph data from JSON string
    ///
    /// Expected format:
    /// ```json
    /// {
    ///   "nodes": [{ "id": "1", "x": 0, "y": 0, ... }],
    ///   "edges": [{ "id": "e1", "source": "1", "target": "2", ... }]
    /// }
    /// ```
    pub fn load_graph(&mut self, json: &str) -> Result<(), JsValue> {
        self.graph = Graph::from_json(json)
            .map_err(|e| JsValue::from_str(&format!("Parse error: {}", e)))?;
        Ok(())
    }

    /// Run complete force-directed layout
    ///
    /// Returns JSON with new positions:
    /// ```json
    /// {
    ///   "nodes": [{ "id": "1", "x": 100, "y": 200 }],
    ///   "elapsedMs": 45.2,
    ///   "iterationsRun": 150,
    ///   "converged": true
    /// }
    /// ```
    pub fn run_layout(&mut self, options_json: &str) -> Result<String, JsValue> {
        let options: LayoutOptions = serde_json::from_str(options_json)
            .map_err(|e| JsValue::from_str(&format!("Options parse error: {}", e)))?;

        options.validate()
            .map_err(|e| JsValue::from_str(&e))?;

        let layout = ForceDirectedLayout::new(options);
        let result = layout.run(&mut self.graph);

        serde_json::to_string(&result)
            .map_err(|e| JsValue::from_str(&format!("Serialize error: {}", e)))
    }

    /// Incremental layout step for animation
    ///
    /// Call this in requestAnimationFrame loop.
    /// Returns partial result with current positions.
    pub fn step_layout(&mut self, iterations: u32) -> Result<String, JsValue> {
        let layout = self.layout.as_ref()
            .ok_or_else(|| JsValue::from_str("Call init_layout first"))?;

        let (result, new_temp) = layout.step(
            &mut self.graph,
            iterations as usize,
            self.temperature
        );

        self.temperature = new_temp;

        serde_json::to_string(&result)
            .map_err(|e| JsValue::from_str(&format!("Serialize error: {}", e)))
    }

    /// Initialize incremental layout (call before step_layout)
    pub fn init_layout(&mut self, options_json: &str) -> Result<(), JsValue> {
        let options: LayoutOptions = serde_json::from_str(options_json)
            .map_err(|e| JsValue::from_str(&format!("Options parse error: {}", e)))?;

        self.layout = Some(ForceDirectedLayout::new(options));
        self.temperature = 100.0;

        Ok(())
    }

    /// Check if animated layout has converged
    pub fn is_converged(&self) -> bool {
        self.temperature < 0.5
    }

    /// Reset layout state (for re-running)
    pub fn reset_layout(&mut self) {
        self.temperature = 100.0;
    }
}
```

---

## Hit Testing

```rust
#[wasm_bindgen]
impl GraphEngine {
    /// Find node at given point
    ///
    /// Returns node ID or null if no node at point.
    /// Coordinates are in graph space (not screen space).
    pub fn hit_test(&self, x: f64, y: f64) -> Option<String> {
        // Reverse iteration to hit topmost node first
        for node in self.graph.nodes.values() {
            if node.contains_point(x, y) {
                return Some(node.id.clone());
            }
        }
        None
    }

    /// Find all nodes within rectangle
    pub fn hit_test_rect(&self, x: f64, y: f64, width: f64, height: f64) -> String {
        let ids: Vec<String> = self.graph.nodes.values()
            .filter(|n| {
                n.x + n.width > x &&
                n.x < x + width &&
                n.y + n.height > y &&
                n.y < y + height
            })
            .map(|n| n.id.clone())
            .collect();

        serde_json::to_string(&ids).unwrap_or_else(|_| "[]".to_string())
    }
}
```

---

## Node Operations

```rust
#[wasm_bindgen]
impl GraphEngine {
    /// Update single node position (after drag)
    pub fn update_node_position(&mut self, id: &str, x: f64, y: f64) -> bool {
        if let Some(node) = self.graph.get_node_mut(id) {
            node.x = x;
            node.y = y;
            true
        } else {
            false
        }
    }

    /// Pin node to fixed position
    pub fn pin_node(&mut self, id: &str, x: f64, y: f64) -> bool {
        if let Some(node) = self.graph.get_node_mut(id) {
            node.fx = Some(x);
            node.fy = Some(y);
            true
        } else {
            false
        }
    }

    /// Unpin node (allow movement in layout)
    pub fn unpin_node(&mut self, id: &str) -> bool {
        if let Some(node) = self.graph.get_node_mut(id) {
            node.fx = None;
            node.fy = None;
            true
        } else {
            false
        }
    }

    /// Get current node position
    pub fn get_node_position(&self, id: &str) -> Option<String> {
        self.graph.get_node(id).map(|n| {
            format!(r#"{{"x":{},"y":{}}}"#, n.x, n.y)
        })
    }

    /// Get all current positions (for sync with React)
    pub fn get_all_positions(&self) -> String {
        let positions: Vec<_> = self.graph.nodes.values()
            .map(|n| serde_json::json!({
                "id": n.id,
                "x": n.x,
                "y": n.y
            }))
            .collect();

        serde_json::to_string(&positions).unwrap_or_else(|_| "[]".to_string())
    }
}
```

---

## Viewport Operations

```rust
#[wasm_bindgen]
impl GraphEngine {
    /// Set current viewport (for culling calculations)
    pub fn set_viewport(&mut self, x: f64, y: f64, width: f64, height: f64, zoom: f64) {
        self.viewport = Viewport { x, y, width, height, zoom };
    }

    /// Get IDs of nodes visible in current viewport
    pub fn get_visible_nodes(&self) -> String {
        let visible: Vec<String> = self.graph.nodes.values()
            .filter(|n| self.viewport.contains_node(n))
            .map(|n| n.id.clone())
            .collect();

        serde_json::to_string(&visible).unwrap_or_else(|_| "[]".to_string())
    }

    /// Get graph bounds (for fitView calculation)
    pub fn get_bounds(&self) -> String {
        if self.graph.nodes.is_empty() {
            return r#"{"x":0,"y":0,"width":0,"height":0}"#.to_string();
        }

        let (min_x, max_x, min_y, max_y) = self.graph.nodes.values().fold(
            (f64::MAX, f64::MIN, f64::MAX, f64::MIN),
            |(min_x, max_x, min_y, max_y), n| {
                (
                    min_x.min(n.x),
                    max_x.max(n.x + n.width),
                    min_y.min(n.y),
                    max_y.max(n.y + n.height),
                )
            },
        );

        format!(
            r#"{{"x":{},"y":{},"width":{},"height":{}}}"#,
            min_x, min_y, max_x - min_x, max_y - min_y
        )
    }
}
```

---

## Graph Queries

```rust
#[wasm_bindgen]
impl GraphEngine {
    /// Get node count
    pub fn node_count(&self) -> usize {
        self.graph.node_count()
    }

    /// Get edge count
    pub fn edge_count(&self) -> usize {
        self.graph.edge_count()
    }

    /// Get nodes within N hops from start
    pub fn nodes_within_depth(&self, start_id: &str, depth: usize) -> String {
        let node_ids = self.graph.nodes_within_depth(start_id, depth);
        let ids: Vec<_> = node_ids.into_iter().collect();
        serde_json::to_string(&ids).unwrap_or_else(|_| "[]".to_string())
    }

    /// Get neighbors of a node (directly connected)
    pub fn get_neighbors(&self, node_id: &str) -> String {
        let neighbors: Vec<_> = self.graph.neighbors(node_id).collect();
        serde_json::to_string(&neighbors).unwrap_or_else(|_| "[]".to_string())
    }
}
```

---

## Memory Management

```rust
#[wasm_bindgen]
impl GraphEngine {
    /// Clear all data (for reuse without reallocating)
    pub fn clear(&mut self) {
        self.graph = Graph::new();
        self.layout = None;
        self.temperature = 100.0;
    }

    /// Free memory (call when done with engine)
    /// Note: This is called automatically when engine is garbage collected,
    /// but can be called explicitly for immediate cleanup.
    pub fn free(self) {
        // Drop happens automatically, but this makes intent explicit
        drop(self);
    }
}
```

---

## Error Handling Pattern

```rust
// src/bindings/error.rs

use wasm_bindgen::JsValue;

/// Convert any error to JsValue
pub fn to_js_error<E: std::fmt::Display>(err: E) -> JsValue {
    JsValue::from_str(&err.to_string())
}

/// Result type for WASM functions
pub type WasmResult<T> = Result<T, JsValue>;

// Usage:
impl GraphEngine {
    pub fn some_method(&self) -> WasmResult<String> {
        let data = do_something()
            .map_err(to_js_error)?;

        serde_json::to_string(&data)
            .map_err(to_js_error)
    }
}
```

---

## Logging (Debug)

```rust
// src/bindings/log.rs

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn warn(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn error(s: &str);
}

/// Log to browser console (debug builds only)
#[cfg(debug_assertions)]
macro_rules! console_log {
    ($($t:tt)*) => (log(&format!($($t)*)))
}

#[cfg(not(debug_assertions))]
macro_rules! console_log {
    ($($t:tt)*) => {}
}

// Usage:
console_log!("Layout took {}ms for {} nodes", elapsed, count);
```

---

## TypeScript Declarations

wasm-pack генерирует `.d.ts` автоматически:

```typescript
// pkg/graph_engine.d.ts (generated)

export class GraphEngine {
  free(): void;
  constructor();
  load_graph(json: string): void;
  run_layout(options_json: string): string;
  step_layout(iterations: number): string;
  init_layout(options_json: string): void;
  is_converged(): boolean;
  reset_layout(): void;
  hit_test(x: number, y: number): string | undefined;
  hit_test_rect(x: number, y: number, width: number, height: number): string;
  update_node_position(id: string, x: number, y: number): boolean;
  pin_node(id: string, x: number, y: number): boolean;
  unpin_node(id: string): boolean;
  get_node_position(id: string): string | undefined;
  get_all_positions(): string;
  set_viewport(x: number, y: number, width: number, height: number, zoom: number): void;
  get_visible_nodes(): string;
  get_bounds(): string;
  node_count(): number;
  edge_count(): number;
  nodes_within_depth(start_id: string, depth: number): string;
  get_neighbors(node_id: string): string;
  clear(): void;
}

export function init(): Promise<void>;
```

---

## Best Practices

### 1. Minimize JS↔WASM calls

```rust
// ❌ Bad: many small calls
pub fn get_node_x(&self, id: &str) -> f64 { ... }
pub fn get_node_y(&self, id: &str) -> f64 { ... }

// ✅ Good: batch into single call
pub fn get_all_positions(&self) -> String { ... }
```

### 2. Use JSON for complex data

```rust
// ❌ Bad: multiple return values
pub fn get_bounds(&self) -> (f64, f64, f64, f64) { ... }

// ✅ Good: JSON string
pub fn get_bounds(&self) -> String {
    format!(r#"{{"x":{},"y":{},"width":{},"height":{}}}"#, ...)
}
```

### 3. Validate at boundary

```rust
pub fn load_graph(&mut self, json: &str) -> Result<(), JsValue> {
    // Validate JSON structure
    let data: GraphData = serde_json::from_str(json)?;

    // Validate business rules
    if data.nodes.is_empty() {
        return Err(JsValue::from_str("Graph must have at least one node"));
    }

    // ...
}
```
