# Backend Architecture

Neylin Backend использует **Clean Architecture** (Uncle Bob) на Go.

## Принцип

```
┌─────────────────────────────────────────────────────────────┐
│                      Infrastructure                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      Adapter                           │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │                  Application                     │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │                 Domain                     │  │  │  │
│  │  │  │                                           │  │  │  │
│  │  │  │  Entities, Value Objects, Domain Services │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  │                                                 │  │  │
│  │  │  Use Cases, Ports (Interfaces), DTOs           │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  Handlers, Middleware, Repository Implementations    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Config, Database, External Services, Logger               │
└─────────────────────────────────────────────────────────────┘
```

**Правило зависимостей**: Зависимости направлены только ВНУТРЬ. Внутренние слои не знают о внешних.

---

## Разделы документации

| # | Раздел | Описание |
|---|--------|----------|
| 1 | [Layers](./01-layers.md) | Структура проекта и 4 слоя |
| 2 | [Domain](./02-domain.md) | Entities, Value Objects, Domain Services |
| 3 | [Application](./03-application.md) | Use Cases, Ports, DTOs |
| 4 | [Adapters](./04-adapters.md) | Handlers, Middleware, Repositories |
| 5 | [Infrastructure](./05-infrastructure.md) | Config, DB, External Services, DI |
| 6 | [Redis](./06-redis.md) | Sessions, Caching, Rate Limiting, Pub/Sub |
| 7 | [Observability](./07-observability.md) | Tracing, Metrics, Logging, Health |
| 8 | [Testing](./08-testing.md) | Unit, Integration, E2E |
| 9 | [Deployment](./09-deployment.md) | Docker, Makefile |
| 99 | [Checklists](./99-checklists.md) | Quick Reference |

