# Performance

## Bundle Size

### Code Splitting

```tsx
// Lazy loading для тяжёлых компонентов
import { lazy, Suspense } from 'react'

const GraphCanvas = lazy(() => import('@/features/graph/components/graph-canvas'))

export const MapPage = () => (
  <Suspense fallback={<GraphSkeleton />}>
    <GraphCanvas />
  </Suspense>
)
```

### Route-based Splitting

```tsx
// React Router 7 автоматически делает code splitting по роутам
// routes.ts
export const routes = [
  {
    path: '/dashboard',
    lazy: () => import('./pages/dashboard')  // Отдельный chunk
  },
  {
    path: '/settings',
    lazy: () => import('./pages/settings')   // Отдельный chunk
  }
]
```

### Manual Chunks (vite.config.ts)

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
})
```

### Анализ bundle

```bash
# Визуализация bundle
bun run build && bunx vite-bundle-visualizer

# Или через rollup plugin
bun add -D rollup-plugin-visualizer
```

---

## Runtime Performance

### React.memo

**Когда использовать:**
- Компонент рендерится часто (в списке, при изменении parent)
- Props не меняются часто
- Рендер компонента "тяжёлый"

```tsx
// ❌ Рендерится при каждом изменении parent
const NodeCard = ({ node }: Props) => (
  <Card>
    <CardTitle>{node.title}</CardTitle>
    <CardContent>{node.content}</CardContent>
  </Card>
)

// ✅ Рендерится только при изменении node
const NodeCard = memo(({ node }: Props) => (
  <Card>
    <CardTitle>{node.title}</CardTitle>
    <CardContent>{node.content}</CardContent>
  </Card>
))
```

### useMemo

```tsx
// ❌ Пересчёт при каждом render
const filteredNodes = nodes.filter(n => n.type === selectedType)

// ✅ Пересчёт только при изменении nodes или selectedType
const filteredNodes = useMemo(
  () => nodes.filter(n => n.type === selectedType),
  [nodes, selectedType]
)
```

### useCallback

```tsx
// ❌ Новая функция при каждом render → child ререндерится
const handleClick = (id: string) => selectNode(id)

// ✅ Стабильная ссылка → child НЕ ререндерится
const handleClick = useCallback(
  (id: string) => selectNode(id),
  [selectNode]
)
```

### Когда НЕ использовать мемоизацию

- Компонент рендерится редко
- Props всегда меняются
- Простые компоненты (overhead мемоизации > выигрыш)

---

## Virtualization

Для длинных списков (100+ элементов):

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export const NodeList = ({ nodes }: Props) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,  // Примерная высота элемента
    overscan: 5  // Рендерить 5 элементов за пределами viewport
  })

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <NodeCard
            key={nodes[virtualRow.index].id}
            node={nodes[virtualRow.index]}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              height: virtualRow.size
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## Images

### Next-gen formats

```tsx
// Используйте WebP/AVIF вместо PNG/JPG
<picture>
  <source srcSet="/image.avif" type="image/avif" />
  <source srcSet="/image.webp" type="image/webp" />
  <img src="/image.jpg" alt="Description" />
</picture>
```

### Lazy loading

```tsx
// Native lazy loading
<img src="/image.jpg" loading="lazy" alt="Description" />

// С placeholder
import { useState } from 'react'

const LazyImage = ({ src, alt }: Props) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative">
      {!loaded && <Skeleton className="absolute inset-0" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={loaded ? 'opacity-100' : 'opacity-0'}
      />
    </div>
  )
}
```

### Responsive images

```tsx
<img
  src="/image-800.jpg"
  srcSet="/image-400.jpg 400w, /image-800.jpg 800w, /image-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Description"
/>
```

---

## SSR Performance

### Streaming

```tsx
// React Router 7 поддерживает streaming из коробки
// Длинные запросы можно defer

export const loader = async () => {
  // Критичные данные — ждём
  const user = await getUser()

  // Некритичные — стримим
  const recommendations = getRecommendations()  // Promise, не await

  return defer({
    user,
    recommendations
  })
}

// В компоненте
<Suspense fallback={<RecommendationsSkeleton />}>
  <Await resolve={data.recommendations}>
    {(recommendations) => <Recommendations data={recommendations} />}
  </Await>
</Suspense>
```

### Selective Hydration

```tsx
// Обёртка для компонентов, которые не нужно hydrate сразу
import { lazy, Suspense } from 'react'

const Comments = lazy(() => import('./Comments'))

// Comments hydrate только когда пользователь доскроллит
<Suspense fallback={<CommentsSkeleton />}>
  <Comments />
</Suspense>
```

---

## Web Vitals

### Метрики

| Метрика | Цель | Описание |
|---------|------|----------|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| TTFB | < 800ms | Time to First Byte |

### Измерение

```tsx
// shared/lib/web-vitals.ts
import { onCLS, onFID, onLCP, onTTFB } from 'web-vitals'

export const reportWebVitals = () => {
  onCLS(console.log)
  onFID(console.log)
  onLCP(console.log)
  onTTFB(console.log)
}

// Или отправка в analytics
onLCP((metric) => {
  analytics.track('web-vitals', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating
  })
})
```

### Lighthouse CI

```js
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/dashboard'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
```

---

## Чеклист

### Bundle
- [ ] Code splitting по роутам
- [ ] Lazy loading тяжёлых компонентов
- [ ] Tree shaking работает
- [ ] Bundle < 200KB initial

### Runtime
- [ ] React.memo для списков
- [ ] Virtualization для 100+ элементов
- [ ] Нет лишних ререндеров (React DevTools Profiler)

### Images
- [ ] WebP/AVIF форматы
- [ ] Lazy loading
- [ ] Responsive sizes

### Metrics
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Lighthouse > 80

---

## См. также

- [08-ssr.md](./08-ssr.md) — SSR и streaming
- [06-testing.md](./06-testing.md) — Performance testing
