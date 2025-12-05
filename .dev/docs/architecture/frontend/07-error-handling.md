# Error Handling

## Стратегия обработки ошибок

| Слой | Тип ошибки | Обработка |
|------|------------|-----------|
| **Pages** | Критические (auth, 500) | Error Boundary + Fallback UI |
| **Widgets** | Layout ошибки | Error Boundary |
| **Features** | Локальные ошибки | Try-catch + Toast |
| **Entities** | API ошибки | React Query onError |
| **Shared** | Утилиты | Throw + пропаганда вверх |

---

## Error Boundaries

### Page-level Error Boundary

Обрабатывает критические ошибки страницы:

```tsx
// pages/dashboard/overview-page/overview-page.tsx
import { ErrorBoundary } from '@/shared/components/error-boundary'
import { PageErrorFallback } from '@/shared/components/page-error-fallback'

export const OverviewPage = () => {
  return (
    <ErrorBoundary fallback={<PageErrorFallback />}>
      <OverviewContent />
    </ErrorBoundary>
  )
}
```

### Widget-level Error Boundary

Изолирует ошибки виджета, не роняя всю страницу:

```tsx
// widgets/dashboard-layout/dashboard-layout.tsx
import { ErrorBoundary } from '@/shared/components/error-boundary'
import { WidgetErrorFallback } from '@/shared/components/widget-error-fallback'

export const DashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex h-screen">
      <ErrorBoundary fallback={<SidebarFallback />}>
        <Sidebar />
      </ErrorBoundary>

      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
```

### Feature-level Error Handling

Для features обычно достаточно локальной обработки:

```tsx
// features/billing/plan-card/plan-card.tsx
import { toast } from '@/shared/components/toast'

export const PlanCard = () => {
  const { mutate: upgrade, error } = useUpgradePlan({
    onError: (error) => {
      toast.error(error.message)
    }
  })

  return (
    <Card>
      {/* ... */}
      <Button onClick={() => upgrade()}>Upgrade</Button>
    </Card>
  )
}
```

---

## Реализация Error Boundary

```tsx
// shared/components/error-boundary/error-boundary.tsx
import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo)

    // Отправляем в error tracking (Sentry, etc.)
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}
```

---

## Fallback компоненты

### Page Error Fallback

```tsx
// shared/components/page-error-fallback/page-error-fallback.tsx
import { Button } from '@/shared/components/button'

export const PageErrorFallback = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Что-то пошло не так</h1>
        <p className="mt-2 text-muted-foreground">
          Произошла ошибка при загрузке страницы
        </p>
        <Button
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Обновить страницу
        </Button>
      </div>
    </div>
  )
}
```

### Widget Error Fallback

```tsx
// shared/components/widget-error-fallback/widget-error-fallback.tsx
export const WidgetErrorFallback = ({ name }: { name?: string }) => {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
      <p className="text-sm text-destructive">
        Не удалось загрузить {name ?? 'компонент'}
      </p>
    </div>
  )
}
```

---

## React Query Error Handling

### Global Error Handler

```tsx
// app/providers/query-provider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from '@/shared/components/toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      onError: (error) => {
        // Глобальная обработка ошибок запросов
        if (error instanceof ApiError && error.status === 401) {
          // Редирект на логин
          window.location.href = '/sign-in'
        }
      }
    },
    mutations: {
      onError: (error) => {
        toast.error(error.message)
      }
    }
  }
})
```

### Per-query Error Handling

```tsx
// entities/user/user.queries.ts
export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: userApi.getCurrentUser,
    onError: (error) => {
      // Специфичная обработка для этого запроса
      if (error.status === 404) {
        // User не найден - это не ошибка
        return
      }
      throw error
    }
  })
}
```

---

## API Error Класс

```tsx
// shared/api/api-error.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static fromResponse(response: Response, body?: any): ApiError {
    return new ApiError(
      body?.message ?? response.statusText,
      response.status,
      body?.code
    )
  }
}
```

```tsx
// shared/api/api-client.ts
export const apiClient = {
  async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })

    const body = await response.json().catch(() => null)

    if (!response.ok) {
      throw ApiError.fromResponse(response, body)
    }

    return body as T
  }
}
```

---

## Error Reporting

### Интеграция с Sentry

```tsx
// app/providers/error-provider.tsx
import * as Sentry from '@sentry/react'

export const ErrorProvider = ({ children }: PropsWithChildren) => {
  return (
    <Sentry.ErrorBoundary
      fallback={<PageErrorFallback />}
      onError={(error, componentStack) => {
        Sentry.captureException(error, {
          extra: { componentStack }
        })
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
```

### Custom Hook для Error Reporting

```tsx
// shared/hooks/use-error-reporter.ts
import * as Sentry from '@sentry/react'

export const useErrorReporter = () => {
  return {
    report: (error: Error, context?: Record<string, any>) => {
      console.error(error)
      Sentry.captureException(error, { extra: context })
    },
    reportMessage: (message: string, level: 'info' | 'warning' | 'error' = 'error') => {
      Sentry.captureMessage(message, level)
    }
  }
}
```

---

## Правила

1. **Page-level** Error Boundary для критических ошибок
2. **Widget-level** Error Boundary для изоляции виджетов
3. **Feature-level** используйте toast + onError
4. **Не глушите ошибки** - логируйте и репортите
5. **Fallback UI** должен давать понятную информацию
6. **401 ошибки** → редирект на логин (глобально)
7. **Retry** → включайте для network ошибок, выключайте для 4xx
