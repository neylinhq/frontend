# Local Development Setup

## Prerequisites

| Инструмент | Версия | Установка |
|------------|--------|-----------|
| Bun | 1.0+ | [bun.sh](https://bun.sh) |
| Docker | Latest | [docker.com](https://docker.com) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

---

## Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-org/neylin.git
cd neylin/frontend

# 2. Установить зависимости
bun install

# 3. Скопировать env файл
cp .env.example .env.local

# 4. Запустить backend (Docker)
docker-compose up -d

# 5. Запустить dev server
bun dev
```

Открыть http://localhost:5173

---

## Environment

### Файлы

| Файл | Назначение | Git |
|------|------------|-----|
| `.env.example` | Шаблон переменных | ✅ Tracked |
| `.env.local` | Локальные переменные | ❌ Ignored |
| `.env.development` | Dev defaults | ✅ Tracked |
| `.env.production` | Prod defaults | ✅ Tracked |

### Переменные

```bash
# .env.example
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws

# Feature flags
VITE_FF_NEW_EDITOR=true
VITE_FF_AI_FEATURES=false
```

### Приоритет загрузки

```
.env.local → .env.[mode] → .env
```

---

## Docker

### Backend services

```bash
# Запустить все сервисы
docker-compose up -d

# Проверить статус
docker-compose ps

# Логи
docker-compose logs -f api

# Остановить
docker-compose down
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: neylin
      POSTGRES_PASSWORD: neylin
      POSTGRES_DB: neylin
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: ../backend
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://neylin:neylin@postgres:5432/neylin
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

---

## Команды

### Development

| Команда | Описание |
|---------|----------|
| `bun dev` | Dev server с HMR |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun run typecheck` | TypeScript проверка |

### Linting & Formatting

| Команда | Описание |
|---------|----------|
| `bun run lint` | Biome lint |
| `bun run format` | Biome format |
| `bun run check` | Lint + format |

### Testing

| Команда | Описание |
|---------|----------|
| `bun test` | Запустить тесты |
| `bun test --watch` | Watch mode |
| `bun run test:coverage` | С coverage |
| `bun run test:e2e` | E2E тесты |

### Database (если используется)

| Команда | Описание |
|---------|----------|
| `bun run db:migrate` | Применить миграции |
| `bun run db:seed` | Заполнить тестовыми данными |
| `bun run db:reset` | Сбросить и пересоздать |

---

## IDE Setup

### VS Code

#### Рекомендуемые расширения

```json
// .vscode/extensions.json
{
  "recommendations": [
    "biomejs.biome",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

#### Настройки

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

### WebStorm

1. Settings → Languages & Frameworks → JavaScript → Code Quality Tools → Biome
2. Enable "Run on save"
3. Set as default formatter

---

## Troubleshooting

### Port conflicts

```bash
# Найти процесс на порту
lsof -i :5173
# или на Windows
netstat -ano | findstr :5173

# Убить процесс
kill -9 <PID>
```

### Bun version mismatch

```bash
# Проверить версию
bun -v

# Обновить bun
bun upgrade
```

### Missing env variables

```bash
# Проверить что .env.local существует
ls -la .env*

# Скопировать из примера
cp .env.example .env.local
```

### Docker issues

```bash
# Пересобрать контейнеры
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Очистить всё
docker system prune -a
```

### Bun issues

```bash
# Очистить кэш
bun pm cache rm

# Переустановить зависимости
rm -rf node_modules bun.lockb
bun install
```

### TypeScript errors

```bash
# Перезапустить TS server в VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Или пересобрать типы
bun run typecheck
```

---

## Git Hooks

### Husky + lint-staged

```bash
# Установка
bun add -D husky lint-staged
bunx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["biome check --write"],
    "*.{json,md}": ["biome format --write"]
  }
}
```

### Pre-commit hook

```bash
# .husky/pre-commit
bunx lint-staged
bun run typecheck
```

---

## Полезные ссылки

| Ресурс | URL |
|--------|-----|
| React Router Docs | https://reactrouter.com |
| TanStack Query | https://tanstack.com/query |
| Zustand | https://zustand-demo.pmnd.rs |
| Biome | https://biomejs.dev |
| Tailwind CSS | https://tailwindcss.com |

---

## См. также

- [99-best-practices.md](./99-best-practices.md) — Конфигурация
- [06-testing.md](./06-testing.md) — Тестирование
