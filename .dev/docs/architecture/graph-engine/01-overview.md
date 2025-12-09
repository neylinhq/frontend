# 01. Overview

## Проблема

Текущая реализация графа на xyflow (React Flow) имеет ограничения:

| Метрика | Текущее состояние | Проблема |
|---------|-------------------|----------|
| 500 nodes layout | ~300ms | Заметная задержка |
| 1000 nodes layout | ~1.5s | Блокирует UI |
| 2000 nodes layout | ~5s | Неприемлемо |
| Memory (1000 nodes) | ~50MB | Высокое потребление |
| Hit testing | O(n) | Медленно при pan/zoom |

## Решение

**Rust + WebAssembly** движок с гибридным рендерингом:

```
┌─────────────────────────────────────────────────────────────┐
│                    Performance Bottlenecks                   │
├─────────────────────────────────────────────────────────────┤
│  Layout calculation    ──→  WASM (10x faster)               │
│  Hit testing           ──→  WASM QuadTree (O(log n))        │
│  Viewport culling      ──→  WASM spatial index              │
│  DOM rendering         ──→  React (сохраняем)               │
│  User interactions     ──→  React (сохраняем)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Фазы реализации

### Phase 1: Layout Engine (MVP)

**Цель**: Rust вычисляет позиции, React рендерит DOM.

```
┌──────────────┐     JSON      ┌──────────────┐
│    React     │ ───────────→  │     WASM     │
│  (nodes,     │               │  (layout     │
│   edges)     │  ←───────────  │   engine)    │
│              │   positions   │              │
└──────────────┘               └──────────────┘
```

**Преимущества**:
- Минимальный риск — DOM рендеринг не меняется
- Максимальный выигрыш — layout это главный bottleneck
- Постепенная миграция — можно A/B тестировать

**Компоненты**:
- `GraphEngine` — основной WASM класс
- `load_graph()` — загрузка данных
- `run_layout()` — полный layout
- `step_layout()` — инкрементальный layout для анимации
- `hit_test()` — определение ноды под курсором

### Phase 2: WebGL Rendering (Optional)

**Цель**: Рендеринг через WebGL для 5000+ нод.

```
┌─────────────────────────────────────────────────┐
│                 React Container                  │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐  │
│  │         WebGL Canvas (z-index: 0)         │  │
│  │  • Node backgrounds (instanced quads)     │  │
│  │  • Edges (bezier curves)                  │  │
│  │  • Shadows, selection highlights          │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │        DOM Overlay (z-index: 1)           │  │
│  │  • Text labels (positioned divs)          │  │
│  │  • Icons, badges                          │  │
│  │  • Interactive elements                   │  │
│  └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│              UI Controls (React)                 │
└─────────────────────────────────────────────────┘
```

**Когда нужен Phase 2**:
- Графы 5000+ нод
- Требуется 60 FPS при любом масштабе
- DOM overlay становится bottleneck

---

## Архитектурные решения

### Почему Rust?

| Критерий | JavaScript | Rust/WASM |
|----------|------------|-----------|
| Числовые вычисления | Slow (JIT overhead) | Fast (native) |
| Memory layout | Objects, GC | Flat arrays, no GC |
| SIMD | Limited | Full support |
| Predictable perf | No (GC pauses) | Yes |

### Почему гибридный подход?

1. **Сохраняем React экосистему** — accessibility, i18n, theming
2. **Текст остаётся в DOM** — subpixel rendering, selection
3. **Постепенная миграция** — можно откатить на xyflow
4. **SEO/SSR** — начальный рендер без WASM

### Data Flow

```
┌─────────────┐
│   Backend   │
│  (GraphQL)  │
└──────┬──────┘
       │ nodes[], edges[]
       ▼
┌─────────────┐     serialize      ┌─────────────┐
│   React     │ ──────────────────→│    WASM     │
│   Query     │                    │   Engine    │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ ←─────────── positions[] ────────┘
       ▼
┌─────────────┐
│  ReactFlow  │
│   Nodes     │
└─────────────┘
```

---

## Совместимость

### С текущей реализацией

| Компонент | Изменения |
|-----------|-----------|
| `features/graph/` | Сохраняется как fallback |
| `features/graph-wasm/` | Новая feature (WASM wrapper) |
| `entities/node`, `entities/edge` | Без изменений |
| API endpoints | Без изменений |
| Types (Node, Edge) | Расширяем, не ломаем |

### Fallback стратегия

```typescript
// Automatic fallback if WASM not supported
const GraphVisualization = lazy(() =>
  hasWasmSupport()
    ? import('@/features/graph-wasm')
    : import('@/features/graph')
)
```

---

## Goals & Non-Goals

### Goals

- 10x улучшение layout performance
- O(log n) hit testing
- Поддержка 2000+ нод
- Сохранение текущего UX
- Backward compatibility с API

### Non-Goals

- Полная замена React на Canvas (Phase 1)
- Mobile-first оптимизация
- Offline-first синхронизация
- Real-time collaboration (отдельная feature)

---

## Риски и митигация

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| WASM bundle size | Medium | Tree-shaking, lazy load |
| Browser support | Low | 95%+ browsers support WASM |
| Debug complexity | Medium | Source maps, console.log bindings |
| Memory leaks | Medium | Explicit free(), WeakRef |
| Layout отличается | Low | Те же параметры, детерминизм |

---

## Референсы

- [wasm-bindgen](https://rustwasm.github.io/docs/wasm-bindgen/) — Rust↔JS bindings
- [d3-force](https://github.com/d3/d3-force) — референс для layout
- [sigma.js](https://www.sigmajs.org/) — WebGL graph rendering
- [Graphology](https://graphology.github.io/) — graph data structures
