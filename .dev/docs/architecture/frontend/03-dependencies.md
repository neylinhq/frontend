# Правила зависимостей

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

## Cross-widget imports

**Widgets могут импортировать другие widgets** для композиции сложных layout-ов.

Это прагматичное расширение FSD, избегающее prop-drilling через pages.

### Почему cross-widget imports разрешены?

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

**Ограничения**:
- Не создавать циклических зависимостей между widgets
- Предпочитать композицию через children, если widget используется в 1-2 местах

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

---

## Stores в Entities

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

## Source of Truth

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
