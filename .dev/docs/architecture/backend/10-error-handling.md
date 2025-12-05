# Error Handling

Стратегия обработки ошибок для Go backend.

---

## Error Hierarchy

```
                    error (Go interface)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   DomainError     InfraError      ExternalError
        │
   ┌────┴────┬──────────┬──────────┐
   │         │          │          │
NotFound  Conflict  Forbidden  Validation
```

---

## Domain Errors

Domain errors — бизнес-ошибки, понятные пользователю.

```go
// internal/domain/error/errors.go
package domainerror

import "errors"

// Sentinel errors для errors.Is()
var (
    // Auth
    ErrInvalidCredentials = errors.New("invalid credentials")
    ErrUnauthorized       = errors.New("unauthorized")
    ErrForbidden          = errors.New("forbidden")
    ErrTokenExpired       = errors.New("token expired")
    ErrTokenInvalid       = errors.New("token invalid")

    // User
    ErrUserNotFound    = errors.New("user not found")
    ErrUserEmailExists = errors.New("email already exists")
    ErrUsernameExists  = errors.New("username already exists")

    // Map
    ErrMapNotFound      = errors.New("map not found")
    ErrMapLimitExceeded = errors.New("map limit exceeded")

    // Node
    ErrNodeNotFound       = errors.New("node not found")
    ErrNodeLimitExceeded  = errors.New("node limit exceeded")
    ErrNodeCycleDetected  = errors.New("cycle detected in graph")

    // Edge
    ErrEdgeNotFound    = errors.New("edge not found")
    ErrEdgeDuplicate   = errors.New("edge already exists")
    ErrEdgeSelfLoop    = errors.New("self-referencing edge not allowed")

    // Validation
    ErrInvalidEmail    = errors.New("invalid email format")
    ErrWeakPassword    = errors.New("password does not meet requirements")
    ErrInvalidNodeType = errors.New("invalid node type")

    // Subscription
    ErrSubscriptionRequired = errors.New("subscription required")
    ErrPlanUpgradeRequired  = errors.New("plan upgrade required")
)
```

---

## Structured Domain Errors

Для ошибок с контекстом используем структуры:

```go
// internal/domain/error/structured.go
package domainerror

import "fmt"

// ValidationError — ошибка валидации с деталями по полям
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation error: %s - %s", e.Field, e.Message)
}

func NewValidationError(field, message string) *ValidationError {
    return &ValidationError{Field: field, Message: message}
}

// MultiValidationError — множественные ошибки валидации
type MultiValidationError struct {
    Errors []ValidationError
}

func (e *MultiValidationError) Error() string {
    return fmt.Sprintf("validation failed: %d errors", len(e.Errors))
}

func (e *MultiValidationError) ToMap() map[string]string {
    result := make(map[string]string, len(e.Errors))
    for _, err := range e.Errors {
        result[err.Field] = err.Message
    }
    return result
}

// NotFoundError — ресурс не найден
type NotFoundError struct {
    Resource string
    ID       string
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s not found: %s", e.Resource, e.ID)
}

func NewNotFoundError(resource, id string) *NotFoundError {
    return &NotFoundError{Resource: resource, ID: id}
}

// ConflictError — конфликт данных
type ConflictError struct {
    Resource string
    Field    string
    Value    string
}

func (e *ConflictError) Error() string {
    return fmt.Sprintf("%s with %s '%s' already exists", e.Resource, e.Field, e.Value)
}
```

---

## Error Wrapping Strategy

### Когда оборачивать

```go
// ✅ ПРАВИЛЬНО: добавляем контекст на границах слоёв
func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
    var row userRow
    err := r.db.GetContext(ctx, &row, query, id)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, domainerror.ErrUserNotFound  // Domain error, не оборачиваем
        }
        return nil, fmt.Errorf("get user by id: %w", err)  // Infrastructure error, оборачиваем
    }
    return rowToUser(&row), nil
}

// ✅ ПРАВИЛЬНО: Use Case проверяет бизнес-правила
func (uc *CreateMapUseCase) Execute(ctx context.Context, input CreateMapInput) (*dto.MapDTO, error) {
    mapsCount, err := uc.mapRepo.CountByUserID(ctx, input.UserID)
    if err != nil {
        return nil, fmt.Errorf("count maps: %w", err)
    }

    if !service.CanCreateMap(sub.PlanType, mapsCount) {
        return nil, domainerror.ErrMapLimitExceeded  // Бизнес-ошибка, не оборачиваем
    }
    // ...
}
```

### Когда НЕ оборачивать

```go
// ❌ ПЛОХО: бессмысленная обёртка
func (uc *GetUserUseCase) Execute(ctx context.Context, id uuid.UUID) (*dto.UserDTO, error) {
    user, err := uc.userRepo.GetByID(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("failed to get user: %w", err)  // Избыточно
    }
    return dto.UserToDTO(user), nil
}

// ✅ ПРАВИЛЬНО: domain errors пропускаем без изменений
func (uc *GetUserUseCase) Execute(ctx context.Context, id uuid.UUID) (*dto.UserDTO, error) {
    user, err := uc.userRepo.GetByID(ctx, id)
    if err != nil {
        return nil, err  // ErrUserNotFound или wrapped DB error
    }
    return dto.UserToDTO(user), nil
}
```

---

## HTTP Error Mapping

Handler маппит domain errors на HTTP статусы:

```go
// internal/adapter/http/response/errors.go
package response

import (
    "errors"
    "github.com/gofiber/fiber/v2"
    "neylin/internal/domain/error"
)

// FromDomainError маппит domain error на HTTP response
func FromDomainError(c *fiber.Ctx, err error) error {
    status, code, message := mapError(err)

    return c.Status(status).JSON(Response{
        Success: false,
        Error: &ErrorInfo{
            Code:    code,
            Message: message,
        },
    })
}

func mapError(err error) (status int, code string, message string) {
    // Structured errors
    var notFound *domainerror.NotFoundError
    if errors.As(err, &notFound) {
        return fiber.StatusNotFound, "NOT_FOUND", err.Error()
    }

    var conflict *domainerror.ConflictError
    if errors.As(err, &conflict) {
        return fiber.StatusConflict, "CONFLICT", err.Error()
    }

    var validation *domainerror.MultiValidationError
    if errors.As(err, &validation) {
        return fiber.StatusBadRequest, "VALIDATION_ERROR", "Validation failed"
    }

    // Sentinel errors
    switch {
    // 401 Unauthorized
    case errors.Is(err, domainerror.ErrInvalidCredentials):
        return fiber.StatusUnauthorized, "INVALID_CREDENTIALS", "Invalid email or password"
    case errors.Is(err, domainerror.ErrUnauthorized):
        return fiber.StatusUnauthorized, "UNAUTHORIZED", "Authentication required"
    case errors.Is(err, domainerror.ErrTokenExpired):
        return fiber.StatusUnauthorized, "TOKEN_EXPIRED", "Token has expired"
    case errors.Is(err, domainerror.ErrTokenInvalid):
        return fiber.StatusUnauthorized, "TOKEN_INVALID", "Invalid token"

    // 403 Forbidden
    case errors.Is(err, domainerror.ErrForbidden):
        return fiber.StatusForbidden, "FORBIDDEN", "Access denied"
    case errors.Is(err, domainerror.ErrMapLimitExceeded):
        return fiber.StatusForbidden, "MAP_LIMIT_EXCEEDED", "Map limit reached for your plan"
    case errors.Is(err, domainerror.ErrNodeLimitExceeded):
        return fiber.StatusForbidden, "NODE_LIMIT_EXCEEDED", "Node limit reached"
    case errors.Is(err, domainerror.ErrPlanUpgradeRequired):
        return fiber.StatusForbidden, "UPGRADE_REQUIRED", "Please upgrade your plan"

    // 404 Not Found
    case errors.Is(err, domainerror.ErrUserNotFound):
        return fiber.StatusNotFound, "USER_NOT_FOUND", "User not found"
    case errors.Is(err, domainerror.ErrMapNotFound):
        return fiber.StatusNotFound, "MAP_NOT_FOUND", "Map not found"
    case errors.Is(err, domainerror.ErrNodeNotFound):
        return fiber.StatusNotFound, "NODE_NOT_FOUND", "Node not found"
    case errors.Is(err, domainerror.ErrEdgeNotFound):
        return fiber.StatusNotFound, "EDGE_NOT_FOUND", "Edge not found"

    // 409 Conflict
    case errors.Is(err, domainerror.ErrUserEmailExists):
        return fiber.StatusConflict, "EMAIL_EXISTS", "Email already registered"
    case errors.Is(err, domainerror.ErrUsernameExists):
        return fiber.StatusConflict, "USERNAME_EXISTS", "Username already taken"
    case errors.Is(err, domainerror.ErrEdgeDuplicate):
        return fiber.StatusConflict, "EDGE_EXISTS", "Edge already exists"

    // 422 Unprocessable Entity (бизнес-логика)
    case errors.Is(err, domainerror.ErrEdgeSelfLoop):
        return fiber.StatusUnprocessableEntity, "SELF_LOOP", "Cannot create self-referencing edge"
    case errors.Is(err, domainerror.ErrNodeCycleDetected):
        return fiber.StatusUnprocessableEntity, "CYCLE_DETECTED", "Operation would create a cycle"

    // 400 Bad Request (валидация)
    case errors.Is(err, domainerror.ErrInvalidEmail):
        return fiber.StatusBadRequest, "INVALID_EMAIL", "Invalid email format"
    case errors.Is(err, domainerror.ErrWeakPassword):
        return fiber.StatusBadRequest, "WEAK_PASSWORD", "Password does not meet requirements"
    case errors.Is(err, domainerror.ErrInvalidNodeType):
        return fiber.StatusBadRequest, "INVALID_NODE_TYPE", "Invalid node type"

    // 500 Internal Server Error (всё остальное)
    default:
        // Логируем полную ошибку, но не показываем пользователю
        return fiber.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred"
    }
}
```

---

## Retry Logic

### Transient vs Permanent Errors

```go
// internal/pkg/retry/retry.go
package retry

import (
    "context"
    "errors"
    "time"
)

// TransientError маркирует ошибку как временную (можно retry)
type TransientError struct {
    Err error
}

func (e *TransientError) Error() string { return e.Err.Error() }
func (e *TransientError) Unwrap() error { return e.Err }

func IsTransient(err error) bool {
    var transient *TransientError
    return errors.As(err, &transient)
}

// Do выполняет функцию с retry для transient errors
func Do(ctx context.Context, maxAttempts int, initialDelay time.Duration, fn func() error) error {
    var lastErr error
    delay := initialDelay

    for attempt := 1; attempt <= maxAttempts; attempt++ {
        err := fn()
        if err == nil {
            return nil
        }

        lastErr = err

        // Permanent error — не retry
        if !IsTransient(err) {
            return err
        }

        // Последняя попытка — не ждём
        if attempt == maxAttempts {
            break
        }

        // Exponential backoff
        select {
        case <-ctx.Done():
            return ctx.Err()
        case <-time.After(delay):
            delay *= 2
            if delay > 30*time.Second {
                delay = 30 * time.Second
            }
        }
    }

    return fmt.Errorf("max retries exceeded: %w", lastErr)
}
```

### Использование

```go
// В repository или external service
func (r *AIRepository) Analyze(ctx context.Context, data *AnalyzeInput) (*AnalyzeOutput, error) {
    var result *AnalyzeOutput

    err := retry.Do(ctx, 3, time.Second, func() error {
        resp, err := r.client.Call(ctx, data)
        if err != nil {
            // Network errors — transient
            if isNetworkError(err) {
                return &retry.TransientError{Err: err}
            }
            // Rate limit — transient
            if isRateLimited(err) {
                return &retry.TransientError{Err: err}
            }
            // API errors (400, 401, etc.) — permanent
            return err
        }
        result = resp
        return nil
    })

    return result, err
}
```

---

## Circuit Breaker

Для внешних сервисов (OpenAI, Stripe):

```go
// internal/pkg/circuitbreaker/breaker.go
package circuitbreaker

import (
    "errors"
    "sync"
    "time"
)

var ErrCircuitOpen = errors.New("circuit breaker is open")

type State int

const (
    StateClosed State = iota
    StateOpen
    StateHalfOpen
)

type CircuitBreaker struct {
    mu sync.RWMutex

    failureThreshold int
    resetTimeout     time.Duration
    halfOpenMax      int

    failures     int
    successes    int
    state        State
    lastFailure  time.Time
}

func New(failureThreshold int, resetTimeout time.Duration) *CircuitBreaker {
    return &CircuitBreaker{
        failureThreshold: failureThreshold,
        resetTimeout:     resetTimeout,
        halfOpenMax:      3,
        state:            StateClosed,
    }
}

func (cb *CircuitBreaker) Execute(fn func() error) error {
    if !cb.allowRequest() {
        return ErrCircuitOpen
    }

    err := fn()

    if err != nil {
        cb.recordFailure()
        return err
    }

    cb.recordSuccess()
    return nil
}

func (cb *CircuitBreaker) allowRequest() bool {
    cb.mu.RLock()
    defer cb.mu.RUnlock()

    switch cb.state {
    case StateClosed:
        return true
    case StateOpen:
        if time.Since(cb.lastFailure) > cb.resetTimeout {
            cb.mu.RUnlock()
            cb.mu.Lock()
            cb.state = StateHalfOpen
            cb.successes = 0
            cb.mu.Unlock()
            cb.mu.RLock()
            return true
        }
        return false
    case StateHalfOpen:
        return true
    }
    return false
}

func (cb *CircuitBreaker) recordFailure() {
    cb.mu.Lock()
    defer cb.mu.Unlock()

    cb.failures++
    cb.lastFailure = time.Now()

    if cb.state == StateHalfOpen || cb.failures >= cb.failureThreshold {
        cb.state = StateOpen
    }
}

func (cb *CircuitBreaker) recordSuccess() {
    cb.mu.Lock()
    defer cb.mu.Unlock()

    if cb.state == StateHalfOpen {
        cb.successes++
        if cb.successes >= cb.halfOpenMax {
            cb.state = StateClosed
            cb.failures = 0
        }
    } else {
        cb.failures = 0
    }
}
```

### Использование с AI Service

```go
// internal/infrastructure/ai/openai.go
type OpenAIService struct {
    client  *openai.Client
    breaker *circuitbreaker.CircuitBreaker
}

func NewOpenAIService(apiKey string) *OpenAIService {
    return &OpenAIService{
        client:  openai.NewClient(apiKey),
        breaker: circuitbreaker.New(5, 30*time.Second), // 5 failures → 30s cooldown
    }
}

func (s *OpenAIService) AnalyzeMap(ctx context.Context, fullMap *entity.FullMap) (*entity.AIAnalysis, error) {
    var result *entity.AIAnalysis

    err := s.breaker.Execute(func() error {
        resp, err := s.client.CreateChatCompletion(ctx, req)
        if err != nil {
            return err
        }
        result = parseResponse(resp)
        return nil
    })

    if errors.Is(err, circuitbreaker.ErrCircuitOpen) {
        // Fallback: возвращаем пустой результат или cached
        return &entity.AIAnalysis{Status: "unavailable"}, nil
    }

    return result, err
}
```

---

## Error Logging

### Уровни логирования

| Level | Когда использовать |
|-------|-------------------|
| `Error` | Неожиданные ошибки, требуют внимания |
| `Warn` | Ожидаемые ошибки (not found, validation) |
| `Info` | Успешные операции |
| `Debug` | Детали для отладки |

```go
// internal/adapter/http/middleware/error_logger.go
func ErrorLoggerMiddleware(logger *zap.Logger) fiber.Handler {
    return func(c *fiber.Ctx) error {
        err := c.Next()

        if err != nil {
            status := c.Response().StatusCode()
            requestID := c.Locals("requestID").(string)

            fields := []zap.Field{
                zap.String("request_id", requestID),
                zap.String("method", c.Method()),
                zap.String("path", c.Path()),
                zap.Int("status", status),
                zap.Error(err),
            }

            switch {
            case status >= 500:
                // Unexpected errors — полный stack trace
                logger.Error("internal error", fields...)
            case status == 401 || status == 403:
                // Auth errors — warn (может быть атака)
                logger.Warn("auth error", fields...)
            case status >= 400:
                // Client errors — debug (ожидаемые)
                logger.Debug("client error", fields...)
            }
        }

        return err
    }
}
```

### Структурированное логирование ошибок

```go
// В Use Case
func (uc *CreateNodeUseCase) Execute(ctx context.Context, input CreateNodeInput) (*dto.NodeDTO, error) {
    // ...
    if err := uc.nodeRepo.Create(ctx, node); err != nil {
        uc.logger.Error("failed to create node",
            zap.String("map_id", input.MapID.String()),
            zap.String("user_id", input.UserID.String()),
            zap.String("node_type", input.Type),
            zap.Error(err),
        )
        return nil, fmt.Errorf("create node: %w", err)
    }
    // ...
}
```

---

## Recovery Strategy

### Global Panic Recovery

```go
// internal/adapter/http/middleware/recover.go
func RecoverMiddleware(logger *zap.Logger) fiber.Handler {
    return func(c *fiber.Ctx) error {
        defer func() {
            if r := recover(); r != nil {
                logger.Error("panic recovered",
                    zap.Any("panic", r),
                    zap.String("stack", string(debug.Stack())),
                    zap.String("request_id", c.Locals("requestID").(string)),
                    zap.String("path", c.Path()),
                )

                c.Status(fiber.StatusInternalServerError).JSON(Response{
                    Success: false,
                    Error: &ErrorInfo{
                        Code:    "INTERNAL_ERROR",
                        Message: "An unexpected error occurred",
                    },
                })
            }
        }()

        return c.Next()
    }
}
```

### Graceful Degradation

```go
// В handler — fallback при недоступности сервиса
func (h *MapHandler) GetWithAnalysis(c *fiber.Ctx) error {
    // ...
    fullMap, err := h.getFullUC.Execute(c.Context(), input)
    if err != nil {
        return response.FromDomainError(c, err)
    }

    // AI analysis — не критично, graceful degradation
    analysis, err := h.analyzeUC.Execute(c.Context(), fullMap)
    if err != nil {
        // Логируем, но не fail'им запрос
        h.logger.Warn("ai analysis failed",
            zap.String("map_id", mapID.String()),
            zap.Error(err),
        )
        analysis = nil  // Вернём без analysis
    }

    fullMap.AIAnalysis = analysis
    return c.JSON(response.Success(dto.FullMapToDTO(fullMap)))
}
```

---

## Чеклист

- [ ] Domain errors определены как sentinel errors
- [ ] Structured errors для ошибок с контекстом
- [ ] Error wrapping на границах слоёв
- [ ] HTTP mapping покрывает все domain errors
- [ ] Retry logic для transient errors
- [ ] Circuit breaker для внешних сервисов
- [ ] Structured logging с уровнями
- [ ] Panic recovery middleware
- [ ] Graceful degradation для некритичных сервисов

---

## См. также

- [04-adapters.md](./04-adapters.md) — HTTP handlers и response helpers
- [07-observability.md](./07-observability.md) — Logging, tracing
- [11-security.md](./11-security.md) — Security и error exposure
