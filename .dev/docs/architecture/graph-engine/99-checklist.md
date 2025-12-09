# 99. Implementation Checklist

## Phase 1: Layout Engine (MVP)

### Step 1: Project Setup

- [ ] Create `graph-engine/` directory at project root
- [ ] Initialize Cargo.toml with wasm-bindgen dependencies
- [ ] Setup basic module structure (`lib.rs`, `graph/`, `layout/`)
- [ ] Configure wasm-pack for web target
- [ ] Add `.gitignore` for `target/` and `pkg/`
- [ ] Test basic "hello world" WASM export

```bash
# Commands
mkdir graph-engine && cd graph-engine
cargo init --lib
# Edit Cargo.toml
wasm-pack build --target web
```

### Step 2: Core Data Structures

- [ ] Implement `Node` struct with serde derives
- [ ] Implement `NodeType` enum with all variants
- [ ] Implement `Edge` struct
- [ ] Implement `RelationType` enum with weights
- [ ] Implement `Graph` container with HashMap
- [ ] Add adjacency lists (outgoing/incoming)
- [ ] Implement `from_json()` parser
- [ ] Write unit tests for data structures

**Acceptance criteria**:
```rust
let json = r#"{"nodes":[...],"edges":[...]}"#;
let graph = Graph::from_json(json)?;
assert_eq!(graph.node_count(), expected);
```

### Step 3: Layout Algorithm

- [ ] Implement `Rect` struct for bounds
- [ ] Implement `QuadTree` structure
- [ ] Implement QuadTree `build()` from positions
- [ ] Implement Barnes-Hut `calculate_repulsion()`
- [ ] Implement `ForceDirectedLayout` struct
- [ ] Implement repulsive forces loop
- [ ] Implement attractive forces (edge springs)
- [ ] Implement direction forces (hierarchy)
- [ ] Implement center gravity
- [ ] Implement velocity application with temperature
- [ ] Implement convergence detection
- [ ] Write benchmark tests

**Acceptance criteria**:
```rust
let mut graph = generate_test_graph(1000);
let layout = ForceDirectedLayout::new(options);
let result = layout.run(&mut graph);
assert!(result.elapsed_ms < 100.0);
```

### Step 4: WASM Bindings

- [ ] Create `GraphEngine` struct with wasm_bindgen
- [ ] Implement `new()` constructor
- [ ] Implement `load_graph()` with JSON parsing
- [ ] Implement `run_layout()` returning JSON
- [ ] Implement `step_layout()` for animation
- [ ] Implement `hit_test()` for interaction
- [ ] Implement `update_node_position()` for drag
- [ ] Implement `get_all_positions()` for sync
- [ ] Add error handling (Result → JsValue)
- [ ] Add console_error_panic_hook
- [ ] Generate TypeScript declarations

**Acceptance criteria**:
```javascript
const engine = new GraphEngine();
engine.load_graph(jsonString);
const result = JSON.parse(engine.run_layout(optionsJson));
expect(result.nodes).toHaveLength(expectedCount);
```

### Step 5: Frontend Integration

- [ ] Install Vite WASM plugins
- [ ] Create `features/graph-wasm/` directory
- [ ] Create TypeScript types (`types.ts`)
- [ ] Create feature detection (`feature-detect.ts`)
- [ ] Create data transformation (`transform.ts`)
- [ ] Create `useGraphEngine` hook
- [ ] Create `useAnimatedLayout` hook
- [ ] Create `GraphWasmVisualization` component
- [ ] Add error boundary
- [ ] Update barrel exports (`index.ts`)
- [ ] Test with small graph

**Acceptance criteria**:
```typescript
const { isReady, runLayout } = useGraphEngine()
// Component renders and layout completes
```

### Step 6: Testing & Validation

- [ ] A/B comparison: WASM vs TS layout positions
- [ ] Performance benchmarks at 100, 500, 1000 nodes
- [ ] Memory usage profiling
- [ ] Browser compatibility testing (Chrome, Firefox, Safari)
- [ ] Edge cases: empty graph, single node, disconnected
- [ ] Error handling: invalid JSON, missing nodes

---

## Phase 2: WebGL Rendering (Optional)

### Prerequisites
- [ ] Phase 1 complete and stable
- [ ] Performance measurements show DOM is bottleneck
- [ ] Target scale confirmed (5000+ nodes)

### Step 7: WebGL Setup

- [ ] Add WebGL features to Cargo.toml
- [ ] Create `render/` module
- [ ] Create `Renderer` struct with WebGL context
- [ ] Compile node vertex shader
- [ ] Compile node fragment shader
- [ ] Setup VAO and buffers
- [ ] Test basic quad rendering

### Step 8: Node Rendering

- [ ] Implement instanced quad rendering
- [ ] Add rounded rectangle SDF in fragment shader
- [ ] Add selection highlight
- [ ] Add shadow/glow effects
- [ ] Implement viewport transformation
- [ ] Implement viewport culling

### Step 9: Edge Rendering

- [ ] Implement bezier tessellation
- [ ] Create edge vertex buffer
- [ ] Add line width via geometry
- [ ] Add arrow heads
- [ ] Add edge colors per type

### Step 10: DOM Overlay

- [ ] Create `DomOverlay` React component
- [ ] Sync positions with WebGL canvas
- [ ] Implement text labels
- [ ] Implement click zones
- [ ] Handle zoom scaling

---

## Migration Checklist

### Before Migration

- [ ] Current graph feature has comprehensive tests
- [ ] Performance baseline documented
- [ ] Rollback plan defined

### During Migration

- [ ] Feature flag for WASM (`graph-wasm` flag)
- [ ] A/B testing setup
- [ ] Monitoring for errors/performance

### After Migration

- [ ] Remove feature flag (100% rollout)
- [ ] Archive old `features/graph/` (don't delete yet)
- [ ] Update documentation
- [ ] Performance report

---

## Quick Reference

### Build Commands

```bash
# Build WASM
cd graph-engine
wasm-pack build --target web --out-dir ../frontend/src/features/graph-wasm/pkg

# Build WASM (release)
wasm-pack build --target web --release --out-dir ../frontend/src/features/graph-wasm/pkg

# Run Rust tests
cargo test

# Run benchmarks
cargo bench

# Check WASM size
ls -lh pkg/*.wasm
```

### Frontend Commands

```bash
# Build with WASM
npm run build:wasm && npm run build

# Dev with WASM
npm run dev:wasm

# Test WASM integration
npm test -- --grep "graph-wasm"
```

### Debug Tips

```rust
// Log to browser console
web_sys::console::log_1(&"Debug message".into());

// Enable panic hook
console_error_panic_hook::set_once();
```

```typescript
// Check if WASM loaded
console.log('WASM ready:', isReady)

// Measure layout time
performance.mark('start')
runLayout(options)
performance.measure('layout', 'start')
```

---

## Definition of Done

### Phase 1 Complete When:

1. ✅ WASM module builds without errors
2. ✅ Layout produces same results as TS (within tolerance)
3. ✅ 10x performance improvement at 1000 nodes
4. ✅ All existing graph tests pass
5. ✅ No memory leaks after 100 layout cycles
6. ✅ Works in Chrome, Firefox, Safari
7. ✅ Error handling doesn't crash app
8. ✅ Documentation updated

### Phase 2 Complete When:

1. ✅ WebGL renders 5000 nodes at 60 FPS
2. ✅ Text remains readable (DOM overlay)
3. ✅ Interactions work (click, drag, zoom)
4. ✅ Accessibility maintained (keyboard nav)
5. ✅ Mobile performance acceptable

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WASM bundle too large | Low | Medium | Tree shaking, lazy load |
| Browser incompatibility | Low | High | Feature detection, fallback |
| Layout differs from TS | Medium | Medium | Side-by-side comparison |
| Memory leaks | Medium | High | Explicit free(), monitoring |
| Performance regression | Low | High | A/B testing, rollback plan |
| Debug difficulty | Medium | Low | Source maps, console hooks |

---

## Timeline Estimate

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Step 1-2 | 2-3 days | None |
| Step 3 | 3-4 days | Step 2 |
| Step 4 | 2-3 days | Step 3 |
| Step 5 | 2-3 days | Step 4 |
| Step 6 | 2-3 days | Step 5 |
| **Phase 1 Total** | **~2 weeks** | |
| Step 7-10 | 2-3 weeks | Phase 1 |
| **Phase 2 Total** | **~3 weeks** | |

> Note: Estimates assume familiarity with Rust and WASM. Add buffer for learning curve if needed.
