# Layers & Project Structure

## Структура проекта

```
neylin-backend/
├── cmd/
│   └── server/
│       ├── main.go              # Entry point
│       └── wire.go              # Dependency injection
│
├── internal/
│   ├── domain/                  # Слой 1: Domain
│   │   ├── entity/
│   │   ├── valueobject/
│   │   ├── service/
│   │   └── error/
│   │
│   ├── application/             # Слой 2: Application
│   │   ├── usecase/
│   │   ├── port/
│   │   │   ├── repository/
│   │   │   └── service/
│   │   └── dto/
│   │
│   ├── adapter/                 # Слой 3: Adapter
│   │   ├── http/
│   │   │   ├── handler/
│   │   │   ├── middleware/
│   │   │   ├── request/
│   │   │   ├── response/
│   │   │   └── router/
│   │   └── repository/
│   │       └── postgres/
│   │
│   └── infrastructure/          # Слой 4: Infrastructure
│       ├── config/
│       ├── database/
│       ├── auth/
│       ├── redis/
│       ├── observability/
│       └── external/
│           ├── stripe/
│           └── openai/
│
├── migrations/                  # SQL миграции
│
└── tests/
    ├── e2e/
    └── fixtures/
```

---

## 4 слоя

### Domain (Центр)

**Что содержит:**
- Entities — бизнес-объекты с логикой
- Value Objects — иммутабельные объекты с валидацией
- Domain Services — логика между entities
- Domain Errors — бизнес-ошибки

**Зависимости:** Никаких внешних зависимостей

```go
// internal/domain/entity/user.go
type User struct {
    ID       uuid.UUID
    Email    valueobject.Email
    Password valueobject.HashedPassword
    // ...
}
```

---

### Application

**Что содержит:**
- Use Cases — один класс = один бизнес-сценарий
- Ports — интерфейсы для внешних зависимостей
- DTOs — объекты передачи данных

**Зависимости:** Только Domain

```go
// internal/application/usecase/auth/register.go
type RegisterUseCase struct {
    userRepo    repository.UserRepository  // Port (interface)
    authService service.AuthService        // Port (interface)
}
```

---

### Adapter

**Что содержит:**
- HTTP Handlers — обработка запросов
- Middleware — auth, logging, rate limit
- Repository Implementations — Postgres, Redis
- Request/Response DTOs — HTTP-специфичные

**Зависимости:** Application, Domain

```go
// internal/adapter/http/handler/auth.go
type AuthHandler struct {
    registerUC *auth.RegisterUseCase
}

// internal/adapter/repository/postgres/user.go
type UserRepository struct {
    db *sqlx.DB
}
```

---

### Infrastructure

**Что содержит:**
- Config — конфигурация приложения
- Database — подключения к БД
- External Services — Stripe, OpenAI clients
- Logger, Tracer, Metrics

**Зависимости:** Может зависеть от всех слоёв

```go
// internal/infrastructure/config/config.go
type Config struct {
    App      AppConfig
    Database DatabaseConfig
    // ...
}
```

---

## Правило зависимостей

```
Infrastructure → Adapter → Application → Domain
      ↓              ↓           ↓          ↓
   Всё OK      App+Domain    Только     Ничего
                            Domain
```

| Слой | Может импортировать |
|------|---------------------|
| Domain | Ничего (только stdlib) |
| Application | Domain |
| Adapter | Application, Domain |
| Infrastructure | Все слои |

---

## Почему так?

1. **Тестируемость** — Domain и Application тестируются без БД/HTTP
2. **Гибкость** — легко заменить Postgres на MongoDB
3. **Изоляция** — изменения в HTTP не затрагивают бизнес-логику
4. **Понятность** — чёткие границы ответственности

---

## Используемые библиотеки

| Библиотека | Назначение |
|------------|------------|
| [Fiber](https://gofiber.io/) | HTTP framework |
| [sqlx](https://github.com/jmoiron/sqlx) | SQL toolkit (расширение database/sql) |
| [go-redis](https://github.com/redis/go-redis) | Redis client |
| [Wire](https://github.com/google/wire) | Compile-time dependency injection |
| [zap](https://github.com/uber-go/zap) | Structured logging |
| [validator](https://github.com/go-playground/validator) | Request validation |
| [jwt-go](https://github.com/golang-jwt/jwt) | JWT tokens (RS256) |
| [envconfig](https://github.com/kelseyhightower/envconfig) | Configuration from env vars |
