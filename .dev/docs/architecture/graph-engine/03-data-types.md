# 03. Data Types

## Overview

Data types синхронизированы между Rust (WASM) и TypeScript (frontend).

```
┌─────────────────┐         JSON          ┌─────────────────┐
│   TypeScript    │ ◄──────────────────► │      Rust       │
│                 │                       │                 │
│   WasmNode      │ ←───────────────────→ │   Node          │
│   WasmEdge      │ ←───────────────────→ │   Edge          │
│   LayoutOptions │ ←───────────────────→ │   LayoutOptions │
│   LayoutResult  │ ←───────────────────→ │   LayoutResult  │
└─────────────────┘                       └─────────────────┘
```

---

## Node

### Rust

```rust
// src/graph/node.rs

use serde::{Deserialize, Serialize};

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
    pub vx: f64,  // velocity X
    #[serde(skip)]
    pub vy: f64,  // velocity Y
    #[serde(skip)]
    pub fx: Option<f64>,  // fixed X (pinned)
    #[serde(skip)]
    pub fy: Option<f64>,  // fixed Y (pinned)
}

impl Node {
    pub fn new(id: String, label: String, node_type: NodeType) -> Self {
        Self {
            id,
            x: 0.0,
            y: 0.0,
            width: 220.0,  // Default card width
            height: 120.0, // Default card height
            node_type,
            label,
            description: None,
            metadata: serde_json::Value::Null,
            vx: 0.0,
            vy: 0.0,
            fx: None,
            fy: None,
        }
    }

    /// Center point of the node
    pub fn center(&self) -> (f64, f64) {
        (self.x + self.width / 2.0, self.y + self.height / 2.0)
    }

    /// Check if point is inside node bounds
    pub fn contains_point(&self, px: f64, py: f64) -> bool {
        px >= self.x && px <= self.x + self.width &&
        py >= self.y && py <= self.y + self.height
    }

    /// Reset velocity (after layout iteration)
    pub fn reset_velocity(&mut self) {
        self.vx = 0.0;
        self.vy = 0.0;
    }

    /// Check if node is pinned (has fixed position)
    pub fn is_pinned(&self) -> bool {
        self.fx.is_some() || self.fy.is_some()
    }
}
```

### TypeScript

```typescript
// features/graph-wasm/lib/types.ts

export interface WasmNode {
  id: string
  x: number
  y: number
  width: number
  height: number
  node_type: NodeType
  label: string
  description?: string
  metadata: Record<string, unknown>
}

export type NodeType =
  | 'concept'
  | 'theory'
  | 'fact'
  | 'example'
  | 'definition'
  | 'question'
```

---

## NodeType

### Rust

```rust
// src/graph/node.rs

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum NodeType {
    Concept,
    Theory,
    Fact,
    Example,
    Definition,
    Question,
}

impl NodeType {
    /// Mass factor for force simulation (heavier = more stable)
    pub fn mass(&self) -> f64 {
        match self {
            Self::Concept => 2.0,    // Concepts are "heavier"
            Self::Theory => 1.8,
            Self::Definition => 1.5,
            Self::Fact => 1.2,
            Self::Example => 1.0,
            Self::Question => 0.8,
        }
    }

    /// Default dimensions for this node type
    pub fn default_dimensions(&self) -> (f64, f64) {
        match self {
            Self::Concept => (240.0, 140.0),
            Self::Theory => (260.0, 160.0),
            _ => (220.0, 120.0),
        }
    }
}
```

### Mapping to entities/node

```typescript
// Conversion from entities/node to WASM types
import type { Node } from '@/entities/node'
import type { WasmNode, NodeType } from './types'

export const toWasmNode = (node: Node): WasmNode => ({
  id: node.id,
  x: node.position.x,
  y: node.position.y,
  width: 220,
  height: 120,
  node_type: node.type as NodeType,
  label: node.label,
  description: node.description,
  metadata: node.metadata
})
```

---

## Edge

### Rust

```rust
// src/graph/edge.rs

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Edge {
    pub id: String,
    pub source: String,
    pub target: String,
    pub relation_type: RelationType,
    pub weight: f64,
    pub bidirectional: bool,
}

impl Edge {
    pub fn new(id: String, source: String, target: String, relation_type: RelationType) -> Self {
        Self {
            id,
            source,
            target,
            weight: relation_type.default_weight(),
            relation_type,
            bidirectional: false,
        }
    }

    /// Effective weight for layout (combines type weight and custom weight)
    pub fn effective_weight(&self) -> f64 {
        self.relation_type.default_weight() * self.weight
    }
}
```

### TypeScript

```typescript
// features/graph-wasm/lib/types.ts

export interface WasmEdge {
  id: string
  source: string
  target: string
  relation_type: RelationType
  weight: number
  bidirectional: boolean
}

export type RelationType =
  | 'prerequisite'
  | 'is-a'
  | 'part-of'
  | 'explains'
  | 'causes'
  | 'influences'
  | 'has-a'
  | 'similar-to'
  | 'related-to'
  | 'contradicts'
```

---

## RelationType

### Rust

```rust
// src/graph/edge.rs

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
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
    /// Default weight for layout attraction
    /// Higher = stronger pull between connected nodes
    pub fn default_weight(&self) -> f64 {
        match self {
            Self::Prerequisite => 1.0,   // Strongest
            Self::IsA => 0.9,
            Self::PartOf => 0.85,
            Self::Explains => 0.7,
            Self::Causes => 0.65,
            Self::Influences => 0.5,
            Self::HasA => 0.5,
            Self::SimilarTo => 0.4,
            Self::RelatedTo => 0.3,
            Self::Contradicts => 0.2,    // Weakest (repels?)
        }
    }

    /// Whether this edge type implies hierarchy (for vertical layout)
    pub fn is_hierarchical(&self) -> bool {
        matches!(self, Self::Prerequisite | Self::IsA | Self::PartOf | Self::Explains)
    }

    /// Direction strength multiplier for vertical separation
    pub fn direction_strength(&self) -> f64 {
        match self {
            Self::Prerequisite => 1.0,
            Self::IsA => 0.8,
            Self::PartOf => 0.7,
            Self::Explains => 0.5,
            _ => 0.0,  // Non-hierarchical
        }
    }
}
```

---

## Graph

### Rust

```rust
// src/graph/graph.rs

use std::collections::{HashMap, HashSet};
use super::{Node, Edge};

pub struct Graph {
    pub nodes: HashMap<String, Node>,
    pub edges: Vec<Edge>,

    // Adjacency lists for fast traversal
    outgoing: HashMap<String, Vec<usize>>,  // node_id → edge indices
    incoming: HashMap<String, Vec<usize>>,
}

impl Graph {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            edges: Vec::new(),
            outgoing: HashMap::new(),
            incoming: HashMap::new(),
        }
    }

    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        #[derive(Deserialize)]
        struct GraphData {
            nodes: Vec<Node>,
            edges: Vec<Edge>,
        }

        let data: GraphData = serde_json::from_str(json)?;
        let mut graph = Self::new();

        for node in data.nodes {
            graph.add_node(node);
        }
        for edge in data.edges {
            graph.add_edge(edge);
        }

        Ok(graph)
    }

    pub fn add_node(&mut self, node: Node) {
        let id = node.id.clone();
        self.nodes.insert(id.clone(), node);
        self.outgoing.entry(id.clone()).or_default();
        self.incoming.entry(id).or_default();
    }

    pub fn add_edge(&mut self, edge: Edge) {
        let idx = self.edges.len();
        self.outgoing
            .entry(edge.source.clone())
            .or_default()
            .push(idx);
        self.incoming
            .entry(edge.target.clone())
            .or_default()
            .push(idx);
        self.edges.push(edge);
    }

    pub fn get_node(&self, id: &str) -> Option<&Node> {
        self.nodes.get(id)
    }

    pub fn get_node_mut(&mut self, id: &str) -> Option<&mut Node> {
        self.nodes.get_mut(id)
    }

    /// Get all neighbors (both incoming and outgoing)
    pub fn neighbors(&self, id: &str) -> impl Iterator<Item = &str> {
        let outgoing = self.outgoing.get(id)
            .map(|indices| indices.iter().map(|&i| self.edges[i].target.as_str()))
            .into_iter()
            .flatten();

        let incoming = self.incoming.get(id)
            .map(|indices| indices.iter().map(|&i| self.edges[i].source.as_str()))
            .into_iter()
            .flatten();

        outgoing.chain(incoming)
    }

    /// Get nodes within N hops from start node (BFS)
    pub fn nodes_within_depth(&self, start: &str, depth: usize) -> HashSet<String> {
        let mut visited = HashSet::new();
        let mut queue = vec![(start.to_string(), 0usize)];

        while let Some((node_id, d)) = queue.pop() {
            if d > depth || visited.contains(&node_id) {
                continue;
            }
            visited.insert(node_id.clone());

            if d < depth {
                for neighbor in self.neighbors(&node_id) {
                    if !visited.contains(neighbor) {
                        queue.push((neighbor.to_string(), d + 1));
                    }
                }
            }
        }

        visited
    }

    pub fn node_count(&self) -> usize {
        self.nodes.len()
    }

    pub fn edge_count(&self) -> usize {
        self.edges.len()
    }
}

impl Default for Graph {
    fn default() -> Self {
        Self::new()
    }
}
```

---

## Layout Types

### LayoutOptions

```rust
// src/layout/config.rs

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LayoutOptions {
    pub view_mode: ViewMode,
    pub focused_node_id: Option<String>,
    pub spacing_percent: f64,       // 50-200, default 100
    pub direction_strength: f64,    // 0-100, default 100
    pub iterations: usize,          // default 150
    pub cooling_factor: f64,        // default 0.97
    pub theta: f64,                 // Barnes-Hut threshold, default 0.9
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ViewMode {
    Overview,
    Focus,
    Path,
}

impl Default for LayoutOptions {
    fn default() -> Self {
        Self {
            view_mode: ViewMode::Overview,
            focused_node_id: None,
            spacing_percent: 100.0,
            direction_strength: 100.0,
            iterations: 150,
            cooling_factor: 0.97,
            theta: 0.9,
        }
    }
}
```

### LayoutResult

```rust
// src/layout/mod.rs

use serde::Serialize;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LayoutResult {
    pub nodes: Vec<NodePosition>,
    pub elapsed_ms: f64,
    pub iterations_run: usize,
    pub converged: bool,
}

#[derive(Clone, Debug, Serialize)]
pub struct NodePosition {
    pub id: String,
    pub x: f64,
    pub y: f64,
}
```

### TypeScript equivalents

```typescript
// features/graph-wasm/lib/types.ts

export interface LayoutOptions {
  viewMode: 'overview' | 'focus' | 'path'
  focusedNodeId?: string
  spacingPercent: number      // 50-200
  directionStrength: number   // 0-100
  iterations: number
  coolingFactor: number
  theta: number
}

export interface LayoutResult {
  nodes: NodePosition[]
  elapsedMs: number
  iterationsRun: number
  converged: boolean
}

export interface NodePosition {
  id: string
  x: number
  y: number
}
```

---

## Type Safety

### serde rename strategies

```rust
// Consistent JSON field naming
#[serde(rename_all = "camelCase")]  // Rust snake_case → JS camelCase
#[serde(rename_all = "kebab-case")] // For enums like RelationType
```

### Validation

```rust
impl LayoutOptions {
    pub fn validate(&self) -> Result<(), String> {
        if self.spacing_percent < 50.0 || self.spacing_percent > 200.0 {
            return Err("spacing_percent must be 50-200".into());
        }
        if self.direction_strength < 0.0 || self.direction_strength > 100.0 {
            return Err("direction_strength must be 0-100".into());
        }
        if self.iterations == 0 {
            return Err("iterations must be > 0".into());
        }
        Ok(())
    }
}
```
