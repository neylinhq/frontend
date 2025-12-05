# Modular FSD - Neylin Frontend Architecture

> **Фреймворк**: React Router 7 (SSR)

## Обзор

Neylin использует архитектуру **Modular FSD** — кастомную вариацию [Feature-Sliced Design](https://feature-sliced.design) с дополнительными правилами организации файлов и именования.

### Отличия от классического FSD

**Классический FSD**:
```
features/auth/
  ├── api/          # API клиенты
  ├── model/        # Логика, хуки, стор
  └── ui/           # Компоненты
```

**Modular FSD** (наш подход):
```
features/auth/              # Семантическая группа
  ├── sign-in-form/         # Плоский модуль
  │   ├── index.ts
  │   ├── sign-in.tsx
  │   └── sign-in.schema.ts
  └── sign-up-form/         # Плоский модуль
```

### Почему Modular FSD?

1. **Плоская структура** → легче искать файлы
2. **Явное именование** → понятно без открытия файла
3. **Гибкие модули** → простые плоские, сложные сегментированные
4. **Группы без файлов** → избегаем "общих помоек"
5. **Строгие boundaries** → как в FSD

---

## Разделы документации

| Раздел | Описание |
|--------|----------|
| [01-layers](./01-layers.md) | 6 слоёв архитектуры (app → shared) |
| [02-modules](./02-modules.md) | Структура модулей, группы vs модули |
| [03-dependencies](./03-dependencies.md) | Правила импортов, cross-imports |
| [04-state](./04-state.md) | React Query vs Zustand |
| [05-server](./05-server.md) | Server-only код (.server.ts) |
| [06-testing](./06-testing.md) | Стратегия тестирования |
| [07-error-handling](./07-error-handling.md) | Error boundaries |
| [08-ssr](./08-ssr.md) | Server-Side Rendering |
| [09-security](./09-security.md) | Безопасность, a11y, known issues |
| [10-i18n](./10-i18n.md) | Интернационализация |
| [11-performance](./11-performance.md) | Оптимизация производительности |
| [12-realtime](./12-realtime.md) | WebSocket, polling, SSE |
| [13-feature-flags](./13-feature-flags.md) | Feature flags |
| [14-local-dev](./14-local-dev.md) | Локальная разработка |
| [99-best-practices](./99-best-practices.md) | Чеклист и quick reference |

---

## См. также

- [Design System](../design/design-system.md) - UI/UX гайдлайны
- [Backend Architecture](../backend-architecture.md) - Архитектура бэкенда
- [Backend Spec](../backend-spec.md) - API спецификация
