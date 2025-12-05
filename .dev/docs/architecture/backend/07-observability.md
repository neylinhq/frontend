# Observability

Observability включает tracing, metrics, logging и health checks.

---

## OpenTelemetry Tracing

```go
// internal/infrastructure/observability/tracing.go
package observability

import (
    "context"

    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
    "go.opentelemetry.io/otel/propagation"
    "go.opentelemetry.io/otel/sdk/resource"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
    semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
    "go.opentelemetry.io/otel/trace"
)

type TracerProvider struct {
    provider *sdktrace.TracerProvider
    tracer   trace.Tracer
}

func NewTracerProvider(cfg config.ObservabilityConfig) (*TracerProvider, error) {
    if !cfg.TracingEnabled {
        return &TracerProvider{tracer: otel.Tracer(cfg.ServiceName)}, nil
    }

    ctx := context.Background()

    // Create OTLP exporter
    exporter, err := otlptracegrpc.New(ctx,
        otlptracegrpc.WithEndpoint(cfg.TracingEndpoint),
        otlptracegrpc.WithInsecure(),
    )
    if err != nil {
        return nil, err
    }

    // Create resource with service info
    res, _ := resource.New(ctx,
        resource.WithAttributes(
            semconv.ServiceName(cfg.ServiceName),
            semconv.ServiceVersion(cfg.ServiceVersion),
            semconv.DeploymentEnvironment(cfg.Environment),
        ),
    )

    // Create sampler
    var sampler sdktrace.Sampler
    switch cfg.TracingSampler {
    case "always_on":
        sampler = sdktrace.AlwaysSample()
    case "always_off":
        sampler = sdktrace.NeverSample()
    default:
        sampler = sdktrace.ParentBased(
            sdktrace.TraceIDRatioBased(cfg.TracingSampleRate),
        )
    }

    // Create trace provider
    provider := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter),
        sdktrace.WithResource(res),
        sdktrace.WithSampler(sampler),
    )

    otel.SetTracerProvider(provider)
    otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
        propagation.TraceContext{},
        propagation.Baggage{},
    ))

    return &TracerProvider{provider: provider, tracer: provider.Tracer(cfg.ServiceName)}, nil
}

// Span helpers
func StartSpan(ctx context.Context, name string, opts ...trace.SpanStartOption) (context.Context, trace.Span) {
    return otel.Tracer("neylin").Start(ctx, name, opts...)
}

func AddSpanAttributes(ctx context.Context, attrs ...attribute.KeyValue) {
    trace.SpanFromContext(ctx).SetAttributes(attrs...)
}

func RecordSpanError(ctx context.Context, err error) {
    trace.SpanFromContext(ctx).RecordError(err)
}

// Common attributes
var (
    AttrUserID    = attribute.Key("user.id")
    AttrMapID     = attribute.Key("map.id")
    AttrRequestID = attribute.Key("request.id")
    AttrCacheHit  = attribute.Key("cache.hit")
)
```

---

## Prometheus Metrics

```go
// internal/infrastructure/observability/metrics.go
package observability

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
)

// HTTP metrics
var (
    HTTPRequestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "neylin_http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )

    HTTPRequestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "neylin_http_request_duration_seconds",
            Help:    "HTTP request duration in seconds",
            Buckets: []float64{.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10},
        },
        []string{"method", "endpoint"},
    )

    HTTPActiveRequests = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "neylin_http_active_requests",
            Help: "Number of active HTTP requests",
        },
    )
)

// Database metrics
var (
    DBQueryTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "neylin_db_queries_total",
            Help: "Total number of database queries",
        },
        []string{"operation", "table", "status"},
    )

    DBQueryDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "neylin_db_query_duration_seconds",
            Help:    "Database query duration in seconds",
            Buckets: []float64{.001, .005, .01, .025, .05, .1, .25, .5, 1},
        },
        []string{"operation", "table"},
    )

    DBConnectionsActive = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "neylin_db_connections_active",
            Help: "Number of active database connections",
        },
    )
)

// Redis metrics
var (
    RedisOperationsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "neylin_redis_operations_total",
            Help: "Total number of Redis operations",
        },
        []string{"operation", "status"},
    )

    RedisCacheHits = promauto.NewCounter(
        prometheus.CounterOpts{
            Name: "neylin_redis_cache_hits_total",
            Help: "Total number of cache hits",
        },
    )

    RedisCacheMisses = promauto.NewCounter(
        prometheus.CounterOpts{
            Name: "neylin_redis_cache_misses_total",
            Help: "Total number of cache misses",
        },
    )
)

// Business metrics
var (
    MapsCreatedTotal = promauto.NewCounter(
        prometheus.CounterOpts{
            Name: "neylin_maps_created_total",
            Help: "Total number of maps created",
        },
    )

    NodesCreatedTotal = promauto.NewCounter(
        prometheus.CounterOpts{
            Name: "neylin_nodes_created_total",
            Help: "Total number of nodes created",
        },
    )

    AIRequestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "neylin_ai_requests_total",
            Help: "Total number of AI requests",
        },
        []string{"provider", "model", "status"},
    )

    AIRequestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "neylin_ai_request_duration_seconds",
            Help:    "AI request duration in seconds",
            Buckets: []float64{1, 2, 5, 10, 20, 30, 60, 120},
        },
        []string{"provider", "model"},
    )

    SubscriptionsByPlan = promauto.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "neylin_subscriptions_by_plan",
            Help: "Number of subscriptions by plan type",
        },
        []string{"plan"},
    )
)

// Rate limiting & circuit breaker
var (
    RateLimitHits = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "neylin_rate_limit_hits_total",
            Help: "Total number of rate limit hits",
        },
        []string{"layer", "endpoint"},
    )

    CircuitBreakerState = promauto.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "neylin_circuit_breaker_state",
            Help: "Circuit breaker state (0=closed, 1=open, 2=half-open)",
        },
        []string{"service"},
    )
)
```

---

## Structured Logging

```go
// internal/infrastructure/observability/logger.go
package observability

import (
    "context"

    "go.opentelemetry.io/otel/trace"
    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"
)

type Logger struct {
    *zap.Logger
}

func NewLogger(cfg config.ObservabilityConfig) (*Logger, error) {
    var zapConfig zap.Config

    if cfg.Environment == "production" {
        zapConfig = zap.NewProductionConfig()
    } else {
        zapConfig = zap.NewDevelopmentConfig()
        zapConfig.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
    }

    level, _ := zapcore.ParseLevel(cfg.LogLevel)
    zapConfig.Level = zap.NewAtomicLevelAt(level)

    if cfg.LogFormat == "json" {
        zapConfig.Encoding = "json"
    } else {
        zapConfig.Encoding = "console"
    }

    zapConfig.InitialFields = map[string]interface{}{
        "service": cfg.ServiceName,
        "version": cfg.ServiceVersion,
        "env":     cfg.Environment,
    }

    logger, err := zapConfig.Build(
        zap.AddCaller(),
        zap.AddStacktrace(zapcore.ErrorLevel),
    )
    if err != nil {
        return nil, err
    }

    return &Logger{Logger: logger}, nil
}

// WithContext adds trace context to logger
func (l *Logger) WithContext(ctx context.Context) *zap.Logger {
    span := trace.SpanFromContext(ctx)
    if !span.SpanContext().IsValid() {
        return l.Logger
    }

    return l.Logger.With(
        zap.String("trace_id", span.SpanContext().TraceID().String()),
        zap.String("span_id", span.SpanContext().SpanID().String()),
    )
}

// Field helpers
func RequestFields(method, path, ip, userAgent string) []zap.Field {
    return []zap.Field{
        zap.String("method", method),
        zap.String("path", path),
        zap.String("ip", ip),
        zap.String("user_agent", userAgent),
    }
}

func ResponseFields(status int, duration float64, size int) []zap.Field {
    return []zap.Field{
        zap.Int("status", status),
        zap.Float64("duration_ms", duration),
        zap.Int("response_size", size),
    }
}

func ErrorFields(err error, code string) []zap.Field {
    return []zap.Field{
        zap.Error(err),
        zap.String("error_code", code),
    }
}
```

---

## Middleware

### Metrics Middleware

```go
// internal/adapter/http/middleware/metrics.go
package middleware

func MetricsMiddleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        start := time.Now()

        observability.HTTPActiveRequests.Inc()
        defer observability.HTTPActiveRequests.Dec()

        endpoint := c.Route().Path
        method := c.Method()

        err := c.Next()

        duration := time.Since(start).Seconds()
        status := strconv.Itoa(c.Response().StatusCode())

        observability.HTTPRequestsTotal.WithLabelValues(method, endpoint, status).Inc()
        observability.HTTPRequestDuration.WithLabelValues(method, endpoint).Observe(duration)

        return err
    }
}
```

### Tracing Middleware

```go
// internal/adapter/http/middleware/tracing.go
package middleware

func TracingMiddleware(serviceName string) fiber.Handler {
    tracer := otel.Tracer(serviceName)
    propagator := otel.GetTextMapPropagator()

    return func(c *fiber.Ctx) error {
        ctx := propagator.Extract(c.Context(), propagation.HeaderCarrier(c.GetReqHeaders()))

        spanName := c.Method() + " " + c.Route().Path
        ctx, span := tracer.Start(ctx, spanName,
            trace.WithSpanKind(trace.SpanKindServer),
            trace.WithAttributes(
                semconv.HTTPMethod(c.Method()),
                semconv.HTTPRoute(c.Route().Path),
                attribute.String("http.client_ip", c.IP()),
            ),
        )
        defer span.End()

        c.SetUserContext(ctx)

        if span.SpanContext().IsValid() {
            c.Set("X-Trace-ID", span.SpanContext().TraceID().String())
        }

        err := c.Next()

        span.SetAttributes(semconv.HTTPStatusCode(c.Response().StatusCode()))
        if err != nil {
            span.RecordError(err)
        }

        return err
    }
}
```

---

## Health Checks

```go
// internal/adapter/http/handler/health.go
package handler

type HealthHandler struct {
    db      *sqlx.DB
    redis   redis.Cmdable
    version string
}

type HealthResponse struct {
    Status    string           `json:"status"`
    Version   string           `json:"version"`
    Timestamp string           `json:"timestamp"`
    Checks    map[string]Check `json:"checks"`
}

type Check struct {
    Status   string `json:"status"`
    Duration string `json:"duration,omitempty"`
    Error    string `json:"error,omitempty"`
}

// GET /health/live - Liveness probe
func (h *HealthHandler) Liveness(c *fiber.Ctx) error {
    return c.JSON(fiber.Map{"status": "ok"})
}

// GET /health/ready - Readiness probe
func (h *HealthHandler) Readiness(c *fiber.Ctx) error {
    ctx, cancel := context.WithTimeout(c.Context(), 5*time.Second)
    defer cancel()

    checks := make(map[string]Check)
    overallStatus := "healthy"

    // Check PostgreSQL
    dbCheck := h.checkDB(ctx)
    checks["postgresql"] = dbCheck
    if dbCheck.Status != "healthy" {
        overallStatus = "unhealthy"
    }

    // Check Redis
    redisCheck := h.checkRedis(ctx)
    checks["redis"] = redisCheck
    if redisCheck.Status != "healthy" {
        overallStatus = "unhealthy"
    }

    response := HealthResponse{
        Status:    overallStatus,
        Version:   h.version,
        Timestamp: time.Now().UTC().Format(time.RFC3339),
        Checks:    checks,
    }

    if overallStatus == "unhealthy" {
        return c.Status(fiber.StatusServiceUnavailable).JSON(response)
    }

    return c.JSON(response)
}

func (h *HealthHandler) checkDB(ctx context.Context) Check {
    start := time.Now()
    if err := h.db.PingContext(ctx); err != nil {
        return Check{Status: "unhealthy", Duration: time.Since(start).String(), Error: err.Error()}
    }
    return Check{Status: "healthy", Duration: time.Since(start).String()}
}

func (h *HealthHandler) checkRedis(ctx context.Context) Check {
    start := time.Now()
    if err := h.redis.Ping(ctx).Err(); err != nil {
        return Check{Status: "unhealthy", Duration: time.Since(start).String(), Error: err.Error()}
    }
    return Check{Status: "healthy", Duration: time.Since(start).String()}
}

// GET /health/metrics - Detailed metrics
func (h *HealthHandler) Metrics(c *fiber.Ctx) error {
    dbStats := h.db.Stats()
    redisInfo, _ := h.redis.Info(c.Context(), "clients", "memory").Result()

    return c.JSON(fiber.Map{
        "database": fiber.Map{
            "open_connections": dbStats.OpenConnections,
            "in_use":           dbStats.InUse,
            "idle":             dbStats.Idle,
        },
        "redis": redisInfo,
    })
}
```

---

## Правила

1. **Trace ID** в каждом response header
2. **Metrics** для всех HTTP endpoints, DB queries, Redis operations
3. **Structured logging** с trace context
4. **Health checks**: liveness (simple) + readiness (full dependency check)
5. **Sampling** для production tracing (не 100%)
