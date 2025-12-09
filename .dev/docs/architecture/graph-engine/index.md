# Graph Engine Architecture

Высокопроизводительный движок для визуализации графов знаний на базе **Rust + WebAssembly**.

## Принцип

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Application                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    graph-wasm feature                      │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              useGraphEngine Hook                     │  │  │
│  │  │                                                      │  │  │
│  │  │  loadGraph() → runLayout() → stepLayout()           │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↕ wasm-bindgen                      │
├─────────────────────────────────────────────────────────────────┤
│                      WebAssembly Module                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     GraphEngine                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  Graph   │  │  Layout  │  │ Spatial  │  │ Viewport │  │  │
│  │  │  (data)  │  │ (forces) │  │ (quadtree)│  │ (camera) │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Гибридный подход**: WASM вычисляет позиции, React/DOM рендерит элементы.

---

## Разделы документации

| # | Раздел | Описание |
|---|--------|----------|
| 1 | [Overview](./01-overview.md) | Архитектура, фазы, goals |
| 2 | [Project Structure](./02-project-structure.md) | Структура директорий, модули |
| 3 | [Data Types](./03-data-types.md) | Node, Edge, Graph, enums |
| 4 | [Layout Algorithm](./04-layout-algorithm.md) | Force-directed, Barnes-Hut, QuadTree |
| 5 | [WASM Bindings](./05-wasm-bindings.md) | wasm-bindgen API, JS interop |
| 6 | [Frontend Integration](./06-frontend-integration.md) | React hooks, Vite config, types |
| 7 | [WebGL Rendering](./07-webgl-rendering.md) | Phase 2: Canvas rendering (optional) |
| 8 | [Performance](./08-performance.md) | Benchmarks, optimization, memory |
| 99 | [Checklist](./99-checklist.md) | Implementation steps, migration path |

---

## Quick Start

```bash
# 1. Build WASM module
cd graph-engine
wasm-pack build --target web --out-dir ../frontend/src/features/graph-wasm/pkg

# 2. Use in React
import { useGraphEngine } from '@/features/graph-wasm'

const { isReady, loadGraph, runLayout } = useGraphEngine()
```

---

## См. также

- [Frontend Architecture](../frontend/index.md) - FSD структура
- [Backend Architecture](../backend/index.md) - API и данные
- [Design Manifesto](../design/design-manifesto.md) - UI/UX принципы
