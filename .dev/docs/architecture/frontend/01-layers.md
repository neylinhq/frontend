# Слои архитектуры

> **Фреймворк**: React Router 7 (SSR)

## Диаграмма слоёв

```
┌─────────────────────────────────────────────────────────────┐
│                         app/                                │
│            (providers, theme, root config)                  │
└─────────────────────────┬───────────────────────────────────┘
                          │ imports from ↓
┌─────────────────────────▼───────────────────────────────────┐
│                        pages/                               │
│        (dashboard/, auth/, legal/, docs/, pricing/)         │
└─────────────────────────┬───────────────────────────────────┘
                          │ imports from ↓
┌─────────────────────────▼───────────────────────────────────┐
│                       widgets/                              │
│          (dashboard-layout, user-nav)                       │
└─────────────────────────┬───────────────────────────────────┘
                          │ imports from ↓
┌─────────────────────────▼───────────────────────────────────┐
│                      features/                              │
│   (auth/, billing/, graph/, node-editor/, settings/)        │
└─────────────────────────┬───────────────────────────────────┘
                          │ imports from ↓
┌─────────────────────────▼───────────────────────────────────┐
│                      entities/                              │
│      (map, node, edge, user, subscription, session)         │
└─────────────────────────┬───────────────────────────────────┘
                          │ imports from ↓
┌─────────────────────────▼───────────────────────────────────┐
│                       shared/                               │
│  (components, hooks, lib, types, schemas, styles, etc.)     │
└─────────────────────────────────────────────────────────────┘
```

**Основное правило**: Слой может импортировать **ТОЛЬКО** из нижележащих слоёв.

---

## 1. App Layer (`src/app/`)

**Назначение**: Инициализация приложения, глобальные провайдеры.

**Структура**:
```
app/
├── providers/      # React Query, Theme, Auth providers
└── theme/          # Тема и палитры
```

**Что можно**:
- ✅ Импортировать из любого нижележащего слоя
- ✅ Настраивать глобальные провайдеры
- ✅ Определять глобальный routing

**Что нельзя**:
- ❌ Содержать бизнес-логику
- ❌ Содержать UI компоненты (кроме корневых)

**Пример**:
```tsx
// app/root.tsx
import { QueryProvider } from '@/app/providers/query-provider'
import { ThemeProvider } from '@/app/theme/theme-provider'
import { Outlet } from 'react-router'

export default () => {
  return (
    <QueryProvider>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </QueryProvider>
  )
}
```

---

## 2. Pages Layer (`src/pages/`)

**Назначение**: Страницы-компоненты, соответствующие роутам.

**Структура**:
```
pages/
├── dashboard/          # ГРУППА pages
│   ├── map-view-page/
│   ├── node-edit-page/
│   └── overview-page/
├── auth/               # ГРУППА pages
│   ├── sign-in-page/
│   └── sign-up-page/
├── home-page/
└── pricing-page/
```

**Что можно**:
- ✅ Импортировать widgets, features, entities, shared
- ✅ Композировать features и widgets
- ✅ Работать с routing (loaders, actions)

**Что нельзя**:
- ❌ Импортировать другие pages
- ❌ Содержать сложную бизнес-логику
- ❌ Напрямую работать с API (только через entities/features)

**Пример**:
```tsx
// pages/dashboard/overview-page/overview-page.tsx
import { MapCard } from '@/features/maps'
import { DashboardLayout } from '@/widgets/dashboard-layout'

export const OverviewPage = () => {
  const maps = useLoaderData<typeof loader>()

  return (
    <DashboardLayout>
      <div className="grid grid-cols-3 gap-4">
        {maps.map(map => <MapCard key={map.id} map={map} />)}
      </div>
    </DashboardLayout>
  )
}
```

---

## 3. Widgets Layer (`src/widgets/`)

**Назначение**: Композитные UI блоки, объединяющие features.

**Структура**:
```
widgets/
├── dashboard-layout/    # Layout с header + sidebar
└── user-nav/            # Навигация пользователя
```

**Что можно**:
- ✅ Импортировать features, entities, shared
- ✅ **Импортировать другие widgets** (cross-widget)
- ✅ Содержать layout логику
- ✅ Композировать features

**Что нельзя**:
- ❌ Импортировать pages
- ❌ Содержать бизнес-логику
- ❌ Напрямую работать с API
- ❌ Создавать циклические зависимости между widgets

**Пример**:
```tsx
// widgets/dashboard-layout/components/dashboard-layout.tsx
import { Sidebar } from './sidebar'
import { DashboardHeader } from './dashboard-header'
import { UserNav } from '@/widgets/user-nav'

export const DashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader>
          <UserNav />
        </DashboardHeader>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
```

---

## 4. Features Layer (`src/features/`)

**Назначение**: Функциональные модули с конкретной задачей.

**Структура**:
```
features/
├── auth/               # ГРУППА features
│   ├── sign-in-form/   # модуль
│   ├── sign-up-form/   # модуль
│   └── reset-password/ # модуль
├── billing/            # ГРУППА features
│   ├── plan-card/
│   └── payment-form/
└── graph/              # сложный модуль (не группа)
    ├── index.ts
    ├── components/
    ├── model/
    └── lib/
```

**Что можно**:
- ✅ Импортировать entities, shared
- ✅ Содержать компоненты feature
- ✅ Использовать hooks из entities
- ✅ Работать с API через entities

**Что нельзя**:
- ❌ Импортировать другие features (cross-feature imports)
- ❌ Импортировать pages или widgets
- ❌ Создавать общие файлы на уровне группы

**Пример**:
```tsx
// features/billing/plan-card/plan-card.tsx
import { usePlanDetails } from '@/entities/subscription'
import { Button } from '@/shared/components/button'

export const PlanCard = ({ planType }: Props) => {
  const { data: plan } = usePlanDetails(planType)

  return (
    <Card>
      <CardHeader>{plan.name}</CardHeader>
      <CardContent>{plan.price}</CardContent>
      <CardFooter>
        <Button>Upgrade</Button>
      </CardFooter>
    </Card>
  )
}
```

---

## 5. Entities Layer (`src/entities/`)

**Назначение**: Бизнес-сущности и работа с данными.

**Структура**:
```
entities/
├── node/
│   ├── node.schema.ts
│   ├── node.api.ts
│   ├── node.queries.ts
│   └── lib/
│       └── node-icon.ts
├── session/           # НЕ auth! (session = аутентификация)
│   ├── session.schema.ts
│   ├── session.api.ts
│   └── session.queries.ts
└── user/
    ├── user.schema.ts
    ├── user.api.ts
    └── user.queries.ts
```

**Что можно**:
- ✅ Импортировать **types И schemas** из других entities (через явный barrel)
- ✅ Импортировать из shared
- ✅ Определять Zod схемы
- ✅ Определять API клиенты
- ✅ Экспортировать React Query hooks (ЕДИНЫЙ источник истины для данных)
- ✅ Содержать domain utilities

**Что нельзя**:
- ❌ Импортировать **hooks/api/queries** из других entities
- ❌ Импортировать features, pages, widgets
- ❌ Содержать UI компоненты

---

## 6. Shared Layer (`src/shared/`)

**Назначение**: Глобальные переиспользуемые элементы.

**Структура**:
```
shared/
├── components/    # Глобальные React компоненты (button, input, dialog)
├── hooks/         # Глобальные хуки (useMediaQuery, useDebounce)
├── lib/           # Глобальные утилиты ПЛОСКО (cn, formatDate)
├── core/          # Инфраструктурные модули (theme, wasm)
├── types/         # Глобальные TypeScript типы
├── schemas/       # Глобальные Zod схемы (если есть)
├── styles/        # Глобальные стили
├── tests/         # Тестовые утилиты (render helpers, test fixtures)
├── api/           # HTTP client, API utilities
└── config/        # Глобальная конфигурация
```

**Что можно**:
- ✅ Содержать generic компоненты
- ✅ Содержать утилиты без domain логики
- ✅ Содержать конфиги

**Что нельзя**:
- ❌ Импортировать из app, pages, widgets, features, entities
- ❌ Содержать бизнес-логику
- ❌ Знать о domain моделях

### core/ — Инфраструктурные модули

**Назначение**: Сложные переиспользуемые подсистемы, которые не являются ни простыми утилитами (`lib/`), ни бизнес-сущностями (`entities/`).

**Структура**:
```
shared/core/
├── theme/              # Система тем
│   ├── index.ts        # Публичный API (обязательно)
│   └── ...             # Внутренние файлы
└── wasm/               # WebAssembly модули
    ├── index.ts        # Публичный API (обязательно)
    └── ...             # Внутренние файлы
```

**Что можно**:
- ✅ Содержать контексты, типы, константы, хуки
- ✅ Свободная внутренняя структура (нейминг на усмотрение модуля)
- ✅ Внешние/сгенерированные файлы (wasm, codegen)

**Что нельзя**:
- ❌ React компоненты (Provider'ы — в `app/`, UI — в `features/`)
- ❌ Отсутствие `index.ts` — каждый модуль ОБЯЗАН иметь публичный API

**Отличие от других сегментов**:

| Сегмент | Структура | Назначение |
|---------|-----------|------------|
| `lib/` | ПЛОСКАЯ (без папок) | Простые утилиты: cn, formatDate |
| `core/` | Модули с index.ts | Инфраструктура: theme, wasm, i18n |
| `components/` | Модули с index.ts | UI компоненты: Button, Dialog |

**Правило**: `core/` = инкапсулированные модули. Обязателен только `index.ts`. Внутренняя структура — детали реализации.

**Примеры использования**:
```tsx
// ✅ Импорт через публичный API
import { useTheme, MODES } from '@/shared/core/theme'
import { GraphEngine } from '@/shared/core/wasm'

// ❌ Прямой импорт внутренних файлов
import { ThemeContext } from '@/shared/core/theme/theme-context'
```

---

## Server-only файлы (`.server.ts`)

Файлы с суффиксом `.server.ts` содержат код, который выполняется **только на сервере** и никогда не попадает в клиентский бандл.

**Где могут находиться:**
- `pages/` — loaders, actions
- `entities/` — серверные API функции
- `shared/` — серверные утилиты

**Правила:**
```tsx
// ✅ Прямой импорт в другом .server.ts файле
import { getSession } from '@/entities/session/session.server'

// ❌ НИКОГДА не экспортировать через barrel (index.ts)
// entities/session/index.ts
export { getSession } from './session.server' // утечёт на клиент!
```

> **Подробнее**: [05-server.md](./05-server.md)

---

## Circular Dependencies

### Обнаружение

```bash
# Проверка циклических зависимостей
npx madge --circular src/

# Визуализация графа зависимостей
npx madge --image graph.svg src/
```

### Частые причины

| Проблема | Решение |
|----------|---------|
| Entity A импортирует Entity B и наоборот | Выделить общие types в shared |
| Feature использует другую feature | Вынести общую логику в entities |
| Barrel export тянет лишнее | Использовать прямые импорты |

### Исправление

```tsx
// ❌ ПЛОХО: Circular dependency
// entities/node/node.schema.ts
import { EdgeSchema } from '@/entities/edge'

// entities/edge/edge.schema.ts
import { NodeSchema } from '@/entities/node'

// ✅ ХОРОШО: Общие типы в shared
// shared/types/graph.ts
export type NodeId = Brand<string, 'NodeId'>
export type EdgeId = Brand<string, 'EdgeId'>

// entities/node/node.schema.ts
import { NodeId, EdgeId } from '@/shared/types/graph'
```

---

## См. также

- [02-modules.md](./02-modules.md) — Структура модулей
- [03-dependencies.md](./03-dependencies.md) — Правила импортов
- [05-server.md](./05-server.md) — Server-only код
- [08-ssr.md](./08-ssr.md) — SSR и hydration
