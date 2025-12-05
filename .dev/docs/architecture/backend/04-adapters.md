# Adapter Layer

Adapter layer содержит реализации портов: HTTP handlers, middleware, repository implementations.

---

## HTTP Handlers

### Auth Handler

```go
// internal/adapter/http/handler/auth.go
package handler

type AuthHandler struct {
    registerUC       *auth.RegisterUseCase
    loginUC          *auth.LoginUseCase
    logoutUC         *auth.LogoutUseCase
    refreshUC        *auth.RefreshUseCase
    forgotPasswordUC *auth.ForgotPasswordUseCase
    resetPasswordUC  *auth.ResetPasswordUseCase
}

func NewAuthHandler(
    registerUC *auth.RegisterUseCase,
    loginUC *auth.LoginUseCase,
    // ...
) *AuthHandler {
    return &AuthHandler{
        registerUC: registerUC,
        loginUC:    loginUC,
        // ...
    }
}

// POST /auth/register
func (h *AuthHandler) Register(c *fiber.Ctx) error {
    var req request.RegisterRequest
    if err := c.BodyParser(&req); err != nil {
        return response.BadRequest(c, "invalid request body")
    }

    if err := req.Validate(); err != nil {
        return response.ValidationError(c, err)
    }

    output, err := h.registerUC.Execute(c.Context(), auth.RegisterInput{
        Email:     req.Email,
        Password:  req.Password,
        FirstName: req.FirstName,
        LastName:  req.LastName,
    })

    if err != nil {
        return response.FromDomainError(c, err)
    }

    return c.Status(fiber.StatusCreated).JSON(response.Success(response.AuthResponse{
        User:         output.User,
        AccessToken:  output.AccessToken,
        RefreshToken: output.RefreshToken,
    }))
}

// POST /auth/login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
    var req request.LoginRequest
    if err := c.BodyParser(&req); err != nil {
        return response.BadRequest(c, "invalid request body")
    }

    output, err := h.loginUC.Execute(c.Context(), auth.LoginInput{
        Email:    req.Email,
        Password: req.Password,
    })

    if err != nil {
        return response.FromDomainError(c, err)
    }

    return c.JSON(response.Success(response.AuthResponse{
        User:         output.User,
        AccessToken:  output.AccessToken,
        RefreshToken: output.RefreshToken,
    }))
}

// POST /auth/logout
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)
    token := c.Locals("token").(string)

    err := h.logoutUC.Execute(c.Context(), auth.LogoutInput{
        UserID: userID,
        Token:  token,
    })

    if err != nil {
        return response.FromDomainError(c, err)
    }

    return c.SendStatus(fiber.StatusNoContent)
}
```

### Map Handler

```go
// internal/adapter/http/handler/map.go
package handler

type MapHandler struct {
    createUC  *mapuc.CreateMapUseCase
    getUC     *mapuc.GetMapUseCase
    getFullUC *mapuc.GetFullMapUseCase
    listUC    *mapuc.ListMapsUseCase
    updateUC  *mapuc.UpdateMapUseCase
    deleteUC  *mapuc.DeleteMapUseCase
    analyzeUC *mapuc.AnalyzeMapUseCase
}

// GET /maps
func (h *MapHandler) List(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)

    output, err := h.listUC.Execute(c.Context(), mapuc.ListMapsInput{
        UserID:    userID,
        SortBy:    c.Query("sort", "updated_at"),
        SortOrder: c.Query("order", "desc"),
    })

    if err != nil {
        return response.FromDomainError(c, err)
    }

    return c.JSON(response.Success(output))
}

// POST /maps
func (h *MapHandler) Create(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)

    var req request.CreateMapRequest
    if err := c.BodyParser(&req); err != nil {
        return response.BadRequest(c, "invalid request body")
    }

    if err := req.Validate(); err != nil {
        return response.ValidationError(c, err)
    }

    output, err := h.createUC.Execute(c.Context(), mapuc.CreateMapInput{
        UserID:      userID,
        Title:       req.Title,
        Description: req.Description,
    })

    if err != nil {
        return response.FromDomainError(c, err)
    }

    return c.Status(fiber.StatusCreated).JSON(response.Success(output))
}

// GET /maps/:id
func (h *MapHandler) Get(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)

    mapID, err := uuid.Parse(c.Params("id"))
    if err != nil {
        return response.BadRequest(c, "invalid map id")
    }

    output, err := h.getUC.Execute(c.Context(), mapuc.GetMapInput{
        UserID: userID,
        MapID:  mapID,
    })

    if err != nil {
        return response.FromDomainError(c, err)
    }

    return c.JSON(response.Success(output))
}

// DELETE /maps/:id
func (h *MapHandler) Delete(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)

    mapID, err := uuid.Parse(c.Params("id"))
    if err != nil {
        return response.BadRequest(c, "invalid map id")
    }

    err = h.deleteUC.Execute(c.Context(), mapuc.DeleteMapInput{
        UserID: userID,
        MapID:  mapID,
    })

    if err != nil {
        return response.FromDomainError(c, err)
    }

    return c.SendStatus(fiber.StatusNoContent)
}
```

---

## Middleware

### Auth Middleware

```go
// internal/adapter/http/middleware/auth.go
package middleware

func AuthMiddleware(authService service.AuthService) fiber.Handler {
    return func(c *fiber.Ctx) error {
        authHeader := c.Get("Authorization")
        if authHeader == "" {
            return response.Unauthorized(c, "missing authorization header")
        }

        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            return response.Unauthorized(c, "invalid authorization format")
        }

        token := parts[1]

        claims, err := authService.ValidateAccessToken(token)
        if err != nil {
            return response.Unauthorized(c, "invalid or expired token")
        }

        c.Locals("userID", claims.UserID)
        c.Locals("email", claims.Email)
        c.Locals("role", claims.Role)
        c.Locals("token", token)

        return c.Next()
    }
}
```

### Rate Limit Middleware

```go
// internal/adapter/http/middleware/rate_limit.go
package middleware

func RateLimitMiddleware(max int, window time.Duration) fiber.Handler {
    return limiter.New(limiter.Config{
        Max:        max,
        Expiration: window,
        KeyGenerator: func(c *fiber.Ctx) string {
            if userID := c.Locals("userID"); userID != nil {
                return userID.(string)
            }
            return c.IP()
        },
        LimitReached: func(c *fiber.Ctx) error {
            return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
                "error": fiber.Map{
                    "code":    "RATE_LIMITED",
                    "message": "Too many requests, please try again later",
                },
            })
        },
    })
}
```

### Logger Middleware

```go
// internal/adapter/http/middleware/logger.go
package middleware

func LoggerMiddleware(logger *zap.Logger) fiber.Handler {
    return func(c *fiber.Ctx) error {
        start := time.Now()

        err := c.Next()

        logger.Info("request",
            zap.String("method", c.Method()),
            zap.String("path", c.Path()),
            zap.Int("status", c.Response().StatusCode()),
            zap.Duration("latency", time.Since(start)),
            zap.String("ip", c.IP()),
            zap.String("request_id", c.Locals("requestID").(string)),
        )

        return err
    }
}
```

### Request ID Middleware

```go
// internal/adapter/http/middleware/request_id.go
package middleware

func RequestIDMiddleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        requestID := c.Get("X-Request-ID")
        if requestID == "" {
            requestID = uuid.New().String()
        }

        c.Locals("requestID", requestID)
        c.Set("X-Request-ID", requestID)

        return c.Next()
    }
}
```

---

## Request/Response DTOs

### Request DTOs

```go
// internal/adapter/http/request/auth.go
package request

import "github.com/go-playground/validator/v10"

type RegisterRequest struct {
    Email     string `json:"email" validate:"required,email"`
    Password  string `json:"password" validate:"required,min=8"`
    FirstName string `json:"firstName" validate:"max=100"`
    LastName  string `json:"lastName" validate:"max=100"`
}

func (r *RegisterRequest) Validate() error {
    return validator.New().Struct(r)
}

type LoginRequest struct {
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required"`
}

type RefreshRequest struct {
    RefreshToken string `json:"refreshToken" validate:"required"`
}
```

### Response Helpers

Все API ответы имеют унифицированный формат:

```json
// Успешный ответ
{
  "success": true,
  "data": { ... }
}

// Ответ с ошибкой
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "user not found",
    "details": { "field": "error message" }  // опционально, для валидации
  }
}

// Пагинированный ответ
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

```go
// internal/adapter/http/response/response.go
package response

type Response struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   *ErrorInfo  `json:"error,omitempty"`
}

type ErrorInfo struct {
    Code    string            `json:"code"`
    Message string            `json:"message"`
    Details map[string]string `json:"details,omitempty"`
}

type PaginatedResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data"`
    Meta    *Pagination `json:"meta,omitempty"`
}

type Pagination struct {
    Total  int `json:"total"`
    Limit  int `json:"limit"`
    Offset int `json:"offset"`
}

func Success(c *fiber.Ctx, data interface{}) error {
    return c.JSON(Response{
        Success: true,
        Data:    data,
    })
}

func Created(c *fiber.Ctx, data interface{}) error {
    return c.Status(fiber.StatusCreated).JSON(Response{
        Success: true,
        Data:    data,
    })
}

func NoContent(c *fiber.Ctx) error {
    return c.SendStatus(fiber.StatusNoContent)
}

func Paginated(c *fiber.Ctx, data interface{}, total, limit, offset int) error {
    return c.JSON(PaginatedResponse{
        Success: true,
        Data:    data,
        Meta: &Pagination{
            Total:  total,
            Limit:  limit,
            Offset: offset,
        },
    })
}

func Error(c *fiber.Ctx, err error) error {
    status, code, message := mapError(err)
    return c.Status(status).JSON(Response{
        Success: false,
        Error: &ErrorInfo{
            Code:    code,
            Message: message,
        },
    })
}

func ValidationError(c *fiber.Ctx, details map[string]string) error {
    return c.Status(fiber.StatusBadRequest).JSON(Response{
        Success: false,
        Error: &ErrorInfo{
            Code:    "VALIDATION_ERROR",
            Message: "Validation failed",
            Details: details,
        },
    })
}

func mapError(err error) (status int, code string, message string) {
    switch {
    // Not found
    case errors.Is(err, domainerror.ErrUserNotFound):
        return fiber.StatusNotFound, "USER_NOT_FOUND", err.Error()
    case errors.Is(err, domainerror.ErrMapNotFound):
        return fiber.StatusNotFound, "MAP_NOT_FOUND", err.Error()

    // Conflict
    case errors.Is(err, domainerror.ErrUserEmailExists):
        return fiber.StatusConflict, "EMAIL_EXISTS", err.Error()

    // Auth
    case errors.Is(err, domainerror.ErrInvalidCredentials):
        return fiber.StatusUnauthorized, "INVALID_CREDENTIALS", err.Error()
    case errors.Is(err, domainerror.ErrUnauthorized):
        return fiber.StatusUnauthorized, "UNAUTHORIZED", err.Error()
    case errors.Is(err, domainerror.ErrForbidden):
        return fiber.StatusForbidden, "FORBIDDEN", err.Error()

    // Business rules
    case errors.Is(err, domainerror.ErrMapLimitExceeded):
        return fiber.StatusForbidden, "MAP_LIMIT_EXCEEDED", err.Error()

    default:
        return fiber.StatusInternalServerError, "INTERNAL_ERROR", "An internal error occurred"
    }
}
```

---

## Router

```go
// internal/adapter/http/router/router.go
package router

func Setup(
    app *fiber.App,
    authService service.AuthService,
    authHandler *handler.AuthHandler,
    userHandler *handler.UserHandler,
    mapHandler *handler.MapHandler,
    nodeHandler *handler.NodeHandler,
    edgeHandler *handler.EdgeHandler,
    // ...
) {
    // Global middleware
    app.Use(middleware.RequestIDMiddleware())
    app.Use(middleware.RecoverMiddleware())

    // Health checks (no auth)
    app.Get("/health", healthHandler.Health)
    app.Get("/ready", healthHandler.Ready)

    // API v1
    api := app.Group("/api/v1")

    // Auth routes (no auth required)
    auth := api.Group("/auth")
    auth.Post("/register", authHandler.Register)
    auth.Post("/login", middleware.RateLimitMiddleware(5, 15*time.Minute), authHandler.Login)
    auth.Post("/refresh", authHandler.Refresh)
    auth.Post("/forgot-password", authHandler.ForgotPassword)
    auth.Post("/reset-password", authHandler.ResetPassword)

    // Protected routes
    protected := api.Group("", middleware.AuthMiddleware(authService))

    protected.Post("/auth/logout", authHandler.Logout)

    // Users
    users := protected.Group("/users")
    users.Get("/me", userHandler.GetProfile)
    users.Patch("/me/profile", userHandler.UpdateProfile)
    users.Post("/me/avatar", userHandler.UploadAvatar)
    users.Delete("/me", userHandler.DeleteAccount)

    // Maps
    maps := protected.Group("/maps")
    maps.Get("/", mapHandler.List)
    maps.Post("/", mapHandler.Create)
    maps.Get("/:id", mapHandler.Get)
    maps.Get("/:id/full", mapHandler.GetFull)
    maps.Patch("/:id", mapHandler.Update)
    maps.Delete("/:id", mapHandler.Delete)

    // Nodes
    maps.Get("/:mapId/nodes", nodeHandler.List)
    maps.Post("/:mapId/nodes", nodeHandler.Create)

    // Edges
    maps.Get("/:mapId/edges", edgeHandler.List)
    maps.Post("/:mapId/edges", edgeHandler.Create)
}
```

---

## Repository Implementations

### User Repository (Postgres)

```go
// internal/adapter/repository/postgres/user.go
package postgres

type UserRepository struct {
    db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
    return &UserRepository{db: db}
}

type userRow struct {
    ID           uuid.UUID      `db:"id"`
    Email        string         `db:"email"`
    PasswordHash string         `db:"password_hash"`
    FirstName    sql.NullString `db:"first_name"`
    // ...
}

func (r *UserRepository) Create(ctx context.Context, user *entity.User) error {
    query := `
        INSERT INTO users (id, email, password_hash, first_name, ...)
        VALUES ($1, $2, $3, $4, ...)
    `
    _, err := r.db.ExecContext(ctx, query,
        user.ID,
        user.Email.String(),
        string(user.Password),
        // ...
    )
    return err
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
    var row userRow
    query := `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`

    err := r.db.GetContext(ctx, &row, query, id)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, domainerror.ErrUserNotFound
        }
        return nil, err
    }

    return rowToUser(&row)
}

func (r *UserRepository) GetByEmail(ctx context.Context, email valueobject.Email) (*entity.User, error) {
    var row userRow
    query := `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`

    err := r.db.GetContext(ctx, &row, query, email.String())
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, domainerror.ErrUserNotFound
        }
        return nil, err
    }

    return rowToUser(&row)
}

func (r *UserRepository) ExistsByEmail(ctx context.Context, email valueobject.Email) (bool, error) {
    var exists bool
    query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL)`
    err := r.db.GetContext(ctx, &exists, query, email.String())
    return exists, err
}

// Update, SoftDelete — реализуются аналогично другим методам

func rowToUser(row *userRow) (*entity.User, error) {
    return &entity.User{
        ID:        row.ID,
        Email:     valueobject.Email(row.Email),
        Password:  valueobject.HashedPassword(row.PasswordHash),
        FirstName: row.FirstName.String,
        // ...
    }, nil
}
```

---

## Правила

1. **Handlers** только парсят request и вызывают Use Case
2. **Middleware** для cross-cutting concerns (auth, logging, rate limit)
3. **Repository** маппит между domain entities и database rows
4. **Response helpers** для консистентного API формата
5. **Domain errors** маппятся на HTTP status codes
