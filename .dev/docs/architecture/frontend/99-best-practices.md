# Best Practices

> **Фреймворк**: React Router 7 (SSR)

## Quick Reference Чеклист

### Кодирование

1. **Arrow functions везде**: `function` только для генераторов/this
2. **Biome вместо ESLint/Prettier**: Единый инструмент для форматирования и линтинга

### Структура

3. **Группа ≠ Модуль**: Группа = папка для IDE, модуль = единица с index.ts
4. **Сегментируйте при > 5 файлах**: Если модуль растёт - разделяйте
5. **У 90%+ модулей простая структура**: Не создавайте сегменты без необходимости
6. **/lib всегда плоская**: Разделяйте по логике (`layout-utils.ts`), НЕ по типам (`/lib/hooks`)

### Зависимости

7. **Cross-entity imports**: types + schemas через явный barrel (НЕ hooks/api/queries)
8. **Cross-widget imports разрешены**: Widgets = композиция, могут импортировать друг друга
9. **Cross-feature imports запрещены**: Features изолированы друг от друга
10. **Barrel exports**: Явные экспорты в `index.ts`, НЕ `export *`

### State Management

11. **React Query = server state**: Данные с API, кэширование
12. **Zustand = client state**: UI state, domain state
13. **Stores: domain → entities, UI → features**: Shared state в entities, локальный UI state в features

### Типы

14. **Domain types в entities**: Source of truth для NodeId, UserId, etc.
15. **Utility types в shared**: Nullable, Brand - generic helpers

### Server

16. **`.server.ts` только из `.server.ts`**: Импортируется напрямую, НЕ через barrel

### Тестирование

17. **Co-locate тесты**: `.test.ts` рядом с файлом для unit, `app/__tests__/` для integration/e2e
18. **MSW для API mocking**: Не jest.mock для HTTP запросов

### Разработка

19. **Начинайте снизу вверх**: Сначала entities, потом features, потом pages
20. **Не бойтесь дублировать**: Лучше дублировать код, чем нарушать boundaries
21. **Именуйте чётко**: `user.queries.ts`, `user.api.ts` - понятно без документации

---

## Частые ошибки

### ❌ Файлы на уровне группы

```
features/
└── auth/
    ├── sign-in-form/
    ├── sign-up-form/
    └── auth.queries.ts  # ❌ НЕЛЬЗЯ
```

**Решение**: Переместить в `entities/session/`

### ❌ Import hooks из другой entity

```tsx
// entities/edge/edge.schema.ts
import { useNode } from '@/entities/node'  # ❌ НЕЛЬЗЯ
```

**Решение**: Только types и schemas через barrel

### ❌ UI state в entities

```tsx
// entities/user/user-ui.store.ts
export const useUserUIStore = create(() => ({
  isProfileOpen: false  # ❌ Это UI state!
}))
```

**Решение**: Переместить в `features/user-profile/model/`

### ❌ Export * from

```tsx
// entities/user/index.ts
export * from './user.schema'  # ❌ Нет контроля над API
```

**Решение**: Явные экспорты

### ❌ Server код через barrel

```tsx
// entities/session/index.ts
export { requireAuth } from './session.server'  # ❌ Утечёт на клиент!
```

**Решение**: Импорт напрямую в `.server.ts` файлах

### ❌ Вложенные папки в /lib

```
lib/
├── utils/
│   └── format.ts  # ❌ Слишком глубоко
└── hooks/
    └── use-debounce.ts  # ❌ Слишком глубоко
```

**Решение**: Плоская структура `lib/format-utils.ts`

---

## Рекомендуемый порядок разработки

```
1. entities/     ← Начинаем здесь
   └── schema + api + queries

2. features/     ← Потом сюда
   └── UI components + local state

3. widgets/      ← Композируем features
   └── Layouts + navigation

4. pages/        ← Собираем всё вместе
   └── Route components + loaders
```

---

## Проверка архитектуры

### Вопросы для code review

- [ ] Все импорты идут сверху вниз по слоям?
- [ ] Нет файлов на уровне группы?
- [ ] Server код только в `.server.ts`?
- [ ] Barrel exports явные (не `export *`)?
- [ ] Domain types в entities, не в shared?
- [ ] UI state в features, domain state в entities?

### Команды для проверки

```bash
# Проверить circular dependencies
npx madge --circular src/

# Проверить структуру
tree src/features --dirsfirst

# Проверить что .server.ts не в client bundle
grep -r "requireAuth" .output/client/
```

---

## Конфигурация

### biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error",
        "noConsoleLog": "warn"
      },
      "style": {
        "useConst": "error",
        "noUnusedTemplateLiteral": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "none"
    }
  }
}
```

### tsconfig.json (выжимка)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### vite.config.ts (выжимка)

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router']
        }
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger'] // Удаляем в production
  }
})
```

---

## См. также

- [01-layers.md](./01-layers.md) — Слои архитектуры
- [02-modules.md](./02-modules.md) — Структура модулей
- [06-testing.md](./06-testing.md) — Тестирование
- [09-security.md](./09-security.md) — Безопасность
