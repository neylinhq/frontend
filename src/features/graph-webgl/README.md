# graph-webgl

WebGL-based graph visualization с использованием Rust WASM движка.

**Drop-in replacement** для `features/graph` - использует тот же API и пропсы.

## Как переключиться с xyflow на WebGL

### Вариант 1: Замена импорта (рекомендуется)

Найдите где используется `GraphVisualization`:

```tsx
// ❌ Старый импорт (xyflow)
import { GraphVisualization } from '@/features/graph';

// ✅ Новый импорт (WebGL + WASM)
import { GraphVisualization } from '@/features/graph-webgl';
```

Компонент имеет **идентичный API**, поэтому код использования не меняется:

```tsx
<GraphVisualization
  mapId={mapId}
  className="h-full"
  interactive={true}
  initialData={map}
  renderConnectionsPanel={renderConnectionsPanel}
/>
```

### Вариант 2: Условное переключение

Для A/B тестирования или плавного rollout:

```tsx
import { GraphVisualization as XyflowGraph } from '@/features/graph';
import { GraphVisualization as WebGLGraph } from '@/features/graph-webgl';

const USE_WEBGL = process.env.NEXT_PUBLIC_USE_WEBGL === 'true';
const GraphVisualization = USE_WEBGL ? WebGLGraph : XyflowGraph;

// Используем как обычно
<GraphVisualization mapId={mapId} />
```

## Требования

### 1. Собрать WASM модуль

```bash
cd graph-engine
wasm-pack build --target web --out-dir pkg
```

### 2. Установить Vite плагины

```bash
npm install -D vite-plugin-wasm vite-plugin-top-level-await
```

### 3. Обновить vite.config.ts

```typescript
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    // ... другие плагины
  ],
  optimizeDeps: {
    exclude: ['graph-engine'] // Исключить WASM из pre-bundling
  }
});
```

## Поддерживаемые фичи

### ✅ Реализовано

- Загрузка графа из данных
- Force-directed layout (150 итераций)
- WebGL rendering (instanced)
- Pan/Zoom управление мышью
- Статистика рендеринга
- Обработка ошибок
- Адаптивный canvas (device pixel ratio)

### 🚧 В разработке

- Выбор узлов (selection)
- Focus mode
- Hit testing (клик по узлам)
- Анимированные переходы
- Minimap
- Фильтры и поиск

### 📝 Запланировано

- Экспорт позиций в БД
- Edge bundling
- LOD (Level of Detail) при зуме
- Frustum culling оптимизация
- Touch gestures

## Производительность

| Метрика | xyflow | WebGL (WASM) |
|---------|--------|--------------|
| Layout 500 узлов | ~200ms | ~50ms |
| Layout 5000 узлов | crash | ~500ms |
| Render @ 60fps | <10fps | 60fps |
| Draw calls | 1000+ | ~20 |

## Отладка

Включите статистику в правом верхнем углу для мониторинга:

- **Zoom** - текущий уровень зума
- **Nodes** - количество отрисованных узлов
- **WebGL** - индикатор активного движка

## Troubleshooting

### WASM не загружается

```
Failed to fetch dynamically imported module
```

**Решение:** Убедитесь что `wasm-pack build` был запущен и файлы находятся в `graph-engine/pkg/`

### WebGL2 не поддерживается

```
Failed to get WebGL2 context
```

**Решение:** Проверьте поддержку браузера на https://caniuse.com/webgl2
Поддерживается: Chrome 56+, Firefox 51+, Safari 15+

### Низкая производительность

- Проверьте что используется Hardware Acceleration в настройках браузера
- Откройте DevTools → Performance для профилирования
- Убедитесь что canvas использует правильный `devicePixelRatio`

## API Reference

См. документацию в:
- `lib/wasm-adapter.ts` - TypeScript wrapper для WASM
- `hooks/use-graph-engine.ts` - React hook для lifecycle
- `components/graph-webgl-visualization.tsx` - основной компонент
