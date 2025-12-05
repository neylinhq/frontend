# State Management

## Обзор

Neylin использует два инструмента для управления состоянием:

| Инструмент | Тип state | Где живёт |
|------------|-----------|-----------|
| **React Query** | Server state (данные с API) | `entities/*/[domain].queries.ts` |
| **Zustand** | Client state (UI + domain) | `entities/*/[domain].store.ts` или `features/*/model/*.store.ts` |

---

## React Query = Server State

**Что такое server state:**
- Данные с бэкенда (users, maps, nodes)
- Кэшируемые данные
- Данные с TTL (stale time)
- Данные требующие refetch

**Где хранить**: `entities/*/[domain].queries.ts`

```tsx
// entities/user/user.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from './user.api'

export const userKeys = {
  all: ['users'] as const,
  current: () => [...userKeys.all, 'current'] as const,
  byId: (id: string) => [...userKeys.all, id] as const
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: userApi.getCurrentUser,
    staleTime: 5 * 60 * 1000  // 5 минут
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.current() })
    }
  })
}
```

**Правила:**
- ✅ Один источник истины для entity данных
- ✅ Все компоненты используют один и тот же hook
- ✅ Автоматическая синхронизация через invalidation
- ❌ Не дублировать данные в Zustand

---

## Zustand = Client State

### Domain State (entities)

**Что такое domain state:**
- Аутентификация (session)
- Текущий контекст (currentMap, selectedNodes)
- Shared state между features

**Где хранить**: `entities/*/[domain].store.ts`

```tsx
// entities/session/session.store.ts
import { create } from 'zustand'
import type { User } from '@/entities/user'

interface SessionState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false })
}))
```

```tsx
// entities/map/map.store.ts
import { create } from 'zustand'
import type { MapId } from './map.schema'

interface MapContextState {
  currentMapId: MapId | null
  setCurrentMap: (id: MapId) => void
}

export const useMapContext = create<MapContextState>((set) => ({
  currentMapId: null,
  setCurrentMap: (id) => set({ currentMapId: id })
}))
```

### UI State (features)

**Что такое UI state:**
- Состояние формы (isEditing, draftFields)
- Состояние UI (selectedTab, isOpen)
- Временные данные (drag position)

**Где хранить**: `features/*/model/*.store.ts`

```tsx
// features/user-profile/model/profile.store.ts
import { create } from 'zustand'

interface ProfileUIState {
  isEditing: boolean
  draftFields: Partial<UserProfile>
  startEditing: () => void
  cancelEditing: () => void
  updateDraft: (fields: Partial<UserProfile>) => void
}

export const useProfileStore = create<ProfileUIState>((set) => ({
  isEditing: false,
  draftFields: {},
  startEditing: () => set({ isEditing: true }),
  cancelEditing: () => set({ isEditing: false, draftFields: {} }),
  updateDraft: (fields) => set((state) => ({
    draftFields: { ...state.draftFields, ...fields }
  }))
}))
```

---

## Когда что использовать?

```
┌─────────────────────────────────────────────────────────────┐
│                    Откуда данные?                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
    ┌───────────────┐           ┌───────────────┐
    │  С сервера?   │           │  Локальные?   │
    │  (API)        │           │  (UI/Context) │
    └───────┬───────┘           └───────┬───────┘
            │                           │
            ▼                           ▼
    ┌───────────────┐           ┌───────────────────────┐
    │ React Query   │           │ Shared между          │
    │ .queries.ts   │           │ features?             │
    └───────────────┘           └───────────┬───────────┘
                                            │
                          ┌─────────────────┴─────────────────┐
                          │                                   │
                          ▼                                   ▼
                  ┌───────────────┐                   ┌───────────────┐
                  │ Да → Zustand  │                   │ Нет → Zustand │
                  │ entities/     │                   │ features/     │
                  │ *.store.ts    │                   │ model/*.store │
                  └───────────────┘                   └───────────────┘
```

---

## Синхронизация React Query ↔ Zustand

Иногда нужно синхронизировать server state с client state:

```tsx
// features/graph/model/graph-view.store.ts
import { create } from 'zustand'
import type { Node } from '@/entities/node'

interface GraphViewState {
  selectedNodes: Set<string>
  hoveredNode: string | null
  // НЕ храним nodes здесь - они в React Query!
}

// Использование в компоненте
const GraphCanvas = () => {
  // Server state
  const { data: nodes } = useMapNodes(mapId)

  // Client state
  const { selectedNodes, setSelected } = useGraphViewStore()

  // Комбинируем
  const selectedNodeData = nodes?.filter(n => selectedNodes.has(n.id))
}
```

**Правила синхронизации:**
- ✅ React Query = source of truth для данных
- ✅ Zustand хранит только references (IDs), не копии данных
- ✅ Компонент комбинирует оба источника
- ❌ Не копировать данные из React Query в Zustand

---

## Примеры

### Плохо: дублирование данных

```tsx
// ❌ ПЛОХО - данные дублируются
const useGraphStore = create((set) => ({
  nodes: [],  // Дубликат данных из API
  setNodes: (nodes) => set({ nodes })
}))

// Компонент синхронизирует вручную
const { data } = useMapNodes()
useEffect(() => {
  setNodes(data)  // Источник багов!
}, [data])
```

### Хорошо: разделение ответственности

```tsx
// ✅ ХОРОШО - данные в React Query, состояние в Zustand
const useGraphViewStore = create((set) => ({
  selectedNodeIds: new Set<string>(),
  viewportZoom: 1,
  // Только UI state, не данные!
}))

// Компонент
const { data: nodes } = useMapNodes()  // Server state
const { selectedNodeIds } = useGraphViewStore()  // Client state
const selectedNodes = nodes?.filter(n => selectedNodeIds.has(n.id))
```

---

## Persist (опционально)

Для сохранения state между сессиями:

```tsx
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'system' as 'light' | 'dark' | 'system',
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'theme-storage'  // localStorage key
    }
  )
)
```

**Когда использовать persist:**
- ✅ Пользовательские настройки (тема, язык)
- ✅ Draft данные (черновик формы)
- ❌ Не для server state (используйте React Query cache)
- ❌ Не для sensitive данные (токены → httpOnly cookies)

---

## SSR & Hydration

При использовании SSR (React Router 7) необходимо учитывать hydration.

### Проблема

```tsx
// ❌ ПЛОХО: Hydration mismatch
const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark'  // На сервере всегда 'dark', на клиенте из localStorage
    }),
    { name: 'theme' }
  )
)
```

### Решение: Cookie-first

```tsx
// ✅ ХОРОШО: Тема из cookie (доступна на сервере)
// app/root.tsx (loader)
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const theme = request.headers.get('Cookie')?.match(/theme=(\w+)/)?.[1] ?? 'light'
  return { theme }
}

// Компонент
const { theme } = useLoaderData<typeof loader>()
```

### Решение: Deferred hydration

```tsx
// ✅ ХОРОШО: Zustand инициализируется после hydration
const useClientStore = create((set) => ({
  value: null,  // Default для SSR
  hydrated: false,
  hydrate: (value) => set({ value, hydrated: true })
}))

// В компоненте
useEffect(() => {
  const saved = localStorage.getItem('value')
  if (saved) hydrate(JSON.parse(saved))
}, [])
```

> **Подробнее**: [08-ssr.md](./08-ssr.md)

---

## State Reset

### При logout

```tsx
// entities/session/session.store.ts
export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isAuthenticated: false,
  logout: () => {
    // 1. Очистить свой state
    set({ user: null, isAuthenticated: false })

    // 2. Очистить React Query cache
    queryClient.clear()

    // 3. Очистить другие stores (если нужно)
    useMapContext.getState().reset()
    useGraphViewStore.getState().reset()
  }
}))
```

### При смене контекста

```tsx
// При переходе на другую map
const useMapContext = create((set) => ({
  currentMapId: null,
  setCurrentMap: (id) => {
    // Сбросить зависимый state
    useGraphViewStore.getState().reset()
    set({ currentMapId: id })
  },
  reset: () => set({ currentMapId: null })
}))
```

---

## Anti-pattern: State Duplication

> **Внимание**: Это известная проблема в текущем коде.

```tsx
// ❌ ПЛОХО: Два источника истины для user
// entities/session/session.store.ts
export const useSessionStore = create(() => ({
  user: null,  // Zustand
}))

// entities/user/user.queries.ts
export const useUser = () => useQuery({
  queryKey: ['user'],
  queryFn: fetchUser  // React Query
})
```

**Проблемы:**
- Race conditions между источниками
- Stale data в одном из источников
- Сложность синхронизации

**Решение:**
```tsx
// ✅ ХОРОШО: Один источник истины
// React Query = данные пользователя
export const useUser = () => useQuery({ queryKey: ['user'], queryFn: fetchUser })

// Zustand = только UI state (isAuthenticated computed из React Query)
export const useSessionStore = create(() => ({
  // Нет user здесь!
  loginRedirectPath: null
}))
```

---

## См. также

- [08-ssr.md](./08-ssr.md) — SSR и hydration
- [09-security.md](./09-security.md) — Безопасное хранение данных
