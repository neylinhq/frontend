# Архитектура приложения Neylin

## Обзор

Neylin — React/Remix приложение для создания карт знаний. Архитектура построена на **Feature-Sliced Design (FSD)** с адаптациями под специфику проекта.

## Структура слоёв FSD

```
app/          → Remix routes, entry points
src/
  ├── app/        → Глобальные провайдеры, конфиги
  ├── pages/      → (не используется, роуты в app/)
  ├── widgets/    → Композитные блоки UI
  ├── features/   → Бизнес-фичи с UI и логикой
  ├── entities/   → Бизнес-сущности (схемы, хуки, presenters)
  └── shared/     → Переиспользуемый код без бизнес-логики
```

### Иерархия импортов

```
app → pages → widgets → features → entities → shared
 ↓      ↓        ↓          ↓          ↓         ✗
 всё   всё      всё        всё       shared   никого
ниже  ниже     ниже       ниже
```

**Правило:** Каждый слой может импортировать только из слоёв НИЖЕ себя.

---

## Структуры модулей

### Плоская структура

Для простых модулей (1-4 файла, 1 компонент):

```
module/
  index.ts              → public API (всегда)
  module.tsx            → компоненты
  module.types.ts       → типы TypeScript
  module.hooks.ts       → React хуки
  module.utils.ts       → утилиты
  module.constants.ts   → константы
  module.schema.ts      → Zod схемы
  module.styles.css     → стили
  module.api.ts         → API функции
  module.query.ts       → React Query хуки
  module.d.ts           → декларации типов (редко)
```

### Сложная структура

Для крупных модулей (5+ файлов, 2+ компонентов):

```
module/
  index.ts
  /components           → чистые .tsx
  /model                → hooks, types, schema, constants
  /lib                  → чистые утилиты .ts
  /styles               → CSS файлы
  /api                  → api.ts, query.ts
```

**Содержимое /model:**
```
/model
  module.hooks.ts       → или some-part.hooks.ts если большой
  module.types.ts
  module.schema.ts
  module.constants.ts
```

**Группировка внутри model:**

Файлы группируем по логике, а не по типу. Если несколько хуков/констант связаны с одной функциональностью — объединяем в один файл:

```
# ❌ Плохо — много мелких файлов
/model
  use-graph-keyboard.ts
  use-graph-zoom.ts
  use-graph-pan.ts
  keyboard.constants.ts
  zoom.constants.ts

# ✅ Хорошо — группировка по логике
/model
  graph-navigation.hooks.ts    → keyboard + zoom + pan
  graph-navigation.constants.ts
```

Правило: если 2+ файла относятся к одной логике — объединяй в `{логика}.hooks.ts` или `{логика}.constants.ts`.

### Когда какую использовать

| Критерий | Плоская | Сложная |
|----------|---------|---------|
| Файлов | 1-4 | 5+ |
| Компонентов | 1 | 2+ |
| Команда | solo | team |

---

## Слой `shared/`

Самый нижний слой. **Не может импортировать из других слоёв.**

### Структура

```
shared/
  ├── config/      → Конфигурации приложения
  ├── lib/         → Чистые утилиты (.ts файлы)
  ├── hooks/       → Универсальные React хуки
  ├── styles/      → Глобальные стили
  └── ui/          → UI компоненты без бизнес-логики
```

### Структура UI модуля

```
shared/ui/button/
  ├── index.ts              → Public API
  └── components/
      └── button.tsx        → Компонент(ы)
```

Или для простых компонентов:

```
shared/ui/badge/
  ├── index.ts
  └── badge.tsx
```

### Примеры компонентов shared/ui

- `Button`, `Badge`, `Card` — базовые UI элементы
- `ConnectionItem` — generic список с иконкой, лейблом, subtitle
- `LanguageSwitcher` — переключатель языка (без бизнес-логики)
- `Typography` — типографика с вариантами

**Ключевой принцип:** Компоненты shared НЕ знают о бизнес-сущностях. Вся бизнес-логика передаётся через props.

```tsx
// ✅ Правильно — generic props
<ConnectionItem
  icon={<NodeIcon />}
  label={node.label}
  subtitle={<span>{t(`graph.edgeTypes.${edge.relationType}`)}</span>}
/>

// ❌ Неправильно — знание о бизнес-сущностях
<ConnectionItem edge={edge} node={node} />
```

---

## Слой `entities/`

Бизнес-сущности приложения. **Может импортировать только из shared.**

### Структура сущности

```
entities/edge/
  ├── index.ts           → Public API (экспорты)
  └── model/
      ├── edge.schema.ts → Zod схемы и типы
      └── edge.hooks.ts  → React хуки для работы с сущностью
```

### Что содержит entities

| Папка/файл | Содержимое |
|------------|------------|
| `model/*.schema.ts` | Zod схемы, типы TypeScript |
| `model/*.hooks.ts` | React хуки для работы с сущностью |
| `lib/*.ts` | Presenters, адаптеры, утилиты |

### Presenters в entities

Presenters — функции преобразования данных для UI. Живут в `entities/*/lib/`.

```
entities/node/
  ├── index.ts
  ├── node.schema.ts
  └── lib/
      ├── node-icon.ts    → getNodeIcon(type) → LucideIcon
      └── node-style.ts   → getNodeBorderColor(type) → string
```

```tsx
// entities/node/lib/node-icon.ts
export const getNodeIcon = (type: NodeType): LucideIcon => {
  const icons: Record<NodeType, LucideIcon> = {
    concept: Brain,
    fact: FileText,
    // ...
  }
  return icons[type] || Brain
}
```

**Почему presenters в entities?**
- Они работают с типами сущности (NodeType)
- Это "представление" данных, не UI логика
- Features могут использовать их для рендера

---

## Слой `features/`

Бизнес-фичи с UI и логикой. **Может импортировать из entities и shared.**

### Структура фичи

```
features/node-drawer/
  ├── index.ts              → Public API
  ├── components/
  │   ├── node-drawer.tsx
  │   ├── drawer-overview-tab.tsx
  │   └── drawer-connections-tab.tsx
  └── model/
      └── drawer-tabs.hooks.ts
```

### Правила features

1. **Features НЕ импортируют друг друга**
   ```tsx
   // ❌ Неправильно
   import { Something } from '@/features/other-feature'

   // ✅ Правильно — вынести общее в entities или shared
   import { Something } from '@/entities/common'
   ```

2. **Локальные компоненты в components/**
   ```
   features/block-editor/
     └── components/
         ├── block-editor.tsx      → главный компонент
         ├── bubble-menu.tsx       → внутренний компонент
         └── floating-menu.tsx     → внутренний компонент
   ```

3. **Хуки в model/**
   ```
   features/graph-view/
     └── model/
         ├── focus-mode.hooks.ts
         └── graph-view.types.ts
   ```

---

## Слой `widgets/`

Композитные блоки из нескольких features. **Может импортировать из features, entities, shared.**

```
widgets/
  └── map-workspace/
      ├── index.ts
      └── components/
          └── map-workspace.tsx  → композиция GraphView + NodeDrawer + Toolbar
```

---

## Слой `app/` (Remix routes)

Entry points приложения. Remix роуты живут в `app/routes/`.

```
app/
  ├── root.tsx              → Root layout, providers
  └── routes/
      ├── _index.tsx        → Landing page
      ├── auth/
      │   ├── login.tsx
      │   └── logout.ts
      └── dashboard/
          └── maps/
              └── $mapId/
                  ├── view.tsx
                  └── node.$nodeId.tsx
```

---

## Паттерны и практики

### 1. Public API через index.ts

Каждый модуль экспортирует только необходимое:

```tsx
// entities/node/index.ts
export type { Node, NodeType } from './node.schema'
export { NodeSchema, NodeTypeEnum } from './node.schema'
export { getNodeIcon } from './lib/node-icon'
export { getNodeBorderColor, getComplexityColor } from './lib/node-style'
```

Импорт всегда через index:

```tsx
// ✅ Правильно
import { Node, getNodeIcon } from '@/entities/node'

// ❌ Неправильно — прямой импорт из внутренностей
import { Node } from '@/entities/node/node.schema'
```

### 2. Оптимизация поиска O(n) вместо O(n²)

```tsx
// ❌ O(n²) — find внутри цикла
for (const edge of edges) {
  const node = allNodes.find(n => n.id === edge.targetNodeId)
}

// ✅ O(n) — Map для O(1) lookup
const nodesMap = useMemo(() =>
  new Map(allNodes.map(n => [n.id, n])),
  [allNodes]
)

for (const edge of edges) {
  const node = nodesMap.get(edge.targetNodeId)
}
```

### 3. Generic компоненты в shared

Компоненты shared не знают о бизнес-логике:

```tsx
// shared/ui/connection-item/components/connection-item.tsx
interface ConnectionItemProps {
  icon: React.ReactNode      // Любая иконка
  label: string              // Любой текст
  subtitle?: React.ReactNode // Любой контент
  direction?: 'incoming' | 'outgoing'
  onOpen?: () => void
  onPanTo?: () => void
}
```

Features передают бизнес-данные через props:

```tsx
// features/node-drawer/components/drawer-connections-tab.tsx
const NodeIcon = getNodeIcon(connectedNode.type)

<ConnectionItem
  icon={<NodeIcon className='w-4 h-4' />}
  label={connectedNode.label}
  subtitle={
    <>
      <span>{t(`graph.edgeTypes.${edge.relationType}`)}</span>
      {edge.label && <span>· {edge.label}</span>}
    </>
  }
  onOpen={() => onOpenNode(connectedNode.id)}
/>
```

### 4. Cleanup для useEffect с таймерами

```tsx
useEffect(() => {
  const timeoutId = setTimeout(() => doSomething(), 100)
  return () => clearTimeout(timeoutId)  // ← cleanup
}, [deps])
```

### 5. Стабильные ключи в списках

```tsx
// ❌ Антипаттерн
{items.map((item, index) => <Item key={index} />)}

// ✅ Правильно — уникальный идентификатор
{items.map(item => <Item key={item.id} />)}

// ✅ Для статичных данных (SVG paths) — index допустим
{staticPaths.map((path, index) => <path key={index} d={path} />)}
```

---

## Схемы данных (Zod)

Все бизнес-сущности описаны Zod схемами:

```tsx
// entities/node/model/node.schema.ts
export const NodeTypeEnum = z.enum([
  'concept', 'fact', 'theory', 'example',
  'question', 'hypothesis', 'person', 'school'
])

export const NodeSchema = z.object({
  id: z.string(),
  mapId: z.string(),
  label: z.string(),
  description: z.string().optional(),
  content: z.string().optional(),
  type: NodeTypeEnum,
  position: z.object({ x: z.number(), y: z.number() }),
  metadata: NodeMetadataSchema,
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Node = z.infer<typeof NodeSchema>
```

---

## Алиасы импортов

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```tsx
import { Button } from '@/shared/ui/button'
import { Node } from '@/entities/node'
import { NodeDrawer } from '@/features/node-drawer'
```

---

## Чеклист при создании нового модуля

- [ ] Определить слой (shared/entities/features/widgets)
- [ ] Создать структуру папок (index.ts, components/, model/, lib/)
- [ ] Написать public API в index.ts
- [ ] Проверить направление импортов (только из нижних слоёв)
- [ ] Generic компоненты → shared, бизнес-логика → features
- [ ] Схемы данных → entities/*/model/*.schema.ts
- [ ] Хуки для сущности → entities/*/model/*.hooks.ts
- [ ] Presenters → entities/*/lib/*.ts
