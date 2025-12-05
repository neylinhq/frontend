# Infrastructure Layer

Infrastructure layer содержит конфигурацию, подключения к БД, внешние сервисы и DI.

---

## Configuration

```go
// internal/infrastructure/config/config.go
package config

import (
    "time"
    "github.com/kelseyhightower/envconfig"
)

type Config struct {
    App      AppConfig
    Database DatabaseConfig
    Redis    RedisConfig
    JWT      JWTConfig
    Stripe   StripeConfig
    AI       AIConfig
    S3       S3Config
    SMTP     SMTPConfig
    Log      LogConfig
}

type AppConfig struct {
    Env         string `envconfig:"APP_ENV" default:"development"`
    Port        int    `envconfig:"APP_PORT" default:"8080"`
    Host        string `envconfig:"APP_HOST" default:"0.0.0.0"`
    CORSOrigins string `envconfig:"CORS_ORIGINS" default:"http://localhost:3000"`
}

type DatabaseConfig struct {
    URL            string `envconfig:"DATABASE_URL" required:"true"`
    MaxConnections int    `envconfig:"DATABASE_MAX_CONNECTIONS" default:"50"`
}

type RedisConfig struct {
    URL string `envconfig:"REDIS_URL" required:"true"`
}

type JWTConfig struct {
    PrivateKeyPath  string        `envconfig:"JWT_PRIVATE_KEY_PATH" required:"true"`
    PublicKeyPath   string        `envconfig:"JWT_PUBLIC_KEY_PATH" required:"true"`
    AccessTokenTTL  time.Duration `envconfig:"JWT_ACCESS_TOKEN_TTL" default:"15m"`
    RefreshTokenTTL time.Duration `envconfig:"JWT_REFRESH_TOKEN_TTL" default:"720h"`
}

type StripeConfig struct {
    SecretKey     string `envconfig:"STRIPE_SECRET_KEY" required:"true"`
    WebhookSecret string `envconfig:"STRIPE_WEBHOOK_SECRET" required:"true"`
}

type AIConfig struct {
    OpenAIAPIKey    string        `envconfig:"OPENAI_API_KEY"`
    AnthropicAPIKey string        `envconfig:"ANTHROPIC_API_KEY"`
    DefaultModel    string        `envconfig:"AI_DEFAULT_MODEL" default:"gpt-3.5-turbo"`
    RequestTimeout  time.Duration `envconfig:"AI_REQUEST_TIMEOUT" default:"60s"`
}

type S3Config struct {
    Endpoint       string `envconfig:"S3_ENDPOINT" required:"true"`
    Region         string `envconfig:"S3_REGION" default:"auto"`
    AccessKey      string `envconfig:"S3_ACCESS_KEY" required:"true"`
    SecretKey      string `envconfig:"S3_SECRET_KEY" required:"true"`
    BucketAvatars  string `envconfig:"S3_BUCKET_AVATARS" default:"neylin-avatars"`
    BucketPreviews string `envconfig:"S3_BUCKET_PREVIEWS" default:"neylin-previews"`
}

type SMTPConfig struct {
    Host     string `envconfig:"SMTP_HOST"`
    Port     int    `envconfig:"SMTP_PORT" default:"587"`
    User     string `envconfig:"SMTP_USER"`
    Password string `envconfig:"SMTP_PASSWORD"`
    From     string `envconfig:"EMAIL_FROM" default:"noreply@neylin.io"`
}

type LogConfig struct {
    Level  string `envconfig:"LOG_LEVEL" default:"info"`
    Format string `envconfig:"LOG_FORMAT" default:"json"`
}

func Load() (*Config, error) {
    var cfg Config
    err := envconfig.Process("", &cfg)
    if err != nil {
        return nil, err
    }
    return &cfg, nil
}
```

---

## Database Setup

### PostgreSQL

```go
// internal/infrastructure/database/postgres.go
package database

import (
    "context"
    "time"

    "github.com/jmoiron/sqlx"
    _ "github.com/lib/pq"
    "neylin/internal/infrastructure/config"
)

func NewPostgres(cfg config.DatabaseConfig) (*sqlx.DB, error) {
    db, err := sqlx.Connect("postgres", cfg.URL)
    if err != nil {
        return nil, err
    }

    db.SetMaxOpenConns(cfg.MaxConnections)
    db.SetMaxIdleConns(cfg.MaxConnections / 2)
    db.SetConnMaxLifetime(time.Hour)

    // Verify connection
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := db.PingContext(ctx); err != nil {
        return nil, err
    }

    return db, nil
}
```

### Redis

```go
// internal/infrastructure/database/redis.go
package database

import (
    "context"
    "time"

    "github.com/redis/go-redis/v9"
    "neylin/internal/infrastructure/config"
)

func NewRedis(cfg config.RedisConfig) (*redis.Client, error) {
    opts, err := redis.ParseURL(cfg.URL)
    if err != nil {
        return nil, err
    }

    client := redis.NewClient(opts)

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := client.Ping(ctx).Err(); err != nil {
        return nil, err
    }

    return client, nil
}
```

---

## JWT Implementation

```go
// internal/infrastructure/auth/jwt.go
package auth

import (
    "crypto/rsa"
    "os"
    "time"

    "github.com/golang-jwt/jwt/v5"
    "github.com/google/uuid"
    "golang.org/x/crypto/bcrypt"
    "neylin/internal/application/port/service"
    "neylin/internal/domain/entity"
    "neylin/internal/domain/valueobject"
    "neylin/internal/infrastructure/config"
)

type JWTService struct {
    privateKey      *rsa.PrivateKey
    publicKey       *rsa.PublicKey
    accessTokenTTL  time.Duration
    refreshTokenTTL time.Duration
}

func NewJWTService(cfg config.JWTConfig) (*JWTService, error) {
    privateKeyData, err := os.ReadFile(cfg.PrivateKeyPath)
    if err != nil {
        return nil, err
    }
    privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(privateKeyData)
    if err != nil {
        return nil, err
    }

    publicKeyData, err := os.ReadFile(cfg.PublicKeyPath)
    if err != nil {
        return nil, err
    }
    publicKey, err := jwt.ParseRSAPublicKeyFromPEM(publicKeyData)
    if err != nil {
        return nil, err
    }

    return &JWTService{
        privateKey:      privateKey,
        publicKey:       publicKey,
        accessTokenTTL:  cfg.AccessTokenTTL,
        refreshTokenTTL: cfg.RefreshTokenTTL,
    }, nil
}

func (s *JWTService) HashPassword(password valueobject.Password) (valueobject.HashedPassword, error) {
    hash, err := bcrypt.GenerateFromPassword([]byte(password.String()), 12)
    if err != nil {
        return "", err
    }
    return valueobject.HashedPassword(hash), nil
}

func (s *JWTService) VerifyPassword(hashed valueobject.HashedPassword, plain valueobject.Password) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hashed), []byte(plain.String()))
    return err == nil
}

func (s *JWTService) GenerateAccessToken(user *entity.User) (string, error) {
    claims := jwt.MapClaims{
        "sub":   user.ID.String(),
        "email": user.Email.String(),
        "role":  string(user.Role),
        "exp":   time.Now().Add(s.accessTokenTTL).Unix(),
        "iat":   time.Now().Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
    return token.SignedString(s.privateKey)
}

func (s *JWTService) GenerateRefreshToken() (string, error) {
    return uuid.New().String(), nil
}

func (s *JWTService) ValidateAccessToken(tokenString string) (*service.TokenClaims, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
            return nil, jwt.ErrSignatureInvalid
        }
        return s.publicKey, nil
    })

    if err != nil {
        return nil, err
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok || !token.Valid {
        return nil, jwt.ErrSignatureInvalid
    }

    userID, err := uuid.Parse(claims["sub"].(string))
    if err != nil {
        return nil, err
    }

    return &service.TokenClaims{
        UserID: userID,
        Email:  claims["email"].(string),
        Role:   entity.Role(claims["role"].(string)),
    }, nil
}

func (s *JWTService) HashRefreshToken(token string) string {
    hash, _ := bcrypt.GenerateFromPassword([]byte(token), 10)
    return string(hash)
}
```

---

## External Services

### OpenAI Client

```go
// internal/infrastructure/external/openai/client.go
package openai

import (
    "context"

    "github.com/sashabaranov/go-openai"
    "neylin/internal/domain/entity"
    "neylin/internal/infrastructure/config"
)

type Client struct {
    client *openai.Client
    config config.AIConfig
}

func NewClient(cfg config.AIConfig) *Client {
    return &Client{
        client: openai.NewClient(cfg.OpenAIAPIKey),
        config: cfg,
    }
}

func (c *Client) AnalyzeMap(ctx context.Context, fullMap *entity.FullMap, model string) (*entity.AIAnalysis, error) {
    prompt := buildAnalysisPrompt(fullMap)

    resp, err := c.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
        Model: model,
        Messages: []openai.ChatCompletionMessage{
            {Role: openai.ChatMessageRoleSystem, Content: "You are an expert knowledge graph analyst..."},
            {Role: openai.ChatMessageRoleUser, Content: prompt},
        },
    })

    if err != nil {
        return nil, err
    }

    return parseAnalysisResponse(resp.Choices[0].Message.Content)
}
```

### Stripe Client

```go
// internal/infrastructure/external/stripe/client.go
package stripe

import (
    "github.com/stripe/stripe-go/v76"
    "github.com/stripe/stripe-go/v76/checkout/session"
    "github.com/stripe/stripe-go/v76/customer"
    "neylin/internal/infrastructure/config"
)

type Client struct {
    config config.StripeConfig
}

func NewClient(cfg config.StripeConfig) *Client {
    stripe.Key = cfg.SecretKey
    return &Client{config: cfg}
}

func (c *Client) CreateCustomer(email, name string) (*stripe.Customer, error) {
    params := &stripe.CustomerParams{
        Email: stripe.String(email),
        Name:  stripe.String(name),
    }
    return customer.New(params)
}

func (c *Client) CreateCheckoutSession(customerID, priceID, successURL, cancelURL string) (*stripe.CheckoutSession, error) {
    params := &stripe.CheckoutSessionParams{
        Customer:   stripe.String(customerID),
        Mode:       stripe.String(string(stripe.CheckoutSessionModeSubscription)),
        SuccessURL: stripe.String(successURL),
        CancelURL:  stripe.String(cancelURL),
        LineItems: []*stripe.CheckoutSessionLineItemParams{
            {Price: stripe.String(priceID), Quantity: stripe.Int64(1)},
        },
    }
    return session.New(params)
}
```

---

## Dependency Injection (Wire)

```go
// cmd/server/wire.go
//go:build wireinject
// +build wireinject

package main

import (
    "github.com/google/wire"
    "neylin/internal/adapter/http/handler"
    "neylin/internal/adapter/repository/postgres"
    "neylin/internal/application/usecase/auth"
    mapuc "neylin/internal/application/usecase/map"
    "neylin/internal/infrastructure/config"
    "neylin/internal/infrastructure/database"
    infraAuth "neylin/internal/infrastructure/auth"
)

func InitializeApp(cfg *config.Config) (*App, error) {
    wire.Build(
        // Database
        database.NewPostgres,
        database.NewRedis,

        // Repositories
        postgres.NewUserRepository,
        postgres.NewMapRepository,
        postgres.NewNodeRepository,
        postgres.NewEdgeRepository,
        postgres.NewSubscriptionRepository,

        // External Services
        infraAuth.NewJWTService,
        stripe.NewClient,
        openai.NewClient,

        // Use Cases
        auth.NewRegisterUseCase,
        auth.NewLoginUseCase,
        auth.NewLogoutUseCase,
        mapuc.NewCreateMapUseCase,
        mapuc.NewGetMapUseCase,
        // ... other use cases

        // Handlers
        handler.NewAuthHandler,
        handler.NewUserHandler,
        handler.NewMapHandler,
        handler.NewNodeHandler,

        // Router
        router.Setup,

        // App
        NewApp,
    )
    return nil, nil // Wire генерирует реальную реализацию
}
```

---

## Main Entry Point

```go
// cmd/server/main.go
package main

import (
    "context"
    "os"
    "os/signal"
    "syscall"
    "time"

    "go.uber.org/zap"
    "neylin/internal/infrastructure/config"
)

func main() {
    // Load config
    cfg, err := config.Load()
    if err != nil {
        panic(err)
    }

    // Initialize logger
    logger, _ := zap.NewProduction()
    if cfg.App.Env == "development" {
        logger, _ = zap.NewDevelopment()
    }
    defer logger.Sync()

    // Initialize app with Wire
    app, err := InitializeApp(cfg)
    if err != nil {
        logger.Fatal("failed to initialize app", zap.Error(err))
    }

    // Start server in goroutine
    go func() {
        if err := app.Start(); err != nil {
            logger.Fatal("failed to start server", zap.Error(err))
        }
    }()

    logger.Info("server started",
        zap.String("env", cfg.App.Env),
        zap.Int("port", cfg.App.Port),
    )

    // Graceful shutdown
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    logger.Info("shutting down server...")

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := app.Shutdown(ctx); err != nil {
        logger.Error("server forced to shutdown", zap.Error(err))
    }

    logger.Info("server exited")
}
```

---

## Правила

1. **Конфигурация** через environment variables с defaults
2. **Connection pooling** для всех БД подключений
3. **Graceful shutdown** с timeout
4. **Wire** для compile-time dependency injection
5. **RSA keys** для JWT (асимметричное шифрование)
6. **External services** обёрнуты в adapters
