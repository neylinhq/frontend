# Server-only код

## Файлы `.server.ts`

Файлы `.server.ts` содержат код, который **НИКОГДА не должен попасть в клиентский бандл**.

React Router (и другие SSR фреймворки) автоматически исключают эти файлы из client bundle.

---

## Что класть в `.server.ts`

| Тип | Пример |
|-----|--------|
| **Loaders** | Загрузка данных для страницы |
| **Actions** | Обработка форм, мутации |
| **Auth guards** | `requireAuth()`, `requireAdmin()` |
| **Секреты** | Доступ к env-переменным, API keys |
| **Database** | Прямые запросы к БД (если есть) |

---

## Примеры

### Auth guard

```tsx
// entities/session/session.server.ts
import { redirect } from 'react-router'
import { getSession } from './session.utils'

export const requireAuth = async (request: Request) => {
  const session = await getSession(request)
  if (!session.userId) {
    throw redirect('/sign-in')
  }
  return session
}

export const requireAdmin = async (request: Request) => {
  const session = await requireAuth(request)
  if (session.role !== 'admin') {
    throw redirect('/dashboard')
  }
  return session
}
```

### Page loader

```tsx
// pages/dashboard/overview-page/overview-page.server.ts
import { requireAuth } from '@/entities/session/session.server'
import { mapApi } from '@/entities/map'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await requireAuth(request)
  const maps = await mapApi.getUserMaps(session.userId)

  return { maps, user: session.user }
}
```

### Form action

```tsx
// pages/settings/profile-page/profile-page.server.ts
import { requireAuth } from '@/entities/session/session.server'
import { userApi } from '@/entities/user'
import { ProfileSchema } from '@/entities/user'

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await requireAuth(request)
  const formData = await request.formData()

  const result = ProfileSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { errors: result.error.flatten() }
  }

  await userApi.updateProfile(session.userId, result.data)
  return { success: true }
}
```

---

## Почему НЕ экспортировать через index.ts?

```tsx
// ❌ ОПАСНО - серверный код может утечь на клиент
// entities/session/index.ts
export { requireAuth } from './session.server'

// ✅ ПРАВИЛЬНО - импорт напрямую в .server.ts файлах
// pages/dashboard/overview-page/overview-page.server.ts
import { requireAuth } from '@/entities/session/session.server'
```

**Проблема с barrel export:**
- Bundler может включить весь `index.ts` в client bundle
- Серверные зависимости (node APIs, env vars) попадут на клиент
- Build сломается или app утечёт секреты

---

## Правило

**`.server.ts` импортируется только из других `.server.ts` файлов.**

```
✅ .server.ts → .server.ts
❌ .tsx → .server.ts
❌ index.ts → .server.ts
```

---

## Структура в модуле

```
entities/session/
├── index.ts              # ❌ НЕ экспортирует .server.ts
├── session.schema.ts     # Типы и схемы
├── session.api.ts        # API client (для клиента)
├── session.queries.ts    # React Query hooks
└── session.server.ts     # Auth guards, server utils
```

```
pages/dashboard/overview-page/
├── index.ts
├── overview-page.tsx
└── overview-page.server.ts  # Loader + Action
```

---

## Проверка

Если не уверены, попадёт ли код в client bundle:

1. **Build приложение**: `pnpm build`
2. **Проверьте размер bundle**: `pnpm analyze` (если есть)
3. **Поищите в output**: `grep -r "requireAuth" .output/client`

Серверный код НЕ должен появиться в client output.

---

## Env переменные

```tsx
// ❌ ПЛОХО - в обычном файле
const API_KEY = process.env.SECRET_API_KEY  // Утечёт на клиент!

// ✅ ХОРОШО - в .server.ts
// entities/payment/payment.server.ts
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY

export const createPaymentIntent = async (amount: number) => {
  const stripe = new Stripe(STRIPE_SECRET)
  return stripe.paymentIntents.create({ amount })
}
```

**Правило**: Любой `process.env.SECRET_*` должен быть в `.server.ts`.

---

## Error Handling в Loaders

### Типы ошибок

| Тип | Обработка | HTTP Status |
|-----|-----------|-------------|
| Not found | throw Response | 404 |
| Unauthorized | throw redirect | 302 → /sign-in |
| Forbidden | throw Response | 403 |
| Validation | return { errors } | 200 (с errors) |
| Server error | throw Response | 500 |

### Примеры

```tsx
// pages/maps/map-page/map-page.server.ts
import { data, redirect } from 'react-router'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // 1. Auth check
  const session = await getSession(request)
  if (!session) {
    throw redirect('/sign-in')
  }

  // 2. Fetch data
  const map = await mapApi.getById(params.mapId)

  // 3. Not found
  if (!map) {
    throw data({ message: 'Map not found' }, { status: 404 })
  }

  // 4. Forbidden
  if (map.userId !== session.userId) {
    throw data({ message: 'Access denied' }, { status: 403 })
  }

  return { map }
}
```

### Actions с валидацией

```tsx
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()

  // Валидация — НЕ throw, а return с errors
  const result = MapSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return data(
      { errors: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    await mapApi.create(result.data)
    return redirect('/dashboard')
  } catch (error) {
    // Серверная ошибка
    console.error('Failed to create map:', error)
    throw data(
      { message: 'Failed to create map' },
      { status: 500 }
    )
  }
}
```

### Error Boundary

Ошибки из loaders перехватываются ErrorBoundary:

```tsx
// app/root.tsx
export const ErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    // Наша ошибка (404, 403, 500)
    return <ErrorPage status={error.status} message={error.data.message} />
  }

  // Неожиданная ошибка
  return <ErrorPage status={500} message="Something went wrong" />
}
```

> **Подробнее**: [07-error-handling.md](./07-error-handling.md)

---

## Security в Loaders

### Input Validation

```tsx
// ✅ Всегда валидируйте params и query
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const mapId = z.string().uuid().safeParse(params.mapId)
  if (!mapId.success) {
    throw data({ message: 'Invalid map ID' }, { status: 400 })
  }

  // Теперь mapId.data типизирован и валиден
  const map = await mapApi.getById(mapId.data)
}
```

### Rate Limiting

```tsx
// shared/lib/rate-limit.server.ts
import { RateLimiter } from 'limiter'

const limiters = new Map<string, RateLimiter>()

export const checkRateLimit = (ip: string, limit = 100) => {
  let limiter = limiters.get(ip)
  if (!limiter) {
    limiter = new RateLimiter({ tokensPerInterval: limit, interval: 'minute' })
    limiters.set(ip, limiter)
  }

  if (!limiter.tryRemoveTokens(1)) {
    throw data({ message: 'Too many requests' }, { status: 429 })
  }
}
```

> **Подробнее**: [09-security.md](./09-security.md)

---

## См. также

- [01-layers.md](./01-layers.md) — Где размещать .server.ts файлы
- [07-error-handling.md](./07-error-handling.md) — Error boundaries
- [08-ssr.md](./08-ssr.md) — SSR и loaders
- [09-security.md](./09-security.md) — Безопасность
