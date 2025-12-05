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

```go
// internal/adapter/http/response/response.go
package response

type Response struct {
    Data interface{} `json:"data,omitempty"`
    Meta Meta        `json:"meta"`
}

type Meta struct {
    Timestamp time.Time `json:"timestamp"`
}

type ErrorResponse struct {
    Error ErrorBody `json:"error"`
}

type ErrorBody struct {
    Code    string            `json:"code"`
    Message string            `json:"message"`
    Details map[string]string `json:"details,omitempty"`
}

func Success(data interface{}) Response {
    return Response{
        Data: data,
        Meta: Meta{Timestamp: time.Now()},
    }
}

func BadRequest(c *fiber.Ctx, message string) error {
    return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
        Error: ErrorBody{Code: "BAD_REQUEST", Message: message},
    })
}

func Unauthorized(c *fiber.Ctx, message string) error {
    return c.Status(fiber.StatusUnauthorized).JSON(ErrorResponse{
        Error: ErrorBody{Code: "UNAUTHORIZED", Message: message},
    })
}

func FromDomainError(c *fiber.Ctx, err error) error {
    code, status := mapDomainError(err)
    return c.Status(status).JSON(ErrorResponse{
        Error: ErrorBody{Code: code, Message: err.Error()},
    })
}

func mapDomainError(err error) (string, int) {
    switch err {
    case domainerror.ErrUserNotFound:
        return "USER_NOT_FOUND", fiber.StatusNotFound
    case domainerror.ErrUserEmailExists:
        return "USER_EMAIL_EXISTS", fiber.StatusConflict
    case domainerror.ErrInvalidCredentials:
        return "AUTH_INVALID_CREDENTIALS", fiber.StatusUnauthorized
    case domainerror.ErrMapNotFound:
        return "MAP_NOT_FOUND", fiber.StatusNotFound
    case domainerror.ErrMapLimitExceeded:
        return "MAP_LIMIT_EXCEEDED", fiber.StatusUnprocessableEntity
    case domainerror.ErrForbidden:
        return "FORBIDDEN", fiber.StatusForbidden
    default:
        return "INTERNAL_ERROR", fiber.StatusInternalServerError
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
