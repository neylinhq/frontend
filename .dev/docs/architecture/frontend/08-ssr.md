# Server-Side Rendering (SSR)

SSR — рендеринг страницы на сервере с последующей гидрацией на клиенте.

---

# ЧАСТЬ 1: ФУНДАМЕНТ

## Что такое SSR

### Rendering Strategies

| Стратегия | Когда рендерится | Когда данные | Примеры |
|-----------|------------------|--------------|---------|
| CSR | Browser | Browser | Vite + React SPA |
| SSR | Server (каждый запрос) | Server | Next.js, Remix |
| SSG | Build time | Build time | Astro, 11ty |
| ISR | Build + revalidate | Build + cache | Next.js ISR |

### Когда использовать SSR

- SEO критичен (публичные страницы, блоги, e-commerce)
- Первый контентный рендер важен (LCP для Core Web Vitals)
- Данные персонализированы (auth, geo, A/B тесты)
- Превью в соцсетях (og:image, og:title)

### Когда НЕ использовать SSR

- Приватные dashboard-ы (SEO не нужен → CSR достаточно)
- Realtime apps (WebSocket heavy → гидрация мешает)
- Статический контент (лучше SSG → быстрее и дешевле)
- Высокая нагрузка без кэширования (каждый запрос = рендер)

---

## Жизненный цикл SSR

```
┌─────────────────────────────────────────────────────────────┐
│                        REQUEST                               │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  1. SERVER: Route Matching                                   │
│     └─ Определяем какой компонент рендерить                  │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. SERVER: Data Fetching                                    │
│     └─ loader / getServerSideProps / load()                  │
│     └─ Запросы к API, БД, кэшу                               │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. SERVER: Render to HTML                                   │
│     └─ renderToString / renderToPipeableStream               │
│     └─ Компоненты → HTML строка                              │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. RESPONSE: HTML + Serialized State                        │
│     └─ <script>__DATA__ = {...}</script>                     │
│     └─ Полный HTML для SEO и быстрого FCP                    │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. CLIENT: Hydration                                        │
│     └─ hydrateRoot(document, <App />)                        │
│     └─ React "оживляет" HTML, прикрепляет event listeners    │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  6. CLIENT: Interactive                                      │
│     └─ SPA navigation (client-side routing)                  │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые метрики

| Метрика | SSR | CSR |
|---------|-----|-----|
| TTFB | Медленнее (рендер на сервере) | Быстрее (статичный HTML) |
| FCP | Быстрее (HTML с контентом) | Медленнее (пустой div) |
| TTI | Зависит от размера JS | Зависит от размера JS |
| SEO | Полный контент | Требует JS для индексации |

---

## Фундаментальные проблемы

### 1. Environment Mismatch

**Проблема:** Server (Node.js) ≠ Client (Browser)

| API | Server | Client |
|-----|--------|--------|
| `window` | ❌ undefined | ✅ |
| `document` | ❌ undefined | ✅ |
| `localStorage` | ❌ undefined | ✅ |
| `sessionStorage` | ❌ undefined | ✅ |
| `navigator` | ❌ undefined | ✅ |
| `fetch` | ✅ (Node 18+) | ✅ |
| `process.env` | ✅ | ⚠️ только public |
| `fs`, `path` | ✅ | ❌ |

**Решения:**

```tsx
// 1. Базовая проверка
if (typeof window !== 'undefined') {
  // Код только для браузера
  window.scrollTo(0, 0)
}

// 2. SSR-safe инициализация useState
const [value, setValue] = useState(() => {
  if (typeof window === 'undefined') return defaultValue
  return localStorage.getItem('key') ?? defaultValue
})

// 3. useEffect (выполняется только на клиенте)
useEffect(() => {
  // Безопасно использовать window, document, etc.
  const handleResize = () => setWidth(window.innerWidth)
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

---

### 2. Hydration Mismatch

**Проблема:** HTML с сервера ≠ HTML на клиенте → React warning/error

```
Warning: Text content did not match. Server: "5" Client: "7"
```

**Причины:**

| Причина | Пример |
|---------|--------|
| Время | `Date.now()`, `new Date()` |
| Рандом | `Math.random()`, `uuid()` |
| Browser API | `localStorage.getItem()` |
| Media queries | `window.innerWidth < 768` |
| User agent | `navigator.userAgent` |

**Решения:**

```tsx
// 1. useIsClient hook — универсальное решение
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])
  return isClient
}

// Использование
const Component = () => {
  const isClient = useIsClient()

  // На сервере рендерим placeholder, на клиенте — реальный контент
  if (!isClient) return <Skeleton />
  return <ClientOnlyContent />
}

// 2. suppressHydrationWarning — для контролируемых случаев
// Когда мы ЗНАЕМ что значения будут разными и это ОК
<time suppressHydrationWarning>
  {new Date().toLocaleTimeString()}
</time>

// 3. CSS вместо JS для responsive
// ПЛОХО: hydration mismatch на mobile
const isMobile = window.innerWidth < 768
return isMobile ? <MobileNav /> : <DesktopNav />

// ХОРОШО: один компонент, разные стили
<nav className="hidden md:flex">Desktop</nav>
<nav className="flex md:hidden">Mobile</nav>
```

---

### 3. State Transfer (Server → Client)

**Проблема:** Данные загружены на сервере — как передать клиенту без повторного fetch?

**Решения:**

```tsx
// 1. Inline script (классический подход)
// Server
const html = `
  <script>
    window.__INITIAL_STATE__ = ${JSON.stringify(data)}
  </script>
  <div id="root">${renderedHtml}</div>
`

// Client
const initialState = window.__INITIAL_STATE__

// 2. Framework loader data (React Router / Remix)
// Server
export const loader = async () => {
  const data = await fetchData()
  return { data }
}

// Client
const { data } = useLoaderData()

// 3. TanStack Query dehydration
// Server
const queryClient = new QueryClient()
await queryClient.prefetchQuery({ queryKey: ['user'], queryFn: fetchUser })
const dehydratedState = dehydrate(queryClient)

// Client
<HydrationBoundary state={dehydratedState}>
  <App />
</HydrationBoundary>
```

---

### 4. Flash of Unstyled Content (FOUC)

**Проблема:** Тема/стили не применены до загрузки и выполнения JS

**Симптомы:**
- Страница мигает белым перед применением dark mode
- Layout shifts при загрузке шрифтов
- Компоненты "прыгают" при hydration

**Решения:**

```html
<!-- 1. Critical CSS inline в <head> -->
<head>
  <style>
    /* Минимальный CSS для предотвращения flash */
    html { background: #fff; color: #000; }
    html.dark { background: #121212; color: #fff; }
  </style>
</head>

<!-- 2. Blocking script в <head> ДО body -->
<head>
  <script>
    // Выполняется синхронно, до рендера body
    (function() {
      const theme = document.cookie.match(/theme=(\w+)/)?.[1]
        ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      document.documentElement.classList.add(theme)
    })()
  </script>
</head>

<!-- 3. Cookie-first approach -->
<!-- Сервер читает cookie и добавляет class в HTML сразу -->
<html class="dark"> <!-- Уже с классом с сервера -->
```

---

### 5. Memory Leaks на сервере

**Проблема:** Singleton stores/caches накапливают данные между запросами

```tsx
// ❌ ПЛОХО: один store на все запросы всех пользователей
// Данные user A попадут к user B!
const store = createStore()

export const loader = async () => {
  store.setState({ user: await getCurrentUser() }) // Утечка!
}

// ✅ ХОРОШО: store per request
export const loader = async () => {
  const store = createStore() // Новый store для каждого запроса
  store.setState({ user: await getCurrentUser() })
  return { state: store.getState() }
}
```

**Правило:** На сервере всё должно быть request-scoped, не module-level.

---

## Паттерны

### Server-Only Code

**Правило:** Серверный код НЕ должен попадать в client bundle

```tsx
// ✅ Файлы .server.ts — автоматически исключаются bundler-ом
// session.server.ts
import { cookies } from 'some-node-lib'

export const getSession = (request: Request) => {
  return cookies.parse(request.headers.get('Cookie'))
}

// ✅ Динамический import в loader
export const loader = async ({ request }) => {
  // import() только на сервере, не попадёт в bundle
  const { getSession } = await import('./session.server')
  return getSession(request)
}

// ❌ НИКОГДА не экспортировать через barrel
// entities/session/index.ts
export { getSession } from './session.server' // Утечёт в client bundle!

// ✅ Импорт напрямую из .server.ts файла
import { getSession } from '@/entities/session/session.server'
```

---

### Client-Only Components

Компоненты использующие browser API (Canvas, WebGL, Web Audio, etc.)

```tsx
// Паттерн 1: ClientOnly wrapper
const ClientOnly = ({
  children,
  fallback = null
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted ? children : fallback
}

// Использование
<ClientOnly fallback={<GraphSkeleton />}>
  <WebGLGraph data={nodes} />
</ClientOnly>

// Паттерн 2: Dynamic import с ssr: false (Next.js)
import dynamic from 'next/dynamic'

const Graph = dynamic(() => import('./Graph'), {
  ssr: false,
  loading: () => <GraphSkeleton />
})

// Паттерн 3: Lazy loading (React Router / Remix)
// Компонент загрузится только на клиенте после hydration
const Graph = lazy(() => import('./Graph'))

<Suspense fallback={<GraphSkeleton />}>
  <Graph />
</Suspense>
```

---

### Cookie-First для Preferences

**Почему cookie, а не localStorage:**

| Аспект | Cookie | localStorage |
|--------|--------|--------------|
| Доступ на сервере | ✅ В request headers | ❌ Только клиент |
| SSR | ✅ Можно рендерить правильную тему | ❌ Только после hydration |
| FOUC | ✅ Нет flash | ❌ Flash при загрузке |
| Размер | ⚠️ ~4KB лимит | ✅ ~5MB |

```tsx
// Server (loader) — читаем theme из cookie
export const loader = async ({ request }) => {
  const cookies = request.headers.get('Cookie') ?? ''
  const theme = cookies.match(/theme=(\w+)/)?.[1] ?? 'light'
  return { theme }
}

// Client — синхронизируем cookie и localStorage
const setTheme = (newTheme: string) => {
  // Cookie для SSR (следующий запрос)
  document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`

  // localStorage для быстрого доступа на клиенте
  localStorage.setItem('theme', newTheme)

  // Применяем класс
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(newTheme)
}
```

---

## Передача состояния

### TanStack Query / React Query

```tsx
// === Server (loader) ===
import { dehydrate, QueryClient } from '@tanstack/react-query'

export const loader = async ({ request }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 минута
      },
    },
  })

  // Prefetch данные на сервере
  await queryClient.prefetchQuery({
    queryKey: ['user', 'current'],
    queryFn: () => fetchCurrentUser(request),
  })

  await queryClient.prefetchQuery({
    queryKey: ['maps'],
    queryFn: () => fetchMaps(request),
  })

  return {
    dehydratedState: dehydrate(queryClient),
  }
}

// === Client (root) ===
const App = () => {
  const { dehydratedState } = useLoaderData<typeof loader>()

  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <Outlet />
      </HydrationBoundary>
    </QueryClientProvider>
  )
}

// === Component ===
// useQuery НЕ сделает fetch — данные уже есть из SSR
const { data: user } = useQuery({
  queryKey: ['user', 'current'],
  queryFn: fetchCurrentUser,
})
```

---

### Zustand с SSR

```tsx
// ❌ ПЛОХО: singleton store — утечка данных между запросами
export const useStore = create(() => ({
  user: null,
  setUser: (user) => set({ user }),
}))

// ✅ ХОРОШО: factory + context
import { createStore, StoreApi } from 'zustand'

type State = { user: User | null }
type Store = StoreApi<State>

const StoreContext = createContext<Store | null>(null)

// Factory для создания store per request
const createAppStore = (initialState?: Partial<State>) =>
  createStore<State>(() => ({
    user: null,
    ...initialState,
  }))

// Provider инициализирует store с SSR данными
export const StoreProvider = ({
  children,
  initialState
}: {
  children: React.ReactNode
  initialState: Partial<State>
}) => {
  const [store] = useState(() => createAppStore(initialState))

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  )
}

// Hook для использования store
export const useAppStore = <T,>(selector: (state: State) => T): T => {
  const store = useContext(StoreContext)
  if (!store) throw new Error('Missing StoreProvider')
  return useStore(store, selector)
}

// === Usage ===
// Root
const { user } = useLoaderData()
<StoreProvider initialState={{ user }}>
  <App />
</StoreProvider>

// Component
const user = useAppStore((s) => s.user)
```

---

## Anti-patterns

### ❌ Module-level browser access

```tsx
// ПЛОХО: выполняется при импорте модуля (на сервере тоже!)
export const isMac = navigator.platform.includes('Mac')
// ReferenceError: navigator is not defined

// ПЛОХО: даже с проверкой — значение фиксируется при импорте
export const isMac = typeof navigator !== 'undefined'
  ? navigator.platform.includes('Mac')
  : false
// На сервере всегда false, hydration mismatch

// ХОРОШО: hook — выполняется в runtime на клиенте
export const useIsMac = () => {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.includes('Mac'))
  }, [])

  return isMac
}
```

---

### ❌ localStorage в useState initializer

```tsx
// ПЛОХО: hydration mismatch
// Server: defaultValue, Client: 'dark' → mismatch!
const [theme, setTheme] = useState(
  localStorage.getItem('theme') ?? 'light'
)

// ПЛОХО: даже с проверкой — всё равно mismatch
const [theme, setTheme] = useState(
  typeof window !== 'undefined'
    ? localStorage.getItem('theme')
    : 'light'
)
// Server: 'light', Client: 'dark' → mismatch!

// ХОРОШО: через loader (SSR data)
const { theme: serverTheme } = useLoaderData()
const [theme, setTheme] = useState(serverTheme)

// ХОРОШО: два прохода с useEffect
const [theme, setTheme] = useState('light') // SSR value
useEffect(() => {
  const stored = localStorage.getItem('theme')
  if (stored) setTheme(stored)
}, [])
```

---

### ❌ Условный рендеринг по размеру окна

```tsx
// ПЛОХО: сервер всегда рендерит один вариант
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
return isMobile ? <MobileNav /> : <DesktopNav />
// Server: DesktopNav, Client (mobile): MobileNav → hydration mismatch

// ХОРОШО: CSS media queries
<nav className="hidden md:flex">
  <DesktopNav />
</nav>
<nav className="flex md:hidden">
  <MobileNav />
</nav>

// ХОРОШО: если нужен JS — useIsClient
const isClient = useIsClient()
const isMobile = isClient && window.innerWidth < 768

// На сервере рендерим оба, CSS скрывает нужный
if (!isClient) {
  return (
    <>
      <div className="hidden md:block"><DesktopNav /></div>
      <div className="md:hidden"><MobileNav /></div>
    </>
  )
}

return isMobile ? <MobileNav /> : <DesktopNav />
```

---

## Тестирование

### Проверка SSR

```bash
# Посмотреть HTML без JS
curl -s https://your-site.com | head -100

# Найти конкретный элемент
curl -s https://your-site.com | grep -o '<main>.*</main>'

# Проверить что данные есть в HTML
curl -s https://your-site.com/dashboard | grep "John Doe"
```

**В DevTools:**
- `View Page Source` (Ctrl+U) — показывает SSR HTML
- `Inspect Element` — показывает DOM после hydration
- Если они разные → SSR работает

### Проверка Hydration

1. **Console warnings:**
   ```
   Warning: Text content did not match.
   Warning: Expected server HTML to contain a matching <div>
   ```

2. **React DevTools → Profiler:**
   - Hydration time
   - Components that re-rendered during hydration

3. **E2E с отключённым JS:**
   ```ts
   // Playwright
   test('SSR works without JS', async ({ browser }) => {
     const context = await browser.newContext({ javaScriptEnabled: false })
     const page = await context.newPage()
     await page.goto('/dashboard')

     // Контент должен быть виден без JS
     await expect(page.locator('h1')).toContainText('Dashboard')
   })
   ```

---

## Чеклист

### Компоненты

- [ ] Нет `window`/`document`/`navigator` без проверки `typeof window !== 'undefined'`
- [ ] Нет `localStorage`/`sessionStorage` в `useState` initializer
- [ ] `Date.now()`, `Math.random()` не в render (или с `suppressHydrationWarning`)
- [ ] Canvas/WebGL/Web Audio обёрнуты в `ClientOnly`

### Loaders / Data Fetching

- [ ] Возвращают serializable данные (no functions, no circular refs, no undefined)
- [ ] Server-only imports через dynamic `import()` или `.server.ts`
- [ ] Не утекает sensitive data (passwords, API keys)
- [ ] Error handling (try/catch, error boundaries)

### Stores

- [ ] Создаются per-request (не module-level singleton)
- [ ] Initial state из loader, не из browser storage

### Theme / Locale

- [ ] Cookie-first (читается на сервере)
- [ ] Blocking script в `<head>` для предотвращения FOUC
- [ ] Синхронизация cookie ↔ localStorage

### Production

- [ ] `View Source` показывает полный контент
- [ ] Lighthouse SSR score > 90
- [ ] Нет hydration warnings в console

---

# ЧАСТЬ 2: ФРЕЙМВОРКИ

## React Router 7 / Remix

### Структура

```
app/
├── entry.client.tsx      # hydrateRoot()
├── entry.server.tsx      # renderToReadableStream() (опционально)
├── root.tsx              # Layout + root loader
├── routes.ts             # Route config
└── routes/
    ├── _index.tsx        # /
    ├── dashboard.tsx     # /dashboard
    └── auth/
        ├── login.tsx     # /auth/login
        └── logout.ts     # /auth/logout (action only)
```

### Loader (Data Fetching)

```tsx
// routes/dashboard.tsx
import type { LoaderFunctionArgs } from 'react-router'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 1. Динамический import server-only кода
  const { getSession } = await import('@/entities/session/session.server')

  // 2. Проверка auth
  const session = await getSession(request)
  if (!session) {
    throw redirect('/auth/login')
  }

  // 3. Fetch данных
  const data = await fetchDashboardData(session.userId)

  // 4. Return (автоматически сериализуется)
  return { data, user: session.user }
}

export default function Dashboard() {
  // Типизированный доступ к данным
  const { data, user } = useLoaderData<typeof loader>()

  return <DashboardPage data={data} user={user} />
}
```

### Action (Mutations)

```tsx
// routes/maps/new.tsx
import type { ActionFunctionArgs } from 'react-router'

export const action = async ({ request }: ActionFunctionArgs) => {
  const { getSession } = await import('@/entities/session/session.server')
  const session = await getSession(request)

  if (!session) {
    throw redirect('/auth/login')
  }

  const formData = await request.formData()
  const title = formData.get('title') as string

  try {
    const map = await createMap({ title, userId: session.userId })
    return redirect(`/maps/${map.id}`)
  } catch (error) {
    return { error: 'Failed to create map' }
  }
}

export default function NewMap() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <Form method="post">
      {actionData?.error && <Alert>{actionData.error}</Alert>}

      <input name="title" required />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Map'}
      </button>
    </Form>
  )
}
```

### Server-only файлы

```tsx
// entities/session/session.server.ts
// Этот файл НИКОГДА не попадёт в client bundle

import { createCookie } from 'react-router'

export const sessionCookie = createCookie('session', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
})

export const getSession = async (request: Request) => {
  const cookie = request.headers.get('Cookie')
  return sessionCookie.parse(cookie)
}

export const commitSession = async (session: SessionData) => {
  return sessionCookie.serialize(session)
}

export const destroySession = async () => {
  return sessionCookie.serialize('', { maxAge: 0 })
}
```

### useFetcher (Background Mutations)

```tsx
// Мутация без навигации
const LogoutButton = () => {
  const fetcher = useFetcher()
  const isLoggingOut = fetcher.state !== 'idle'

  return (
    <fetcher.Form method="post" action="/auth/logout">
      <button disabled={isLoggingOut}>
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </fetcher.Form>
  )
}
```

---

## Next.js (App Router)

### Структура

```
app/
├── layout.tsx            # Root layout (обязателен)
├── page.tsx              # / (Home)
├── loading.tsx           # Loading UI
├── error.tsx             # Error boundary
├── not-found.tsx         # 404
└── dashboard/
    ├── layout.tsx        # Dashboard layout
    ├── page.tsx          # /dashboard
    └── [mapId]/
        └── page.tsx      # /dashboard/[mapId]
```

### Server Components (по умолчанию)

```tsx
// app/dashboard/page.tsx
// Server Component — БЕЗ 'use client'

import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // Прямой async/await, нет useEffect!
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const data = await fetchDashboardData(session.userId)

  return (
    <div>
      <h1>Dashboard</h1>
      <DashboardContent data={data} />
    </div>
  )
}
```

### Client Components

```tsx
// app/dashboard/interactive-chart.tsx
'use client' // Обязательная директива

import { useState } from 'react'

export const InteractiveChart = ({ data }) => {
  const [selected, setSelected] = useState(null)

  // Можно использовать hooks, event handlers, browser API
  return (
    <Chart
      data={data}
      onSelect={setSelected}
      selected={selected}
    />
  )
}
```

### Server Actions

```tsx
// app/actions.ts
'use server'

export async function createMap(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const title = formData.get('title') as string

  const map = await db.map.create({
    data: { title, userId: session.userId }
  })

  revalidatePath('/dashboard')
  redirect(`/maps/${map.id}`)
}

// Использование в Client Component
'use client'

import { createMap } from './actions'

export function NewMapForm() {
  return (
    <form action={createMap}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

### Data Fetching Options

```tsx
// SSR (no cache) — каждый запрос
const data = await fetch(url, { cache: 'no-store' })

// SSG (static) — кэшируется навсегда
const data = await fetch(url) // или { cache: 'force-cache' }

// ISR (revalidate) — кэш с TTL
const data = await fetch(url, { next: { revalidate: 60 } }) // 60 секунд

// Tags для инвалидации
const data = await fetch(url, { next: { tags: ['maps'] } })
// В action: revalidateTag('maps')
```

---

## Nuxt 3

### Структура

```
pages/
├── index.vue             # /
├── dashboard.vue         # /dashboard
└── maps/
    └── [id].vue          # /maps/:id

server/
├── api/
│   └── maps.ts           # /api/maps
└── middleware/
    └── auth.ts

composables/
└── useAuth.ts            # Auto-imported composables
```

### Data Fetching

```vue
<!-- pages/dashboard.vue -->
<script setup>
// SSR-safe fetch с автоматической дедупликацией
const { data: maps, pending, error } = await useFetch('/api/maps')

// Или с lazy loading (fetch после mount)
const { data: stats, pending: statsPending } = useLazyFetch('/api/stats')

// С query params
const page = ref(1)
const { data } = await useFetch('/api/maps', {
  query: { page }
})
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <MapCard v-for="map in maps" :key="map.id" :map="map" />
  </div>
</template>
```

### Server API Routes

```ts
// server/api/maps.ts
export default defineEventHandler(async (event) => {
  // Middleware уже проверила auth, session в event.context
  const session = event.context.session

  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const maps = await db.map.findMany({
    where: { userId: session.userId }
  })

  return maps
})
```

### Server Middleware

```ts
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const session = await getSession(event)
  event.context.session = session
})
```

### Client-Only Components

```vue
<template>
  <ClientOnly>
    <CanvasGraph :data="nodes" />

    <template #fallback>
      <GraphSkeleton />
    </template>
  </ClientOnly>
</template>
```

---

## SvelteKit

### Структура

```
src/routes/
├── +layout.svelte        # Root layout
├── +layout.server.ts     # Root server load
├── +page.svelte          # /
├── +page.ts              # Universal load
└── dashboard/
    ├── +page.svelte
    ├── +page.server.ts   # Server-only load
    └── +page.ts          # Universal load
```

### Load Functions

```ts
// src/routes/dashboard/+page.server.ts
// Server-only — доступ к cookies, DB, secrets
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ cookies, locals }) => {
  const session = cookies.get('session')

  if (!session) {
    throw redirect(302, '/login')
  }

  const user = await getUser(session)
  const maps = await getMaps(user.id)

  return { user, maps }
}
```

```ts
// src/routes/dashboard/+page.ts
// Universal — работает на сервере И клиенте
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, data }) => {
  // data — из +page.server.ts
  // fetch — universal (работает везде)

  const stats = await fetch('/api/stats').then(r => r.json())

  return { ...data, stats }
}
```

### Form Actions

```ts
// src/routes/maps/new/+page.server.ts
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const session = cookies.get('session')
    if (!session) {
      return fail(401, { error: 'Unauthorized' })
    }

    const data = await request.formData()
    const title = data.get('title')

    try {
      const map = await createMap({ title, userId: session.userId })
      throw redirect(302, `/maps/${map.id}`)
    } catch (e) {
      return fail(400, { error: 'Failed to create map' })
    }
  }
}
```

```svelte
<!-- src/routes/maps/new/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms'

  export let form // Результат action (errors)
</script>

<form method="POST" use:enhance>
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}

  <input name="title" required />
  <button type="submit">Create Map</button>
</form>
```

### Browser Check

```svelte
<script>
  import { browser } from '$app/environment'

  // Безопасно использовать browser API
  $: if (browser) {
    localStorage.setItem('key', value)
  }
</script>
```

---

## Сравнение фреймворков

| Аспект | React Router 7 | Next.js 14+ | Nuxt 3 | SvelteKit |
|--------|----------------|-------------|--------|-----------|
| **Data Fetch** | `loader` | `async` Server Component | `useFetch` | `load` |
| **Mutations** | `action` + `Form` | Server Actions | `useFetch` POST | `actions` |
| **Server-only** | `.server.ts` | Server Components | `server/` | `+page.server.ts` |
| **Client-only** | `ClientOnly` wrapper | `'use client'` | `<ClientOnly>` | `browser` check |
| **Streaming** | ✅ `defer` | ✅ `loading.tsx` | ✅ `useLazyFetch` | ✅ `await` |
| **Type Safety** | ✅ `typeof loader` | ✅ | ⚠️ Manual | ✅ `$types` |
| **File Routing** | `routes.ts` config | ✅ Convention | ✅ Convention | ✅ Convention |

---

## Правила

1. **Фундамент одинаков** — проблемы SSR одни и те же во всех фреймворках
2. **Синтаксис разный** — каждый фреймворк решает по-своему
3. **Cookie-first** — для theme/locale/auth (читается на сервере)
4. **Server-only изоляция** — не давать серверному коду утечь на клиент
5. **Hydration-safe** — не использовать browser API в initial render
6. **Request-scoped state** — не использовать singleton stores на сервере
