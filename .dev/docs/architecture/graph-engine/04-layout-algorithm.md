# 04. Layout Algorithm

## Overview

Force-directed layout с Barnes-Hut оптимизацией для O(n log n) сложности.

```
┌─────────────────────────────────────────────────────────────┐
│                    Layout Pipeline                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Build QuadTree ──────► O(n log n)                       │
│           │                                                  │
│           ▼                                                  │
│  2. Repulsive Forces ────► Barnes-Hut approximation         │
│           │                 O(n log n) vs O(n²)             │
│           ▼                                                  │
│  3. Attractive Forces ───► Edge springs                     │
│           │                 O(e)                             │
│           ▼                                                  │
│  4. Direction Forces ────► Vertical hierarchy               │
│           │                 O(e)                             │
│           ▼                                                  │
│  5. Center Gravity ──────► Prevent drift                    │
│           │                 O(n)                             │
│           ▼                                                  │
│  6. Apply Velocities ────► Temperature limiting             │
│           │                 O(n)                             │
│           ▼                                                  │
│  7. Repeat until converged                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## QuadTree (Barnes-Hut)

### Концепция

Вместо вычисления O(n²) парных взаимодействий, группируем далёкие ноды:

```
┌───────────────────────────────────┐
│               │                   │
│   ●  ●       │                   │
│     ●        │        ◐          │  ← Далёкий кластер аппроксимируем
│              │     (center       │     одной "массой" в центре
├──────────────┼───────────────────┤
│              │                   │
│              │                   │
│      ★       │                   │  ★ = текущая нода
│              │                   │
└───────────────────────────────────┘

Если s/d < θ (theta), используем аппроксимацию
s = размер квадранта
d = расстояние до квадранта
θ = 0.9 (threshold)
```

### Реализация

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
    body: Option<usize>,        // Index if leaf node
    children: Option<[Box<QuadNode>; 4]>,  // NW, NE, SW, SE
}

#[derive(Clone, Copy)]
pub struct Rect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

impl QuadTree {
    /// Build tree from node positions
    pub fn build(positions: &[(f64, f64, f64)]) -> Self {
        // positions: [(x, y, mass), ...]

        // Calculate bounds
        let (min_x, max_x, min_y, max_y) = positions.iter().fold(
            (f64::MAX, f64::MIN, f64::MAX, f64::MIN),
            |(min_x, max_x, min_y, max_y), (x, y, _)| {
                (min_x.min(*x), max_x.max(*x), min_y.min(*y), max_y.max(*y))
            },
        );

        let size = (max_x - min_x).max(max_y - min_y) * 1.1;  // 10% padding
        let bounds = Rect {
            x: min_x - size * 0.05,
            y: min_y - size * 0.05,
            width: size,
            height: size,
        };

        let mut tree = Self { root: None, bounds };

        for (i, &(x, y, mass)) in positions.iter().enumerate() {
            tree.insert(i, x, y, mass);
        }

        tree
    }

    fn insert(&mut self, index: usize, x: f64, y: f64, mass: f64) {
        // Insert node into tree, subdividing as needed
        // ... implementation details
    }

    /// Calculate repulsive force on a point using Barnes-Hut approximation
    pub fn calculate_repulsion(
        &self,
        px: f64,
        py: f64,
        theta: f64,
        ideal_distance_sq: f64,
    ) -> (f64, f64) {
        if let Some(ref root) = self.root {
            self.calculate_force(root, px, py, theta, ideal_distance_sq)
        } else {
            (0.0, 0.0)
        }
    }

    fn calculate_force(
        &self,
        node: &QuadNode,
        px: f64,
        py: f64,
        theta: f64,
        ideal_distance_sq: f64,
    ) -> (f64, f64) {
        let dx = node.center_of_mass.0 - px;
        let dy = node.center_of_mass.1 - py;
        let dist_sq = dx * dx + dy * dy;

        if dist_sq < 0.01 {
            return (0.0, 0.0);  // Too close, skip
        }

        let s = node.bounds.width;
        let d = dist_sq.sqrt();

        // Barnes-Hut criterion: if node is far enough, treat as single mass
        if node.children.is_none() || s / d < theta {
            // Coulomb-like repulsion: F = k * m1 * m2 / r²
            let force = ideal_distance_sq * node.total_mass / dist_sq;
            let fx = -dx / d * force;
            let fy = -dy / d * force;
            return (fx, fy);
        }

        // Otherwise, recurse into children
        if let Some(ref children) = node.children {
            let mut total_fx = 0.0;
            let mut total_fy = 0.0;
            for child in children.iter() {
                let (fx, fy) = self.calculate_force(child, px, py, theta, ideal_distance_sq);
                total_fx += fx;
                total_fy += fy;
            }
            (total_fx, total_fy)
        } else {
            (0.0, 0.0)
        }
    }
}
```

---

## Force-Directed Layout

### Основной алгоритм

```rust
// src/layout/force_directed.rs

use super::{QuadTree, LayoutOptions, LayoutResult, NodePosition};
use crate::graph::Graph;

pub struct ForceDirectedLayout {
    options: LayoutOptions,
    ideal_distance: f64,
}

impl ForceDirectedLayout {
    pub fn new(options: LayoutOptions) -> Self {
        // ideal_distance scales with spacing_percent
        let base_distance = 200.0;
        let ideal_distance = base_distance * (options.spacing_percent / 100.0);

        Self {
            options,
            ideal_distance,
        }
    }

    pub fn run(&self, graph: &mut Graph) -> LayoutResult {
        let start = web_sys::window()
            .and_then(|w| w.performance())
            .map(|p| p.now())
            .unwrap_or(0.0);

        let mut temperature = self.ideal_distance * 0.5;
        let mut iterations_run = 0;
        let mut converged = false;

        for iter in 0..self.options.iterations {
            iterations_run = iter + 1;

            // 1. Build QuadTree for Barnes-Hut
            let positions: Vec<_> = graph.nodes.values()
                .map(|n| {
                    let (cx, cy) = n.center();
                    (cx, cy, n.node_type.mass())
                })
                .collect();

            let tree = QuadTree::build(&positions);

            // 2. Calculate forces
            let ideal_sq = self.ideal_distance * self.ideal_distance;

            // Repulsive forces (Barnes-Hut)
            for node in graph.nodes.values_mut() {
                if node.is_pinned() { continue; }

                let (cx, cy) = node.center();
                let (fx, fy) = tree.calculate_repulsion(
                    cx, cy,
                    self.options.theta,
                    ideal_sq,
                );
                node.vx += fx;
                node.vy += fy;
            }

            // Attractive forces (edges)
            self.apply_attraction(graph);

            // Direction forces (hierarchy)
            if self.options.direction_strength > 0.0 {
                self.apply_direction(graph);
            }

            // Center gravity
            self.apply_center_gravity(graph);

            // 3. Apply velocities with temperature limiting
            let max_displacement = self.apply_velocities(graph, temperature);

            // 4. Cool down
            temperature *= self.options.cooling_factor;

            // 5. Check convergence
            if max_displacement < 0.5 {
                converged = true;
                break;
            }
        }

        let elapsed_ms = web_sys::window()
            .and_then(|w| w.performance())
            .map(|p| p.now() - start)
            .unwrap_or(0.0);

        LayoutResult {
            nodes: graph.nodes.values()
                .map(|n| NodePosition {
                    id: n.id.clone(),
                    x: n.x,
                    y: n.y,
                })
                .collect(),
            elapsed_ms,
            iterations_run,
            converged,
        }
    }

    /// Incremental layout for animation
    pub fn step(&self, graph: &mut Graph, iterations: usize, temperature: f64) -> (LayoutResult, f64) {
        // Same as run() but:
        // - Limited iterations per call
        // - Returns new temperature
        // - Caller manages temperature between frames
        // ... implementation
        todo!()
    }
}
```

### Attractive Forces

```rust
impl ForceDirectedLayout {
    fn apply_attraction(&self, graph: &mut Graph) {
        // We need indices because we modify nodes while iterating edges
        let edge_data: Vec<_> = graph.edges.iter()
            .map(|e| (e.source.clone(), e.target.clone(), e.effective_weight()))
            .collect();

        for (source_id, target_id, weight) in edge_data {
            let (sx, sy, tx, ty) = {
                let source = match graph.nodes.get(&source_id) {
                    Some(n) => n,
                    None => continue,
                };
                let target = match graph.nodes.get(&target_id) {
                    Some(n) => n,
                    None => continue,
                };
                let (scx, scy) = source.center();
                let (tcx, tcy) = target.center();
                (scx, scy, tcx, tcy)
            };

            let dx = tx - sx;
            let dy = ty - sy;
            let dist = (dx * dx + dy * dy).sqrt().max(0.01);

            // Hooke's law: F = k * (d - ideal) / d
            // Simplified: F = d² / ideal (stronger when far apart)
            let force = (dist * dist / self.ideal_distance) * weight;
            let fx = (dx / dist) * force;
            let fy = (dy / dist) * force;

            // Apply to both nodes (equal and opposite)
            if let Some(source) = graph.nodes.get_mut(&source_id) {
                if !source.is_pinned() {
                    source.vx += fx;
                    source.vy += fy;
                }
            }
            if let Some(target) = graph.nodes.get_mut(&target_id) {
                if !target.is_pinned() {
                    target.vx -= fx;
                    target.vy -= fy;
                }
            }
        }
    }
}
```

### Direction Forces (Hierarchy)

```rust
impl ForceDirectedLayout {
    fn apply_direction(&self, graph: &mut Graph) {
        let strength = self.options.direction_strength / 100.0;
        let level_spacing = self.ideal_distance * 1.5;

        let edge_data: Vec<_> = graph.edges.iter()
            .filter(|e| e.relation_type.is_hierarchical())
            .map(|e| (
                e.source.clone(),
                e.target.clone(),
                e.relation_type.direction_strength()
            ))
            .collect();

        for (source_id, target_id, type_strength) in edge_data {
            let effective_strength = strength * type_strength * level_spacing;

            // Push source UP (negative Y)
            if let Some(source) = graph.nodes.get_mut(&source_id) {
                if !source.is_pinned() {
                    source.vy -= effective_strength;
                }
            }

            // Push target DOWN (positive Y)
            if let Some(target) = graph.nodes.get_mut(&target_id) {
                if !target.is_pinned() {
                    target.vy += effective_strength;
                }
            }
        }
    }
}
```

### Center Gravity

```rust
impl ForceDirectedLayout {
    fn apply_center_gravity(&self, graph: &mut Graph) {
        // Calculate center of mass
        let (sum_x, sum_y, count) = graph.nodes.values()
            .fold((0.0, 0.0, 0usize), |(sx, sy, c), n| {
                let (cx, cy) = n.center();
                (sx + cx, sy + cy, c + 1)
            });

        if count == 0 { return; }

        let center_x = sum_x / count as f64;
        let center_y = sum_y / count as f64;

        // Pull nodes toward center (weak force)
        let gravity = 0.01;

        for node in graph.nodes.values_mut() {
            if node.is_pinned() { continue; }

            let (cx, cy) = node.center();
            node.vx -= (cx - center_x) * gravity;
            node.vy -= (cy - center_y) * gravity;
        }
    }
}
```

### Apply Velocities

```rust
impl ForceDirectedLayout {
    fn apply_velocities(&self, graph: &mut Graph, temperature: f64) -> f64 {
        let mut max_displacement = 0.0;

        for node in graph.nodes.values_mut() {
            if node.is_pinned() {
                // Pinned nodes use fixed position
                if let Some(fx) = node.fx {
                    node.x = fx - node.width / 2.0;
                }
                if let Some(fy) = node.fy {
                    node.y = fy - node.height / 2.0;
                }
                node.reset_velocity();
                continue;
            }

            // Limit velocity by temperature
            let speed = (node.vx * node.vx + node.vy * node.vy).sqrt();
            if speed > temperature {
                node.vx = node.vx / speed * temperature;
                node.vy = node.vy / speed * temperature;
            }

            // Apply velocity
            node.x += node.vx;
            node.y += node.vy;

            max_displacement = max_displacement.max(speed);

            // Reset for next iteration
            node.reset_velocity();
        }

        max_displacement
    }
}
```

---

## Focus Mode Layout

Для режима Focus нужны модификации:

```rust
impl ForceDirectedLayout {
    fn run_focus_mode(&self, graph: &mut Graph) -> LayoutResult {
        let focused_id = match &self.options.focused_node_id {
            Some(id) => id.clone(),
            None => return self.run(graph),  // Fallback to overview
        };

        // 1. Pin focused node to center
        if let Some(focused) = graph.nodes.get_mut(&focused_id) {
            focused.fx = Some(0.0);
            focused.fy = Some(0.0);
        }

        // 2. Run normal layout (focused node stays pinned)
        let result = self.run(graph);

        // 3. Unpin
        if let Some(focused) = graph.nodes.get_mut(&focused_id) {
            focused.fx = None;
            focused.fy = None;
        }

        result
    }
}
```

---

## Constants

```rust
// src/layout/config.rs

/// Default node spacing (pixels)
pub const DEFAULT_NODE_SPACING: f64 = 200.0;

/// Default vertical spacing between hierarchy levels
pub const DEFAULT_LEVEL_SPACING: f64 = 300.0;

/// Default number of layout iterations
pub const DEFAULT_ITERATIONS: usize = 150;

/// Default cooling factor (temperature decay per iteration)
pub const DEFAULT_COOLING_FACTOR: f64 = 0.97;

/// Default Barnes-Hut theta (approximation threshold)
/// Higher = faster but less accurate
/// 0.9 is good balance for 1000+ nodes
pub const DEFAULT_THETA: f64 = 0.9;

/// Minimum distance between nodes (collision avoidance)
pub const MIN_NODE_DISTANCE: f64 = 10.0;

/// Convergence threshold (max displacement to stop early)
pub const CONVERGENCE_THRESHOLD: f64 = 0.5;
```

---

## Complexity Analysis

| Operation | Naive | Barnes-Hut |
|-----------|-------|------------|
| Build tree | — | O(n log n) |
| Repulsion | O(n²) | O(n log n) |
| Attraction | O(e) | O(e) |
| Total/iter | O(n² + e) | O(n log n + e) |
| 1000 nodes | ~1M ops | ~10K ops |

**Speedup factor**: ~100x for 1000 nodes
