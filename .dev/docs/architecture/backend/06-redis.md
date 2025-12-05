# Redis Architecture

Redis используется для sessions, caching, rate limiting, distributed locks и pub/sub.

---

## Используемые типы

```go
// internal/infrastructure/redis/types.go
package redis

import (
    "context"
    "time"

    "github.com/redis/go-redis/v9"
)

// RedisClient интерфейс для работы с Redis
// Реализуется *redis.Client, *redis.ClusterClient, *redis.Ring
type RedisClient interface {
    Get(ctx context.Context, key string) *redis.StringCmd
    Set(ctx context.Context, key string, value interface{}, expiration time.Duration) *redis.StatusCmd
    SetNX(ctx context.Context, key string, value interface{}, expiration time.Duration) *redis.BoolCmd
    Del(ctx context.Context, keys ...string) *redis.IntCmd
    Expire(ctx context.Context, key string, expiration time.Duration) *redis.BoolCmd

    // Hash operations
    HSet(ctx context.Context, key string, values ...interface{}) *redis.IntCmd
    HGet(ctx context.Context, key string, field string) *redis.StringCmd
    HGetAll(ctx context.Context, key string) *redis.MapStringStringCmd
    HMGET(ctx context.Context, key string, fields ...string) *redis.SliceCmd

    // Set operations
    SMembers(ctx context.Context, key string) *redis.StringSliceCmd
    SAdd(ctx context.Context, key string, members ...interface{}) *redis.IntCmd

    // Pub/Sub
    Publish(ctx context.Context, channel string, message interface{}) *redis.IntCmd
    Subscribe(ctx context.Context, channels ...string) *redis.PubSub

    // Scripting
    Eval(ctx context.Context, script string, keys []string, args ...interface{}) *redis.Cmd
    EvalSha(ctx context.Context, sha1 string, keys []string, args ...interface{}) *redis.Cmd
}
```

---

## Key Naming Convention

**Pattern**: `neylin:{env}:{type}:{id}:{subkey}`

| Prefix | Purpose | TTL | Example |
|--------|---------|-----|---------|
| `session` | User sessions | 720h | `neylin:prod:session:usr_01HX...` |
| `rate` | Rate limit buckets | 1h | `neylin:prod:rate:ip:192.168.1.1` |
| `cache` | Data cache | varies | `neylin:prod:cache:map:map_01HX...` |
| `lock` | Distributed locks | 30s | `neylin:prod:lock:map:map_01HX...` |
| `idempotency` | Idempotency keys | 24h | `neylin:prod:idempotency:req_01HX...` |
| `queue` | Background jobs | - | `neylin:prod:queue:ai:analyze` |
| `pubsub` | Real-time events | - | `neylin:prod:pubsub:map:map_01HX...` |
| `circuit` | Circuit breaker state | 5m | `neylin:prod:circuit:stripe` |

```go
// internal/infrastructure/redis/keys.go
package redis

type KeyBuilder struct {
    prefix string
}

func NewKeyBuilder() *KeyBuilder {
    return &KeyBuilder{prefix: fmt.Sprintf("neylin:%s", env)}
}

func (k *KeyBuilder) Session(userID string) string {
    return fmt.Sprintf("%s:session:%s", k.prefix, userID)
}

func (k *KeyBuilder) RateIP(ip string) string {
    return fmt.Sprintf("%s:rate:ip:%s", k.prefix, ip)
}

func (k *KeyBuilder) CacheMap(mapID string) string {
    return fmt.Sprintf("%s:cache:map:%s", k.prefix, mapID)
}

func (k *KeyBuilder) LockMap(mapID string) string {
    return fmt.Sprintf("%s:lock:map:%s", k.prefix, mapID)
}
```

---

## Session Management

```go
// internal/infrastructure/redis/session.go
package redis

type SessionData struct {
    UserID       string    `json:"user_id"`
    Email        string    `json:"email"`
    Role         string    `json:"role"`
    DeviceID     string    `json:"device_id"`
    UserAgent    string    `json:"user_agent"`
    IP           string    `json:"ip"`
    CreatedAt    time.Time `json:"created_at"`
    LastActivity time.Time `json:"last_activity"`
}

type SessionManager struct {
    client RedisClient
    keys   *KeyBuilder
    ttl    time.Duration
}

func NewSessionManager(client RedisClient, ttl time.Duration) *SessionManager {
    return &SessionManager{
        client: client,
        keys:   NewKeyBuilder(),
        ttl:    ttl,
    }
}

// CreateSession creates a new session for user
func (m *SessionManager) CreateSession(ctx context.Context, data *SessionData) error {
    key := m.keys.Session(data.UserID)
    jsonData, _ := json.Marshal(data)
    // Use HSET for multi-device support
    return m.client.HSet(ctx, key, data.DeviceID, jsonData).Err()
}

// GetAllSessions retrieves all active sessions for user
func (m *SessionManager) GetAllSessions(ctx context.Context, userID string) ([]*SessionData, error) {
    key := m.keys.Session(userID)
    results, err := m.client.HGetAll(ctx, key).Result()
    if err != nil {
        return nil, err
    }

    sessions := make([]*SessionData, 0, len(results))
    for _, jsonData := range results {
        var data SessionData
        if err := json.Unmarshal([]byte(jsonData), &data); err != nil {
            continue
        }
        sessions = append(sessions, &data)
    }
    return sessions, nil
}

// DeleteAllSessions removes all sessions for user (logout all devices)
func (m *SessionManager) DeleteAllSessions(ctx context.Context, userID string) error {
    return m.client.Del(ctx, m.keys.Session(userID)).Err()
}
```

---

## Rate Limiting

### Token Bucket Algorithm

```go
// internal/infrastructure/redis/ratelimit.go
package redis

import (
    "context"
    "time"

    "github.com/redis/go-redis/v9"
)

// Lua script for atomic token bucket
var tokenBucketScript = redis.NewScript(`
    local key = KEYS[1]
    local capacity = tonumber(ARGV[1])
    local refill_rate = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])
    local requested = tonumber(ARGV[4])

    local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
    local tokens = tonumber(bucket[1])
    local last_refill = tonumber(bucket[2])

    if tokens == nil then
        tokens = capacity
        last_refill = now
    end

    local elapsed = now - last_refill
    local refill = elapsed * refill_rate
    tokens = math.min(capacity, tokens + refill)

    local allowed = 0
    local remaining = tokens
    local retry_after = 0

    if tokens >= requested then
        tokens = tokens - requested
        allowed = 1
        remaining = tokens
    else
        retry_after = math.ceil((requested - tokens) / refill_rate)
    end

    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
    redis.call('EXPIRE', key, 3600)

    return {allowed, remaining, retry_after}
`)

type RateLimitResult struct {
    Allowed    bool
    Remaining  int
    RetryAfter int
    Limit      int
}

type RateLimiter struct {
    client RedisClient
    keys   *KeyBuilder
}

func (r *RateLimiter) CheckLimit(ctx context.Context, key string, capacity, refillRate int) (*RateLimitResult, error) {
    now := float64(time.Now().Unix())

    result, err := tokenBucketScript.Run(ctx, r.client, []string{key}, capacity, refillRate, now, 1).Int64Slice()
    if err != nil {
        return nil, err
    }

    return &RateLimitResult{
        Allowed:    result[0] == 1,
        Remaining:  int(result[1]),
        RetryAfter: int(result[2]),
        Limit:      capacity,
    }, nil
}
```

### Multi-layer Rate Limiting

```go
func (r *RateLimiter) CheckMultiLayer(ctx context.Context, ip, userID, endpoint string) (*RateLimitResult, string, error) {
    layers := []struct {
        key      string
        capacity int
        rate     int
        name     string
    }{
        {r.keys.RateGlobal(), 10000, 1000, "global"},
        {r.keys.RateIP(ip), 100, 10, "ip"},
    }

    if userID != "" {
        layers = append(layers,
            struct{ key string; capacity int; rate int; name string }{
                r.keys.RateUser(userID), 1000, 100, "user",
            },
            struct{ key string; capacity int; rate int; name string }{
                r.keys.RateEndpoint(userID, endpoint), 60, 6, "endpoint",
            },
        )
    }

    for _, layer := range layers {
        result, err := r.CheckLimit(ctx, layer.key, layer.capacity, layer.rate)
        if err != nil {
            return nil, "", err
        }
        if !result.Allowed {
            return result, layer.name, nil
        }
    }

    return &RateLimitResult{Allowed: true}, "", nil
}
```

---

## Distributed Locking

```go
// internal/infrastructure/redis/lock.go
package redis

import (
    "context"
    "errors"
    "time"

    "github.com/redis/go-redis/v9"
)

var (
    ErrLockNotAcquired = errors.New("lock not acquired")
    ErrLockNotOwned    = errors.New("lock not owned by this instance")
)

// Lua script for safe lock release
var releaseLockScript = redis.NewScript(`
    if redis.call('GET', KEYS[1]) == ARGV[1] then
        return redis.call('DEL', KEYS[1])
    end
    return 0
`)

type Lock struct {
    key    string
    token  string
    client RedisClient
    ttl    time.Duration
}

type LockManager struct {
    client RedisClient
    keys   *KeyBuilder
}

// AcquireLock attempts to acquire a distributed lock
func (m *LockManager) AcquireLock(ctx context.Context, key string, ttl time.Duration) (*Lock, error) {
    token := generateToken()

    acquired, err := m.client.SetNX(ctx, key, token, ttl).Result()
    if err != nil {
        return nil, err
    }

    if !acquired {
        return nil, ErrLockNotAcquired
    }

    return &Lock{key: key, token: token, client: m.client, ttl: ttl}, nil
}

// AcquireLockWithRetry attempts to acquire lock with retries
func (m *LockManager) AcquireLockWithRetry(ctx context.Context, key string, ttl time.Duration, maxRetries int, retryDelay time.Duration) (*Lock, error) {
    for i := 0; i < maxRetries; i++ {
        lock, err := m.AcquireLock(ctx, key, ttl)
        if err == nil {
            return lock, nil
        }
        if err != ErrLockNotAcquired {
            return nil, err
        }

        select {
        case <-ctx.Done():
            return nil, ctx.Err()
        case <-time.After(retryDelay):
        }
    }
    return nil, ErrLockNotAcquired
}

// Release releases the lock
func (l *Lock) Release(ctx context.Context) error {
    result, err := releaseLockScript.Run(ctx, l.client, []string{l.key}, l.token).Int64()
    if err != nil {
        return err
    }
    if result == 0 {
        return ErrLockNotOwned
    }
    return nil
}

// StartHeartbeat starts automatic lock extension
func (l *Lock) StartHeartbeat(ctx context.Context) {
    go func() {
        ticker := time.NewTicker(l.ttl / 3)
        defer ticker.Stop()

        for {
            select {
            case <-ctx.Done():
                return
            case <-ticker.C:
                if err := l.Extend(ctx, l.ttl); err != nil {
                    return
                }
            }
        }
    }()
}
```

---

## Cache Layer

```go
// internal/infrastructure/redis/cache.go
package redis

import (
    "context"
    "encoding/json"
    "time"

    "github.com/redis/go-redis/v9"
)

type CacheManager struct {
    client RedisClient
    keys   *KeyBuilder
}

// Cache TTL constants
const (
    CacheTTLShort  = 5 * time.Minute
    CacheTTLMedium = 30 * time.Minute
    CacheTTLLong   = 2 * time.Hour
    CacheTTLDay    = 24 * time.Hour
)

// Get retrieves item from cache
func (c *CacheManager) Get(ctx context.Context, key string, dest interface{}) (bool, error) {
    data, err := c.client.Get(ctx, key).Bytes()
    if err == redis.Nil {
        return false, nil
    }
    if err != nil {
        return false, err
    }
    return true, json.Unmarshal(data, dest)
}

// Set stores item in cache with TTL
func (c *CacheManager) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
    data, err := json.Marshal(value)
    if err != nil {
        return err
    }
    return c.client.Set(ctx, key, data, ttl).Err()
}

// GetOrSet implements cache-aside pattern
func (c *CacheManager) GetOrSet(ctx context.Context, key string, dest interface{}, ttl time.Duration, loader func() (interface{}, error)) error {
    found, err := c.Get(ctx, key, dest)
    if err != nil {
        return err
    }
    if found {
        return nil
    }

    value, err := loader()
    if err != nil {
        return err
    }

    _ = c.Set(ctx, key, value, ttl) // Log but don't fail on cache miss

    data, _ := json.Marshal(value)
    return json.Unmarshal(data, dest)
}

// InvalidateByTag removes all cache entries with given tag
func (c *CacheManager) InvalidateByTag(ctx context.Context, tag string) error {
    tagKey := c.keys.prefix + ":cache:tag:" + tag
    keys, _ := c.client.SMembers(ctx, tagKey).Result()
    if len(keys) > 0 {
        c.client.Del(ctx, keys...)
        c.client.Del(ctx, tagKey)
    }
    return nil
}
```

---

## Pub/Sub for Real-Time

```go
// internal/infrastructure/redis/pubsub.go
package redis

type EventType string

const (
    EventNodeCreated EventType = "node.created"
    EventNodeUpdated EventType = "node.updated"
    EventNodeDeleted EventType = "node.deleted"
    EventEdgeCreated EventType = "edge.created"
    EventMapAnalyzed EventType = "map.analyzed"
)

type Event struct {
    Type      EventType              `json:"type"`
    MapID     string                 `json:"map_id,omitempty"`
    EntityID  string                 `json:"entity_id,omitempty"`
    Data      map[string]interface{} `json:"data,omitempty"`
    Timestamp time.Time              `json:"timestamp"`
}

type PubSubManager struct {
    client RedisClient
    keys   *KeyBuilder
}

// PublishMapEvent publishes event to map channel
func (p *PubSubManager) PublishMapEvent(ctx context.Context, mapID string, event *Event) error {
    event.MapID = mapID
    event.Timestamp = time.Now()
    data, _ := json.Marshal(event)
    return p.client.Publish(ctx, p.keys.PubSubMapUpdates(mapID), data).Err()
}

// SubscribeToMap subscribes to map updates
func (p *PubSubManager) SubscribeToMap(ctx context.Context, mapID string) *Subscription {
    pubsub := p.client.Subscribe(ctx, p.keys.PubSubMapUpdates(mapID))
    return &Subscription{pubsub: pubsub}
}

type Subscription struct {
    pubsub *redis.PubSub
}

func (s *Subscription) Channel() <-chan *Event {
    ch := make(chan *Event, 100)

    go func() {
        defer close(ch)
        msgCh := s.pubsub.Channel()
        for msg := range msgCh {
            var event Event
            if err := json.Unmarshal([]byte(msg.Payload), &event); err != nil {
                continue
            }
            ch <- &event
        }
    }()

    return ch
}

func (s *Subscription) Close() error {
    return s.pubsub.Close()
}
```

---

## Idempotency Support

```go
// internal/infrastructure/redis/idempotency.go
package redis

import (
    "context"
    "encoding/json"

    "github.com/redis/go-redis/v9"
)

type IdempotencyResult struct {
    Status     string          `json:"status"` // "processing", "completed", "failed"
    Response   json.RawMessage `json:"response,omitempty"`
    StatusCode int             `json:"status_code,omitempty"`
}

type IdempotencyManager struct {
    client RedisClient
    keys   *KeyBuilder
    ttl    time.Duration
}

// Check checks if request was already processed
func (m *IdempotencyManager) Check(ctx context.Context, key string) (*IdempotencyResult, bool, error) {
    fullKey := m.keys.Idempotency(key)
    data, err := m.client.Get(ctx, fullKey).Bytes()
    if err == redis.Nil {
        return nil, false, nil
    }
    if err != nil {
        return nil, false, err
    }

    var result IdempotencyResult
    json.Unmarshal(data, &result)
    return &result, result.Status == "processing", nil
}

// Start marks request as being processed
func (m *IdempotencyManager) Start(ctx context.Context, key string) error {
    fullKey := m.keys.Idempotency(key)
    result := IdempotencyResult{Status: "processing"}
    data, _ := json.Marshal(result)

    set, err := m.client.SetNX(ctx, fullKey, data, m.ttl).Result()
    if err != nil {
        return err
    }
    if !set {
        return ErrLockNotAcquired
    }
    return nil
}

// Complete stores successful response
func (m *IdempotencyManager) Complete(ctx context.Context, key string, statusCode int, response interface{}) error {
    fullKey := m.keys.Idempotency(key)
    respData, _ := json.Marshal(response)
    result := IdempotencyResult{Status: "completed", Response: respData, StatusCode: statusCode}
    data, _ := json.Marshal(result)
    return m.client.Set(ctx, fullKey, data, m.ttl).Err()
}
```

---

## Circuit Breaker State

```go
// internal/infrastructure/redis/circuit.go
package redis

import (
    "context"
    "encoding/json"
    "time"

    "github.com/redis/go-redis/v9"
)

type CircuitState string

const (
    CircuitClosed   CircuitState = "closed"
    CircuitOpen     CircuitState = "open"
    CircuitHalfOpen CircuitState = "half_open"
)

type CircuitBreakerState struct {
    State           CircuitState `json:"state"`
    Failures        int          `json:"failures"`
    Successes       int          `json:"successes"`
    LastFailureTime time.Time    `json:"last_failure_time"`
    LastStateChange time.Time    `json:"last_state_change"`
}

type CircuitBreakerStorage struct {
    client RedisClient
    keys   *KeyBuilder
}

func (s *CircuitBreakerStorage) GetState(ctx context.Context, service string) (*CircuitBreakerState, error) {
    key := s.keys.CircuitBreaker(service)
    data, err := s.client.Get(ctx, key).Bytes()
    if err == redis.Nil {
        return &CircuitBreakerState{State: CircuitClosed, LastStateChange: time.Now()}, nil
    }
    if err != nil {
        return nil, err
    }

    var state CircuitBreakerState
    json.Unmarshal(data, &state)
    return &state, nil
}

func (s *CircuitBreakerStorage) RecordFailure(ctx context.Context, service string) (*CircuitBreakerState, error) {
    state, _ := s.GetState(ctx, service)
    state.Failures++
    state.LastFailureTime = time.Now()

    key := s.keys.CircuitBreaker(service)
    data, _ := json.Marshal(state)
    s.client.Set(ctx, key, data, 5*time.Minute)

    return state, nil
}

func (s *CircuitBreakerStorage) TransitionState(ctx context.Context, service string, newState CircuitState) error {
    state, _ := s.GetState(ctx, service)
    state.State = newState
    state.LastStateChange = time.Now()
    if newState == CircuitClosed {
        state.Failures = 0
        state.Successes = 0
    }

    key := s.keys.CircuitBreaker(service)
    data, _ := json.Marshal(state)
    return s.client.Set(ctx, key, data, 5*time.Minute).Err()
}
```
