# 07. WebGL Rendering (Phase 2)

> **Status**: Optional future enhancement
>
> **When needed**: Graphs with 5000+ nodes where DOM becomes bottleneck

## Overview

Phase 2 добавляет WebGL рендеринг для графических элементов, сохраняя DOM для текста.

```
┌─────────────────────────────────────────────────────────────┐
│                      Rendering Stack                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  z-index: 2  ┌─────────────────────────────────────────┐    │
│              │          UI Controls (React)            │    │
│              │    Toolbar, Minimap, Zoom buttons      │    │
│              └─────────────────────────────────────────┘    │
│                                                              │
│  z-index: 1  ┌─────────────────────────────────────────┐    │
│              │          DOM Overlay (React)            │    │
│              │    Text labels, Icons, Badges          │    │
│              │    Interactive elements (click zones)  │    │
│              └─────────────────────────────────────────┘    │
│                                                              │
│  z-index: 0  ┌─────────────────────────────────────────┐    │
│              │          WebGL Canvas (WASM)            │    │
│              │    Node backgrounds (instanced quads)  │    │
│              │    Edges (bezier/line segments)        │    │
│              │    Shadows, Glows, Selection rings     │    │
│              └─────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Why Hybrid Rendering?

### DOM для текста

| Аспект | DOM | WebGL |
|--------|-----|-------|
| Subpixel rendering | ✅ Native | ❌ Blurry |
| Text selection | ✅ Native | ❌ Custom |
| Accessibility | ✅ Screen readers | ❌ Canvas |
| Font rendering | ✅ System fonts | ❌ Atlas/SDF |
| i18n/RTL | ✅ Native | ❌ Complex |

### WebGL для графики

| Аспект | DOM | WebGL |
|--------|-----|-------|
| 1000 nodes | ~30 FPS | 60 FPS |
| 5000 nodes | ~5 FPS | 60 FPS |
| Bezier edges | ~10 FPS | 60 FPS |
| GPU memory | High (paint layers) | Low (buffers) |

---

## Rust WebGL Bindings

### Cargo.toml

```toml
[features]
default = ["console_error_panic_hook"]
webgl = [
    "web-sys/WebGl2RenderingContext",
    "web-sys/WebGlProgram",
    "web-sys/WebGlShader",
    "web-sys/WebGlBuffer",
    "web-sys/WebGlVertexArrayObject",
    "web-sys/WebGlUniformLocation",
    "web-sys/HtmlCanvasElement",
]
```

### Renderer Struct

```rust
// src/render/mod.rs

use web_sys::{WebGl2RenderingContext, WebGlProgram, WebGlBuffer, WebGlVertexArrayObject};
use wasm_bindgen::JsCast;

pub struct Renderer {
    gl: WebGl2RenderingContext,
    node_program: WebGlProgram,
    edge_program: WebGlProgram,
    node_vao: WebGlVertexArrayObject,
    node_instance_buffer: WebGlBuffer,
    edge_vao: WebGlVertexArrayObject,
    edge_vertex_buffer: WebGlBuffer,
    viewport: Viewport,
}

impl Renderer {
    pub fn new(canvas_id: &str) -> Result<Self, String> {
        let document = web_sys::window()
            .ok_or("No window")?
            .document()
            .ok_or("No document")?;

        let canvas = document
            .get_element_by_id(canvas_id)
            .ok_or("Canvas not found")?
            .dyn_into::<web_sys::HtmlCanvasElement>()
            .map_err(|_| "Not a canvas")?;

        let gl = canvas
            .get_context("webgl2")
            .map_err(|_| "WebGL2 not supported")?
            .ok_or("WebGL2 context failed")?
            .dyn_into::<WebGl2RenderingContext>()
            .map_err(|_| "WebGL2 cast failed")?;

        // Compile shaders, create buffers...
        let node_program = Self::compile_node_program(&gl)?;
        let edge_program = Self::compile_edge_program(&gl)?;

        // ... setup VAOs and buffers

        Ok(Self {
            gl,
            node_program,
            edge_program,
            // ...
        })
    }

    pub fn render(&mut self, graph: &Graph, viewport: &Viewport) {
        let gl = &self.gl;

        // Clear
        gl.clear_color(0.0, 0.0, 0.0, 0.0);  // Transparent
        gl.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT);

        // Update viewport uniform
        self.update_viewport_uniform(viewport);

        // Render edges first (below nodes)
        self.render_edges(graph, viewport);

        // Render nodes
        self.render_nodes(graph, viewport);
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        self.gl.viewport(0, 0, width as i32, height as i32);
    }
}
```

---

## Shaders

### Node Vertex Shader

```glsl
// Instanced rendering - one draw call for all nodes
#version 300 es

// Per-vertex attributes (quad corners)
layout(location = 0) in vec2 a_position;  // [-0.5, 0.5]

// Per-instance attributes
layout(location = 1) in vec2 a_offset;    // Node center
layout(location = 2) in vec2 a_size;      // Node width/height
layout(location = 3) in vec4 a_color;     // Background color
layout(location = 4) in float a_corner_radius;
layout(location = 5) in float a_selected; // 0 or 1

// Uniforms
uniform mat3 u_view_matrix;  // Camera transform

// Outputs to fragment shader
out vec2 v_uv;
out vec4 v_color;
out vec2 v_size;
out float v_corner_radius;
out float v_selected;

void main() {
    // Scale quad to node size
    vec2 scaled = a_position * a_size;

    // Apply offset
    vec2 world_pos = scaled + a_offset;

    // Apply view transform
    vec3 clip_pos = u_view_matrix * vec3(world_pos, 1.0);

    gl_Position = vec4(clip_pos.xy, 0.0, 1.0);

    // Pass to fragment
    v_uv = a_position + 0.5;  // [0, 1]
    v_color = a_color;
    v_size = a_size;
    v_corner_radius = a_corner_radius;
    v_selected = a_selected;
}
```

### Node Fragment Shader

```glsl
#version 300 es
precision highp float;

in vec2 v_uv;
in vec4 v_color;
in vec2 v_size;
in float v_corner_radius;
in float v_selected;

out vec4 fragColor;

// Rounded rectangle SDF
float roundedRectSDF(vec2 p, vec2 size, float radius) {
    vec2 d = abs(p) - size + radius;
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - radius;
}

void main() {
    // Convert UV to local coordinates
    vec2 local = (v_uv - 0.5) * v_size;

    // SDF for rounded rectangle
    float dist = roundedRectSDF(local, v_size * 0.5, v_corner_radius);

    // Anti-aliased edge
    float alpha = 1.0 - smoothstep(-1.0, 1.0, dist);

    // Border for selected nodes
    if (v_selected > 0.5) {
        float border_dist = abs(dist) - 2.0;
        float border_alpha = 1.0 - smoothstep(-1.0, 1.0, border_dist);
        vec4 border_color = vec4(0.4, 0.6, 1.0, 1.0);  // Selection blue
        fragColor = mix(v_color, border_color, border_alpha * 0.8);
        fragColor.a *= alpha;
    } else {
        fragColor = v_color;
        fragColor.a *= alpha;
    }
}
```

### Edge Vertex Shader

```glsl
#version 300 es

layout(location = 0) in vec2 a_position;  // Bezier control points
layout(location = 1) in vec4 a_color;
layout(location = 2) in float a_width;

uniform mat3 u_view_matrix;

out vec4 v_color;

void main() {
    vec3 clip_pos = u_view_matrix * vec3(a_position, 1.0);
    gl_Position = vec4(clip_pos.xy, 0.0, 1.0);
    v_color = a_color;
}
```

---

## Instanced Rendering

```rust
impl Renderer {
    fn render_nodes(&mut self, graph: &Graph, viewport: &Viewport) {
        let gl = &self.gl;

        // Collect visible node data
        let instance_data: Vec<f32> = graph.nodes.values()
            .filter(|n| viewport.contains_node(n))
            .flat_map(|n| {
                let color = node_type_to_color(n.node_type);
                vec![
                    n.x + n.width / 2.0,   // offset x
                    n.y + n.height / 2.0,  // offset y
                    n.width as f32,        // size x
                    n.height as f32,       // size y
                    color.0, color.1, color.2, color.3, // RGBA
                    8.0,                   // corner radius
                    if n.is_selected { 1.0 } else { 0.0 },
                ]
            })
            .collect();

        let instance_count = instance_data.len() / 10;

        if instance_count == 0 { return; }

        // Upload instance data
        gl.bind_buffer(
            WebGl2RenderingContext::ARRAY_BUFFER,
            Some(&self.node_instance_buffer)
        );

        unsafe {
            let array = js_sys::Float32Array::view(&instance_data);
            gl.buffer_data_with_array_buffer_view(
                WebGl2RenderingContext::ARRAY_BUFFER,
                &array,
                WebGl2RenderingContext::DYNAMIC_DRAW,
            );
        }

        // Draw instanced
        gl.use_program(Some(&self.node_program));
        gl.bind_vertex_array(Some(&self.node_vao));
        gl.draw_arrays_instanced(
            WebGl2RenderingContext::TRIANGLE_STRIP,
            0,
            4,  // 4 vertices per quad
            instance_count as i32,
        );
    }
}
```

---

## Edge Tessellation

Bezier curves need to be tessellated into line segments:

```rust
// src/render/bezier.rs

/// Tessellate cubic bezier into line segments
pub fn tessellate_bezier(
    p0: (f64, f64),
    p1: (f64, f64),
    p2: (f64, f64),
    p3: (f64, f64),
    tolerance: f64,
) -> Vec<(f64, f64)> {
    let mut points = vec![p0];
    tessellate_recursive(p0, p1, p2, p3, tolerance, &mut points);
    points.push(p3);
    points
}

fn tessellate_recursive(
    p0: (f64, f64),
    p1: (f64, f64),
    p2: (f64, f64),
    p3: (f64, f64),
    tolerance: f64,
    points: &mut Vec<(f64, f64)>,
) {
    // Check if curve is flat enough
    let d1 = point_line_distance(p1, p0, p3);
    let d2 = point_line_distance(p2, p0, p3);

    if d1 + d2 < tolerance {
        return;
    }

    // De Casteljau subdivision
    let p01 = midpoint(p0, p1);
    let p12 = midpoint(p1, p2);
    let p23 = midpoint(p2, p3);
    let p012 = midpoint(p01, p12);
    let p123 = midpoint(p12, p23);
    let p0123 = midpoint(p012, p123);

    tessellate_recursive(p0, p01, p012, p0123, tolerance, points);
    points.push(p0123);
    tessellate_recursive(p0123, p123, p23, p3, tolerance, points);
}
```

---

## DOM Overlay Sync

```typescript
// features/graph-wasm/components/dom-overlay.tsx

import { memo, useMemo } from 'react'
import type { Node } from '@/entities/node'

interface DomOverlayProps {
  nodes: Node[]
  viewport: { x: number; y: number; zoom: number }
  containerRef: React.RefObject<HTMLDivElement>
}

export const DomOverlay = memo(({ nodes, viewport, containerRef }: DomOverlayProps) => {
  // Transform graph coordinates to screen coordinates
  const screenNodes = useMemo(() =>
    nodes.map(node => ({
      ...node,
      screenX: (node.position.x - viewport.x) * viewport.zoom,
      screenY: (node.position.y - viewport.y) * viewport.zoom,
      screenWidth: node.width * viewport.zoom,
      screenHeight: node.height * viewport.zoom,
    })),
    [nodes, viewport]
  )

  // Only render visible nodes
  const visibleNodes = useMemo(() => {
    if (!containerRef.current) return screenNodes

    const rect = containerRef.current.getBoundingClientRect()
    return screenNodes.filter(n =>
      n.screenX + n.screenWidth > 0 &&
      n.screenX < rect.width &&
      n.screenY + n.screenHeight > 0 &&
      n.screenY < rect.height
    )
  }, [screenNodes, containerRef])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {visibleNodes.map(node => (
        <div
          key={node.id}
          className="absolute pointer-events-auto"
          style={{
            transform: `translate(${node.screenX}px, ${node.screenY}px)`,
            width: node.screenWidth,
            height: node.screenHeight,
          }}
        >
          <div className="p-2">
            <span className="text-sm font-medium truncate">
              {node.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
})
```

---

## Performance Considerations

### Batching

```rust
// Batch all nodes into single draw call
gl.draw_arrays_instanced(
    WebGl2RenderingContext::TRIANGLE_STRIP,
    0,
    4,
    node_count as i32,  // Thousands of instances, 1 draw call
);
```

### Culling

```rust
// CPU-side frustum culling before upload
let visible_nodes: Vec<_> = graph.nodes.values()
    .filter(|n| viewport.intersects_node(n))
    .collect();
```

### LOD (Level of Detail)

```rust
// At low zoom, skip expensive rendering
if viewport.zoom < 0.1 {
    // Simple colored rectangles, no rounded corners
    self.render_nodes_simple(visible_nodes);
} else {
    // Full quality with rounded corners, shadows
    self.render_nodes_quality(visible_nodes);
}
```

### Buffer Management

```rust
// Pre-allocate buffers for expected max size
const MAX_NODES: usize = 10_000;
const MAX_EDGES: usize = 50_000;

// Reuse buffers, only reallocate if exceeded
if node_count > self.node_buffer_capacity {
    self.reallocate_node_buffer(node_count * 2);
}
```

---

## When to Use Phase 2

| Scenario | Phase 1 (DOM) | Phase 2 (WebGL) |
|----------|---------------|-----------------|
| < 1000 nodes | ✅ Sufficient | Overkill |
| 1000-3000 nodes | ⚠️ May lag | ✅ Smooth |
| > 3000 nodes | ❌ Too slow | ✅ Required |
| Complex edges | ⚠️ Expensive | ✅ Fast |
| Mobile devices | ✅ Battery friendly | ⚠️ GPU drain |

### Migration Path

1. Implement Phase 1 (WASM layout + DOM render)
2. Measure performance at target scale
3. If DOM is bottleneck → add WebGL layer
4. Keep DOM overlay for text (always)
