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
