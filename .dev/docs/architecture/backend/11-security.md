# Security

Практики безопасности для Go backend.

---

## Input Validation

### Validation Strategy

```
┌─────────────────────────────────────────────────────────┐
│ HTTP Request                                             │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Handler: Struct validation (go-playground/validator) │
│    - Format (email, uuid, url)                          │
│    - Required fields                                    │
│    - Length constraints                                 │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Use Case: Business validation                         │
│    - Uniqueness (email exists?)                         │
│    - Authorization (owns resource?)                     │
│    - Limits (plan quota)                                │
└─────────────────────┬───────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Domain: Value Object validation                       │
│    - Email format + domain rules                        │
│    - Password strength                                  │
│    - Node type enum                                     │
└─────────────────────────────────────────────────────────┘
```

### Request Validation

```go
// internal/adapter/http/request/user.go
package request

import "github.com/go-playground/validator/v10"

type UpdateProfileRequest struct {
    FirstName   string `json:"firstName" validate:"max=100"`
    LastName    string `json:"lastName" validate:"max=100"`
    DisplayName string `json:"displayName" validate:"max=100"`
    Username    string `json:"username" validate:"omitempty,min=3,max=50,alphanum"`
    Bio         string `json:"bio" validate:"max=500"`
}

type CreateNodeRequest struct {
    Label       string  `json:"label" validate:"required,min=1,max=200"`
    Description string  `json:"description" validate:"max=5000"`
    Content     string  `json:"content" validate:"max=50000"`
    Type        string  `json:"type" validate:"required,oneof=concept fact question task resource"`
    PositionX   float64 `json:"positionX" validate:"required"`
    PositionY   float64 `json:"positionY" validate:"required"`
}

var validate = validator.New()

func (r *CreateNodeRequest) Validate() error {
    return validate.Struct(r)
}
```

### Value Object Validation

```go
// internal/domain/valueobject/email.go
package valueobject

import (
    "regexp"
    "strings"
    "neylin/internal/domain/error"
)

type Email string

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func NewEmail(s string) (Email, error) {
    s = strings.ToLower(strings.TrimSpace(s))

    if len(s) == 0 {
        return "", domainerror.ErrInvalidEmail
    }

    if len(s) > 255 {
        return "", domainerror.ErrInvalidEmail
    }

    if !emailRegex.MatchString(s) {
        return "", domainerror.ErrInvalidEmail
    }

    return Email(s), nil
}

func (e Email) String() string { return string(e) }
```

```go
// internal/domain/valueobject/password.go
package valueobject

import (
    "unicode"
    "neylin/internal/domain/error"
)

type Password string

func NewPassword(s string) (Password, error) {
    if len(s) < 8 {
        return "", domainerror.ErrWeakPassword
    }

    if len(s) > 128 {
        return "", domainerror.ErrWeakPassword
    }

    var hasUpper, hasLower, hasDigit bool
    for _, r := range s {
        switch {
        case unicode.IsUpper(r):
            hasUpper = true
        case unicode.IsLower(r):
            hasLower = true
        case unicode.IsDigit(r):
            hasDigit = true
        }
    }

    if !hasUpper || !hasLower || !hasDigit {
        return "", domainerror.ErrWeakPassword
    }

    return Password(s), nil
}
```

---

## SQL Injection Prevention

### Parameterized Queries (sqlx)

```go
// ✅ ПРАВИЛЬНО: parameterized queries
func (r *UserRepository) GetByEmail(ctx context.Context, email valueobject.Email) (*entity.User, error) {
    var row userRow
    query := `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`
    err := r.db.GetContext(ctx, &row, query, email.String())
    return rowToUser(&row), err
}

// ✅ ПРАВИЛЬНО: Named parameters
func (r *MapRepository) ListByUserID(ctx context.Context, userID uuid.UUID, opts MapListOptions) ([]entity.Map, error) {
    query := `
        SELECT * FROM maps
        WHERE user_id = :user_id AND deleted_at IS NULL
        ORDER BY :sort_by :sort_order
        LIMIT :limit OFFSET :offset
    `
    // ВНИМАНИЕ: sort_by и sort_order нужно whitelist'ить!
    // ...
}

// ❌ ПЛОХО: string concatenation
func (r *MapRepository) ListBad(ctx context.Context, sortBy string) ([]entity.Map, error) {
    query := fmt.Sprintf("SELECT * FROM maps ORDER BY %s", sortBy)  // SQL INJECTION!
    // ...
}
```

### Whitelist для динамических полей

```go
// internal/adapter/repository/postgres/helpers.go
package postgres

var allowedSortFields = map[string]bool{
    "created_at": true,
    "updated_at": true,
    "title":      true,
}

var allowedSortOrders = map[string]bool{
    "asc":  true,
    "desc": true,
}

func sanitizeSortField(field string) string {
    if allowedSortFields[field] {
        return field
    }
    return "updated_at"  // default
}

func sanitizeSortOrder(order string) string {
    order = strings.ToLower(order)
    if allowedSortOrders[order] {
        return order
    }
    return "desc"  // default
}

// Использование
func (r *MapRepository) ListByUserID(ctx context.Context, userID uuid.UUID, opts MapListOptions) ([]entity.Map, error) {
    sortField := sanitizeSortField(opts.SortBy)
    sortOrder := sanitizeSortOrder(opts.SortOrder)

    query := fmt.Sprintf(`
        SELECT * FROM maps
        WHERE user_id = $1 AND deleted_at IS NULL
        ORDER BY %s %s
        LIMIT $2 OFFSET $3
    `, sortField, sortOrder)

    return r.db.SelectContext(ctx, &rows, query, userID, opts.Limit, opts.Offset)
}
```

---

## CSRF Protection

### SameSite Cookies

```go
// internal/adapter/http/middleware/cookies.go
package middleware

func SetAuthCookies(c *fiber.Ctx, accessToken, refreshToken string) {
    // Access token cookie
    c.Cookie(&fiber.Cookie{
        Name:     "access_token",
        Value:    accessToken,
        Path:     "/",
        MaxAge:   15 * 60,  // 15 minutes
        HTTPOnly: true,
        Secure:   true,
        SameSite: "Strict",
    })

    // Refresh token cookie
    c.Cookie(&fiber.Cookie{
        Name:     "refresh_token",
        Value:    refreshToken,
        Path:     "/api/auth/refresh",  // Только для refresh endpoint
        MaxAge:   7 * 24 * 60 * 60,     // 7 days
        HTTPOnly: true,
        Secure:   true,
        SameSite: "Strict",
    })
}
```

### CSRF Token для критических операций

```go
// internal/adapter/http/middleware/csrf.go
package middleware

import (
    "crypto/rand"
    "encoding/base64"
)

func GenerateCSRFToken() string {
    b := make([]byte, 32)
    rand.Read(b)
    return base64.URLEncoding.EncodeToString(b)
}

func CSRFMiddleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        // Skip safe methods
        if c.Method() == "GET" || c.Method() == "HEAD" || c.Method() == "OPTIONS" {
            return c.Next()
        }

        // Verify CSRF token for destructive operations
        token := c.Get("X-CSRF-Token")
        sessionToken := c.Cookies("csrf_token")

        if token == "" || token != sessionToken {
            return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
                "error": "invalid CSRF token",
            })
        }

        return c.Next()
    }
}
```

### Origin Validation

```go
// internal/adapter/http/middleware/origin.go
package middleware

func OriginValidationMiddleware(allowedOrigins []string) fiber.Handler {
    originSet := make(map[string]bool)
    for _, o := range allowedOrigins {
        originSet[o] = true
    }

    return func(c *fiber.Ctx) error {
        origin := c.Get("Origin")

        // No origin = same-origin request
        if origin == "" {
            return c.Next()
        }

        if !originSet[origin] {
            return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
                "error": "origin not allowed",
            })
        }

        return c.Next()
    }
}
```

---

## Rate Limiting

### Per-Endpoint Limits

```go
// internal/adapter/http/router/router.go
package router

func Setup(app *fiber.App, ...) {
    // Global rate limit
    app.Use(middleware.RateLimitMiddleware(100, time.Minute))  // 100 req/min

    // Auth endpoints — строже
    auth := api.Group("/auth")
    auth.Post("/login", middleware.RateLimitMiddleware(5, 15*time.Minute), authHandler.Login)
    auth.Post("/register", middleware.RateLimitMiddleware(3, time.Hour), authHandler.Register)
    auth.Post("/forgot-password", middleware.RateLimitMiddleware(3, time.Hour), authHandler.ForgotPassword)

    // AI endpoints — дорогие
    protected.Post("/maps/:id/analyze", middleware.RateLimitMiddleware(10, time.Hour), mapHandler.Analyze)
}
```

### Redis-based Rate Limiter

```go
// internal/adapter/http/middleware/rate_limit_redis.go
package middleware

import (
    "context"
    "fmt"
    "time"
    "github.com/redis/go-redis/v9"
)

type RedisRateLimiter struct {
    client *redis.Client
    max    int
    window time.Duration
}

func NewRedisRateLimiter(client *redis.Client, max int, window time.Duration) *RedisRateLimiter {
    return &RedisRateLimiter{client: client, max: max, window: window}
}

func (rl *RedisRateLimiter) Allow(ctx context.Context, key string) (bool, error) {
    redisKey := fmt.Sprintf("ratelimit:%s", key)

    pipe := rl.client.Pipeline()
    incr := pipe.Incr(ctx, redisKey)
    pipe.Expire(ctx, redisKey, rl.window)

    _, err := pipe.Exec(ctx)
    if err != nil {
        return false, err
    }

    return incr.Val() <= int64(rl.max), nil
}

func RedisRateLimitMiddleware(limiter *RedisRateLimiter) fiber.Handler {
    return func(c *fiber.Ctx) error {
        key := c.IP()
        if userID := c.Locals("userID"); userID != nil {
            key = userID.(uuid.UUID).String()
        }

        allowed, err := limiter.Allow(c.Context(), key)
        if err != nil {
            // При ошибке Redis — пропускаем (fail open)
            return c.Next()
        }

        if !allowed {
            return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
                "error": fiber.Map{
                    "code":    "RATE_LIMITED",
                    "message": "Too many requests, please try again later",
                },
            })
        }

        return c.Next()
    }
}
```

---

## Password Security

### Requirements

| Requirement | Value |
|------------|-------|
| Min length | 8 characters |
| Max length | 128 characters |
| Uppercase | At least 1 |
| Lowercase | At least 1 |
| Digit | At least 1 |
| Special | Optional |

### Hashing (Argon2id)

```go
// internal/infrastructure/auth/password.go
package auth

import (
    "crypto/rand"
    "encoding/base64"
    "golang.org/x/crypto/argon2"
)

type PasswordHasher struct {
    time    uint32
    memory  uint32
    threads uint8
    keyLen  uint32
    saltLen uint32
}

func NewPasswordHasher() *PasswordHasher {
    return &PasswordHasher{
        time:    1,
        memory:  64 * 1024,  // 64 MB
        threads: 4,
        keyLen:  32,
        saltLen: 16,
    }
}

func (h *PasswordHasher) Hash(password string) (string, error) {
    salt := make([]byte, h.saltLen)
    if _, err := rand.Read(salt); err != nil {
        return "", err
    }

    hash := argon2.IDKey(
        []byte(password),
        salt,
        h.time,
        h.memory,
        h.threads,
        h.keyLen,
    )

    // Format: $argon2id$v=19$m=65536,t=1,p=4$<salt>$<hash>
    return fmt.Sprintf(
        "$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
        argon2.Version,
        h.memory,
        h.time,
        h.threads,
        base64.RawStdEncoding.EncodeToString(salt),
        base64.RawStdEncoding.EncodeToString(hash),
    ), nil
}

func (h *PasswordHasher) Verify(password, encodedHash string) bool {
    // Parse encoded hash...
    // Compute hash with same params...
    // Compare using subtle.ConstantTimeCompare
}
```

---

## Secret Management

### Environment Variables

```go
// internal/infrastructure/config/config.go
package config

type Config struct {
    App      AppConfig
    Database DatabaseConfig
    Redis    RedisConfig
    JWT      JWTConfig
    Stripe   StripeConfig
    OpenAI   OpenAIConfig
}

type JWTConfig struct {
    PrivateKeyPath string `env:"JWT_PRIVATE_KEY_PATH" envDefault:"/secrets/jwt-private.pem"`
    PublicKeyPath  string `env:"JWT_PUBLIC_KEY_PATH" envDefault:"/secrets/jwt-public.pem"`
    AccessTTL      time.Duration `env:"JWT_ACCESS_TTL" envDefault:"15m"`
    RefreshTTL     time.Duration `env:"JWT_REFRESH_TTL" envDefault:"168h"`
}

type StripeConfig struct {
    SecretKey     string `env:"STRIPE_SECRET_KEY,required"`
    WebhookSecret string `env:"STRIPE_WEBHOOK_SECRET,required"`
}

type OpenAIConfig struct {
    APIKey string `env:"OPENAI_API_KEY,required"`
}
```

### Secrets в Production

```yaml
# Kubernetes Secret
apiVersion: v1
kind: Secret
metadata:
  name: neylin-secrets
type: Opaque
data:
  jwt-private.pem: <base64>
  jwt-public.pem: <base64>
  stripe-secret-key: <base64>
  stripe-webhook-secret: <base64>
  openai-api-key: <base64>
```

### Никогда в коде

```go
// ❌ ПЛОХО: hardcoded secrets
const stripeKey = "sk_live_..."

// ❌ ПЛОХО: secrets в конфиге
config := Config{
    StripeKey: "sk_live_...",
}

// ✅ ПРАВИЛЬНО: из environment
config := LoadFromEnv()
```

---

## Audit Logging

### Что логировать

| Event | Fields |
|-------|--------|
| Login success | user_id, ip, user_agent |
| Login failure | email, ip, user_agent, reason |
| Logout | user_id, ip |
| Password change | user_id, ip |
| Password reset request | email, ip |
| Delete account | user_id, ip |
| Subscription change | user_id, old_plan, new_plan |
| Admin action | admin_id, action, target_user |

### Implementation

```go
// internal/application/service/audit.go
package service

type AuditService struct {
    logger *zap.Logger
    repo   repository.AuditLogRepository
}

type AuditEvent struct {
    Event     string
    UserID    *uuid.UUID
    IP        string
    UserAgent string
    Metadata  map[string]interface{}
}

func (s *AuditService) Log(ctx context.Context, event AuditEvent) {
    // Structured logging
    fields := []zap.Field{
        zap.String("event", event.Event),
        zap.String("ip", event.IP),
        zap.String("user_agent", event.UserAgent),
        zap.Time("timestamp", time.Now()),
    }

    if event.UserID != nil {
        fields = append(fields, zap.String("user_id", event.UserID.String()))
    }

    for k, v := range event.Metadata {
        fields = append(fields, zap.Any(k, v))
    }

    s.logger.Info("audit", fields...)

    // Persist to DB for compliance
    if s.repo != nil {
        s.repo.Create(ctx, &entity.AuditLog{
            Event:     event.Event,
            UserID:    event.UserID,
            IP:        event.IP,
            UserAgent: event.UserAgent,
            Metadata:  event.Metadata,
            CreatedAt: time.Now(),
        })
    }
}
```

### Использование

```go
// В Use Case
func (uc *LoginUseCase) Execute(ctx context.Context, input LoginInput) (*LoginOutput, error) {
    user, err := uc.userRepo.GetByEmail(ctx, email)
    if err != nil {
        uc.audit.Log(ctx, service.AuditEvent{
            Event: "login_failure",
            IP:    input.IP,
            UserAgent: input.UserAgent,
            Metadata: map[string]interface{}{
                "email":  input.Email,
                "reason": "user_not_found",
            },
        })
        return nil, domainerror.ErrInvalidCredentials
    }

    if !uc.authService.VerifyPassword(user.Password, password) {
        uc.audit.Log(ctx, service.AuditEvent{
            Event:  "login_failure",
            UserID: &user.ID,
            IP:     input.IP,
            UserAgent: input.UserAgent,
            Metadata: map[string]interface{}{
                "reason": "wrong_password",
            },
        })
        return nil, domainerror.ErrInvalidCredentials
    }

    // Success
    uc.audit.Log(ctx, service.AuditEvent{
        Event:     "login_success",
        UserID:    &user.ID,
        IP:        input.IP,
        UserAgent: input.UserAgent,
    })

    // ...
}
```

---

## CORS Configuration

```go
// internal/adapter/http/middleware/cors.go
package middleware

import "github.com/gofiber/fiber/v2/middleware/cors"

func CORSMiddleware(allowedOrigins []string) fiber.Handler {
    return cors.New(cors.Config{
        AllowOrigins:     strings.Join(allowedOrigins, ","),
        AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        AllowHeaders:     "Origin,Content-Type,Authorization,X-CSRF-Token,X-Request-ID",
        AllowCredentials: true,
        MaxAge:           86400,  // 24 hours
    })
}
```

```go
// В production
allowedOrigins := []string{
    "https://app.neylin.com",
    "https://neylin.com",
}

// В development
allowedOrigins := []string{
    "http://localhost:5173",
    "http://localhost:3000",
}
```

---

## Security Headers

```go
// internal/adapter/http/middleware/security_headers.go
package middleware

func SecurityHeadersMiddleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        // Prevent MIME type sniffing
        c.Set("X-Content-Type-Options", "nosniff")

        // Prevent clickjacking
        c.Set("X-Frame-Options", "DENY")

        // XSS protection (legacy browsers)
        c.Set("X-XSS-Protection", "1; mode=block")

        // Referrer policy
        c.Set("Referrer-Policy", "strict-origin-when-cross-origin")

        // Permissions policy
        c.Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

        // HSTS (production only)
        if config.IsProduction() {
            c.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        }

        return c.Next()
    }
}
```

---

## Чеклист

### Input Validation
- [ ] go-playground/validator для request structs
- [ ] Value Objects для domain validation
- [ ] Whitelist для динамических SQL fields

### SQL Injection
- [ ] Только parameterized queries
- [ ] Нет string concatenation в SQL
- [ ] Whitelist для ORDER BY fields

### Authentication
- [ ] Argon2id для password hashing
- [ ] httpOnly + Secure + SameSite cookies
- [ ] CSRF tokens для destructive operations

### Rate Limiting
- [ ] Global rate limit
- [ ] Strict limits на auth endpoints
- [ ] Redis-based для distributed

### Secrets
- [ ] Secrets только из environment
- [ ] Нет hardcoded credentials
- [ ] Key rotation strategy

### Headers
- [ ] CORS с explicit allowlist
- [ ] Security headers middleware
- [ ] HSTS в production

### Audit
- [ ] Login/logout logging
- [ ] Failed auth attempts
- [ ] Admin actions
- [ ] Sensitive operations

---

## См. также

- [10-error-handling.md](./10-error-handling.md) — Error handling без exposure
- [12-auth-flow.md](./12-auth-flow.md) — JWT flow и token lifecycle
- [06-redis.md](./06-redis.md) — Rate limiting с Redis
