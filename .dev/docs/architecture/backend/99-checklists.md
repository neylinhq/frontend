# Checklists & Quick Reference

---

## Чеклист: создание Use Case

- [ ] Определить Input/Output DTOs
- [ ] Определить необходимые порты (репозитории, сервисы)
- [ ] Реализовать бизнес-логику
- [ ] Добавить валидацию входных данных
- [ ] Добавить проверку прав доступа
- [ ] Написать unit-тесты с моками
- [ ] Добавить в Wire

---

## Чеклист: создание Handler

- [ ] Создать Request/Response DTOs
- [ ] Реализовать парсинг и валидацию запроса
- [ ] Вызвать Use Case
- [ ] Маппинг ошибок на HTTP статусы
- [ ] Добавить роут в router
- [ ] Написать интеграционные тесты

---

## Чеклист: создание Entity

- [ ] Определить поля и типы
- [ ] Создать Value Objects для сложных полей
- [ ] Добавить конструктор с валидацией
- [ ] Добавить бизнес-методы
- [ ] Создать миграцию БД
- [ ] Реализовать репозиторий
- [ ] Написать unit-тесты

---

## Чеклист: API endpoint

- [ ] Handler с валидацией
- [ ] Use Case с бизнес-логикой
- [ ] Repository если нужен доступ к данным
- [ ] Domain errors для бизнес-ошибок
- [ ] Роут в router
- [ ] Rate limiting если нужен
- [ ] Тесты (unit + integration)

---

## Quick Reference: Слои

| Слой | Что содержит | Может зависеть от |
|------|--------------|-------------------|
| Domain | Entities, Value Objects, Domain Services | Ничего |
| Application | Use Cases, Ports (Interfaces), DTOs | Domain |
| Adapter | Handlers, Repositories, Middleware | Application, Domain |
| Infrastructure | Config, DB, External Services | Все слои |

---

## Quick Reference: Паттерны

| Паттерн | Использование |
|---------|---------------|
| Repository | Абстракция доступа к данным |
| Use Case | Один бизнес-сценарий |
| DTO | Передача данных между слоями |
| Value Object | Иммутабельный объект с валидацией |
| Port | Интерфейс внешней зависимости |

---

## Quick Reference: Тестирование

| Тип теста | Что тестирует | Где находится |
|-----------|---------------|---------------|
| Unit | Domain logic, Use Cases | `*_test.go` рядом с кодом |
| Integration | Repositories, Handlers | `*_test.go` рядом с кодом |
| E2E | Full API flow | `tests/e2e/` |

---

## Quick Reference: HTTP Status Codes

| Domain Error | HTTP Status |
|--------------|-------------|
| `ErrUserNotFound` | 404 Not Found |
| `ErrUserEmailExists` | 409 Conflict |
| `ErrInvalidCredentials` | 401 Unauthorized |
| `ErrMapNotFound` | 404 Not Found |
| `ErrMapLimitExceeded` | 422 Unprocessable Entity |
| `ErrNodeLimitExceeded` | 422 Unprocessable Entity |
| `ErrForbidden` | 403 Forbidden |
| Validation errors | 400 Bad Request |
| Unknown errors | 500 Internal Server Error |

---

## Quick Reference: Redis Keys

| Prefix | Purpose | TTL |
|--------|---------|-----|
| `session` | User sessions | 720h |
| `rate` | Rate limit buckets | 1h |
| `cache` | Data cache | 5m-24h |
| `lock` | Distributed locks | 30s |
| `idempotency` | Idempotency keys | 24h |
| `pubsub` | Real-time events | - |
| `circuit` | Circuit breaker | 5m |

---

## Quick Reference: Makefile

```bash
# Development
make run          # Запустить сервер
make dev          # Запустить с hot reload
make test         # Запустить тесты
make lint         # Запустить линтер

# Database
make migrate-up   # Применить миграции
make migrate-down # Откатить миграцию

# Docker
make docker-up    # Поднять контейнеры
make docker-down  # Остановить контейнеры
make docker-logs  # Посмотреть логи

# Code generation
make wire         # Сгенерировать DI
make mocks        # Сгенерировать моки
```

---

## Quick Reference: Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_ENV` | No | development | Environment |
| `APP_PORT` | No | 8080 | HTTP port |
| `DATABASE_URL` | Yes | - | PostgreSQL connection |
| `REDIS_URL` | Yes | - | Redis connection |
| `JWT_PRIVATE_KEY_PATH` | Yes | - | JWT private key |
| `JWT_PUBLIC_KEY_PATH` | Yes | - | JWT public key |
| `STRIPE_SECRET_KEY` | Yes | - | Stripe API key |
| `OPENAI_API_KEY` | No | - | OpenAI API key |
| `LOG_LEVEL` | No | info | Log level |

---

## Quick Reference: API Endpoints

### Auth
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
```

### Users
```
GET    /api/v1/users/me
PATCH  /api/v1/users/me/profile
POST   /api/v1/users/me/avatar
DELETE /api/v1/users/me
```

### Maps
```
GET    /api/v1/maps
POST   /api/v1/maps
GET    /api/v1/maps/:id
GET    /api/v1/maps/:id/full
PATCH  /api/v1/maps/:id
DELETE /api/v1/maps/:id
POST   /api/v1/maps/:id/analyze
```

### Nodes
```
GET    /api/v1/maps/:mapId/nodes
POST   /api/v1/maps/:mapId/nodes
GET    /api/v1/nodes/:id
PATCH  /api/v1/nodes/:id
DELETE /api/v1/nodes/:id
```

### Edges
```
GET    /api/v1/maps/:mapId/edges
POST   /api/v1/maps/:mapId/edges
PATCH  /api/v1/edges/:id
DELETE /api/v1/edges/:id
```

### Health
```
GET    /health/live
GET    /health/ready
GET    /health/metrics
```
