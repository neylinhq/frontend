# Стратегия тестирования

## Уровни тестирования

| Уровень | Расположение | Что тестируем |
|---------|--------------|---------------|
| **Unit** | `*.test.ts` рядом с файлом | Схемы, утилиты, хелперы |
| **Integration** | `app/__tests__/*.integration.test.ts` | Flows, взаимодействие features |
| **E2E** | `app/__tests__/*.e2e.test.ts` | Критические пользовательские пути |

---

## Unit тесты

**Co-located** - `.test.ts` рядом с тестируемым файлом:

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

**Что тестируем:**
- Zod схемы (валидация, edge cases)
- Утилиты в shared/lib
- Хелперы в features/*/lib
- Чистые функции

**Пример:**

```tsx
// entities/node/node.schema.test.ts
import { describe, it, expect } from 'vitest'
import { NodeSchema, NodeIdSchema } from './node.schema'

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

describe('NodeSchema', () => {
  it('validates complete node', () => {
    const node = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'concept',
      title: 'Test Node',
      content: 'Test content'
    }
    expect(NodeSchema.parse(node)).toEqual(node)
  })
})
```

---

## Integration тесты

**Расположение**: `app/__tests__/`

```
app/
├── __tests__/
│   ├── auth.integration.test.ts       # Auth flow
│   ├── billing.integration.test.ts    # Upgrade flow
│   └── graph.integration.test.ts      # Graph interactions
├── providers/
└── theme/
```

**Что тестируем:**
- Многошаговые пользовательские сценарии
- Взаимодействие между features
- React Query + Zustand integration

**Пример:**

```tsx
// app/__tests__/auth.integration.test.ts
import { renderWithProviders, screen, userEvent } from '@/shared/tests'
import { SignInForm } from '@/features/auth/sign-in-form'
import { server } from '@/shared/mocks/server'
import { http, HttpResponse } from 'msw'

describe('Auth Flow', () => {
  it('redirects to dashboard after successful login', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({ user: { id: '1', email: 'test@test.com' } })
      })
    )

    renderWithProviders(<SignInForm />)

    await userEvent.type(screen.getByLabelText('Email'), 'test@test.com')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(window.location.pathname).toBe('/dashboard')
  })
})
```

---

## E2E тесты

**Расположение**: `app/__tests__/`

```
app/
├── __tests__/
│   ├── smoke.e2e.test.ts              # Критические пути
│   ├── signup.e2e.test.ts             # Регистрация + onboarding
│   └── map-creation.e2e.test.ts       # Создание карты + узлы
```

**Что тестируем:**
- Критические пользовательские пути
- Happy path scenarios
- Smoke tests для production

---

## API Mocking с MSW

### Размещение моков

**Централизованно в `shared/mocks/`** - все mock data и MSW handlers в одном месте:

```
shared/
├── mocks/
│   ├── data/                     # Mock data (типизированные объекты)
│   │   ├── users.ts             # Mock users
│   │   ├── maps.ts              # Mock maps
│   │   └── subscriptions.ts     # Mock subscriptions
│   ├── handlers/                # MSW request handlers
│   │   ├── auth.ts              # Auth endpoints
│   │   ├── user.ts              # User endpoints
│   │   ├── map.ts               # Map endpoints
│   │   └── subscription.ts      # Subscription endpoints
│   ├── server.ts                # MSW server setup (Node.js)
│   └── browser.ts               # MSW browser setup (dev mode)
```

**⚠️ FSD Исключение:**
- `shared/mocks/` импортирует типы из `entities/*` - это **допустимо** для тестовых данных
- Моки используются **только в тестах**, не попадают в production bundle
- Моки **не экспортируются** через barrel exports `shared/index.ts`

**Почему централизованно:**
- Моки используются на разных уровнях (integration tests в `app/__tests__/`, unit tests в entities)
- Один источник правды для всех тестовых данных
- Легче поддерживать consistency между тестами
- MSW handlers могут комбинировать данные из разных entities

### Setup

```tsx
// shared/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

```tsx
// shared/mocks/handlers/index.ts
import { http, HttpResponse } from 'msw'
import { MOCK_USERS } from '../data/users'
import { MOCK_MAPS } from '../data/maps'

export const handlers = [
  http.get('/api/user/current', () => {
    return HttpResponse.json(MOCK_USERS[0])
  }),

  http.get('/api/maps', () => {
    return HttpResponse.json(MOCK_MAPS)
  })
]
```

```tsx
// shared/mocks/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './server'

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

## Правила

1. **Co-locate** unit тесты - `.test.ts` рядом с `.ts`
2. **Integration/E2E** → `app/__tests__/`
3. **Моки централизованно** → `shared/mocks/` для MSW handlers и mock data
4. **Coverage** → фокус на критической логике (схемы, утилиты)
5. **Не тестируем** → UI компоненты unit-тестами (слишком хрупко)
6. **MSW** → для всех API моков (не jest.mock)
7. **Isolated** → каждый тест независим

---

## Что НЕ тестировать unit-тестами

- ❌ React компоненты (используйте integration/e2e)
- ❌ Стили и layout
- ❌ Third-party библиотеки
- ❌ Моки (тестируйте реальную логику)

**Почему:**
- UI тесты хрупкие (ломаются при любом изменении)
- Лучше покрыть E2E критические пути
- Unit-тесты для чистой логики, не UI

---

## Coverage Thresholds

### Минимальные требования

| Метрика | Порог | Примечание |
|---------|-------|------------|
| Statements | 60% | Базовый уровень |
| Branches | 50% | Условная логика |
| Functions | 60% | Покрытие функций |
| Lines | 60% | Строки кода |

### Конфигурация (vitest.config.ts)

```ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60
      },
      include: [
        'src/entities/**/*.ts',
        'src/features/**/lib/**/*.ts',
        'src/shared/lib/**/*.ts'
      ],
      exclude: [
        '**/*.test.ts',
        '**/index.ts',
        '**/*.d.ts'
      ]
    }
  }
})
```

---

## Дополнительные типы тестов

### Visual Regression (опционально)

```bash
# Playwright для visual tests
bunx playwright test --project=visual
```

```ts
// tests/visual/button.visual.test.ts
test('button variants', async ({ page }) => {
  await page.goto('/storybook/button')
  await expect(page).toHaveScreenshot('button-variants.png')
})
```

### Accessibility Testing

```ts
// Используем @axe-core/playwright
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('page has no a11y violations', async ({ page }) => {
  await page.goto('/dashboard')

  const results = await new AxeBuilder({ page }).analyze()

  expect(results.violations).toEqual([])
})
```

### Performance Testing

```ts
// Lighthouse CI в pipeline
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }]
      }
    }
  }
}
```

---

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - run: bun install
      - run: bun run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## См. также

- [09-security.md](./09-security.md) — Security testing
- [99-best-practices.md](./99-best-practices.md) — Чеклист
