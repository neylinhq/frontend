# Feature Flags

## Подходы

| Подход | Сложность | Когда использовать |
|--------|-----------|-------------------|
| Environment variables | Низкая | Простые on/off флаги |
| Config file | Низкая | Статичные флаги, per-environment |
| Remote config | Высокая | A/B тесты, gradual rollout, targeting |

---

## Environment Variables

### Простейший подход

```tsx
// shared/lib/feature-flags.ts
export const flags = {
  NEW_EDITOR: import.meta.env.VITE_FF_NEW_EDITOR === 'true',
  DARK_MODE: import.meta.env.VITE_FF_DARK_MODE === 'true',
  AI_FEATURES: import.meta.env.VITE_FF_AI_FEATURES === 'true'
} as const

export type FeatureFlag = keyof typeof flags

export const isEnabled = (flag: FeatureFlag): boolean => flags[flag]
```

### Использование

```tsx
import { isEnabled } from '@/shared/lib/feature-flags'

export const Editor = () => {
  if (isEnabled('NEW_EDITOR')) {
    return <NewEditor />
  }
  return <LegacyEditor />
}
```

### .env файлы

```bash
# .env.development
VITE_FF_NEW_EDITOR=true
VITE_FF_AI_FEATURES=true

# .env.production
VITE_FF_NEW_EDITOR=false
VITE_FF_AI_FEATURES=false
```

---

## Config File

### Структура

```tsx
// shared/lib/feature-flags.ts
type Environment = 'development' | 'staging' | 'production'

const flagsConfig: Record<Environment, Record<string, boolean>> = {
  development: {
    NEW_EDITOR: true,
    AI_FEATURES: true,
    DEBUG_MODE: true
  },
  staging: {
    NEW_EDITOR: true,
    AI_FEATURES: true,
    DEBUG_MODE: false
  },
  production: {
    NEW_EDITOR: false,
    AI_FEATURES: false,
    DEBUG_MODE: false
  }
}

const env = (import.meta.env.MODE || 'development') as Environment

export const flags = flagsConfig[env]

export const isEnabled = (flag: string): boolean => flags[flag] ?? false
```

---

## React Hook

```tsx
// shared/hooks/use-feature-flag.ts
import { flags, type FeatureFlag } from '@/shared/lib/feature-flags'

export const useFeatureFlag = (flag: FeatureFlag): boolean => {
  return flags[flag]
}

// Использование
const Editor = () => {
  const newEditorEnabled = useFeatureFlag('NEW_EDITOR')

  return newEditorEnabled ? <NewEditor /> : <LegacyEditor />
}
```

---

## SSR Considerations

### Cookie-based flags

Для SSR флаги должны быть доступны на сервере:

```tsx
// app/root.tsx (loader)
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Флаги из cookie (для A/B тестов)
  const flags = request.headers.get('Cookie')?.match(/ff_(.+?)=(\w+)/g) || []
  const featureFlags = Object.fromEntries(
    flags.map(f => f.split('='))
  )

  return { featureFlags }
}

// Провайдер
const { featureFlags } = useLoaderData<typeof loader>()

<FeatureFlagsProvider value={featureFlags}>
  <App />
</FeatureFlagsProvider>
```

### Consistent rendering

```tsx
// ❌ ПЛОХО: Hydration mismatch
const newEditorEnabled = typeof window !== 'undefined'
  && localStorage.getItem('ff_new_editor') === 'true'

// ✅ ХОРОШО: Из loader
const { featureFlags } = useLoaderData()
const newEditorEnabled = featureFlags.NEW_EDITOR
```

---

## Remote Config (Advanced)

### Провайдер

```tsx
// shared/lib/remote-flags.ts
interface RemoteFlags {
  flags: Record<string, boolean>
  loading: boolean
  error: Error | null
}

const RemoteFlagsContext = createContext<RemoteFlags | null>(null)

export const RemoteFlagsProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<RemoteFlags>({
    flags: {},
    loading: true,
    error: null
  })

  useEffect(() => {
    fetch('/api/feature-flags')
      .then(res => res.json())
      .then(flags => setState({ flags, loading: false, error: null }))
      .catch(error => setState(s => ({ ...s, loading: false, error })))
  }, [])

  return (
    <RemoteFlagsContext.Provider value={state}>
      {children}
    </RemoteFlagsContext.Provider>
  )
}

export const useRemoteFlag = (flag: string): boolean => {
  const context = useContext(RemoteFlagsContext)
  return context?.flags[flag] ?? false
}
```

### С fallback

```tsx
export const useRemoteFlag = (flag: string, fallback = false): boolean => {
  const context = useContext(RemoteFlagsContext)

  // Пока загружается — используем fallback
  if (context?.loading) return fallback

  return context?.flags[flag] ?? fallback
}
```

---

## Компонент-обёртка

```tsx
// shared/components/feature-flag.tsx
interface FeatureFlagProps {
  flag: FeatureFlag
  children: ReactNode
  fallback?: ReactNode
}

export const FeatureFlag = ({ flag, children, fallback = null }: FeatureFlagProps) => {
  const enabled = useFeatureFlag(flag)
  return enabled ? <>{children}</> : <>{fallback}</>
}

// Использование
<FeatureFlag flag="NEW_EDITOR" fallback={<LegacyEditor />}>
  <NewEditor />
</FeatureFlag>
```

---

## Логирование

```tsx
// shared/lib/feature-flags.ts
export const isEnabled = (flag: FeatureFlag): boolean => {
  const enabled = flags[flag]

  // Логируем использование для аналитики
  if (import.meta.env.PROD) {
    analytics.track('feature_flag_checked', {
      flag,
      enabled,
      userId: getCurrentUserId()
    })
  }

  return enabled
}
```

---

## Cleanup старых флагов

### Процесс

1. Флаг `NEW_EDITOR` включён в production
2. Через 2 недели — удалить `LegacyEditor`
3. Удалить флаг из конфига
4. Удалить проверки `isEnabled('NEW_EDITOR')`

### Автоматизация

```tsx
// shared/lib/feature-flags.ts
const flagsConfig = {
  NEW_EDITOR: {
    enabled: true,
    // Дата после которой флаг должен быть удалён
    removeAfter: '2025-01-15'
  }
}

// В CI проверяем устаревшие флаги
if (process.env.CI) {
  Object.entries(flagsConfig).forEach(([flag, config]) => {
    if (new Date(config.removeAfter) < new Date()) {
      console.warn(`Feature flag "${flag}" should be removed`)
    }
  })
}
```

---

## Чеклист

- [ ] Флаги типизированы
- [ ] SSR-safe (cookie-first или loader)
- [ ] Fallback для loading state
- [ ] Логирование использования
- [ ] Процесс cleanup старых флагов
- [ ] Документация флагов

---

## См. также

- [08-ssr.md](./08-ssr.md) — SSR и cookies
- [06-testing.md](./06-testing.md) — Тестирование с флагами
