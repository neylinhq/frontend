# Neylin Frontend - Документация

Фундаментальная документация по архитектуре и дизайну приложения Neylin.

## 📚 Содержание

### 🏗️ [Architecture](./architecture)
- [FSD Layers](./architecture/fsd-layers.md) - Feature-Sliced Design: слои, структура модулей, файловые паттерны
- [Dependencies](./architecture/dependencies.md) - Диаграмма зависимостей между слоями
- [Patterns](./architecture/patterns.md) - Код-стайл и архитектурные паттерны

### 🎨 [Design](./design)
- [Design Manifesto](./design/design-manifesto.md) - Фундаментальная философия дизайна и визуальные принципы

### 📦 [Legacy](./legacy)
- [Architecture (old)](./legacy/architecture.md) - Старая документация архитектуры
- [SSR](./legacy/ssr.md) - Server-Side Rendering (устаревшее)
- [Design System (old)](./legacy/design-system.md) - Старая документация дизайн-системы

---

## 🚀 Быстрый старт

```bash
# Установка зависимостей
bun install

# Запуск dev сервера
bun dev

# Запуск тестов
bun test

# Проверка типов
bun typecheck
```

## 🛠️ Технологический стек

| Категория | Технология |
|-----------|------------|
| Framework | React 19 + React Router 7 |
| State | Zustand + React Query |
| Styling | Tailwind CSS v4 |
| UI | Radix UI + Custom components |
| Forms | React Hook Form + Zod |
| Editor | Tiptap |
| Graph | @xyflow/react |
| Testing | Vitest + Testing Library |
| Language | TypeScript 5.9 |
| Package Manager | Bun |

## 📁 Структура проекта

```
src/
├── app/          # Инициализация приложения, провайдеры, routing
├── pages/        # Страницы приложения
├── widgets/      # Композитные UI блоки (layouts)
├── features/     # Функциональные модули (graph, billing, auth, etc.)
├── entities/     # Бизнес-сущности (node, edge, map, user, subscription)
└── shared/       # Переиспользуемое
    ├── components/  # Generic компоненты (button, input, dialog, etc.)
    ├── api/         # HTTP client
    ├── lib/         # Утилиты, helpers
    ├── config/      # Конфигурация
    └── styles/      # Глобальные стили
```

## 📝 Соглашения

- **Directories**: kebab-case (`user-profile/`, `graph-view/`)
- **Components**: kebab-case.tsx (`button.tsx`, `card-header.tsx`)
- **Files**: `[domain].[type].ts` (`user.schema.ts`, `map.api.ts`, `node.queries.ts`)
- **FSD**: Строгие правила импортов между слоями (см. [FSD Layers](./architecture/fsd-layers.md))
- **Typing**: Zod для runtime валидации + TypeScript для compile-time
- **Testing**: Co-location тестов (`.test.ts` рядом с `.ts`)

## 🔗 Полезные ссылки

- [FSD Layers](./architecture/fsd-layers.md) - Структура модулей, файловые паттерны, правила импортов
- [Design Manifesto](./design/design-manifesto.md) - Фундаментальная философия дизайна
