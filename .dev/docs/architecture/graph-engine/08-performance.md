# 08. Performance

## Expected Results

### Layout Performance

| Nodes | Current (TS) | WASM (Expected) | Speedup |
|-------|--------------|-----------------|---------|
| 100 | ~20ms | ~2ms | 10x |
| 500 | ~150ms | ~15ms | 10x |
| 1000 | ~500ms | ~50ms | 10x |
| 2000 | ~2s | ~150ms | 13x |
| 5000 | ~12s | ~500ms | 24x |

### Memory Usage

| Nodes | Current (TS) | WASM (Expected) | Savings |
|-------|--------------|-----------------|---------|
| 1000 | ~50MB | ~10MB | 80% |
| 5000 | ~200MB | ~40MB | 80% |

### Frame Rate (DOM Rendering)

| Nodes | Current | After Phase 1 |
|-------|---------|---------------|
| 500 | 30-40 FPS | 50-60 FPS |
| 1000 | 15-25 FPS | 40-50 FPS |
| 2000 | 5-10 FPS | 25-35 FPS |

---

## Benchmarking

### Rust Benchmarks

```rust
// benches/layout_bench.rs

use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use graph_engine::{Graph, ForceDirectedLayout, LayoutOptions};

fn generate_test_graph(node_count: usize, edge_ratio: f64) -> Graph {
    let mut graph = Graph::new();

    // Generate nodes
    for i in 0..node_count {
        let node = Node::new(
            format!("node_{}", i),
            format!("Node {}", i),
            NodeType::Concept,
        );
        graph.add_node(node);
    }

    // Generate edges (random connections)
    let edge_count = (node_count as f64 * edge_ratio) as usize;
    for i in 0..edge_count {
        let source = format!("node_{}", i % node_count);
        let target = format!("node_{}", (i * 7 + 13) % node_count);
        if source != target {
            graph.add_edge(Edge::new(
                format!("edge_{}", i),
                source,
                target,
                RelationType::RelatedTo,
            ));
        }
    }

    graph
}

fn bench_layout(c: &mut Criterion) {
    let mut group = c.benchmark_group("layout");

    for node_count in [100, 500, 1000, 2000, 5000] {
        let graph = generate_test_graph(node_count, 1.5);

        group.bench_with_input(
            BenchmarkId::new("force_directed", node_count),
            &graph,
            |b, graph| {
                b.iter(|| {
                    let mut g = graph.clone();
                    let layout = ForceDirectedLayout::new(LayoutOptions::default());
                    black_box(layout.run(&mut g))
                });
            },
        );
    }

    group.finish();
}

fn bench_quadtree(c: &mut Criterion) {
    let mut group = c.benchmark_group("quadtree");

    for node_count in [100, 1000, 10000] {
        let positions: Vec<_> = (0..node_count)
            .map(|i| (i as f64 * 10.0, i as f64 * 10.0, 1.0))
            .collect();

        group.bench_with_input(
            BenchmarkId::new("build", node_count),
            &positions,
            |b, pos| {
                b.iter(|| black_box(QuadTree::build(pos)));
            },
        );
    }

    group.finish();
}

criterion_group!(benches, bench_layout, bench_quadtree);
criterion_main!(benches);
```

### Run Benchmarks

```bash
# Native benchmarks
cargo bench

# WASM benchmarks (in browser)
wasm-pack test --headless --chrome
```

---

## Profiling

### Chrome DevTools

```typescript
// Add timing markers
performance.mark('layout-start')

const result = engine.run_layout(options)

performance.mark('layout-end')
performance.measure('layout', 'layout-start', 'layout-end')

// Log results
const measures = performance.getEntriesByName('layout')
console.log(`Layout took ${measures[0].duration}ms`)
```

### WASM Performance Tracking

```rust
// src/bindings/mod.rs

use web_sys::Performance;

impl GraphEngine {
    pub fn run_layout_timed(&mut self, options_json: &str) -> Result<String, JsValue> {
        let perf = web_sys::window()
            .and_then(|w| w.performance())
            .ok_or("No performance API")?;

        let start = perf.now();

        let result = self.run_layout_internal(options_json)?;

        let elapsed = perf.now() - start;

        // Log to console in debug builds
        #[cfg(debug_assertions)]
        web_sys::console::log_1(
            &format!("Layout: {}ms for {} nodes", elapsed, self.graph.node_count()).into()
        );

        Ok(result)
    }
}
```

---

## Optimization Techniques

### 1. Barnes-Hut Threshold Tuning

```rust
// Higher theta = faster but less accurate
pub const DEFAULT_THETA: f64 = 0.9;

// For initial rough layout
pub const FAST_THETA: f64 = 1.5;

// For final refinement
pub const ACCURATE_THETA: f64 = 0.5;
```

| Theta | Accuracy | Speed |
|-------|----------|-------|
| 0.5 | High | Slow |
| 0.9 | Good | Fast |
| 1.5 | Low | Very Fast |

### 2. Early Termination

```rust
// Stop if layout converged
if max_displacement < CONVERGENCE_THRESHOLD {
    break;
}

// Stop if temperature too low
if temperature < 0.1 {
    break;
}
```

### 3. Spatial Indexing

```rust
// O(log n) hit testing with QuadTree
pub fn hit_test(&self, x: f64, y: f64) -> Option<String> {
    self.spatial_index.query_point(x, y)
}

// O(log n) viewport culling
pub fn get_visible_nodes(&self) -> Vec<&Node> {
    self.spatial_index.query_rect(self.viewport.bounds())
}
```

### 4. Incremental Layout

```rust
// Instead of full layout, update only affected area
pub fn update_local(&mut self, changed_node: &str, radius: f64) {
    let affected = self.graph.nodes_within_distance(changed_node, radius);
    // Only recalculate forces for affected nodes
    self.layout_subset(&affected);
}
```

### 5. SIMD (Future)

```rust
// With SIMD, can process 4 nodes at once
#[cfg(target_feature = "simd128")]
pub fn calculate_forces_simd(&mut self) {
    use std::arch::wasm32::*;
    // ... SIMD implementation
}
```

---

## Memory Optimization

### 1. Avoid Allocations in Hot Path

```rust
// ❌ Bad: allocates every iteration
for _ in 0..iterations {
    let positions: Vec<_> = self.nodes.values().map(|n| n.center()).collect();
    let tree = QuadTree::build(&positions);
}

// ✅ Good: reuse buffer
let mut positions = Vec::with_capacity(self.nodes.len());
for _ in 0..iterations {
    positions.clear();
    positions.extend(self.nodes.values().map(|n| n.center()));
    tree.rebuild(&positions);
}
```

### 2. Use Indices Instead of Clones

```rust
// ❌ Bad: clones strings
for edge in &self.edges {
    let source = self.nodes.get(&edge.source).cloned();
}

// ✅ Good: use indices
struct EdgeIdx {
    source_idx: usize,
    target_idx: usize,
}
```

### 3. Compact Data Layout

```rust
// ❌ Bad: scattered data
struct Node {
    id: String,
    x: f64,
    y: f64,
    // ... many fields
}

// ✅ Good: separate hot and cold data
struct NodePositions {
    x: Vec<f64>,  // Contiguous, cache-friendly
    y: Vec<f64>,
    vx: Vec<f64>,
    vy: Vec<f64>,
}

struct NodeMetadata {
    ids: Vec<String>,
    labels: Vec<String>,
    // ... cold data
}
```

---

## Bundle Size

### Current WASM Size

| Build | Size (gzip) |
|-------|-------------|
| Debug | ~500KB |
| Release | ~100KB |
| Release + LTO | ~80KB |

### Optimization

```toml
# Cargo.toml
[profile.release]
opt-level = 3      # Max optimization
lto = true         # Link-time optimization
codegen-units = 1  # Single codegen unit
panic = 'abort'    # No unwinding
```

### Tree Shaking

```rust
// Only export what's needed
#[wasm_bindgen]
pub struct GraphEngine { ... }

// Internal helpers NOT exported
fn internal_helper() { ... }
```

---

## Monitoring

### Performance Metrics to Track

```typescript
interface LayoutMetrics {
  nodeCount: number
  edgeCount: number
  layoutTimeMs: number
  iterationsRun: number
  converged: boolean
  memoryUsedMB: number
}

// Report to analytics
const reportMetrics = (metrics: LayoutMetrics) => {
  if (metrics.layoutTimeMs > 1000) {
    console.warn('Slow layout detected:', metrics)
  }

  analytics.track('graph_layout', {
    ...metrics,
    timestamp: Date.now(),
  })
}
```

### Memory Monitoring

```typescript
// Check WASM memory usage
const checkMemory = () => {
  const memory = (performance as any).memory
  if (memory) {
    const usedMB = memory.usedJSHeapSize / 1024 / 1024
    if (usedMB > 500) {
      console.warn('High memory usage:', usedMB, 'MB')
    }
  }
}
```

---

## Comparison: TS vs WASM

### Current TypeScript Implementation

```typescript
// layout-algorithms-optimized.ts
// ~500 lines, O(n²) worst case

for (let i = 0; i < iterations; i++) {
  // Repulsion: O(n²) or O(n log n) with quadtree
  for (const node of nodes) {
    for (const other of nodes) {
      // Calculate repulsion
    }
  }

  // Attraction: O(e)
  for (const edge of edges) {
    // Calculate attraction
  }
}
```

### WASM Implementation

- Same algorithm, just faster execution
- Native f64 operations vs JIT-compiled
- Better cache locality
- No GC pauses
- SIMD potential (future)

---

## Testing Performance

### Unit Tests

```rust
#[test]
fn test_layout_completes_in_time() {
    let graph = generate_test_graph(1000);
    let layout = ForceDirectedLayout::new(LayoutOptions::default());

    let start = std::time::Instant::now();
    layout.run(&mut graph);
    let elapsed = start.elapsed();

    assert!(elapsed.as_millis() < 200, "Layout too slow: {:?}", elapsed);
}
```

### Integration Tests

```typescript
describe('GraphEngine performance', () => {
  it('handles 1000 nodes under 100ms', async () => {
    const { loadGraph, runLayout } = await initGraphEngine()

    const nodes = generateTestNodes(1000)
    const edges = generateTestEdges(nodes, 1500)

    loadGraph(nodes, edges)

    const start = performance.now()
    const result = runLayout({ iterations: 150 })
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(100)
    expect(result.converged).toBe(true)
  })
})
```
