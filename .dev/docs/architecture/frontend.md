# Modular FSD - Neylin Frontend Architecture

## Обзор

Neylin использует архитектуру **Modular FSD** — кастомную вариацию [Feature-Sliced Design](https://feature-sliced.design) с дополнительными правилами организации файлов и именования.

### Отличия от классического FSD

**Классический FSD**:
```
features/auth/
  ├── api/          # API клиенты
  ├── model/        # Логика, хуки, стор
  └── ui/           # Компоненты
```

**Modular FSD** (наш подход):
```
features/auth/              # Семантическая группа
  ├── sign-in-form/         # Плоский модуль
  │   ├── index.ts
  │   ├── sign-in.tsx
  │   └── sign-in.schema.ts
  └── sign-up-form/         # Плоский модуль
```

### Почему Modular FSD?

1. **Плоская структура** → легче искать файлы (`user.api.ts` vs `api/user.ts`)
2. **Явное именование** → понятно без открытия файла
3. **Гибкие модули** → простые остаются плоскими, сложные сегментируются
4. **Группы без файлов** → избегаем "общих помоек" с `utils.ts`, `common.ts`
5. **Строгие boundaries** → как в FSD, только файловая организация иная

---

## Принципы кодирования

### Arrow Functions

**Используйте arrow functions везде, где это возможно**. Function declarations разрешены ТОЛЬКО в исключительных случаях.

```tsx
// ✅ ПРАВИЛЬНО - arrow functions
export const Button = ({ variant }: Props) => {
  return <button className={variant} />
}

export const userKeys = {
  current: () => ['user', 'current'] as const
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: userApi.getCurrentUser
  })
}

// ❌ ПЛОХО - function declaration
export function Button({ variant }: Props) {
  return <button className={variant} />
}

// ✅ ИСКЛЮЧЕНИЕ - function declaration ТОЛЬКО когда arrow невозможен
function* generateIds() { ... }  // генераторы
function Component() { this.state = ... }  // если нужен this (очень редко)
```

**Правило**: Если можно написать через arrow function - пишите через arrow function.

---

## Слои (от верхнего к нижнему)

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

### Группировка в Pages

**ВАЖНО**: Группировка = **ТОЛЬКО** семантическая организация. **НИКАКИХ** файлов на уровне группы.

```
pages/
├── dashboard/          # ГРУППА - просто папка для организации
│   ├── overview-page/  # модуль
│   ├── map-view-page/  # модуль
│   └── node-edit-page/ # модуль
└── auth/               # ГРУППА - просто папка для организации
    ├── sign-in-page/   # модуль
    └── sign-up-page/   # модуль
```

**⛔ СТРОГО ЗАПРЕЩЕНО** создавать файлы на уровне группы:
```
pages/
└── auth/
    ├── sign-in-page/
    ├── sign-up-page/
    └── auth-layout.tsx  # ❌ НЕЛЬЗЯ - файл на уровне группы
    └── auth-utils.ts    # ❌ НЕЛЬЗЯ - файл на уровне группы
```

**Правило**: Группа = папка БЕЗ файлов. Если нужен общий код - создайте widget или вынесите в shared/entities.

### ⚠️ Группа ≠ Модуль

**ВАЖНО для LLM и новых разработчиков:**

Группа (`features/auth/`, `pages/dashboard/`) — это **ПРОСТО ПАПКА** для визуального разделения в IDE.

```
features/
├── auth/                    # ← ЭТО ГРУППА (просто папка, НЕТ index.ts)
│   ├── sign-in-form/        # ← ЭТО МОДУЛЬ (есть index.ts)
│   │   ├── index.ts         # ✅ Barrel export
│   │   └── sign-in-form.tsx
│   └── sign-up-form/        # ← ЭТО МОДУЛЬ
│       ├── index.ts         # ✅ Barrel export
│       └── sign-up-form.tsx
```

**❌ НЕПРАВИЛЬНО думать:**
- "auth/ — это модуль, нужен index.ts для реэкспорта sign-in-form и sign-up-form"

**✅ ПРАВИЛЬНО понимать:**
- Группа = namespace для организации файлов в IDE
- Модуль = единица с public API (index.ts)
- Импорт идёт напрямую в модуль: `@/features/auth/sign-in-form`, НЕ `@/features/auth`

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

### Cross-widget imports

**Widgets могут импортировать другие widgets** для композиции сложных layout-ов.

Это прагматичное расширение FSD, избегающее prop-drilling через pages.

#### Почему cross-widget imports разрешены?

Виджет по определению = **композиция**. Запрет cross-widget создаёт проблемы:

**Без cross-widget (плохо):**
```tsx
// pages/dashboard/overview-page.tsx
import { DashboardLayout } from '@/widgets/dashboard-layout'
import { UserNav } from '@/widgets/user-nav'

// Page вынужден знать о внутренностях layout
<DashboardLayout userNav={<UserNav />}>
  {children}
</DashboardLayout>
```

**С cross-widget (хорошо):**
```tsx
// widgets/dashboard-layout/dashboard-layout.tsx
import { UserNav } from '@/widgets/user-nav'

// Layout сам управляет своей композицией
<Header>
  <UserNav />
</Header>
```

```tsx
// ✅ Разрешено
// widgets/dashboard-layout/ui/dashboard-header.tsx
import { UserNav } from '@/widgets/user-nav'
```

**Ограничения**:
- Не создавать циклических зависимостей между widgets
- Предпочитать композицию через children, если widget используется в 1-2 местах

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

### Группировка в Features

Аналогично pages - **группировка = ТОЛЬКО семантика, НИКАКИХ файлов на уровне группы**.

```
features/
└── auth/              # ГРУППА - просто семантика
    ├── sign-in-form/  # модуль
    ├── sign-up-form/  # модуль
    └── reset-password/ # модуль
```

**⛔ СТРОГО ЗАПРЕЩЕНО** - файлы на уровне группы:
```
features/
└── auth/
    ├── sign-in-form/
    ├── sign-up-form/
    └── auth.queries.ts  # ❌ НЕЛЬЗЯ - переносите в entities/session
    └── auth.api.ts      # ❌ НЕЛЬЗЯ - переносите в entities/session
```

**Правило**: Если код нужен нескольким модулям внутри группы → это entities или shared, НЕ группа.

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

**Пример**:
```tsx
// entities/user/user.queries.ts
import { useQuery } from '@tanstack/react-query'
import { userApi } from './user.api'

export const userKeys = {
  current: () => ['user', 'current'] as const
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: userApi.getCurrentUser
  })
}  // ← ЕДИНЫЙ источник истины для User данных
```

### Stores в Entities

**Entities МОГУТ содержать stores**, если это shared state между несколькими features.

| Где store | Когда | Пример |
|-----------|-------|--------|
| **entities** | Shared domain state для нескольких features | `entities/session/session.store.ts` |
| **features** | Локальный UI state одной фичи | `features/node-editor/model/editor.store.ts` |

**Пример shared store в entities:**
```tsx
// entities/session/session.store.ts
import type { User } from '@/entities/user'  // ✅ cross-entity type import

export const useSessionStore = create<{
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false })
}))
```

**Использование в любой feature:**
```tsx
// features/billing/plan-card/plan-card.tsx
import { useSessionStore } from '@/entities/session'

export const PlanCard = () => {
  const { isAuthenticated } = useSessionStore()
  // ...
}
```

**Правило разделения:**
- **UI state** (isEditing, draftFields, selectedTab) → **features**
- **Domain state** (session, user, currentMap) → **entities**

```tsx
// ✅ ПРАВИЛЬНО - domain state в entities
entities/session/session.store.ts:
export const useSessionStore = create(...)  // shared между features

// ✅ ПРАВИЛЬНО - UI state в features
features/user-profile/model/profile.store.ts:
export const useProfileStore = create(() => ({
  isEditing: false,
  draftFields: {}
}))

// ❌ ПЛОХО - UI state в entities
entities/user/user-ui.store.ts:
export const useUserUIStore = create(() => ({
  isProfileOpen: false  // это UI state, не domain!
}))
```

---

## 6. Shared Layer (`src/shared/`)

**Назначение**: Глобальные переиспользуемые элементы.

**Ключевой принцип**: `/shared` использует **ТУ ЖЕ структуру** что и модули, только на глобальном уровне.

**Структура**:
```
shared/
├── components/    # Глобальные React компоненты (button, input, dialog)
├── hooks/         # Глобальные хуки (useMediaQuery, useDebounce)
├── lib/           # Глобальные утилиты (cn, formatDate)
├── types/         # Глобальные TypeScript типы
├── schemas/       # Глобальные Zod схемы (если есть)
├── styles/        # Глобальные стили
├── tests/         # Тестовые утилиты (render helpers, test fixtures)
├── api/           # HTTP client, API utilities
└── config/        # Глобальная конфигурация
```

**Отличие от модулей**:
- В модуле: types/schemas/hooks → в `/model`
- В shared: types/schemas/hooks → **отдельные папки** `/types`, `/schemas`, `/hooks`

**Что можно**:
- ✅ Содержать generic компоненты
- ✅ Содержать утилиты без domain логики
- ✅ Содержать конфиги
- ✅ Не импортировать НИЧЕГО из верхних слоёв

**Что нельзя**:
- ❌ Импортировать из app, pages, widgets, features, entities
- ❌ Содержать бизнес-логику
- ❌ Знать о domain моделях

**Пример**:
```tsx
// shared/components/button/button.tsx
import { cva } from 'class-variance-authority'

const buttonVariants = cva('btn', {
  variants: {
    variant: {
      default: 'bg-primary text-white',
      outline: 'border border-primary'
    }
  }
})

export const Button = ({ variant = 'default', ...props }) => {
  return <button className={buttonVariants({ variant })} {...props} />
}
```

---

## Структура модулей

### Плоский модуль (Simple Module)

**Плоская структура** подходит для **простых модулей** с 2-5 файлами.

```
user/
├── index.ts
├── user.schema.ts
├── user.api.ts
└── user.queries.ts
```

**Когда использовать**:
- ✅ Простая entity без domain логики
- ✅ Маленький feature (1-2 компонента + хук)
- ✅ Всего 2-5 файлов в модуле

#### Разрешённые файлы в плоском модуле (МАКСИМУМ)

**Обычно используется 3-5 из этого списка, НЕ все сразу**:

```
module/
├── index.ts              # Barrel exports (обязательно)
├── [domain].tsx          # Компонент (если 1 компонент)
├── [domain].types.ts     # TypeScript типы
├── [domain].constants.ts # Константы
├── [domain].schema.ts    # Zod схемы
├── [domain].utils.ts     # Утилиты
├── [domain].hooks.ts     # React hooks
├── [domain].api.ts       # API клиент
├── [domain].queries.ts   # React Query hooks
├── [domain].config.ts    # Конфигурация
├── [domain].server.ts    # Server-only код (loaders/actions)
├── [domain].d.ts         # Type declarations
├── [domain].module.css   # CSS Module (ТОЛЬКО .module.css)
└── [domain].test.ts      # Тесты
```

**❌ НЕЛЬЗЯ**:
- Обычный `.css` (только `.module.css` в модулях, обычный `.css` → `/shared/styles`)
- `.js`, `.jsx` файлы
- Random файлы (`helpers.ts`, `common.ts`, `misc.ts`)

#### Правило для нескольких компонентов в плоском модуле

Если **БОЛЬШЕ одного компонента** - создайте `/components` и положите компоненты туда:

```
module/
├── index.ts
├── module.schema.ts
└── components/          # Несколько компонентов
    ├── card.tsx
    ├── list.tsx
    └── item.tsx
```

**В `/components` РАЗРЕШЕНЫ ТОЛЬКО**:
- ✅ `.tsx` - компоненты
- ✅ `.types.ts` - типы
- ✅ `.constants.ts` - константы
- ✅ `.schema.ts` - схемы (редко)
- ✅ `.utils.ts` - утилиты
- ✅ `.hooks.ts` - хуки
- ✅ `.module.css` - стили
- ✅ `.d.ts` - type declarations
- ✅ `.config.ts` - конфиги
- ✅ `.test.ts` - тесты

**❌ ЗАПРЕЩЕНО**:
- Вложенные папки (`/components/card/card.tsx`)
- Сегменты внутри (`/components/lib/`, `/components/styles/`)

**Когда переходить к сегментированной структуре**: Если в `/components` больше **5-6 компонентов** ИЛИ нужны отдельные styles/lib.

---

### Сложный модуль (Segmented Module)

**Сегментированная структура** подходит для **сложных модулей** с 6+ файлами или чёткими доменными зонами.

```
graph/
├── index.ts
├── components/              # ТОЛЬКО .tsx
│   ├── graph-canvas.tsx
│   ├── graph-toolbar.tsx
│   └── node-context-menu.tsx
├── model/                   # ВСЁ КРОМЕ utils, api, queries
│   ├── graph.schema.ts
│   ├── graph.types.ts
│   ├── graph.store.ts
│   └── graph.hooks.ts
├── lib/                     # ПЛОСКАЯ структура, утилиты по логике
│   ├── layout-utils.ts      # ❌ НЕТ /lib/utils/layout.ts
│   └── transform-utils.ts   # ❌ НЕТ /lib/hooks/useTransform.ts
├── styles/                  # ТОЛЬКО .module.css
│   └── graph.module.css
└── api/                     # queries + api
    ├── graph.api.ts
    └── graph.queries.ts
```

**Сегменты**:

| Сегмент | Содержимое | Правила |
|---------|-----------|---------|
| `index.ts` | Barrel exports | Обязательно |
| `components/` | React компоненты | **ТОЛЬКО `.tsx`** (НЕТ .types.ts, .hooks.ts) |
| `styles/` | Стили | **ТОЛЬКО `.module.css`** (НЕТ обычного .css) |
| `model/` | Логика, схемы, хуки | **ВСЁ КРОМЕ** utils, api, queries |
| `lib/` | Утилиты | **ПЛОСКАЯ** структура (НЕТ /lib/hooks, /lib/utils) |
| `api/` | API + queries | `.api.ts` + `.queries.ts` |

**Внутренние сегменты** (не экспортируются):
- `config/` - конфигурация (опционально)
- `__mocks__/` - моки для тестов
- `__tests__/` - тесты (альтернатива co-location)

**Когда использовать**:
- ✅ Модуль с 6+ файлами
- ✅ Чёткие доменные зоны (components vs model vs lib)
- ✅ Нужны отдельные styles или много утилит

**У 90%+ модулей не будет всех этих сегментов** - используйте только то, что нужно.

---

## Barrel Exports (index.ts)

**Правила**:
1. ✅ Явные экспорты (НЕ `export *`)
2. ✅ Экспортируем из сегментов
3. ⛔ `[domain].server.ts` НЕ экспортируем

```tsx
// ❌ ПЛОХО - export *
export * from './user.schema'
export * from './user.api'

// ✅ ХОРОШО - явные экспорты
export type { User, UserPreferences } from './user.schema'
export { UserSchema, defaultUserPreferences } from './user.schema'
export { useCurrentUser, useUpdateProfile } from './user.queries'
export { userApi } from './user.api'

// ⛔ НИКОГДА не экспортируем server код
// export { requireAuth } from './user.server' // ОПАСНО!
```

---

## Правила импортов

### ✅ Разрешено

```tsx
// pages → widgets, features, entities, shared
import { DashboardLayout } from '@/widgets/dashboard-layout'
import { MapCard } from '@/features/maps'
import { useCurrentUser } from '@/entities/user'
import { Button } from '@/shared/components/button'

// features → entities, shared
import { useFullMap } from '@/entities/map'
import { Input } from '@/shared/components/input'

// entities → shared
import { apiClient } from '@/shared/api/api-client'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
```

### ❌ Запрещено

```tsx
// ❌ shared → entities
import { User } from '@/entities/user'

// ❌ entities → features
import { MapCard } from '@/features/maps'

// ❌ entities → другая entity (hooks/api/queries)
import { useEdges } from '@/entities/edge'  // из node - НЕЛЬЗЯ!
import { edgeApi } from '@/entities/edge'   // из node - НЕЛЬЗЯ!

// ✅ entities → другая entity (types/schemas)
import type { EdgeId } from '@/entities/edge'  // OK
import { EdgeIdSchema } from '@/entities/edge' // OK

// ❌ features → другая feature
import { GraphVisualization } from '@/features/graph' // из billing!

// ❌ импорт напрямую из сегмента (минуя barrel)
import { EdgeSchema } from '@/entities/edge/model/edge.schema'

// ❌ файлы на уровне группы
import { authQueries } from '@/features/auth/auth.queries'
```

---

## Примеры из Neylin

### entities/user (плоская)
```
user/
├── index.ts              # Barrel exports
├── user.schema.ts        # Zod: User, UserPreferences
├── user.api.ts           # API client
└── user.queries.ts       # React Query hooks
```

**Почему плоская**: 4 файла, простая логика, нет domain utilities.

---

### entities/edge (сегментированная)
```
edge/
├── index.ts              # Barrel exports
├── model/
│   ├── edge.schema.ts    # Zod: Edge, RelationType
│   └── edge.hooks.ts     # useConnectionFilter
└── lib/
    └── edge-colors.ts    # Утилиты для цветов
```

**Почему сегментированная**: Чёткое разделение model (схемы + hooks) vs lib (утилиты).

---

### features/graph (сложная)
```
graph/
├── index.ts
├── components/              # ТОЛЬКО .tsx
│   ├── graph-canvas.tsx
│   ├── graph-toolbar.tsx
│   ├── node-context-menu.tsx
│   └── edge-label.tsx
├── model/                   # Логика
│   ├── graph-view.store.ts  # Zustand
│   ├── graph.types.ts
│   └── use-graph-selection.ts
└── lib/                     # ПЛОСКАЯ структура
    ├── force-layout.ts      # ❌ НЕТ /lib/layout/force.ts
    └── graph-utils.ts
```

**Почему сложная**: 10+ файлов, чёткие зоны (components, model, lib).

---

## Best Practices

1. **Arrow functions везде**: `function` только для генераторов/this
2. **Группировка = семантика**: БЕЗ файлов на уровне группы
3. **Начинайте снизу вверх**: Сначала entities, потом features, потом pages
4. **Не бойтесь дублировать**: Лучше дублировать код, чем нарушать boundaries
5. **Barrel exports**: Явные экспорты в `index.ts`
6. **Сегментируйте при > 5 файлах**: Если модуль растёт - разделяйте
7. **Co-locate тесты**: `.test.ts` рядом с файлом
8. **Именуйте чётко**: `user.queries.ts`, `user.api.ts` - понятно без документации
9. **/lib всегда плоская**: Разделяйте по логике (`layout-utils.ts`), НЕ по типам (`/lib/hooks`)
10. **У 90%+ модулей простая структура**: Не создавайте сегменты без необходимости

---

## Cross-Entity Dependencies

### Правило

**Entities могут импортировать types И schemas из других entities через явный barrel export.**

> **Почему schemas разрешены**: Для валидации данных нужны runtime схемы (Zod), не только TypeScript типы.
> Это избегает дублирования валидационной логики.

### Разрешено ✅

```tsx
// entities/node/index.ts
export type { Node, NodeId } from './node.schema'
export { NodeSchema, NodeIdSchema } from './node.schema'

// entities/edge/model/edge.schema.ts
import type { NodeId } from '@/entities/node'
import { NodeIdSchema } from '@/entities/node'  // ✅ Schema для валидации

export const EdgeSchema = z.object({
  source: NodeIdSchema,  // ✅ TypeScript + Runtime валидация
  target: NodeIdSchema
})
```

### Запрещено ❌

```tsx
// ❌ НЕЛЬЗЯ - импорт hooks из другой entity
import { useNode } from '@/entities/node'

// ❌ НЕЛЬЗЯ - импорт API из другой entity
import { nodeApi } from '@/entities/node'

// ❌ НЕЛЬЗЯ - импорт queries из другой entity
import { useNodeDetails } from '@/entities/node'
```

### Почему?

- **Минимальная связанность** - entities остаются независимыми (только data contracts)
- **Четкий контракт** - barrel export явно контролирует экспортируемые types/schemas
- **Легко рефакторить** - внутренняя логика entity не влияет на другие
- **DRY для валидации** - schemas переиспользуются, не дублируются
- **Типобезопасность** - TypeScript (compile-time) + Zod (runtime) проверка

### Source of Truth

Domain типы И schemas живут в source entity:

```tsx
// ✅ ПРАВИЛЬНО - types + schemas в entities
entities/node/node.schema.ts:
export const NodeIdSchema = z.string().uuid()
export type NodeId = z.infer<typeof NodeIdSchema>  // Source of truth

entities/node/index.ts:
export type { NodeId } from './node.schema'
export { NodeIdSchema } from './node.schema'

entities/edge/model/edge.schema.ts:
import type { NodeId } from '@/entities/node'
import { NodeIdSchema } from '@/entities/node'  // Переиспользуем валидацию

export const EdgeSchema = z.object({
  source: NodeIdSchema,  // ✅ Нет дублирования
  target: NodeIdSchema   // ✅ Если NodeId изменится - изменится везде
})

// ❌ ПЛОХО - дублирование
entities/edge/model/edge.schema.ts:
export const EdgeSchema = z.object({
  source: z.string().uuid(),  // Дублирует логику из NodeIdSchema
  target: z.string().uuid()
})

// ❌ ПЛОХО - domain в shared
shared/types/common.ts:
export type NodeId = string  // Domain типы НЕ в shared!
```

---

## Testing Strategy

### Уровни тестирования

**1. Unit тесты** - co-located (`.test.ts` рядом с файлом)

```
entities/user/
├── user.schema.ts
├── user.schema.test.ts      # ✅ Тестируем Zod схемы
├── user.api.ts
└── user.queries.ts

shared/lib/
├── cn.ts
└── cn.test.ts               # ✅ Тестируем утилиты
```

**Что тестируем**:
- Zod схемы (валидация, типы)
- Утилиты в shared/lib
- Хелперы в features/*/lib

**2. Integration тесты** - `app/__tests__/`

```
app/
├── __tests__/
│   ├── auth.integration.test.ts       # ✅ Тестируем auth flow
│   ├── billing.integration.test.ts    # ✅ Тестируем upgrade flow
│   └── graph.integration.test.ts      # ✅ Тестируем graph interactions
├── providers/
└── theme/
```

**Что тестируем**:
- Многошаговые пользовательские сценарии
- Взаимодействие между features
- React Query + Zustand integration

**3. E2E тесты** - `app/__tests__/`

```
app/
├── __tests__/
│   ├── smoke.e2e.test.ts              # ✅ Критические пути
│   ├── signup.e2e.test.ts             # ✅ Регистрация + onboarding
│   └── map-creation.e2e.test.ts       # ✅ Создание карты + узлы
```

**Что тестируем**:
- Критические пользовательские пути
- Happy path scenarios
- Smoke tests для production

### Правила

1. **Co-locate** unit тесты - `.test.ts` рядом с `.ts`
2. **Integration/E2E** → `app/__tests__/`
3. **Coverage** → фокус на критической логике (схемы, утилиты)
4. **Не тестируем** → UI компоненты (слишком хрупко), моки (слишком просто)

---

## Type Organization

### Domain Types → Entities

Domain типы (NodeId, UserId, MapId) живут в entities:

```tsx
// ✅ ПРАВИЛЬНО
entities/node/node.schema.ts:
export type NodeId = string
export type NodeType = 'concept' | 'fact' | 'theory' | ...

entities/user/user.schema.ts:
export type UserId = string
export type UserRole = 'admin' | 'user' | 'viewer'
```

### Utility Types → Shared

Utility типы (Nullable, Brand, etc.) живут в shared:

```tsx
// ✅ ПРАВИЛЬНО
shared/types/common.ts:
export type Nullable<T> = T | null
export type Brand<K, T> = K & { __brand: T }
export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }
```

### Правило

**Если тип = domain** → entities (даже если используется везде)

**Если тип = utility** → shared/types

**Примеры**:

```tsx
// ✅ Domain → entities
NodeId, UserId, MapId, NodeType, RelationType

// ✅ Utility → shared
Nullable, Brand, DeepPartial, Prettify, AsyncReturnType
```

---

## Best Practices

1. **Arrow functions везде**: `function` только для генераторов/this
2. **Группировка = семантика**: БЕЗ файлов на уровне группы (pages/features)
3. **Entities = данные**: React Query ЕДИНЫЙ источник истины, stores в features
4. **Cross-entity imports**: types + schemas через явный barrel (НЕ hooks/api/queries)
5. **Domain types в entities**: Source of truth для NodeId, UserId, etc.
6. **Utility types в shared**: Nullable, Brand - generic helpers
7. **Начинайте снизу вверх**: Сначала entities, потом features, потом pages
8. **Не бойтесь дублировать**: Лучше дублировать код, чем нарушать boundaries
9. **Barrel exports**: Явные экспорты в `index.ts`, НЕ `export *`
10. **Сегментируйте при > 5 файлах**: Если модуль растёт - разделяйте
11. **Co-locate тесты**: `.test.ts` рядом с файлом для unit, `app/__tests__/` для integration/e2e
12. **Именуйте чётко**: `user.queries.ts`, `user.api.ts` - понятно без документации
13. **/lib всегда плоская**: Разделяйте по логике (`layout-utils.ts`), НЕ по типам (`/lib/hooks`)
14. **У 90%+ модулей простая структура**: Не создавайте сегменты без необходимости
15. **`.server.ts` НЕ экспортируем**: Как `.hooks.ts`, `.test.ts` - internal only

---

## См. также

- [Design System](../design/design-system.md) - UI/UX гайдлайны
- [Backend Architecture](../backend-architecture.md) - Архитектура бэкенда
- [Backend Spec](../backend-spec.md) - API спецификация
