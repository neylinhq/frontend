# Структура модулей

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

### Tooling: Biome

Проект использует **[Biome](https://biomejs.dev)** вместо ESLint + Prettier.

**Почему Biome?**
- Единый инструмент для линтинга И форматирования
- В 10-100x быстрее ESLint/Prettier (написан на Rust)
- Меньше конфигурации, меньше конфликтов

**Конфигурация (`biome.json`):**

| Правило | Значение |
|---------|----------|
| Отступы | 2 пробела |
| Ширина строки | 100 символов |
| Кавычки | single (`'`) |
| Точка с запятой | нет (ASI) |
| Trailing commas | нет |
| Line endings | LF |

**Команды:**

```bash
# Форматирование
bun biome format --write .

# Линтинг
bun biome lint .

# Всё вместе (format + lint)
bun biome check --write .
```

---

## Группа ≠ Модуль

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

**⛔ СТРОГО ЗАПРЕЩЕНО** создавать файлы на уровне группы:
```
features/
└── auth/
    ├── sign-in-form/
    ├── sign-up-form/
    └── auth.queries.ts  # ❌ НЕЛЬЗЯ - переносите в entities/session
    └── auth.api.ts      # ❌ НЕЛЬЗЯ - переносите в entities/session
```

**Правило**: Группа = папка БЕЗ файлов. Если нужен общий код - создайте widget или вынесите в shared/entities.

---

## Плоский модуль (Simple Module)

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

### Разрешённые файлы в плоском модуле

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
└── __tests__/            # Тесты модуля (см. 06-testing.md)
```

**❌ НЕЛЬЗЯ**:
- Обычный `.css` (только `.module.css` в модулях)
- `.js`, `.jsx` файлы
- Random файлы (`helpers.ts`, `common.ts`, `misc.ts`)

### Правило для нескольких компонентов

Если **БОЛЬШЕ одного компонента** - создайте `/components`:

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

**❌ ЗАПРЕЩЕНО**:
- Вложенные папки (`/components/card/card.tsx`)
- Сегменты внутри (`/components/lib/`, `/components/styles/`)

---

## Сложный модуль (Segmented Module)

**Сегментированная структура** подходит для **сложных модулей** с 6+ файлами.

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
│   ├── graph.hooks.ts
│   └── graph.layout.hooks.ts    # Subpart: graph.layout
├── lib/                     # ПЛОСКАЯ структура
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
| `components/` | React компоненты | **ТОЛЬКО `.tsx`** |
| `styles/` | Стили | **ТОЛЬКО `.module.css`** |
| `model/` | Логика, схемы, хуки | **ВСЁ КРОМЕ** utils, api, queries |
| `lib/` | Утилиты | **ПЛОСКАЯ** структура |
| `api/` | API + queries | `.api.ts` + `.queries.ts` |

**Когда использовать**:
- ✅ Модуль с 6+ файлами
- ✅ Чёткие доменные зоны (components vs model vs lib)
- ✅ Нужны отдельные styles или много утилит

**У 90%+ модулей не будет всех этих сегментов** - используйте только то, что нужно.

---

## Именование файлов в model/

### Domain правило

Domain (первая часть имени файла) должен быть:
1. **Имя модуля**: `graph.hooks.ts` (domain = `graph`)
2. **Имя модуля + subpart**: `graph.layout.hooks.ts` (domain = `graph.layout`)
3. **Имя компонента**: `node-drawer.hooks.ts` (если `components/node-drawer.tsx` существует)
4. **Имя компонента + subpart**: `node-drawer.panel.hooks.ts`

### Примеры

```
model/
├── graph.hooks.ts            # ✅ Модуль: graph
├── graph.layout.hooks.ts     # ✅ Модуль + subpart: graph.layout
├── graph.selection.hooks.ts  # ✅ Модуль + subpart: graph.selection
├── graph.store.ts            # ✅ Модуль: graph
├── node-drawer.hooks.ts      # ✅ Компонент: node-drawer.tsx
├── node-drawer.panel.hooks.ts # ✅ Компонент + subpart
```

### ❌ ЗАПРЕЩЕНО

```
model/
├── graph-layout.hooks.ts     # ❌ Дефис = имя компонента!
│                             #    Ожидается components/graph-layout.tsx
├── layout.hooks.ts           # ❌ Domain не совпадает с модулем/компонентом
├── use-graph-selection.ts    # ❌ Неверный формат (use-*)
```

### Разница между `-` и `.`

| Символ | Значение | Пример |
|--------|----------|--------|
| `-` (дефис) | Часть имени компонента | `node-drawer.hooks.ts` → компонент `node-drawer.tsx` |
| `.` (точка) | Разделитель subpart | `graph.layout.hooks.ts` → модуль `graph` с subpart `layout` |

**Правило**: Если нужно разбить большой файл на части — используй **точку** для subpart:
```
graph.hooks.ts          # Основные хуки
graph.layout.hooks.ts   # Хуки для layout
graph.zoom.hooks.ts     # Хуки для zoom
```

### Разрешённые суффиксы в model/

| Суффикс | Назначение |
|---------|------------|
| `.types.ts` | TypeScript типы |
| `.constants.ts` | Константы |
| `.schema.ts` | Zod схемы |
| `.store.ts` | Zustand stores |
| `.hooks.ts` | React hooks |
| `.config.ts` | Конфигурация |
| `.context.ts` | React Context |
| `.server.ts` | Server-only код |
| `.d.ts` | Type declarations |

---

## Barrel Exports (index.ts)

**Правила**:
1. ✅ Явные экспорты (НЕ `export *`)
2. ✅ Экспортируем из сегментов
3. ⛔ `[domain].server.ts` **НИКОГДА** не экспортируем через index.ts

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

### ⛔ .server.ts и client bundle leak

Файлы `.server.ts` содержат server-only код (DB queries, auth, secrets). **НИКОГДА** не экспортируй их через `index.ts`:

```tsx
// index.ts

// ⛔ НИКОГДА так не делай
export { createServerApi } from './api.server'  // LEAK!
export { requireAuth } from './auth.server'     // LEAK!

// ✅ Server-only код импортируется напрямую в route loaders/actions
// import { requireAuth } from '@/entities/session/session.server'
```

**Почему опасно?**
- `index.ts` — public API модуля, импортируется в client components
- Bundler включит весь `.server.ts` код в client bundle
- Секреты, DB queries, auth логика утекут в браузер

**Правило**: `.server.ts` импортируется **ТОЛЬКО** напрямую в route loaders/actions, **НИКОГДА** через barrel.

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

### features/graph (сложная)
```
graph/
├── index.ts
├── components/              # ТОЛЬКО .tsx
│   ├── graph-canvas.tsx
│   ├── graph-toolbar.tsx
│   ├── node-drawer.tsx
│   └── edge-label.tsx
├── model/                   # Логика
│   ├── graph.store.ts           # Zustand
│   ├── graph.types.ts
│   ├── graph.hooks.ts           # Основные хуки
│   ├── graph.layout.hooks.ts    # Subpart: layout
│   ├── graph.selection.hooks.ts # Subpart: selection
│   └── node-drawer.hooks.ts     # Компонент: node-drawer.tsx
└── lib/                     # ПЛОСКАЯ структура
    ├── force-layout.ts      # ❌ НЕТ /lib/layout/force.ts
    └── graph-utils.ts
```

**Почему сложная**: 10+ файлов, чёткие зоны (components, model, lib).
**Именование в model/**: Используем точку для subparts (`graph.layout.hooks.ts`), дефис для компонентов (`node-drawer.hooks.ts`).

---

## Когда создавать новый модуль

### Критерии

| Признак | Создавать модуль? |
|---------|-------------------|
| Переиспользуется в 2+ местах | ✅ Да |
| Имеет чёткую domain границу | ✅ Да |
| Содержит 3+ связанных файлов | ✅ Да |
| Один файл / одна функция | ❌ Нет, добавь в существующий |
| Временный код / эксперимент | ❌ Нет, сначала в feature |

### Примеры

```
// ❌ НЕ создавать модуль для одной функции
features/auth/format-password.ts  // Плохо

// ✅ Добавить в существующий модуль
features/auth/sign-in-form/sign-in-form.utils.ts  // Хорошо

// ✅ Создать модуль для domain entity
entities/subscription/  // Чёткая граница, переиспользуется
```

---

## Инфраструктура shared/

`shared/` — инфраструктурный слой, **НЕ** domain-логика. Паттерн `[domain].[subpart].suffix.ts` здесь **НЕ применяется**.

### shared/api/ — API клиент

**СТРОГО** два файла:

```
shared/api/
├── client.ts             # Клиентский API (браузер)
└── server.ts             # Серверный API (SSR, loaders)
```

### shared/config/ — конфигурация

Плоская структура, `kebab-case.ts`:

```
shared/config/
├── index.ts
├── routes.ts
├── api-endpoints.ts
├── breakpoints.ts
├── env.ts
└── ...
```

### shared/lib/ — утилиты

Плоская структура, `kebab-case.ts`:

```
shared/lib/
├── cn/
│   └── index.ts          # classnames utility
├── format-date.ts
├── debounce.ts
└── ...
```

### shared/hooks/ — React хуки

Паттерн `use-*.ts`:

```
shared/hooks/
├── index.ts
├── use-debounce.ts
├── use-dark-mode.ts
├── use-click-outside.ts
└── ...
```

### shared/styles/ — глобальные стили

Любые `.css` файлы:

```
shared/styles/
├── globals.css
├── normalize.css
└── ...
```

### shared/components/ — UI компоненты

**Группа модулей** (обычные FSD правила):

```
shared/components/
├── button/               # Модуль
│   ├── index.ts
│   └── button.tsx
├── card/
│   ├── index.ts
│   └── card.tsx
└── ...
```

**Это ГРУППА** — нет `shared/components/index.ts`!

### shared/core/ — инфраструктурные модули

Группа модулей со свободной внутренней структурой:

```
shared/core/
├── theme/
│   ├── index.ts
│   └── ...
└── wasm/
    ├── index.ts
    ├── graph_engine.js
    └── graph_engine.d.ts
```

### shared/mocks/ — MSW инфраструктура

Специальный модуль, валидатор пропускает:

```
shared/mocks/
├── client.ts             # MSW browser setup
├── server.ts             # MSW server setup (тесты)
├── handlers/
│   └── ...
└── data/
    └── ...
```

---

## Типичные ошибки

### ❌ Вложенные папки в /lib

```
lib/
├── utils/
│   └── format.ts   # ❌ Слишком глубоко
└── hooks/
    └── use-debounce.ts  # ❌ Слишком глубоко
```

**Правильно:**
```
lib/
├── format-utils.ts      # ✅ Плоская структура
└── use-debounce.ts      # ✅ Хуки тоже в lib
```

### ❌ Папки внутри /components

```
components/
├── card/           # ❌ Нет вложенных папок
│   ├── card.tsx
│   └── card.module.css
```

**Правильно:**
```
components/
├── card.tsx           # ✅ Плоско
└── card.module.css    # ✅ Стили рядом (или в /styles)
```

---

## См. также

- [01-layers.md](./01-layers.md) — Слои архитектуры
- [03-dependencies.md](./03-dependencies.md) — Правила импортов
- [06-testing.md](./06-testing.md) — Организация тестов
