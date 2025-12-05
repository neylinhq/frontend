# Security & Best Practices

---

## XSS Prevention

### dangerouslySetInnerHTML

**Проблема:**
```tsx
// ❌ КРИТИЧНО: Template injection
<script dangerouslySetInnerHTML={{
  __html: `window.ENV = ${JSON.stringify(env)}`
}} />
```

**Атака:** Если `env` содержит `</script><script>alert(1)//`, получаем XSS.

**Решения:**
```tsx
// ✅ ВАРИАНТ 1: Base64 encoding
const encoded = btoa(JSON.stringify(env))
<script dangerouslySetInnerHTML={{
  __html: `window.ENV = JSON.parse(atob("${encoded}"))`
}} />

// ✅ ВАРИАНТ 2: data attribute
<div id="env" data-env={JSON.stringify(env)} hidden />
<script>
  window.ENV = JSON.parse(document.getElementById('env').dataset.env)
</script>

// ✅ ВАРИАНТ 3: DOMPurify (для user content)
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

### innerHTML

**Проблема:**
```tsx
// ❌ КРИТИЧНО: Прямая вставка user content
element.innerHTML = userGeneratedContent
```

**Решение:**
```tsx
// ✅ textContent для текста
element.textContent = userText

// ✅ DOMPurify для HTML
import DOMPurify from 'dompurify'
element.innerHTML = DOMPurify.sanitize(userHtml, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
})
```

---

## Sensitive Data Storage

### localStorage

**Проблема:** localStorage доступен любому JS на домене (XSS = полный доступ)

**Что НЕ хранить в localStorage:**
- Tokens (access, refresh)
- Session data
- PII (email, phone)
- API keys

**Решения:**
```tsx
// ✅ httpOnly cookies для auth (недоступны JS)
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Strict

// ✅ Память для sensitive runtime data
const [token, setToken] = useState<string | null>(null)

// ✅ localStorage только для preferences
localStorage.setItem('theme', 'dark')
localStorage.setItem('sidebar', 'collapsed')
```

---

## State Management

### State Duplication (Anti-pattern)

**❌ ПЛОХО — дублирование user в двух источниках:**
```tsx
// session.store.ts (Zustand) — НЕ ДЕЛАТЬ ТАК
export const useSessionStore = create(() => ({
  user: null,  // ❌ User НЕ должен быть в Zustand
  setUser: (user) => set({ user })
}))

// user.queries.ts (React Query)
export const useUser = () => useQuery({
  queryKey: ['user'],
  queryFn: fetchUser
})
```

**Результат:** Two sources of truth → race conditions, stale data

**✅ ПРАВИЛЬНО:**
```tsx
// React Query = server state (user data)
export const useUser = () => useQuery({ queryKey: ['user'], queryFn: fetchUser })

// Zustand = client-only state (UI state, НЕ user data)
export const useUIStore = create(() => ({
  isSidebarOpen: false,
  theme: 'light'
  // НЕТ user здесь!
}))
```

**Правило:** Данные с сервера → React Query. Только клиентское UI состояние → Zustand.

См. также: [04-state.md](./04-state.md)

---

## Error Boundaries

### Multi-level Strategy

**Текущее состояние:** Только root-level boundary

**Требуется:**
```
App
├── RootErrorBoundary (500 page)
│   └── Layout
│       ├── WidgetErrorBoundary (widget fallback)
│       │   └── DashboardWidget
│       └── FeatureErrorBoundary (retry UI)
│           └── GraphEditor
```

**Реализация:**
```tsx
// Granular boundary
const WidgetErrorBoundary = ({ children, name }) => (
  <ErrorBoundary
    fallback={({ error, reset }) => (
      <Card>
        <CardTitle>Ошибка в {name}</CardTitle>
        <Button onClick={reset}>Повторить</Button>
      </Card>
    )}
  >
    {children}
  </ErrorBoundary>
)

// Использование
<WidgetErrorBoundary name="График">
  <GraphWidget />
</WidgetErrorBoundary>
```

---

## Production Hygiene

### Console Statements

**Проблема:** console.log в production = утечка debug info

**Решения:**
```tsx
// 1. ESLint rule
"no-console": ["error", { "allow": ["warn", "error"] }]

// 2. Build-time removal (Vite)
esbuild: {
  drop: ['console', 'debugger']
}

// 3. Debug utility
const debug = import.meta.env.DEV ? console.log : () => {}
```

### TypeScript any

**Проблема:** `any` отключает type safety

**Решения:**
```tsx
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}

// ESLint
"@typescript-eslint/no-explicit-any": "error"

// Вместо any
type Unknown = unknown
type GenericRecord = Record<string, unknown>
```

---

## Accessibility (a11y)

### Чеклист

- [ ] Все interactive elements имеют accessible name
- [ ] Формы имеют labels (не placeholder-only)
- [ ] Кнопки имеют type="button" или type="submit"
- [ ] Изображения имеют alt text
- [ ] Focus visible для keyboard navigation
- [ ] Color contrast минимум 4.5:1
- [ ] ARIA roles где нужно

### Примеры

```tsx
// ❌ ПЛОХО
<button onClick={close}>×</button>
<input placeholder="Email" />
<img src={avatar} />

// ✅ ХОРОШО
<button onClick={close} aria-label="Закрыть">×</button>
<label>
  Email
  <input type="email" />
</label>
<img src={avatar} alt="Аватар пользователя" />
```

---

## Performance

### React.memo

**Когда использовать:**
- Компонент рендерится часто
- Props не меняются часто
- Компонент "тяжелый" (много дочерних элементов)

```tsx
// ❌ Рендерится при каждом parent render
const NodeCard = ({ node }) => <Card>{node.title}</Card>

// ✅ Рендерится только при изменении node
const NodeCard = memo(({ node }) => <Card>{node.title}</Card>)
```

### useMemo / useCallback

```tsx
// ❌ Новый объект каждый render
const config = { theme: 'dark', size: 'lg' }

// ✅ Мемоизация
const config = useMemo(() => ({ theme: 'dark', size: 'lg' }), [])
```

---

## Testing

### Текущее состояние

1 тест на весь проект (MSW health check)

### Минимальный coverage

| Слой | Что тестировать | Приоритет |
|------|-----------------|-----------|
| Entities | Schemas (zod validation) | Critical |
| Features | Business logic hooks | Critical |
| Widgets | Integration (render + interactions) | High |
| Pages | E2E (happy path) | High |

### Структура тестов

```
src/
├── entities/user/
│   ├── user.schema.ts
│   └── user.schema.test.ts    # Zod validation tests
├── features/auth/
│   ├── use-auth.ts
│   └── use-auth.test.ts       # Hook behavior tests
└── app/__tests__/
    └── auth.e2e.test.ts       # E2E flow
```

---

## Security Checklist

### Input Validation
- [ ] Все user inputs валидируются (Zod schemas)
- [ ] File uploads проверяют MIME type
- [ ] URL inputs проверяются на протокол (no javascript:)

### Output Encoding
- [ ] Нет dangerouslySetInnerHTML без санитизации
- [ ] Нет innerHTML без DOMPurify
- [ ] JSON в scripts энкодится безопасно

### Authentication
- [ ] Tokens в httpOnly cookies
- [ ] CSRF protection
- [ ] Secure + SameSite flags

### Data Storage
- [ ] Нет sensitive data в localStorage
- [ ] Нет secrets в client bundle
- [ ] env переменные через VITE_PUBLIC_*

### Headers
- [ ] Content-Security-Policy
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY

---

## CSRF Protection

### Что такое CSRF

Cross-Site Request Forgery — атака, при которой злоумышленник заставляет браузер жертвы выполнить запрос от её имени.

### Защита

```tsx
// 1. SameSite cookies (основная защита)
Set-Cookie: session=abc; SameSite=Strict; Secure; HttpOnly

// 2. CSRF токен (дополнительно для критических операций)
// Сервер генерирует токен
export const loader = async ({ request }) => {
  const csrfToken = generateCSRFToken()
  return { csrfToken }
}

// Клиент отправляет в header
const { csrfToken } = useLoaderData()
fetch('/api/delete-account', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken }
})
```

### Правила

- ✅ `SameSite=Strict` для session cookies
- ✅ CSRF токен для деструктивных операций (delete, payment)
- ✅ Проверять `Origin` header на сервере
- ❌ Не полагаться только на cookies

---

## CORS

### Настройка на сервере

```go
// Backend (Go/Fiber)
app.Use(cors.New(cors.Config{
    AllowOrigins:     "https://app.neylin.com",
    AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
    AllowHeaders:     "Origin,Content-Type,Authorization,X-CSRF-Token",
    AllowCredentials: true,
    MaxAge:           86400,
}))
```

### Правила

- ✅ Явный whitelist origins (не `*`)
- ✅ `AllowCredentials: true` только с явными origins
- ✅ Ограничить methods и headers
- ❌ Не использовать `*` в production

---

## Authentication Flow

### JWT + httpOnly Cookies

```
┌─────────────────────────────────────────────────────────────┐
│ 1. LOGIN                                                     │
│    Client → POST /api/auth/login { email, password }         │
│    Server → Set-Cookie: access_token=...; HttpOnly; Secure   │
│             Set-Cookie: refresh_token=...; HttpOnly; Secure  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. AUTHENTICATED REQUEST                                     │
│    Client → GET /api/user (cookies автоматически)            │
│    Server → Проверяет access_token из cookie                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. TOKEN REFRESH (когда access_token истёк)                  │
│    Client → POST /api/auth/refresh (refresh_token в cookie)  │
│    Server → Новые access_token + refresh_token               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. LOGOUT                                                    │
│    Client → POST /api/auth/logout                            │
│    Server → Clear cookies, invalidate refresh_token          │
└─────────────────────────────────────────────────────────────┘
```

### Реализация

```tsx
// entities/session/session.api.ts
export const sessionApi = {
  login: async (credentials: LoginInput) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include', // Важно для cookies!
      body: JSON.stringify(credentials)
    })
    return response.json()
  },

  refresh: async () => {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    })
    if (!response.ok) {
      // Refresh failed — logout
      window.location.href = '/sign-in'
    }
    return response.json()
  },

  logout: async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
  }
}
```

### Автоматический refresh

```tsx
// shared/api/api-client.ts
export const apiClient = {
  async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    let response = await fetch(url, {
      ...options,
      credentials: 'include'
    })

    // Token expired — try refresh
    if (response.status === 401) {
      await sessionApi.refresh()
      // Retry original request
      response = await fetch(url, {
        ...options,
        credentials: 'include'
      })
    }

    if (!response.ok) {
      throw ApiError.fromResponse(response)
    }

    return response.json()
  }
}
```

---

## Security Headers

### Рекомендуемые headers

```tsx
// middleware или entry.server.ts
const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",  // Для inline scripts
    "style-src 'self' 'unsafe-inline'",   // Для Tailwind
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.neylin.com",
    "frame-ancestors 'none'"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
```

---

## Known Issues

### Critical

| Проблема | Файл | Решение |
|----------|------|---------|
| XSS via dangerouslySetInnerHTML | app/root.tsx | Base64 encode или data attribute |
| XSS via innerHTML | math-extension.ts | DOMPurify |
| State duplication | session.store + user.queries | Выбрать один source of truth |

### High

| Проблема | Файл | Решение |
|----------|------|---------|
| localStorage for graph data | graph.store.ts | In-memory + API sync |
| Console.logs in prod | graph-webgl/*.tsx | ESLint no-console + build drop |
| Single Error Boundary | app/root.tsx | Add feature/widget level |

### Medium

| Проблема | Область | Решение |
|----------|---------|---------|
| Missing memo | Heavy components | Add React.memo |
| Incomplete a11y | Forms, buttons | Add labels, aria-* |
| No tests | All features | Add unit + integration tests |

---

## См. также

- [05-server.md](./05-server.md) — Server-only код и security
- [07-error-handling.md](./07-error-handling.md) — Error handling
- [08-ssr.md](./08-ssr.md) — SSR security considerations
