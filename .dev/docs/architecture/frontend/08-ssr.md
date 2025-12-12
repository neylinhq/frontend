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

---

## Anti-Flash: Предотвращение мигания темы

> **Reference implementation:** [`app/root.tsx`](../../../../app/root.tsx)

### 5 слоёв защиты

| Слой | Что делает | Где |
|------|------------|-----|
| **1. Critical CSS** | Инлайн стили для всех тем в `<head>` | `root.tsx` строки 61-85 |
| **2. SSR Theme Injection** | Сервер читает cookie и рендерит `<html class="dark">` | `root.tsx` loader + Layout |
| **3. Blocking Script** | Синхронизирует localStorage → DOM до paint | `root.tsx` строки 91-147 |
| **4. ThemeProvider** | `useLayoutEffect` для синхронного применения | `theme-provider.tsx` |
| **5. Navigation Flash** | Отключает transitions при навигации | `root.tsx` строки 170-179 |

### Поток данных

```
REQUEST
    ↓
SERVER: loader() → getThemeData(request) → читает cookie
    ↓
SERVER: Layout → <html class="dark" data-palette="vanilla">
    ↓
BROWSER: Critical CSS применяется немедленно
    ↓
BROWSER: Blocking script проверяет localStorage, исправляет если нужно
    ↓
BROWSER: Hydration → ThemeProvider получает SSR данные
    ↓
BROWSER: useLayoutEffect → финальная синхронизация, снятие theme-transition-disabled
```

### Ключевые моменты

**Приоритет источников:** `localStorage > cookie > system`

**Почему cookie для SSR:** Сервер не имеет доступа к localStorage, только к headers.

**Почему blocking script:** Если пользователь сменил тему на другом устройстве, localStorage актуальнее cookie. Скрипт исправляет до первого paint.

**Класс `theme-transition-disabled`:** Отключает CSS transitions во время смены темы, предотвращая анимацию при загрузке.

### Файлы

| Файл | Роль |
|------|------|
| `app/root.tsx` | Всё: Critical CSS, blocking script, Layout, navigation flash |
| `src/app/theme/theme.server.ts` | Чтение cookie на сервере |
| `src/app/theme/components/theme-provider.tsx` | React context + useLayoutEffect |
| `src/shared/core/theme/theme.constants.ts` | Ключи для cookie/localStorage |

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

## Правила SSR

1. **Cookie-first** — для theme/locale/auth (читается на сервере)
2. **Server-only изоляция** — не давать серверному коду утечь на клиент (`.server.ts`)
3. **Hydration-safe** — не использовать browser API в initial render
4. **Request-scoped state** — не использовать singleton stores на сервере
5. **Blocking scripts** — для предотвращения FOUC (theme, locale)

---

## См. также

- [05-server.md](./05-server.md) — Server-only код
- [10-i18n.md](./10-i18n.md) — Интернационализация с SSR
- [04-state.md](./04-state.md) — State management и SSR
