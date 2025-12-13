# Стратегия тестирования

## Структура тестов

```
src/
├── app/__tests__/                    # Cross-module тесты (сценарии)
│   ├── auth/
│   │   ├── sign-in.e2e.ts
│   │   └── sign-up.e2e.ts
│   ├── billing/
│   │   └── checkout.e2e.ts
│   └── providers.integration.ts      # App-level integration (редко)
│
├── features/auth/sign-in-form/
│   └── __tests__/                    # Module-level тесты
│       ├── sign-in-form.test.ts
│       ├── sign-in-form.validation.test.ts
│       └── sign-in-form.integration.ts
│
└── entities/user/
    └── __tests__/
        ├── user.test.ts
        └── user.schema.test.ts
```

---

## Naming Convention

### Module-level (`module/__tests__/`)

```
[module|component].[part?].[test|integration].ts
```

| Пример | Описание |
|--------|----------|
| `sign-in-form.test.ts` | Unit: весь модуль |
| `sign-in-form.validation.test.ts` | Unit: часть модуля (validation) |
| `sign-in-form.integration.ts` | Integration: модуль целиком |
| `sign-in-form.api.integration.ts` | Integration: API часть |
| `graph-canvas.test.ts` | Unit: компонент из `components/` |
| `node-drawer.drag.test.ts` | Unit: часть компонента |

**Для segmented module** domain может быть:
- Имя модуля (`graph`, `sign-in-form`)
- Имя компонента из `components/` (`graph-canvas`, `node-drawer`)

### App-level (`app/__tests__/`)

```
[scenario].[e2e|integration].ts
```

| Пример | Описание |
|--------|----------|
| `sign-in.e2e.ts` | E2E: user flow авторизации |
| `checkout.e2e.ts` | E2E: flow оплаты |
| `providers.integration.ts` | Integration: app providers |

---

## Уровни тестирования

| Тип | Где | Суффикс | Runner | Что тестируем |
|-----|-----|---------|--------|---------------|
| **Unit** | `module/__tests__/` | `.test.ts` | Vitest | Схемы, утилиты, хуки, компоненты |
| **Integration** | `module/__tests__/` или `app/__tests__/` | `.integration.ts` | Vitest | Взаимодействие частей модуля, API |
| **E2E** | `app/__tests__/[group]/` | `.e2e.ts` | Playwright | User flows, критические пути |

---

## Правила размещения

1. **Unit + Integration модуля** → `module/__tests__/`
2. **Cross-module сценарии** → `app/__tests__/[group]/`
3. **Плоская структура** внутри `__tests__/` (без вложенных папок)
4. **Группы в app/__tests__/** соответствуют FSD группам (`auth/`, `billing/`, `graph/`)

---

## Unit тесты

**Расположение**: `module/__tests__/`

```
features/auth/sign-in-form/
└── __tests__/
    ├── sign-in-form.test.ts           # Основные тесты
    ├── sign-in-form.schema.test.ts    # Тесты схемы
    └── sign-in-form.validation.test.ts # Тесты валидации

entities/user/
└── __tests__/
    ├── user.test.ts
    └── user.schema.test.ts
```

**Что тестируем:**
- Zod схемы (валидация, edge cases)
- Утилиты в `lib/`
- Хуки
- Чистые функции

**Пример:**

```tsx
// entities/node/__tests__/node.schema.test.ts
import { describe, it, expect } from 'vitest'
import { NodeSchema, NodeIdSchema } from '../node.schema'

describe('NodeIdSchema', () => {
  it('accepts valid UUID', () => {
    const result = NodeIdSchema.safeParse('123e4567-e89b-12d3-a456-426614174000')
    expect(result.success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    const result = NodeIdSchema.safeParse('not-a-uuid')
    expect(result.success).toBe(false)
  })
})
```

---

## Integration тесты

### Module-level

**Расположение**: `module/__tests__/`

```
features/auth/sign-in-form/
└── __tests__/
    └── sign-in-form.integration.ts    # Взаимодействие частей модуля
```

**Что тестируем:**
- Компонент + хук + API вместе
- React Query + MSW
- Zustand store interactions

### App-level

**Расположение**: `app/__tests__/`

```
app/__tests__/
├── providers.integration.ts           # App providers работают вместе
└── routing.integration.ts             # Router guards
```

**Пример:**

```tsx
// features/auth/sign-in-form/__tests__/sign-in-form.integration.ts
import { renderWithProviders, screen, userEvent } from '@/shared/tests'
import { SignInForm } from '../sign-in-form'
import { server } from '@/shared/mocks/server'
import { http, HttpResponse } from 'msw'

describe('SignInForm Integration', () => {
  it('shows success toast after login', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({ user: { id: '1', email: 'test@test.com' } })
      })
    )

    renderWithProviders(<SignInForm />)

    await userEvent.type(screen.getByLabelText('Email'), 'test@test.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText('Welcome!')).toBeInTheDocument()
  })
})
```

---

## E2E тесты

**Расположение**: `app/__tests__/[group]/`

```
app/__tests__/
├── auth/
│   ├── sign-in.e2e.ts                 # Login flow
│   ├── sign-up.e2e.ts                 # Registration + onboarding
│   └── password-reset.e2e.ts          # Password recovery
├── billing/
│   └── checkout.e2e.ts                # Payment flow
├── graph/
│   └── node-creation.e2e.ts           # Create node flow
└── smoke.e2e.ts                       # Critical paths smoke test
```

**Что тестируем:**
- Критические пользовательские пути
- Happy path scenarios
- Cross-module flows (auth → dashboard → create map)

**Пример:**

```ts
// app/__tests__/auth/sign-in.e2e.ts
import { test, expect } from '@playwright/test'

test('user can sign in and see dashboard', async ({ page }) => {
  await page.goto('/sign-in')

  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('Welcome back')).toBeVisible()
})
```

---

## API Mocking с MSW

### Размещение моков

**Централизованно в `shared/mocks/`**:

```
shared/mocks/
├── data/                     # Mock data
│   ├── users.ts
│   ├── maps.ts
│   └── subscriptions.ts
├── handlers/                 # MSW request handlers
│   ├── auth.ts
│   ├── user.ts
│   └── map.ts
├── server.ts                 # MSW server setup (Node.js)
└── browser.ts                # MSW browser setup (dev mode)
```

**⚠️ FSD Исключение:**
- `shared/mocks/` импортирует типы из `entities/*` — это **допустимо** для тестовых данных
- Моки не попадают в production bundle

### Setup

```tsx
// shared/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

```tsx
// vitest.setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '@/shared/mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Override в тесте

```tsx
import { server } from '@/shared/mocks/server'
import { http, HttpResponse } from 'msw'

it('shows error on failed login', async () => {
  server.use(
    http.post('/api/auth/login', () => {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    })
  )

  // ... test code
})
```

---

## Test Utilities

### Render с провайдерами

```tsx
// shared/tests/render.tsx
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: { route?: string }
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[options?.route ?? '/']}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  )
}
```

### Хелперы

```tsx
// shared/tests/helpers.ts
export const waitForLoadingToFinish = () => {
  return waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
}

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: '1',
  email: 'test@test.com',
  name: 'Test User',
  ...overrides
})
```

---

## Конфигурация

### Vitest

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    include: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.integration.ts'],
    exclude: ['**/*.e2e.ts'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/entities/**/*.ts',
        'src/features/**/lib/**/*.ts',
        'src/shared/lib/**/*.ts'
      ],
      exclude: [
        '**/__tests__/**',
        '**/index.ts',
        '**/*.d.ts'
      ]
    }
  }
})
```

### Playwright

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './src/app/__tests__',
  testMatch: '**/*.e2e.ts',
  use: {
    baseURL: 'http://localhost:3000'
  }
})
```

---

## Coverage Thresholds

| Метрика | Порог | Примечание |
|---------|-------|------------|
| Statements | 60% | Базовый уровень |
| Branches | 50% | Условная логика |
| Functions | 60% | Покрытие функций |
| Lines | 60% | Строки кода |

---

## Правила

1. **Тесты в `__tests__/`** — не co-located рядом с файлами
2. **Плоская структура** — без вложенных папок внутри `__tests__/`
3. **Naming по domain** — `[module|component].[part?].[type].ts`
4. **E2E в app/** — cross-module сценарии отдельно
5. **MSW для API** — не jest.mock
6. **Isolated** — каждый тест независим

---

## Что НЕ тестировать unit-тестами

- ❌ Чисто UI логику (используйте integration/e2e)
- ❌ Стили и layout
- ❌ Third-party библиотеки
- ❌ Простые pass-through функции

**Почему:**
- UI тесты хрупкие (ломаются при любом изменении)
- Лучше покрыть E2E критические пути
- Unit-тесты для бизнес-логики, не UI

---

## Дополнительные типы тестов

### Visual Regression (опционально)

```ts
// Playwright для visual tests
test('button variants', async ({ page }) => {
  await page.goto('/storybook/button')
  await expect(page).toHaveScreenshot('button-variants.png')
})
```

### Accessibility Testing

```ts
import AxeBuilder from '@axe-core/playwright'

test('page has no a11y violations', async ({ page }) => {
  await page.goto('/dashboard')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
```

---

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run test:coverage

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bunx playwright install --with-deps
      - run: bun run test:e2e
```

---

## См. также

- [02-modules.md](./02-modules.md) — Структура модулей
- [09-security.md](./09-security.md) — Security testing
- [99-best-practices.md](./99-best-practices.md) — Чеклист
