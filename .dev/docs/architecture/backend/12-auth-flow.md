# Authentication Flow

JWT-based authentication с access/refresh tokens.

---

## Overview

| Аспект | Решение |
|--------|---------|
| Access Token | JWT (RS256), 15 min TTL |
| Refresh Token | Opaque (UUID), 7 days TTL |
| Storage | httpOnly cookies |
| Revocation | Redis blacklist |

---

## Full Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              REGISTRATION                                     │
│                                                                               │
│  Client                          Server                          Redis       │
│    │                               │                               │         │
│    │ POST /auth/register           │                               │         │
│    │ { email, password }           │                               │         │
│    │──────────────────────────────▶│                               │         │
│    │                               │                               │         │
│    │                               │ 1. Validate email/password    │         │
│    │                               │ 2. Check email uniqueness     │         │
│    │                               │ 3. Hash password (Argon2id)   │         │
│    │                               │ 4. Create user in DB          │         │
│    │                               │ 5. Create free subscription   │         │
│    │                               │ 6. Generate access token (JWT)│         │
│    │                               │ 7. Generate refresh token     │         │
│    │                               │────────────────────────────────▶        │
│    │                               │    Store refresh token hash   │         │
│    │                               │◀────────────────────────────────        │
│    │                               │                               │         │
│    │ Set-Cookie: access_token      │                               │         │
│    │ Set-Cookie: refresh_token     │                               │         │
│    │ { user }                      │                               │         │
│    │◀──────────────────────────────│                               │         │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                 LOGIN                                         │
│                                                                               │
│  Client                          Server                          Redis       │
│    │                               │                               │         │
│    │ POST /auth/login              │                               │         │
│    │ { email, password }           │                               │         │
│    │──────────────────────────────▶│                               │         │
│    │                               │                               │         │
│    │                               │ 1. Find user by email         │         │
│    │                               │ 2. Verify password            │         │
│    │                               │ 3. Generate access token      │         │
│    │                               │ 4. Generate refresh token     │         │
│    │                               │────────────────────────────────▶        │
│    │                               │    Store refresh token hash   │         │
│    │                               │◀────────────────────────────────        │
│    │                               │                               │         │
│    │ Set-Cookie: access_token      │                               │         │
│    │ Set-Cookie: refresh_token     │                               │         │
│    │ { user }                      │                               │         │
│    │◀──────────────────────────────│                               │         │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATED REQUEST                                │
│                                                                               │
│  Client                          Server                          Redis       │
│    │                               │                               │         │
│    │ GET /api/v1/maps              │                               │         │
│    │ Cookie: access_token=...      │                               │         │
│    │──────────────────────────────▶│                               │         │
│    │                               │                               │         │
│    │                               │ 1. Extract JWT from cookie    │         │
│    │                               │ 2. Verify signature (RS256)   │         │
│    │                               │ 3. Check expiration           │         │
│    │                               │────────────────────────────────▶        │
│    │                               │    Check if token blacklisted │         │
│    │                               │◀────────────────────────────────        │
│    │                               │ 4. Extract claims (userID)    │         │
│    │                               │ 5. Process request            │         │
│    │                               │                               │         │
│    │ { data: [...] }               │                               │         │
│    │◀──────────────────────────────│                               │         │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            TOKEN REFRESH                                      │
│                                                                               │
│  Client                          Server                          Redis       │
│    │                               │                               │         │
│    │ POST /auth/refresh            │                               │         │
│    │ Cookie: refresh_token=...     │                               │         │
│    │──────────────────────────────▶│                               │         │
│    │                               │                               │         │
│    │                               │────────────────────────────────▶        │
│    │                               │ 1. Get stored token hash      │         │
│    │                               │◀────────────────────────────────        │
│    │                               │ 2. Verify token matches       │         │
│    │                               │ 3. Generate NEW access token  │         │
│    │                               │ 4. Generate NEW refresh token │         │
│    │                               │────────────────────────────────▶        │
│    │                               │    Delete old, store new      │         │
│    │                               │◀────────────────────────────────        │
│    │                               │                               │         │
│    │ Set-Cookie: access_token      │                               │         │
│    │ Set-Cookie: refresh_token     │                               │         │
│    │◀──────────────────────────────│                               │         │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                LOGOUT                                         │
│                                                                               │
│  Client                          Server                          Redis       │
│    │                               │                               │         │
│    │ POST /auth/logout             │                               │         │
│    │ Cookie: access_token=...      │                               │         │
│    │──────────────────────────────▶│                               │         │
│    │                               │                               │         │
│    │                               │────────────────────────────────▶        │
│    │                               │ 1. Blacklist access token     │         │
│    │                               │ 2. Delete refresh token       │         │
│    │                               │◀────────────────────────────────        │
│    │                               │                               │         │
│    │ Clear-Cookie: access_token    │                               │         │
│    │ Clear-Cookie: refresh_token   │                               │         │
│    │ 204 No Content                │                               │         │
│    │◀──────────────────────────────│                               │         │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Token Lifecycle

### Access Token (JWT)

```
┌─────────────────────────────────────────────────────────────────┐
│ Header                                                           │
│ {                                                                │
│   "alg": "RS256",                                                │
│   "typ": "JWT"                                                   │
│ }                                                                │
├─────────────────────────────────────────────────────────────────┤
│ Payload                                                          │
│ {                                                                │
│   "sub": "550e8400-e29b-41d4-a716-446655440000",  // User ID    │
│   "email": "user@example.com",                                  │
│   "role": "user",                                                │
│   "iat": 1701792000,                              // Issued at   │
│   "exp": 1701792900                               // +15 min     │
│ }                                                                │
├─────────────────────────────────────────────────────────────────┤
│ Signature                                                        │
│ RS256(base64(header) + "." + base64(payload), privateKey)       │
└─────────────────────────────────────────────────────────────────┘
```

### Refresh Token

```
Format: UUID v4 (opaque)
Example: 7c9e6679-7425-40de-944b-e07fc1f90ae7

Storage in Redis:
  Key:   refresh_token:{user_id}:{token_hash}
  Value: { created_at, user_agent, ip }
  TTL:   7 days
```

---

## Redis Keys

```
┌─────────────────────────────────────────────────────────────────┐
│ Refresh Tokens                                                   │
│                                                                  │
│ Key:    refresh_token:{user_id}:{sha256(token)}                 │
│ Value:  {                                                        │
│           "created_at": "2024-01-15T10:30:00Z",                 │
│           "user_agent": "Mozilla/5.0...",                       │
│           "ip": "192.168.1.1"                                   │
│         }                                                        │
│ TTL:    604800 (7 days)                                         │
├─────────────────────────────────────────────────────────────────┤
│ Access Token Blacklist                                           │
│                                                                  │
│ Key:    blacklist:{sha256(token)}                               │
│ Value:  "1"                                                      │
│ TTL:    900 (15 min = access token TTL)                         │
├─────────────────────────────────────────────────────────────────┤
│ User Sessions Index                                              │
│                                                                  │
│ Key:    user_sessions:{user_id}                                 │
│ Type:   SET                                                      │
│ Values: [token_hash_1, token_hash_2, ...]                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Token Service

```go
// internal/infrastructure/auth/jwt.go
package auth

import (
    "crypto/rsa"
    "time"
    "github.com/golang-jwt/jwt/v5"
)

type JWTService struct {
    privateKey *rsa.PrivateKey
    publicKey  *rsa.PublicKey
    accessTTL  time.Duration
}

func NewJWTService(privateKeyPath, publicKeyPath string, accessTTL time.Duration) (*JWTService, error) {
    privateKey, err := loadPrivateKey(privateKeyPath)
    if err != nil {
        return nil, err
    }

    publicKey, err := loadPublicKey(publicKeyPath)
    if err != nil {
        return nil, err
    }

    return &JWTService{
        privateKey: privateKey,
        publicKey:  publicKey,
        accessTTL:  accessTTL,
    }, nil
}

type TokenClaims struct {
    UserID uuid.UUID
    Email  string
    Role   string
}

func (s *JWTService) GenerateAccessToken(user *entity.User) (string, error) {
    now := time.Now()

    claims := jwt.MapClaims{
        "sub":   user.ID.String(),
        "email": user.Email.String(),
        "role":  string(user.Role),
        "iat":   now.Unix(),
        "exp":   now.Add(s.accessTTL).Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
    return token.SignedString(s.privateKey)
}

func (s *JWTService) ValidateAccessToken(tokenString string) (*TokenClaims, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
            return nil, errors.New("unexpected signing method")
        }
        return s.publicKey, nil
    })

    if err != nil {
        return nil, err
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok || !token.Valid {
        return nil, errors.New("invalid token")
    }

    userID, err := uuid.Parse(claims["sub"].(string))
    if err != nil {
        return nil, err
    }

    return &TokenClaims{
        UserID: userID,
        Email:  claims["email"].(string),
        Role:   claims["role"].(string),
    }, nil
}
```

### Refresh Token Repository

```go
// internal/adapter/repository/redis/refresh_token.go
package redis

import (
    "context"
    "crypto/sha256"
    "encoding/hex"
    "encoding/json"
    "fmt"
    "time"
)

type RefreshTokenRepository struct {
    client *redis.Client
    ttl    time.Duration
}

type RefreshTokenData struct {
    CreatedAt time.Time `json:"created_at"`
    UserAgent string    `json:"user_agent"`
    IP        string    `json:"ip"`
}

func (r *RefreshTokenRepository) Create(ctx context.Context, userID uuid.UUID, token string, data RefreshTokenData) error {
    tokenHash := hashToken(token)
    key := fmt.Sprintf("refresh_token:%s:%s", userID, tokenHash)

    jsonData, err := json.Marshal(data)
    if err != nil {
        return err
    }

    // Store token
    if err := r.client.Set(ctx, key, jsonData, r.ttl).Err(); err != nil {
        return err
    }

    // Add to user's sessions set
    sessionsKey := fmt.Sprintf("user_sessions:%s", userID)
    return r.client.SAdd(ctx, sessionsKey, tokenHash).Err()
}

func (r *RefreshTokenRepository) Validate(ctx context.Context, userID uuid.UUID, token string) (*RefreshTokenData, error) {
    tokenHash := hashToken(token)
    key := fmt.Sprintf("refresh_token:%s:%s", userID, tokenHash)

    jsonData, err := r.client.Get(ctx, key).Bytes()
    if err == redis.Nil {
        return nil, domainerror.ErrTokenInvalid
    }
    if err != nil {
        return nil, err
    }

    var data RefreshTokenData
    if err := json.Unmarshal(jsonData, &data); err != nil {
        return nil, err
    }

    return &data, nil
}

func (r *RefreshTokenRepository) Delete(ctx context.Context, userID uuid.UUID, token string) error {
    tokenHash := hashToken(token)
    key := fmt.Sprintf("refresh_token:%s:%s", userID, tokenHash)

    pipe := r.client.Pipeline()
    pipe.Del(ctx, key)
    pipe.SRem(ctx, fmt.Sprintf("user_sessions:%s", userID), tokenHash)
    _, err := pipe.Exec(ctx)
    return err
}

// DeleteAllForUser — logout from all devices
func (r *RefreshTokenRepository) DeleteAllForUser(ctx context.Context, userID uuid.UUID) error {
    sessionsKey := fmt.Sprintf("user_sessions:%s", userID)

    // Get all token hashes
    hashes, err := r.client.SMembers(ctx, sessionsKey).Result()
    if err != nil {
        return err
    }

    if len(hashes) == 0 {
        return nil
    }

    // Delete all tokens
    pipe := r.client.Pipeline()
    for _, hash := range hashes {
        pipe.Del(ctx, fmt.Sprintf("refresh_token:%s:%s", userID, hash))
    }
    pipe.Del(ctx, sessionsKey)
    _, err = pipe.Exec(ctx)
    return err
}

func hashToken(token string) string {
    h := sha256.Sum256([]byte(token))
    return hex.EncodeToString(h[:])
}
```

### Blacklist Repository

```go
// internal/adapter/repository/redis/blacklist.go
package redis

type BlacklistRepository struct {
    client    *redis.Client
    accessTTL time.Duration
}

func (r *BlacklistRepository) Add(ctx context.Context, token string) error {
    hash := hashToken(token)
    key := fmt.Sprintf("blacklist:%s", hash)
    return r.client.Set(ctx, key, "1", r.accessTTL).Err()
}

func (r *BlacklistRepository) IsBlacklisted(ctx context.Context, token string) (bool, error) {
    hash := hashToken(token)
    key := fmt.Sprintf("blacklist:%s", hash)

    exists, err := r.client.Exists(ctx, key).Result()
    if err != nil {
        return false, err
    }
    return exists > 0, nil
}
```

---

## Multi-Device Sessions

### Listing Sessions

```go
// internal/application/usecase/auth/list_sessions.go
package auth

type ListSessionsUseCase struct {
    tokenRepo repository.RefreshTokenRepository
}

type Session struct {
    TokenHash string    `json:"tokenHash"`
    CreatedAt time.Time `json:"createdAt"`
    UserAgent string    `json:"userAgent"`
    IP        string    `json:"ip"`
    Current   bool      `json:"current"`
}

func (uc *ListSessionsUseCase) Execute(ctx context.Context, userID uuid.UUID, currentTokenHash string) ([]Session, error) {
    sessions, err := uc.tokenRepo.ListByUserID(ctx, userID)
    if err != nil {
        return nil, err
    }

    result := make([]Session, len(sessions))
    for i, s := range sessions {
        result[i] = Session{
            TokenHash: s.TokenHash[:8] + "...",  // Partial hash for UI
            CreatedAt: s.CreatedAt,
            UserAgent: s.UserAgent,
            IP:        s.IP,
            Current:   s.TokenHash == currentTokenHash,
        }
    }

    return result, nil
}
```

### Revoking Specific Session

```go
// internal/application/usecase/auth/revoke_session.go
package auth

type RevokeSessionUseCase struct {
    tokenRepo repository.RefreshTokenRepository
}

func (uc *RevokeSessionUseCase) Execute(ctx context.Context, userID uuid.UUID, tokenHash string) error {
    return uc.tokenRepo.DeleteByHash(ctx, userID, tokenHash)
}
```

### Logout from All Devices

```go
// internal/application/usecase/auth/logout_all.go
package auth

type LogoutAllUseCase struct {
    tokenRepo     repository.RefreshTokenRepository
    blacklistRepo repository.BlacklistRepository
}

func (uc *LogoutAllUseCase) Execute(ctx context.Context, userID uuid.UUID) error {
    // Delete all refresh tokens
    if err := uc.tokenRepo.DeleteAllForUser(ctx, userID); err != nil {
        return err
    }

    // Note: existing access tokens will still work until expiry (15 min)
    // For immediate revocation, would need to blacklist all or use
    // per-user token version counter

    return nil
}
```

---

## Token Revocation Strategies

### Strategy 1: Blacklist (Current)

```
Pros:
- Simple to implement
- Fine-grained control

Cons:
- Redis lookup on every request
- Storage grows with revocations

Use when:
- Single logout
- Security incidents
```

### Strategy 2: Token Version Counter

```
Pros:
- Instant mass revocation
- No blacklist storage

Cons:
- Requires DB lookup for version
- All devices affected

Use when:
- Password change
- Security breach
- "Logout all devices"
```

```go
// In user table: token_version INT DEFAULT 1

// In JWT claims:
claims := jwt.MapClaims{
    "sub": user.ID.String(),
    "ver": user.TokenVersion,  // Add version
    // ...
}

// In validation:
func (s *JWTService) ValidateAccessToken(tokenString string, user *entity.User) error {
    claims := // ... parse token
    if claims["ver"].(float64) != float64(user.TokenVersion) {
        return domainerror.ErrTokenInvalid
    }
    return nil
}

// On password change:
func (uc *ChangePasswordUseCase) Execute(...) error {
    // ... change password
    user.TokenVersion++
    uc.userRepo.Update(ctx, user)
}
```

---

## Password Reset Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      PASSWORD RESET                              │
│                                                                  │
│  Client                          Server                 Redis   │
│    │                               │                       │    │
│    │ POST /auth/forgot-password    │                       │    │
│    │ { email }                     │                       │    │
│    │──────────────────────────────▶│                       │    │
│    │                               │                       │    │
│    │                               │ 1. Find user by email │    │
│    │                               │ 2. Generate reset token     │
│    │                               │────────────────────────▶   │
│    │                               │    Store token (1h TTL)    │
│    │                               │◀────────────────────────   │
│    │                               │ 3. Send email with link    │
│    │                               │                       │    │
│    │ 200 OK                        │                       │    │
│    │◀──────────────────────────────│                       │    │
│    │                               │                       │    │
│    │ POST /auth/reset-password     │                       │    │
│    │ { token, newPassword }        │                       │    │
│    │──────────────────────────────▶│                       │    │
│    │                               │────────────────────────▶   │
│    │                               │ 1. Validate token     │    │
│    │                               │◀────────────────────────   │
│    │                               │ 2. Hash new password  │    │
│    │                               │ 3. Update user        │    │
│    │                               │ 4. Increment token_ver│    │
│    │                               │────────────────────────▶   │
│    │                               │ 5. Delete reset token │    │
│    │                               │ 6. Delete all sessions│    │
│    │                               │◀────────────────────────   │
│    │                               │                       │    │
│    │ 200 OK                        │                       │    │
│    │◀──────────────────────────────│                       │    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2FA Design Points

### TOTP (Time-based One-Time Password)

```go
// Future implementation notes

// 1. Store encrypted TOTP secret in user record
type User struct {
    // ...
    TOTPSecret     []byte  // Encrypted with app key
    TOTPEnabled    bool
    RecoveryCodes  []string  // Encrypted, one-time use
}

// 2. Login flow with 2FA
// Step 1: Verify email/password → return temporary token
// Step 2: Verify TOTP code with temp token → return access/refresh tokens

// 3. Recovery flow
// - Use recovery code instead of TOTP
// - Each code usable once
// - Regenerate codes after use
```

### WebAuthn (Passkeys)

```go
// Future implementation notes

// 1. Store credentials
type WebAuthnCredential struct {
    ID        uuid.UUID
    UserID    uuid.UUID
    Name      string  // "MacBook Pro", "iPhone"
    PublicKey []byte
    Counter   uint32
    CreatedAt time.Time
}

// 2. Registration flow
// - Generate challenge
// - Client creates credential
// - Server stores public key

// 3. Authentication flow
// - Generate challenge
// - Client signs with private key
// - Server verifies signature
```

---

## Чеклист

### Token Generation
- [ ] RS256 for JWT signing
- [ ] Short access token TTL (15 min)
- [ ] Secure refresh token generation (crypto/rand)
- [ ] Token hash storage (not plaintext)

### Token Storage
- [ ] httpOnly cookies only
- [ ] Secure flag in production
- [ ] SameSite=Strict
- [ ] Refresh token path restricted

### Token Validation
- [ ] Signature verification
- [ ] Expiration check
- [ ] Blacklist check
- [ ] Claims extraction

### Revocation
- [ ] Logout blacklists access token
- [ ] Logout deletes refresh token
- [ ] Password change invalidates all tokens
- [ ] Session management UI

### Security
- [ ] Rate limiting on auth endpoints
- [ ] Audit logging for auth events
- [ ] Brute force protection
- [ ] Account lockout after failures

---

## См. также

- [11-security.md](./11-security.md) — Password hashing, rate limiting
- [06-redis.md](./06-redis.md) — Redis patterns для tokens
- [04-adapters.md](./04-adapters.md) — Auth middleware
