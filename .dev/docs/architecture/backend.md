# Архитектура Backend: Neylin

## 1. Обзор Clean Architecture

### 1.1 Принципы Uncle Bob

Clean Architecture — архитектурный паттерн, где бизнес-логика изолирована от внешних зависимостей. Ключевые принципы:

1. **Dependency Rule** — зависимости направлены только ВНУТРЬ (к центру)
2. **Entities** — бизнес-правила, не зависящие от фреймворков
3. **Use Cases** — application-specific бизнес-правила
4. **Interface Adapters** — преобразование данных между слоями
5. **Frameworks & Drivers** — внешние инструменты (DB, Web, UI)

### 1.2 Концентрические круги

```
┌─────────────────────────────────────────────────────────────┐
│                    Frameworks & Drivers                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Interface Adapters                   │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │              Application Layer               │    │    │
│  │  │  ┌─────────────────────────────────────┐    │    │    │
│  │  │  │           Domain Layer              │    │    │    │
│  │  │  │                                     │    │    │    │
│  │  │  │    Entities, Value Objects,         │    │    │    │
│  │  │  │    Domain Services                  │    │    │    │
│  │  │  │                                     │    │    │    │
│  │  │  └─────────────────────────────────────┘    │    │    │
│  │  │                                             │    │    │
│  │  │   Use Cases, Ports (Interfaces)             │    │    │
│  │  │                                             │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                     │    │
│  │   Controllers, Presenters, Gateways                 │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│   Web Framework, Database, External Services                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Маппинг на Go

| Clean Architecture | Go Implementation |
|--------------------|-------------------|
| Entities | `internal/domain/entity` |
| Use Cases | `internal/application/usecase` |
| Ports (Interfaces) | `internal/application/port` |
| Controllers | `internal/adapter/http/handler` |
| Gateways | `internal/adapter/repository` |
| Frameworks | `internal/infrastructure` |

---

## 2. Структура проекта

```
neylin-backend/
├── cmd/
│   └── server/
│       └── main.go                 # Entry point
│
├── internal/
│   ├── domain/                     # СЛОЙ 1: Domain (центр)
│   │   ├── entity/                 # Бизнес-сущности
│   │   │   ├── user.go
│   │   │   ├── map.go
│   │   │   ├── node.go
│   │   │   ├── edge.go
│   │   │   ├── subscription.go
│   │   │   └── payment.go
│   │   │
│   │   ├── valueobject/            # Value Objects
│   │   │   ├── email.go
│   │   │   ├── password.go
│   │   │   ├── node_type.go
│   │   │   ├── relation_type.go
│   │   │   ├── plan_type.go
│   │   │   └── position.go
│   │   │
│   │   ├── service/                # Domain Services
│   │   │   ├── password_hasher.go
│   │   │   └── plan_limits.go
│   │   │
│   │   └── error/                  # Domain Errors
│   │       └── errors.go
│   │
│   ├── application/                # СЛОЙ 2: Application
│   │   ├── port/                   # Ports (Interfaces)
│   │   │   ├── repository/         # Repository interfaces
│   │   │   │   ├── user.go
│   │   │   │   ├── map.go
│   │   │   │   ├── node.go
│   │   │   │   ├── edge.go
│   │   │   │   ├── subscription.go
│   │   │   │   └── payment.go
│   │   │   │
│   │   │   └── service/            # External service interfaces
│   │   │       ├── auth.go
│   │   │       ├── storage.go
│   │   │       ├── email.go
│   │   │       ├── payment.go
│   │   │       └── ai.go
│   │   │
│   │   ├── usecase/                # Use Cases
│   │   │   ├── auth/
│   │   │   │   ├── register.go
│   │   │   │   ├── login.go
│   │   │   │   ├── logout.go
│   │   │   │   ├── refresh.go
│   │   │   │   └── reset_password.go
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── get_profile.go
│   │   │   │   ├── update_profile.go
│   │   │   │   ├── change_email.go
│   │   │   │   ├── change_password.go
│   │   │   │   ├── upload_avatar.go
│   │   │   │   └── delete_account.go
│   │   │   │
│   │   │   ├── map/
│   │   │   │   ├── create.go
│   │   │   │   ├── get.go
│   │   │   │   ├── get_full.go
│   │   │   │   ├── list.go
│   │   │   │   ├── update.go
│   │   │   │   ├── delete.go
│   │   │   │   └── analyze.go
│   │   │   │
│   │   │   ├── node/
│   │   │   │   ├── create.go
│   │   │   │   ├── get.go
│   │   │   │   ├── list.go
│   │   │   │   ├── update.go
│   │   │   │   ├── delete.go
│   │   │   │   └── update_positions.go
│   │   │   │
│   │   │   ├── edge/
│   │   │   │   ├── create.go
│   │   │   │   ├── list.go
│   │   │   │   ├── update.go
│   │   │   │   └── delete.go
│   │   │   │
│   │   │   ├── subscription/
│   │   │   │   ├── get_current.go
│   │   │   │   ├── get_usage.go
│   │   │   │   ├── create_checkout.go
│   │   │   │   ├── change_plan.go
│   │   │   │   ├── cancel.go
│   │   │   │   └── resume.go
│   │   │   │
│   │   │   └── payment/
│   │   │       ├── list_methods.go
│   │   │       ├── add_card.go
│   │   │       ├── add_crypto.go
│   │   │       ├── remove_method.go
│   │   │       ├── set_default.go
│   │   │       └── get_history.go
│   │   │
│   │   └── dto/                    # Data Transfer Objects
│   │       ├── auth.go
│   │       ├── user.go
│   │       ├── map.go
│   │       ├── node.go
│   │       ├── edge.go
│   │       ├── subscription.go
│   │       └── payment.go
│   │
│   ├── adapter/                    # СЛОЙ 3: Interface Adapters
│   │   ├── http/                   # HTTP Adapter (Fiber)
│   │   │   ├── handler/            # Request handlers
│   │   │   │   ├── auth.go
│   │   │   │   ├── user.go
│   │   │   │   ├── map.go
│   │   │   │   ├── node.go
│   │   │   │   ├── edge.go
│   │   │   │   ├── subscription.go
│   │   │   │   ├── payment.go
│   │   │   │   ├── webhook.go
│   │   │   │   └── health.go
│   │   │   │
│   │   │   ├── middleware/         # HTTP Middleware
│   │   │   │   ├── auth.go
│   │   │   │   ├── rate_limit.go
│   │   │   │   ├── cors.go
│   │   │   │   ├── logger.go
│   │   │   │   ├── recover.go
│   │   │   │   └── request_id.go
│   │   │   │
│   │   │   ├── request/            # Request DTOs
│   │   │   │   ├── auth.go
│   │   │   │   ├── user.go
│   │   │   │   ├── map.go
│   │   │   │   ├── node.go
│   │   │   │   ├── edge.go
│   │   │   │   └── subscription.go
│   │   │   │
│   │   │   ├── response/           # Response DTOs
│   │   │   │   ├── auth.go
│   │   │   │   ├── user.go
│   │   │   │   ├── map.go
│   │   │   │   ├── node.go
│   │   │   │   ├── edge.go
│   │   │   │   ├── subscription.go
│   │   │   │   └── error.go
│   │   │   │
│   │   │   ├── validator/          # Request validation
│   │   │   │   └── validator.go
│   │   │   │
│   │   │   └── router/             # Route definitions
│   │   │       └── router.go
│   │   │
│   │   └── repository/             # Repository implementations
│   │       ├── postgres/
│   │       │   ├── user.go
│   │       │   ├── map.go
│   │       │   ├── node.go
│   │       │   ├── edge.go
│   │       │   ├── subscription.go
│   │       │   ├── payment.go
│   │       │   ├── refresh_token.go
│   │       │   └── ai_task.go
│   │       │
│   │       └── redis/
│   │           ├── token_blacklist.go
│   │           └── rate_limit.go
│   │
│   └── infrastructure/             # СЛОЙ 4: Frameworks & Drivers
│       ├── config/                 # Configuration
│       │   └── config.go
│       │
│       ├── database/               # Database setup
│       │   ├── postgres.go
│       │   └── redis.go
│       │
│       ├── external/               # External services
│       │   ├── stripe/
│       │   │   └── client.go
│       │   │
│       │   ├── openai/
│       │   │   └── client.go
│       │   │
│       │   ├── anthropic/
│       │   │   └── client.go
│       │   │
│       │   ├── s3/
│       │   │   └── client.go
│       │   │
│       │   └── smtp/
│       │       └── client.go
│       │
│       ├── auth/                   # JWT implementation
│       │   └── jwt.go
│       │
│       ├── logger/                 # Logging
│       │   └── logger.go
│       │
│       └── server/                 # HTTP Server setup
│           └── fiber.go
│
├── migrations/                     # Database migrations
│   ├── 000001_init.up.sql
│   ├── 000001_init.down.sql
│   └── ...
│
├── scripts/                        # Utility scripts
│   ├── migrate.sh
│   └── seed.sh
│
├── deployments/                    # Deployment configs
│   ├── docker/
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   │
│   └── kubernetes/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── configmap.yaml
│
├── api/                            # API specs
│   └── openapi.yaml
│
├── .env.example
├── .gitignore
├── Makefile
├── go.mod
└── go.sum
```

---

## 3. Слой Domain

### 3.1 Entities

Entities — чистые бизнес-объекты без зависимостей от фреймворков.

```go
// internal/domain/entity/user.go
package entity

import (
    "time"

    "github.com/google/uuid"
    "neylin/internal/domain/valueobject"
)

type User struct {
    ID          uuid.UUID
    Email       valueobject.Email
    Password    valueobject.HashedPassword
    FirstName   string
    LastName    string
    DisplayName string
    Username    string
    Bio         string
    AvatarURL   string
    Role        Role
    Preferences UserPreferences

    StripeCustomerID string

    DeletedAt *time.Time
    CreatedAt time.Time
    UpdatedAt time.Time
}

type Role string

const (
    RoleUser   Role = "user"
    RoleAdmin  Role = "admin"
    RoleViewer Role = "viewer"
)

type UserPreferences struct {
    Notifications NotificationPreferences
    Interface     InterfacePreferences
}

type NotificationPreferences struct {
    Email     bool
    Marketing bool
    Updates   bool
}

type InterfacePreferences struct {
    Density    Density
    Animations bool
    Sound      bool
}

type Density string

const (
    DensityCompact     Density = "compact"
    DensityComfortable Density = "comfortable"
    DensitySpacious    Density = "spacious"
)

// NewUser создает нового пользователя с валидацией
func NewUser(email valueobject.Email, password valueobject.HashedPassword) *User {
    now := time.Now()
    return &User{
        ID:        uuid.New(),
        Email:     email,
        Password:  password,
        Role:      RoleUser,
        Preferences: UserPreferences{
            Notifications: NotificationPreferences{
                Email:   true,
                Updates: true,
            },
            Interface: InterfacePreferences{
                Density:    DensityComfortable,
                Animations: true,
            },
        },
        CreatedAt: now,
        UpdatedAt: now,
    }
}

// IsDeleted проверяет soft delete
func (u *User) IsDeleted() bool {
    return u.DeletedAt != nil
}

// CanAccessMap проверяет права доступа к карте
func (u *User) CanAccessMap(mapOwnerID uuid.UUID) bool {
    return u.ID == mapOwnerID || u.Role == RoleAdmin
}
```

```go
// internal/domain/entity/map.go
package entity

import (
    "time"

    "github.com/google/uuid"
)

type Map struct {
    ID          uuid.UUID
    UserID      uuid.UUID
    Title       string
    Description string
    PreviewURL  string
    AIAnalysis  *AIAnalysis

    CreatedAt time.Time
    UpdatedAt time.Time
}

type AIAnalysis struct {
    LastAnalyzed      *time.Time
    Gaps              []string
    Suggestions       []string
    ComplexityScore   float64
    CompletenessScore float64
    StructuralIssues  []string
}

type FullMap struct {
    Map
    Nodes []Node
    Edges []Edge
}

func NewMap(userID uuid.UUID, title, description string) *Map {
    now := time.Now()
    return &Map{
        ID:          uuid.New(),
        UserID:      userID,
        Title:       title,
        Description: description,
        CreatedAt:   now,
        UpdatedAt:   now,
    }
}
```

```go
// internal/domain/entity/node.go
package entity

import (
    "time"

    "github.com/google/uuid"
    "neylin/internal/domain/valueobject"
)

type Node struct {
    ID          uuid.UUID
    MapID       uuid.UUID
    Label       string
    Description string
    Content     string // HTML content
    Type        valueobject.NodeType
    Position    valueobject.Position
    Metadata    NodeMetadata

    CreatedAt time.Time
    UpdatedAt time.Time
}

type NodeMetadata struct {
    Confidence   float64
    Complexity   Complexity
    Sources      []string
    Tags         []string
    LastReviewed *time.Time
    ReviewCount  int
}

type Complexity string

const (
    ComplexityBasic        Complexity = "basic"
    ComplexityIntermediate Complexity = "intermediate"
    ComplexityAdvanced     Complexity = "advanced"
)

// LightweightNode — версия без Content для рендера графа
type LightweightNode struct {
    ID          uuid.UUID
    MapID       uuid.UUID
    Label       string
    Description string
    Type        valueobject.NodeType
    Position    valueobject.Position
    Metadata    NodeMetadata
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

func NewNode(mapID uuid.UUID, label string, nodeType valueobject.NodeType, pos valueobject.Position) *Node {
    now := time.Now()
    return &Node{
        ID:       uuid.New(),
        MapID:    mapID,
        Label:    label,
        Type:     nodeType,
        Position: pos,
        Metadata: NodeMetadata{
            Confidence: 0.5,
            Complexity: ComplexityBasic,
        },
        CreatedAt: now,
        UpdatedAt: now,
    }
}

func (n *Node) ToLightweight() LightweightNode {
    return LightweightNode{
        ID:          n.ID,
        MapID:       n.MapID,
        Label:       n.Label,
        Description: n.Description,
        Type:        n.Type,
        Position:    n.Position,
        Metadata:    n.Metadata,
        CreatedAt:   n.CreatedAt,
        UpdatedAt:   n.UpdatedAt,
    }
}
```

```go
// internal/domain/entity/edge.go
package entity

import (
    "time"

    "github.com/google/uuid"
    "neylin/internal/domain/valueobject"
)

type Edge struct {
    ID            uuid.UUID
    MapID         uuid.UUID
    SourceNodeID  uuid.UUID
    TargetNodeID  uuid.UUID
    RelationType  valueobject.RelationType
    Label         string
    Strength      float64
    Bidirectional bool
    Metadata      EdgeMetadata

    CreatedAt time.Time
    UpdatedAt time.Time
}

type EdgeMetadata struct {
    Confidence    float64
    Evidence      []string
    Examples      []string
    CreatedBy     EdgeCreator
    LastValidated *time.Time
}

type EdgeCreator string

const (
    CreatedByUser EdgeCreator = "user"
    CreatedByAI   EdgeCreator = "ai"
    CreatedByBoth EdgeCreator = "both"
)

func NewEdge(
    mapID, sourceID, targetID uuid.UUID,
    relationType valueobject.RelationType,
) *Edge {
    now := time.Now()
    return &Edge{
        ID:           uuid.New(),
        MapID:        mapID,
        SourceNodeID: sourceID,
        TargetNodeID: targetID,
        RelationType: relationType,
        Strength:     0.5,
        Metadata: EdgeMetadata{
            Confidence: 0.5,
            CreatedBy:  CreatedByUser,
        },
        CreatedAt: now,
        UpdatedAt: now,
    }
}

// Validate проверяет бизнес-правила
func (e *Edge) Validate() error {
    if e.SourceNodeID == e.TargetNodeID {
        return ErrSelfLoop
    }
    if e.Strength < 0 || e.Strength > 1 {
        return ErrInvalidStrength
    }
    return nil
}
```

### 3.2 Value Objects

Value Objects — иммутабельные объекты, определяемые своими значениями.

```go
// internal/domain/valueobject/email.go
package valueobject

import (
    "net/mail"
    "strings"

    "neylin/internal/domain/error"
)

type Email string

func NewEmail(value string) (Email, error) {
    value = strings.ToLower(strings.TrimSpace(value))

    if value == "" {
        return "", domainerror.ErrEmailRequired
    }

    _, err := mail.ParseAddress(value)
    if err != nil {
        return "", domainerror.ErrEmailInvalid
    }

    return Email(value), nil
}

func (e Email) String() string {
    return string(e)
}
```

```go
// internal/domain/valueobject/password.go
package valueobject

import (
    "unicode"

    "neylin/internal/domain/error"
)

type Password string
type HashedPassword string

const MinPasswordLength = 8

func NewPassword(value string) (Password, error) {
    if len(value) < MinPasswordLength {
        return "", domainerror.ErrPasswordTooShort
    }

    // Опционально: проверка сложности
    var hasUpper, hasLower, hasDigit bool
    for _, c := range value {
        switch {
        case unicode.IsUpper(c):
            hasUpper = true
        case unicode.IsLower(c):
            hasLower = true
        case unicode.IsDigit(c):
            hasDigit = true
        }
    }

    if !hasUpper || !hasLower || !hasDigit {
        return "", domainerror.ErrPasswordWeak
    }

    return Password(value), nil
}

func (p Password) String() string {
    return string(p)
}
```

```go
// internal/domain/valueobject/node_type.go
package valueobject

import "neylin/internal/domain/error"

type NodeType string

const (
    NodeTypeConcept    NodeType = "concept"
    NodeTypeFact       NodeType = "fact"
    NodeTypeTheory     NodeType = "theory"
    NodeTypeExample    NodeType = "example"
    NodeTypeQuestion   NodeType = "question"
    NodeTypeHypothesis NodeType = "hypothesis"
    NodeTypePerson     NodeType = "person"
    NodeTypeSchool     NodeType = "school"
)

var validNodeTypes = map[NodeType]bool{
    NodeTypeConcept:    true,
    NodeTypeFact:       true,
    NodeTypeTheory:     true,
    NodeTypeExample:    true,
    NodeTypeQuestion:   true,
    NodeTypeHypothesis: true,
    NodeTypePerson:     true,
    NodeTypeSchool:     true,
}

func NewNodeType(value string) (NodeType, error) {
    nt := NodeType(value)
    if !validNodeTypes[nt] {
        return "", domainerror.ErrInvalidNodeType
    }
    return nt, nil
}
```

```go
// internal/domain/valueobject/relation_type.go
package valueobject

import "neylin/internal/domain/error"

type RelationType string

const (
    RelationIsA          RelationType = "is-a"
    RelationHasA         RelationType = "has-a"
    RelationCauses       RelationType = "causes"
    RelationExplains     RelationType = "explains"
    RelationRelatedTo    RelationType = "related-to"
    RelationInfluences   RelationType = "influences"
    RelationPartOf       RelationType = "part-of"
    RelationPrerequisite RelationType = "prerequisite"
    RelationContradicts  RelationType = "contradicts"
    RelationSimilarTo    RelationType = "similar-to"
)

var validRelationTypes = map[RelationType]bool{
    RelationIsA:          true,
    RelationHasA:         true,
    RelationCauses:       true,
    RelationExplains:     true,
    RelationRelatedTo:    true,
    RelationInfluences:   true,
    RelationPartOf:       true,
    RelationPrerequisite: true,
    RelationContradicts:  true,
    RelationSimilarTo:    true,
}

func NewRelationType(value string) (RelationType, error) {
    rt := RelationType(value)
    if !validRelationTypes[rt] {
        return "", domainerror.ErrInvalidRelationType
    }
    return rt, nil
}
```

```go
// internal/domain/valueobject/position.go
package valueobject

type Position struct {
    X float64
    Y float64
}

func NewPosition(x, y float64) Position {
    return Position{X: x, Y: y}
}
```

### 3.3 Domain Services

Domain Services — бизнес-логика, не принадлежащая конкретной сущности.

```go
// internal/domain/service/plan_limits.go
package service

import (
    "neylin/internal/domain/entity"
    "neylin/internal/domain/valueobject"
)

type PlanLimits struct {
    MaxMaps           *int // nil = unlimited
    MaxNodesPerMap    *int
    MaxTotalNodes     *int
    AIModels          []string
    AIRequestsPerMonth *int
    StorageMB         int
}

var Plans = map[valueobject.PlanType]PlanLimits{
    valueobject.PlanFree: {
        MaxMaps:           ptr(3),
        MaxNodesPerMap:    ptr(50),
        MaxTotalNodes:     ptr(150),
        AIModels:          []string{"gpt-3.5-turbo"},
        AIRequestsPerMonth: ptr(20),
        StorageMB:         50,
    },
    valueobject.PlanPro: {
        MaxMaps:           ptr(20),
        MaxNodesPerMap:    ptr(500),
        MaxTotalNodes:     ptr(5000),
        AIModels:          []string{"gpt-3.5-turbo", "gpt-4", "claude-3-sonnet"},
        AIRequestsPerMonth: ptr(200),
        StorageMB:         1024,
    },
    valueobject.PlanUltra: {
        MaxMaps:           nil, // unlimited
        MaxNodesPerMap:    nil,
        MaxTotalNodes:     nil,
        AIModels:          []string{"gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "claude-3-sonnet", "claude-3-opus"},
        AIRequestsPerMonth: nil,
        StorageMB:         10240,
    },
}

func ptr(i int) *int { return &i }

// CanCreateMap проверяет лимит карт
func CanCreateMap(plan valueobject.PlanType, currentMapsCount int) bool {
    limits := Plans[plan]
    if limits.MaxMaps == nil {
        return true
    }
    return currentMapsCount < *limits.MaxMaps
}

// CanCreateNode проверяет лимит узлов
func CanCreateNode(plan valueobject.PlanType, nodesInMap, totalNodes int) bool {
    limits := Plans[plan]

    if limits.MaxNodesPerMap != nil && nodesInMap >= *limits.MaxNodesPerMap {
        return false
    }
    if limits.MaxTotalNodes != nil && totalNodes >= *limits.MaxTotalNodes {
        return false
    }
    return true
}

// CanUseAIModel проверяет доступность модели
func CanUseAIModel(plan valueobject.PlanType, model string) bool {
    limits := Plans[plan]
    for _, m := range limits.AIModels {
        if m == model {
            return true
        }
    }
    return false
}
```

### 3.4 Domain Errors

```go
// internal/domain/error/errors.go
package domainerror

import "errors"

// Validation errors
var (
    ErrEmailRequired    = errors.New("email is required")
    ErrEmailInvalid     = errors.New("invalid email format")
    ErrPasswordTooShort = errors.New("password must be at least 8 characters")
    ErrPasswordWeak     = errors.New("password must contain uppercase, lowercase and digit")
)

// Entity errors
var (
    ErrInvalidNodeType     = errors.New("invalid node type")
    ErrInvalidRelationType = errors.New("invalid relation type")
    ErrInvalidPlanType     = errors.New("invalid plan type")
    ErrSelfLoop            = errors.New("edge cannot connect node to itself")
    ErrInvalidStrength     = errors.New("strength must be between 0 and 1")
)

// Business errors
var (
    ErrUserNotFound         = errors.New("user not found")
    ErrUserEmailExists      = errors.New("email already exists")
    ErrUserUsernameExists   = errors.New("username already exists")
    ErrInvalidCredentials   = errors.New("invalid credentials")
    ErrMapNotFound          = errors.New("map not found")
    ErrMapLimitExceeded     = errors.New("map limit exceeded for your plan")
    ErrNodeNotFound         = errors.New("node not found")
    ErrNodeLimitExceeded    = errors.New("node limit exceeded for your plan")
    ErrEdgeNotFound         = errors.New("edge not found")
    ErrEdgeAlreadyExists    = errors.New("edge already exists")
    ErrEdgeCrossMap         = errors.New("nodes belong to different maps")
    ErrSubscriptionNotFound = errors.New("subscription not found")
    ErrPaymentMethodLast    = errors.New("cannot remove last payment method")
    ErrAIQuotaExceeded      = errors.New("AI request quota exceeded")
    ErrAIModelNotAllowed    = errors.New("AI model not available for your plan")
    ErrUnauthorized         = errors.New("unauthorized")
    ErrForbidden            = errors.New("forbidden")
)
```

---

## 4. Слой Application

### 4.1 Ports (Interfaces)

Ports определяют контракты для внешних зависимостей.

```go
// internal/application/port/repository/user.go
package repository

import (
    "context"

    "github.com/google/uuid"
    "neylin/internal/domain/entity"
    "neylin/internal/domain/valueobject"
)

type UserRepository interface {
    Create(ctx context.Context, user *entity.User) error
    GetByID(ctx context.Context, id uuid.UUID) (*entity.User, error)
    GetByEmail(ctx context.Context, email valueobject.Email) (*entity.User, error)
    GetByUsername(ctx context.Context, username string) (*entity.User, error)
    Update(ctx context.Context, user *entity.User) error
    SoftDelete(ctx context.Context, id uuid.UUID) error
    HardDelete(ctx context.Context, id uuid.UUID) error
    ExistsByEmail(ctx context.Context, email valueobject.Email) (bool, error)
    ExistsByUsername(ctx context.Context, username string) (bool, error)
}
```

```go
// internal/application/port/repository/map.go
package repository

import (
    "context"

    "github.com/google/uuid"
    "neylin/internal/domain/entity"
)

type MapRepository interface {
    Create(ctx context.Context, m *entity.Map) error
    GetByID(ctx context.Context, id uuid.UUID) (*entity.Map, error)
    GetFullByID(ctx context.Context, id uuid.UUID) (*entity.FullMap, error)
    ListByUserID(ctx context.Context, userID uuid.UUID, opts ListOptions) ([]entity.Map, error)
    Update(ctx context.Context, m *entity.Map) error
    Delete(ctx context.Context, id uuid.UUID) error
    CountByUserID(ctx context.Context, userID uuid.UUID) (int, error)
}

type ListOptions struct {
    SortBy    string
    SortOrder string
    Limit     int
    Offset    int
}
```

```go
// internal/application/port/repository/node.go
package repository

import (
    "context"

    "github.com/google/uuid"
    "neylin/internal/domain/entity"
    "neylin/internal/domain/valueobject"
)

type NodeRepository interface {
    Create(ctx context.Context, node *entity.Node) error
    GetByID(ctx context.Context, id uuid.UUID) (*entity.Node, error)
    ListByMapID(ctx context.Context, mapID uuid.UUID, opts NodeListOptions) ([]entity.LightweightNode, error)
    ListFullByMapID(ctx context.Context, mapID uuid.UUID) ([]entity.Node, error)
    Update(ctx context.Context, node *entity.Node) error
    UpdatePositions(ctx context.Context, positions []NodePosition) error
    Delete(ctx context.Context, id uuid.UUID) error
    CountByMapID(ctx context.Context, mapID uuid.UUID) (int, error)
    CountByUserID(ctx context.Context, userID uuid.UUID) (int, error)
}

type NodeListOptions struct {
    NodeType *valueobject.NodeType
    Full     bool
}

type NodePosition struct {
    ID uuid.UUID
    X  float64
    Y  float64
}
```

```go
// internal/application/port/service/auth.go
package service

import (
    "context"

    "github.com/google/uuid"
    "neylin/internal/domain/entity"
    "neylin/internal/domain/valueobject"
)

type AuthService interface {
    // Hashing
    HashPassword(password valueobject.Password) (valueobject.HashedPassword, error)
    VerifyPassword(hashed valueobject.HashedPassword, plain valueobject.Password) bool

    // Tokens
    GenerateAccessToken(user *entity.User) (string, error)
    GenerateRefreshToken() (string, error)
    ValidateAccessToken(token string) (*TokenClaims, error)
    HashRefreshToken(token string) string
}

type TokenClaims struct {
    UserID uuid.UUID
    Email  string
    Role   entity.Role
}
```

```go
// internal/application/port/service/storage.go
package service

import (
    "context"
    "io"
)

type StorageService interface {
    UploadAvatar(ctx context.Context, userID string, file io.Reader, contentType string) (string, error)
    DeleteAvatar(ctx context.Context, userID string) error
    UploadMapPreview(ctx context.Context, mapID string, file io.Reader) (string, error)
}
```

```go
// internal/application/port/service/ai.go
package service

import (
    "context"

    "neylin/internal/domain/entity"
)

type AIService interface {
    AnalyzeMap(ctx context.Context, fullMap *entity.FullMap, model string) (*entity.AIAnalysis, error)
    SuggestEdges(ctx context.Context, source, target *entity.Node, model string) ([]EdgeSuggestion, error)
}

type EdgeSuggestion struct {
    RelationType string
    Confidence   float64
    Reasoning    string
}
```

### 4.2 Use Cases

Use Cases содержат application-specific бизнес-логику.

```go
// internal/application/usecase/auth/register.go
package auth

import (
    "context"

    "neylin/internal/application/dto"
    "neylin/internal/application/port/repository"
    "neylin/internal/application/port/service"
    "neylin/internal/domain/entity"
    "neylin/internal/domain/error"
    "neylin/internal/domain/valueobject"
)

type RegisterUseCase struct {
    userRepo     repository.UserRepository
    subRepo      repository.SubscriptionRepository
    tokenRepo    repository.RefreshTokenRepository
    authService  service.AuthService
}

func NewRegisterUseCase(
    userRepo repository.UserRepository,
    subRepo repository.SubscriptionRepository,
    tokenRepo repository.RefreshTokenRepository,
    authService service.AuthService,
) *RegisterUseCase {
    return &RegisterUseCase{
        userRepo:    userRepo,
        subRepo:     subRepo,
        tokenRepo:   tokenRepo,
        authService: authService,
    }
}

type RegisterInput struct {
    Email     string
    Password  string
    FirstName string
    LastName  string
}

type RegisterOutput struct {
    User         dto.UserDTO
    AccessToken  string
    RefreshToken string
}

func (uc *RegisterUseCase) Execute(ctx context.Context, input RegisterInput) (*RegisterOutput, error) {
    // 1. Validate email
    email, err := valueobject.NewEmail(input.Email)
    if err != nil {
        return nil, err
    }

    // 2. Check email uniqueness
    exists, err := uc.userRepo.ExistsByEmail(ctx, email)
    if err != nil {
        return nil, err
    }
    if exists {
        return nil, domainerror.ErrUserEmailExists
    }

    // 3. Validate and hash password
    password, err := valueobject.NewPassword(input.Password)
    if err != nil {
        return nil, err
    }

    hashedPassword, err := uc.authService.HashPassword(password)
    if err != nil {
        return nil, err
    }

    // 4. Create user entity
    user := entity.NewUser(email, hashedPassword)
    user.FirstName = input.FirstName
    user.LastName = input.LastName

    // 5. Persist user
    if err := uc.userRepo.Create(ctx, user); err != nil {
        return nil, err
    }

    // 6. Create free subscription
    subscription := entity.NewSubscription(user.ID, valueobject.PlanFree)
    if err := uc.subRepo.Create(ctx, subscription); err != nil {
        return nil, err
    }

    // 7. Generate tokens
    accessToken, err := uc.authService.GenerateAccessToken(user)
    if err != nil {
        return nil, err
    }

    refreshToken, err := uc.authService.GenerateRefreshToken()
    if err != nil {
        return nil, err
    }

    // 8. Store refresh token
    hashedRefresh := uc.authService.HashRefreshToken(refreshToken)
    if err := uc.tokenRepo.Create(ctx, user.ID, hashedRefresh); err != nil {
        return nil, err
    }

    return &RegisterOutput{
        User:         dto.UserToDTO(user),
        AccessToken:  accessToken,
        RefreshToken: refreshToken,
    }, nil
}
```

```go
// internal/application/usecase/map/create.go
package mapuc

import (
    "context"

    "github.com/google/uuid"
    "neylin/internal/application/dto"
    "neylin/internal/application/port/repository"
    "neylin/internal/domain/entity"
    "neylin/internal/domain/error"
    "neylin/internal/domain/service"
    "neylin/internal/domain/valueobject"
)

type CreateMapUseCase struct {
    mapRepo repository.MapRepository
    subRepo repository.SubscriptionRepository
}

func NewCreateMapUseCase(
    mapRepo repository.MapRepository,
    subRepo repository.SubscriptionRepository,
) *CreateMapUseCase {
    return &CreateMapUseCase{
        mapRepo: mapRepo,
        subRepo: subRepo,
    }
}

type CreateMapInput struct {
    UserID      uuid.UUID
    Title       string
    Description string
}

func (uc *CreateMapUseCase) Execute(ctx context.Context, input CreateMapInput) (*dto.MapDTO, error) {
    // 1. Get user's subscription
    sub, err := uc.subRepo.GetByUserID(ctx, input.UserID)
    if err != nil {
        return nil, err
    }

    // 2. Count existing maps
    mapsCount, err := uc.mapRepo.CountByUserID(ctx, input.UserID)
    if err != nil {
        return nil, err
    }

    // 3. Check limit
    if !service.CanCreateMap(sub.PlanType, mapsCount) {
        return nil, domainerror.ErrMapLimitExceeded
    }

    // 4. Create map
    m := entity.NewMap(input.UserID, input.Title, input.Description)

    if err := uc.mapRepo.Create(ctx, m); err != nil {
        return nil, err
    }

    result := dto.MapToDTO(m)
    return &result, nil
}
```

```go
// internal/application/usecase/node/create.go
package nodeuc

import (
    "context"

    "github.com/google/uuid"
    "neylin/internal/application/dto"
    "neylin/internal/application/port/repository"
    "neylin/internal/domain/entity"
    "neylin/internal/domain/error"
    "neylin/internal/domain/service"
    "neylin/internal/domain/valueobject"
)

type CreateNodeUseCase struct {
    nodeRepo repository.NodeRepository
    mapRepo  repository.MapRepository
    subRepo  repository.SubscriptionRepository
}

func NewCreateNodeUseCase(
    nodeRepo repository.NodeRepository,
    mapRepo repository.MapRepository,
    subRepo repository.SubscriptionRepository,
) *CreateNodeUseCase {
    return &CreateNodeUseCase{
        nodeRepo: nodeRepo,
        mapRepo:  mapRepo,
        subRepo:  subRepo,
    }
}

type CreateNodeInput struct {
    UserID      uuid.UUID
    MapID       uuid.UUID
    Label       string
    Description string
    Content     string
    Type        string
    Position    struct{ X, Y float64 }
    Metadata    dto.NodeMetadataInput
}

func (uc *CreateNodeUseCase) Execute(ctx context.Context, input CreateNodeInput) (*dto.NodeDTO, error) {
    // 1. Verify map ownership
    m, err := uc.mapRepo.GetByID(ctx, input.MapID)
    if err != nil {
        return nil, domainerror.ErrMapNotFound
    }
    if m.UserID != input.UserID {
        return nil, domainerror.ErrForbidden
    }

    // 2. Get subscription
    sub, err := uc.subRepo.GetByUserID(ctx, input.UserID)
    if err != nil {
        return nil, err
    }

    // 3. Count nodes
    nodesInMap, err := uc.nodeRepo.CountByMapID(ctx, input.MapID)
    if err != nil {
        return nil, err
    }

    totalNodes, err := uc.nodeRepo.CountByUserID(ctx, input.UserID)
    if err != nil {
        return nil, err
    }

    // 4. Check limits
    if !service.CanCreateNode(sub.PlanType, nodesInMap, totalNodes) {
        return nil, domainerror.ErrNodeLimitExceeded
    }

    // 5. Validate node type
    nodeType, err := valueobject.NewNodeType(input.Type)
    if err != nil {
        return nil, err
    }

    // 6. Create node
    node := entity.NewNode(
        input.MapID,
        input.Label,
        nodeType,
        valueobject.NewPosition(input.Position.X, input.Position.Y),
    )
    node.Description = input.Description
    node.Content = input.Content
    node.Metadata = mapMetadataInput(input.Metadata)

    if err := uc.nodeRepo.Create(ctx, node); err != nil {
        return nil, err
    }

    result := dto.NodeToDTO(node)
    return &result, nil
}
```

### 4.3 DTOs

DTOs — объекты для передачи данных между слоями.

```go
// internal/application/dto/user.go
package dto

import (
    "time"

    "github.com/google/uuid"
    "neylin/internal/domain/entity"
)

type UserDTO struct {
    ID          uuid.UUID          `json:"id"`
    Email       string             `json:"email"`
    FirstName   string             `json:"firstName,omitempty"`
    LastName    string             `json:"lastName,omitempty"`
    DisplayName string             `json:"displayName,omitempty"`
    Username    string             `json:"username,omitempty"`
    Bio         string             `json:"bio,omitempty"`
    AvatarURL   string             `json:"avatarUrl,omitempty"`
    Role        string             `json:"role"`
    Preferences UserPreferencesDTO `json:"preferences"`
    CreatedAt   time.Time          `json:"createdAt"`
}

type UserPreferencesDTO struct {
    Notifications NotificationPreferencesDTO `json:"notifications"`
    Interface     InterfacePreferencesDTO    `json:"interface"`
}

type NotificationPreferencesDTO struct {
    Email     bool `json:"email"`
    Marketing bool `json:"marketing"`
    Updates   bool `json:"updates"`
}

type InterfacePreferencesDTO struct {
    Density    string `json:"density"`
    Animations bool   `json:"animations"`
    Sound      bool   `json:"sound"`
}

func UserToDTO(u *entity.User) UserDTO {
    return UserDTO{
        ID:          u.ID,
        Email:       u.Email.String(),
        FirstName:   u.FirstName,
        LastName:    u.LastName,
        DisplayName: u.DisplayName,
        Username:    u.Username,
        Bio:         u.Bio,
        AvatarURL:   u.AvatarURL,
        Role:        string(u.Role),
        Preferences: UserPreferencesDTO{
            Notifications: NotificationPreferencesDTO{
                Email:     u.Preferences.Notifications.Email,
                Marketing: u.Preferences.Notifications.Marketing,
                Updates:   u.Preferences.Notifications.Updates,
            },
            Interface: InterfacePreferencesDTO{
                Density:    string(u.Preferences.Interface.Density),
                Animations: u.Preferences.Interface.Animations,
                Sound:      u.Preferences.Interface.Sound,
            },
        },
        CreatedAt: u.CreatedAt,
    }
}
```

```go
// internal/application/dto/map.go
package dto

import (
    "time"

    "github.com/google/uuid"
    "neylin/internal/domain/entity"
)

type MapDTO struct {
    ID          uuid.UUID `json:"id"`
    Title       string    `json:"title"`
    Description string    `json:"description,omitempty"`
    NodesCount  int       `json:"nodesCount"`
    PreviewURL  string    `json:"previewUrl,omitempty"`
    CreatedAt   time.Time `json:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt"`
}

type FullMapDTO struct {
    MapDTO
    Nodes      []NodeDTO      `json:"nodes"`
    Edges      []EdgeDTO      `json:"edges"`
    AIAnalysis *AIAnalysisDTO `json:"aiAnalysis,omitempty"`
}

type AIAnalysisDTO struct {
    LastAnalyzed      *time.Time `json:"lastAnalyzed,omitempty"`
    Gaps              []string   `json:"gaps,omitempty"`
    Suggestions       []string   `json:"suggestions,omitempty"`
    ComplexityScore   float64    `json:"complexityScore,omitempty"`
    CompletenessScore float64    `json:"completenessScore,omitempty"`
    StructuralIssues  []string   `json:"structuralIssues,omitempty"`
}

func MapToDTO(m *entity.Map) MapDTO {
    return MapDTO{
        ID:          m.ID,
        Title:       m.Title,
        Description: m.Description,
        PreviewURL:  m.PreviewURL,
        CreatedAt:   m.CreatedAt,
        UpdatedAt:   m.UpdatedAt,
    }
}

func FullMapToDTO(m *entity.FullMap) FullMapDTO {
    nodes := make([]NodeDTO, len(m.Nodes))
    for i, n := range m.Nodes {
        nodes[i] = NodeToDTO(&n)
    }

    edges := make([]EdgeDTO, len(m.Edges))
    for i, e := range m.Edges {
        edges[i] = EdgeToDTO(&e)
    }

    dto := FullMapDTO{
        MapDTO: MapToDTO(&m.Map),
        Nodes:  nodes,
        Edges:  edges,
    }

    if m.AIAnalysis != nil {
        dto.AIAnalysis = &AIAnalysisDTO{
            LastAnalyzed:      m.AIAnalysis.LastAnalyzed,
            Gaps:              m.AIAnalysis.Gaps,
            Suggestions:       m.AIAnalysis.Suggestions,
            ComplexityScore:   m.AIAnalysis.ComplexityScore,
            CompletenessScore: m.AIAnalysis.CompletenessScore,
            StructuralIssues:  m.AIAnalysis.StructuralIssues,
        }
    }

    return dto
}
```

---

## 5. Слой Adapter

### 5.1 HTTP Handlers

```go
// internal/adapter/http/handler/auth.go
package handler

import (
    "github.com/gofiber/fiber/v2"
    "neylin/internal/adapter/http/request"
    "neylin/internal/adapter/http/response"
    "neylin/internal/application/usecase/auth"
)

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
    logoutUC *auth.LogoutUseCase,
    refreshUC *auth.RefreshUseCase,
    forgotPasswordUC *auth.ForgotPasswordUseCase,
    resetPasswordUC *auth.ResetPasswordUseCase,
) *AuthHandler {
    return &AuthHandler{
        registerUC:       registerUC,
        loginUC:          loginUC,
        logoutUC:         logoutUC,
        refreshUC:        refreshUC,
        forgotPasswordUC: forgotPasswordUC,
        resetPasswordUC:  resetPasswordUC,
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

// POST /auth/refresh
func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
    var req request.RefreshRequest
    if err := c.BodyParser(&req); err != nil {
        return response.BadRequest(c, "invalid request body")
    }

    output, err := h.refreshUC.Execute(c.Context(), auth.RefreshInput{
        RefreshToken: req.RefreshToken,
    })

    if err != nil {
        return response.FromDomainError(c, err)
    }

    return c.JSON(response.Success(response.TokenResponse{
        AccessToken:  output.AccessToken,
        RefreshToken: output.RefreshToken,
    }))
}
```

```go
// internal/adapter/http/handler/map.go
package handler

import (
    "github.com/gofiber/fiber/v2"
    "github.com/google/uuid"
    "neylin/internal/adapter/http/request"
    "neylin/internal/adapter/http/response"
    mapuc "neylin/internal/application/usecase/map"
)

type MapHandler struct {
    createUC  *mapuc.CreateMapUseCase
    getUC     *mapuc.GetMapUseCase
    getFullUC *mapuc.GetFullMapUseCase
    listUC    *mapuc.ListMapsUseCase
    updateUC  *mapuc.UpdateMapUseCase
    deleteUC  *mapuc.DeleteMapUseCase
    analyzeUC *mapuc.AnalyzeMapUseCase
}

func NewMapHandler(
    createUC *mapuc.CreateMapUseCase,
    getUC *mapuc.GetMapUseCase,
    getFullUC *mapuc.GetFullMapUseCase,
    listUC *mapuc.ListMapsUseCase,
    updateUC *mapuc.UpdateMapUseCase,
    deleteUC *mapuc.DeleteMapUseCase,
    analyzeUC *mapuc.AnalyzeMapUseCase,
) *MapHandler {
    return &MapHandler{
        createUC:  createUC,
        getUC:     getUC,
        getFullUC: getFullUC,
        listUC:    listUC,
        updateUC:  updateUC,
        deleteUC:  deleteUC,
        analyzeUC: analyzeUC,
    }
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

// GET /maps/:id/full
func (h *MapHandler) GetFull(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)

    mapID, err := uuid.Parse(c.Params("id"))
    if err != nil {
        return response.BadRequest(c, "invalid map id")
    }

    output, err := h.getFullUC.Execute(c.Context(), mapuc.GetFullMapInput{
        UserID: userID,
        MapID:  mapID,
    })

    if err != nil {
        return response.FromDomainError(c, err)
    }

    return c.JSON(response.Success(output))
}

// PATCH /maps/:id
func (h *MapHandler) Update(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)

    mapID, err := uuid.Parse(c.Params("id"))
    if err != nil {
        return response.BadRequest(c, "invalid map id")
    }

    var req request.UpdateMapRequest
    if err := c.BodyParser(&req); err != nil {
        return response.BadRequest(c, "invalid request body")
    }

    output, err := h.updateUC.Execute(c.Context(), mapuc.UpdateMapInput{
        UserID:      userID,
        MapID:       mapID,
        Title:       req.Title,
        Description: req.Description,
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

// POST /maps/:id/analyze
func (h *MapHandler) Analyze(c *fiber.Ctx) error {
    userID := c.Locals("userID").(uuid.UUID)

    mapID, err := uuid.Parse(c.Params("id"))
    if err != nil {
        return response.BadRequest(c, "invalid map id")
    }

    var req request.AnalyzeMapRequest
    if err := c.BodyParser(&req); err != nil {
        return response.BadRequest(c, "invalid request body")
    }

    output, err := h.analyzeUC.Execute(c.Context(), mapuc.AnalyzeMapInput{
        UserID: userID,
        MapID:  mapID,
        Model:  req.Model,
    })

    if err != nil {
        return response.FromDomainError(c, err)
    }

    return c.Status(fiber.StatusAccepted).JSON(response.Success(output))
}
```

### 5.2 Middleware

```go
// internal/adapter/http/middleware/auth.go
package middleware

import (
    "strings"

    "github.com/gofiber/fiber/v2"
    "neylin/internal/adapter/http/response"
    "neylin/internal/application/port/service"
)

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

```go
// internal/adapter/http/middleware/rate_limit.go
package middleware

import (
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/limiter"
)

func RateLimitMiddleware(max int, window time.Duration) fiber.Handler {
    return limiter.New(limiter.Config{
        Max:        max,
        Expiration: window,
        KeyGenerator: func(c *fiber.Ctx) string {
            // По IP для неаутентифицированных
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

```go
// internal/adapter/http/middleware/logger.go
package middleware

import (
    "time"

    "github.com/gofiber/fiber/v2"
    "go.uber.org/zap"
)

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

```go
// internal/adapter/http/middleware/request_id.go
package middleware

import (
    "github.com/gofiber/fiber/v2"
    "github.com/google/uuid"
)

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

### 5.3 Request/Response DTOs

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

type ForgotPasswordRequest struct {
    Email string `json:"email" validate:"required,email"`
}

type ResetPasswordRequest struct {
    Token    string `json:"token" validate:"required"`
    Password string `json:"password" validate:"required,min=8"`
}
```

```go
// internal/adapter/http/response/response.go
package response

import (
    "time"

    "github.com/gofiber/fiber/v2"
    "neylin/internal/domain/error"
)

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
        Error: ErrorBody{
            Code:    "BAD_REQUEST",
            Message: message,
        },
    })
}

func Unauthorized(c *fiber.Ctx, message string) error {
    return c.Status(fiber.StatusUnauthorized).JSON(ErrorResponse{
        Error: ErrorBody{
            Code:    "UNAUTHORIZED",
            Message: message,
        },
    })
}

func ValidationError(c *fiber.Ctx, err error) error {
    return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
        Error: ErrorBody{
            Code:    "VALIDATION_ERROR",
            Message: err.Error(),
        },
    })
}

func FromDomainError(c *fiber.Ctx, err error) error {
    code, status := mapDomainError(err)

    return c.Status(status).JSON(ErrorResponse{
        Error: ErrorBody{
            Code:    code,
            Message: err.Error(),
        },
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
    case domainerror.ErrNodeLimitExceeded:
        return "NODE_LIMIT_EXCEEDED", fiber.StatusUnprocessableEntity
    case domainerror.ErrForbidden:
        return "FORBIDDEN", fiber.StatusForbidden
    default:
        return "INTERNAL_ERROR", fiber.StatusInternalServerError
    }
}
```

### 5.4 Router

```go
// internal/adapter/http/router/router.go
package router

import (
    "github.com/gofiber/fiber/v2"
    "neylin/internal/adapter/http/handler"
    "neylin/internal/adapter/http/middleware"
    "neylin/internal/application/port/service"
)

func Setup(
    app *fiber.App,
    authService service.AuthService,
    authHandler *handler.AuthHandler,
    userHandler *handler.UserHandler,
    mapHandler *handler.MapHandler,
    nodeHandler *handler.NodeHandler,
    edgeHandler *handler.EdgeHandler,
    subscriptionHandler *handler.SubscriptionHandler,
    paymentHandler *handler.PaymentHandler,
    webhookHandler *handler.WebhookHandler,
    healthHandler *handler.HealthHandler,
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

    // Logout (needs auth)
    protected.Post("/auth/logout", authHandler.Logout)

    // Users
    users := protected.Group("/users")
    users.Get("/me", userHandler.GetProfile)
    users.Patch("/me/profile", userHandler.UpdateProfile)
    users.Post("/me/avatar", userHandler.UploadAvatar)
    users.Patch("/me/email", userHandler.ChangeEmail)
    users.Patch("/me/password", userHandler.ChangePassword)
    users.Patch("/me/preferences", userHandler.UpdatePreferences)
    users.Delete("/me", userHandler.DeleteAccount)

    // Maps
    maps := protected.Group("/maps")
    maps.Get("/", mapHandler.List)
    maps.Post("/", mapHandler.Create)
    maps.Get("/:id", mapHandler.Get)
    maps.Get("/:id/full", mapHandler.GetFull)
    maps.Patch("/:id", mapHandler.Update)
    maps.Delete("/:id", mapHandler.Delete)
    maps.Post("/:id/analyze", mapHandler.Analyze)

    // Nodes
    maps.Get("/:mapId/nodes", nodeHandler.List)
    maps.Post("/:mapId/nodes", nodeHandler.Create)
    maps.Patch("/:mapId/nodes/positions", nodeHandler.UpdatePositions)

    nodes := protected.Group("/nodes")
    nodes.Get("/:id", nodeHandler.Get)
    nodes.Patch("/:id", nodeHandler.Update)
    nodes.Delete("/:id", nodeHandler.Delete)

    // Edges
    maps.Get("/:mapId/edges", edgeHandler.List)
    maps.Post("/:mapId/edges", edgeHandler.Create)

    edges := protected.Group("/edges")
    edges.Patch("/:id", edgeHandler.Update)
    edges.Delete("/:id", edgeHandler.Delete)

    // Subscriptions
    subscriptions := protected.Group("/subscriptions")
    subscriptions.Get("/current", subscriptionHandler.GetCurrent)
    subscriptions.Get("/usage", subscriptionHandler.GetUsage)
    subscriptions.Post("/checkout", subscriptionHandler.CreateCheckout)
    subscriptions.Post("/change", subscriptionHandler.ChangePlan)
    subscriptions.Post("/cancel", subscriptionHandler.Cancel)
    subscriptions.Post("/resume", subscriptionHandler.Resume)

    // Plans (public)
    api.Get("/plans", subscriptionHandler.ListPlans)

    // Payment Methods
    payments := protected.Group("/payment-methods")
    payments.Get("/", paymentHandler.List)
    payments.Post("/card", paymentHandler.AddCard)
    payments.Post("/crypto", paymentHandler.AddCrypto)
    payments.Delete("/:id", paymentHandler.Remove)
    payments.Patch("/:id/default", paymentHandler.SetDefault)

    // Payment History
    protected.Get("/payment-history", paymentHandler.GetHistory)

    // Webhooks (no auth, signature verification)
    api.Post("/webhooks/stripe", webhookHandler.HandleStripe)
}
```

### 5.5 Repository Implementations

```go
// internal/adapter/repository/postgres/user.go
package postgres

import (
    "context"
    "database/sql"
    "encoding/json"
    "time"

    "github.com/google/uuid"
    "github.com/jmoiron/sqlx"
    "neylin/internal/domain/entity"
    "neylin/internal/domain/valueobject"
)

type UserRepository struct {
    db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
    return &UserRepository{db: db}
}

type userRow struct {
    ID               uuid.UUID      `db:"id"`
    Email            string         `db:"email"`
    PasswordHash     string         `db:"password_hash"`
    FirstName        sql.NullString `db:"first_name"`
    LastName         sql.NullString `db:"last_name"`
    DisplayName      sql.NullString `db:"display_name"`
    Username         sql.NullString `db:"username"`
    Bio              sql.NullString `db:"bio"`
    AvatarURL        sql.NullString `db:"avatar_url"`
    Role             string         `db:"role"`
    Preferences      []byte         `db:"preferences"`
    StripeCustomerID sql.NullString `db:"stripe_customer_id"`
    DeletedAt        sql.NullTime   `db:"deleted_at"`
    CreatedAt        time.Time      `db:"created_at"`
    UpdatedAt        time.Time      `db:"updated_at"`
}

func (r *UserRepository) Create(ctx context.Context, user *entity.User) error {
    prefsJSON, err := json.Marshal(user.Preferences)
    if err != nil {
        return err
    }

    query := `
        INSERT INTO users (
            id, email, password_hash, first_name, last_name,
            display_name, username, bio, avatar_url, role,
            preferences, stripe_customer_id, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        )
    `

    _, err = r.db.ExecContext(ctx, query,
        user.ID,
        user.Email.String(),
        string(user.Password),
        nullString(user.FirstName),
        nullString(user.LastName),
        nullString(user.DisplayName),
        nullString(user.Username),
        nullString(user.Bio),
        nullString(user.AvatarURL),
        string(user.Role),
        prefsJSON,
        nullString(user.StripeCustomerID),
        user.CreatedAt,
        user.UpdatedAt,
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

func (r *UserRepository) Update(ctx context.Context, user *entity.User) error {
    prefsJSON, err := json.Marshal(user.Preferences)
    if err != nil {
        return err
    }

    query := `
        UPDATE users SET
            email = $2,
            password_hash = $3,
            first_name = $4,
            last_name = $5,
            display_name = $6,
            username = $7,
            bio = $8,
            avatar_url = $9,
            role = $10,
            preferences = $11,
            stripe_customer_id = $12,
            updated_at = $13
        WHERE id = $1
    `

    _, err = r.db.ExecContext(ctx, query,
        user.ID,
        user.Email.String(),
        string(user.Password),
        nullString(user.FirstName),
        nullString(user.LastName),
        nullString(user.DisplayName),
        nullString(user.Username),
        nullString(user.Bio),
        nullString(user.AvatarURL),
        string(user.Role),
        prefsJSON,
        nullString(user.StripeCustomerID),
        time.Now(),
    )

    return err
}

func (r *UserRepository) ExistsByEmail(ctx context.Context, email valueobject.Email) (bool, error) {
    var exists bool
    query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL)`
    err := r.db.GetContext(ctx, &exists, query, email.String())
    return exists, err
}

func rowToUser(row *userRow) (*entity.User, error) {
    var prefs entity.UserPreferences
    if err := json.Unmarshal(row.Preferences, &prefs); err != nil {
        return nil, err
    }

    var deletedAt *time.Time
    if row.DeletedAt.Valid {
        deletedAt = &row.DeletedAt.Time
    }

    return &entity.User{
        ID:               row.ID,
        Email:            valueobject.Email(row.Email),
        Password:         valueobject.HashedPassword(row.PasswordHash),
        FirstName:        row.FirstName.String,
        LastName:         row.LastName.String,
        DisplayName:      row.DisplayName.String,
        Username:         row.Username.String,
        Bio:              row.Bio.String,
        AvatarURL:        row.AvatarURL.String,
        Role:             entity.Role(row.Role),
        Preferences:      prefs,
        StripeCustomerID: row.StripeCustomerID.String,
        DeletedAt:        deletedAt,
        CreatedAt:        row.CreatedAt,
        UpdatedAt:        row.UpdatedAt,
    }, nil
}

func nullString(s string) sql.NullString {
    if s == "" {
        return sql.NullString{}
    }
    return sql.NullString{String: s, Valid: true}
}
```

---

## 6. Слой Infrastructure

### 6.1 Configuration

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
    SecretKey        string `envconfig:"STRIPE_SECRET_KEY" required:"true"`
    WebhookSecret    string `envconfig:"STRIPE_WEBHOOK_SECRET" required:"true"`
    PriceProMonthly  string `envconfig:"STRIPE_PRICE_PRO_MONTHLY"`
    PriceProYearly   string `envconfig:"STRIPE_PRICE_PRO_YEARLY"`
    PriceUltraMonthly string `envconfig:"STRIPE_PRICE_ULTRA_MONTHLY"`
    PriceUltraYearly string `envconfig:"STRIPE_PRICE_ULTRA_YEARLY"`
}

type AIConfig struct {
    OpenAIAPIKey     string        `envconfig:"OPENAI_API_KEY"`
    AnthropicAPIKey  string        `envconfig:"ANTHROPIC_API_KEY"`
    DefaultModel     string        `envconfig:"AI_DEFAULT_MODEL" default:"gpt-3.5-turbo"`
    RequestTimeout   time.Duration `envconfig:"AI_REQUEST_TIMEOUT" default:"60s"`
}

type S3Config struct {
    Endpoint      string `envconfig:"S3_ENDPOINT" required:"true"`
    Region        string `envconfig:"S3_REGION" default:"auto"`
    AccessKey     string `envconfig:"S3_ACCESS_KEY" required:"true"`
    SecretKey     string `envconfig:"S3_SECRET_KEY" required:"true"`
    BucketAvatars string `envconfig:"S3_BUCKET_AVATARS" default:"neylin-avatars"`
    BucketPreviews string `envconfig:"S3_BUCKET_PREVIEWS" default:"neylin-previews"`
}

type SMTPConfig struct {
    Host     string `envconfig:"SMTP_HOST"`
    Port     int    `envconfig:"SMTP_PORT" default:"587"`
    User     string `envconfig:"SMTP_USER"`
    Password string `envconfig:"SMTP_PASSWORD"`
    From     string `envconfig:"EMAIL_FROM" default:"noreply@neylin.io"`
    FromName string `envconfig:"EMAIL_FROM_NAME" default:"Neylin"`
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

### 6.2 Database Setup

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

### 6.3 JWT Implementation

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

### 6.4 External Services

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
    // Формируем промпт с графом
    prompt := buildAnalysisPrompt(fullMap)

    resp, err := c.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
        Model: model,
        Messages: []openai.ChatCompletionMessage{
            {
                Role:    openai.ChatMessageRoleSystem,
                Content: "You are an expert knowledge graph analyst...",
            },
            {
                Role:    openai.ChatMessageRoleUser,
                Content: prompt,
            },
        },
    })

    if err != nil {
        return nil, err
    }

    return parseAnalysisResponse(resp.Choices[0].Message.Content)
}

func buildAnalysisPrompt(fullMap *entity.FullMap) string {
    // Сериализация графа в промпт
    // ...
}

func parseAnalysisResponse(content string) (*entity.AIAnalysis, error) {
    // Парсинг JSON ответа
    // ...
}
```

```go
// internal/infrastructure/external/stripe/client.go
package stripe

import (
    "github.com/stripe/stripe-go/v76"
    "github.com/stripe/stripe-go/v76/checkout/session"
    "github.com/stripe/stripe-go/v76/customer"
    "github.com/stripe/stripe-go/v76/subscription"
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
            {
                Price:    stripe.String(priceID),
                Quantity: stripe.Int64(1),
            },
        },
    }
    return session.New(params)
}

func (c *Client) CancelSubscription(subscriptionID string) (*stripe.Subscription, error) {
    params := &stripe.SubscriptionParams{
        CancelAtPeriodEnd: stripe.Bool(true),
    }
    return subscription.Update(subscriptionID, params)
}
```

---

## 7. Dependency Injection

### 7.1 Wire Setup

```go
// cmd/server/wire.go
//go:build wireinject
// +build wireinject

package main

import (
    "github.com/google/wire"
    "neylin/internal/adapter/http/handler"
    "neylin/internal/adapter/http/router"
    "neylin/internal/adapter/repository/postgres"
    "neylin/internal/application/usecase/auth"
    "neylin/internal/application/usecase/map"
    // ... other imports
    "neylin/internal/infrastructure/config"
    "neylin/internal/infrastructure/database"
    infraAuth "neylin/internal/infrastructure/auth"
    "neylin/internal/infrastructure/external/stripe"
    "neylin/internal/infrastructure/external/openai"
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
        postgres.NewPaymentRepository,
        postgres.NewRefreshTokenRepository,

        // External Services
        infraAuth.NewJWTService,
        stripe.NewClient,
        openai.NewClient,

        // Use Cases
        auth.NewRegisterUseCase,
        auth.NewLoginUseCase,
        auth.NewLogoutUseCase,
        auth.NewRefreshUseCase,
        mapuc.NewCreateMapUseCase,
        mapuc.NewGetMapUseCase,
        mapuc.NewGetFullMapUseCase,
        mapuc.NewListMapsUseCase,
        mapuc.NewUpdateMapUseCase,
        mapuc.NewDeleteMapUseCase,
        // ... other use cases

        // Handlers
        handler.NewAuthHandler,
        handler.NewUserHandler,
        handler.NewMapHandler,
        handler.NewNodeHandler,
        handler.NewEdgeHandler,
        handler.NewSubscriptionHandler,
        handler.NewPaymentHandler,
        handler.NewWebhookHandler,
        handler.NewHealthHandler,

        // Router
        router.Setup,

        // App
        NewApp,
    )
    return nil, nil
}
```

### 7.2 Main Entry Point

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

## 8. Тестирование

### 8.1 Структура тестов

```
neylin-backend/
├── internal/
│   ├── domain/
│   │   └── entity/
│   │       └── user_test.go          # Unit tests
│   │
│   ├── application/
│   │   └── usecase/
│   │       └── auth/
│   │           └── register_test.go  # Unit tests (with mocks)
│   │
│   └── adapter/
│       ├── http/
│       │   └── handler/
│       │       └── auth_test.go      # Integration tests
│       │
│       └── repository/
│           └── postgres/
│               └── user_test.go      # Integration tests
│
└── tests/
    ├── e2e/
    │   └── auth_test.go              # E2E tests
    │
    └── fixtures/
        └── testdata.go
```

### 8.2 Unit Tests (Domain)

```go
// internal/domain/entity/user_test.go
package entity_test

import (
    "testing"

    "github.com/stretchr/testify/assert"
    "neylin/internal/domain/entity"
    "neylin/internal/domain/valueobject"
)

func TestNewUser(t *testing.T) {
    email, _ := valueobject.NewEmail("test@example.com")
    password := valueobject.HashedPassword("hashed")

    user := entity.NewUser(email, password)

    assert.NotEmpty(t, user.ID)
    assert.Equal(t, email, user.Email)
    assert.Equal(t, entity.RoleUser, user.Role)
    assert.False(t, user.IsDeleted())
}

func TestUser_CanAccessMap(t *testing.T) {
    tests := []struct {
        name        string
        userID      string
        userRole    entity.Role
        mapOwnerID  string
        expected    bool
    }{
        {"owner can access", "user1", entity.RoleUser, "user1", true},
        {"admin can access", "admin1", entity.RoleAdmin, "user1", true},
        {"other user cannot", "user2", entity.RoleUser, "user1", false},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            user := &entity.User{
                ID:   uuid.MustParse(tt.userID),
                Role: tt.userRole,
            }

            result := user.CanAccessMap(uuid.MustParse(tt.mapOwnerID))

            assert.Equal(t, tt.expected, result)
        })
    }
}
```

### 8.3 Unit Tests (Use Case with Mocks)

```go
// internal/application/usecase/auth/register_test.go
package auth_test

import (
    "context"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "neylin/internal/application/usecase/auth"
    "neylin/internal/domain/entity"
    "neylin/internal/domain/valueobject"
    "neylin/internal/mocks"
)

func TestRegisterUseCase_Execute(t *testing.T) {
    ctx := context.Background()

    t.Run("success", func(t *testing.T) {
        userRepo := new(mocks.UserRepository)
        subRepo := new(mocks.SubscriptionRepository)
        tokenRepo := new(mocks.RefreshTokenRepository)
        authService := new(mocks.AuthService)

        // Setup expectations
        userRepo.On("ExistsByEmail", ctx, mock.Anything).Return(false, nil)
        userRepo.On("Create", ctx, mock.Anything).Return(nil)
        subRepo.On("Create", ctx, mock.Anything).Return(nil)
        tokenRepo.On("Create", ctx, mock.Anything, mock.Anything).Return(nil)

        authService.On("HashPassword", mock.Anything).Return(valueobject.HashedPassword("hashed"), nil)
        authService.On("GenerateAccessToken", mock.Anything).Return("access-token", nil)
        authService.On("GenerateRefreshToken").Return("refresh-token", nil)
        authService.On("HashRefreshToken", "refresh-token").Return("hashed-refresh")

        uc := auth.NewRegisterUseCase(userRepo, subRepo, tokenRepo, authService)

        output, err := uc.Execute(ctx, auth.RegisterInput{
            Email:    "test@example.com",
            Password: "SecurePass123",
        })

        assert.NoError(t, err)
        assert.NotNil(t, output)
        assert.Equal(t, "access-token", output.AccessToken)
        assert.Equal(t, "refresh-token", output.RefreshToken)

        userRepo.AssertExpectations(t)
    })

    t.Run("email already exists", func(t *testing.T) {
        userRepo := new(mocks.UserRepository)
        userRepo.On("ExistsByEmail", ctx, mock.Anything).Return(true, nil)

        uc := auth.NewRegisterUseCase(userRepo, nil, nil, nil)

        output, err := uc.Execute(ctx, auth.RegisterInput{
            Email:    "existing@example.com",
            Password: "SecurePass123",
        })

        assert.Error(t, err)
        assert.Nil(t, output)
        assert.Equal(t, domainerror.ErrUserEmailExists, err)
    })
}
```

### 8.4 Integration Tests (Repository)

```go
// internal/adapter/repository/postgres/user_test.go
package postgres_test

import (
    "context"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/suite"
    "neylin/internal/adapter/repository/postgres"
    "neylin/internal/domain/entity"
    "neylin/internal/domain/valueobject"
    "neylin/tests/testdb"
)

type UserRepositoryTestSuite struct {
    suite.Suite
    repo *postgres.UserRepository
    db   *testdb.TestDB
}

func (s *UserRepositoryTestSuite) SetupSuite() {
    s.db = testdb.New()
    s.repo = postgres.NewUserRepository(s.db.DB)
}

func (s *UserRepositoryTestSuite) TearDownSuite() {
    s.db.Close()
}

func (s *UserRepositoryTestSuite) SetupTest() {
    s.db.Truncate("users")
}

func (s *UserRepositoryTestSuite) TestCreate() {
    ctx := context.Background()
    email, _ := valueobject.NewEmail("test@example.com")
    user := entity.NewUser(email, "hashed")

    err := s.repo.Create(ctx, user)

    assert.NoError(s.T(), err)

    // Verify in DB
    found, err := s.repo.GetByID(ctx, user.ID)
    assert.NoError(s.T(), err)
    assert.Equal(s.T(), email, found.Email)
}

func (s *UserRepositoryTestSuite) TestGetByEmail_NotFound() {
    ctx := context.Background()
    email, _ := valueobject.NewEmail("notfound@example.com")

    _, err := s.repo.GetByEmail(ctx, email)

    assert.Error(s.T(), err)
    assert.Equal(s.T(), domainerror.ErrUserNotFound, err)
}

func TestUserRepositoryTestSuite(t *testing.T) {
    suite.Run(t, new(UserRepositoryTestSuite))
}
```

### 8.5 E2E Tests

```go
// tests/e2e/auth_test.go
package e2e_test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/stretchr/testify/assert"
    "neylin/tests/testapp"
)

func TestAuthFlow(t *testing.T) {
    app := testapp.New()
    defer app.Close()

    t.Run("register", func(t *testing.T) {
        body := map[string]string{
            "email":    "test@example.com",
            "password": "SecurePass123",
        }
        jsonBody, _ := json.Marshal(body)

        req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewReader(jsonBody))
        req.Header.Set("Content-Type", "application/json")

        resp, _ := app.Test(req)

        assert.Equal(t, http.StatusCreated, resp.StatusCode)

        var result map[string]interface{}
        json.NewDecoder(resp.Body).Decode(&result)

        data := result["data"].(map[string]interface{})
        assert.NotEmpty(t, data["accessToken"])
        assert.NotEmpty(t, data["refreshToken"])
        assert.NotEmpty(t, data["user"])
    })

    t.Run("login", func(t *testing.T) {
        body := map[string]string{
            "email":    "test@example.com",
            "password": "SecurePass123",
        }
        jsonBody, _ := json.Marshal(body)

        req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewReader(jsonBody))
        req.Header.Set("Content-Type", "application/json")

        resp, _ := app.Test(req)

        assert.Equal(t, http.StatusOK, resp.StatusCode)
    })

    t.Run("login invalid credentials", func(t *testing.T) {
        body := map[string]string{
            "email":    "test@example.com",
            "password": "WrongPassword",
        }
        jsonBody, _ := json.Marshal(body)

        req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewReader(jsonBody))
        req.Header.Set("Content-Type", "application/json")

        resp, _ := app.Test(req)

        assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
    })
}
```

---

## 9. Deployment

### 9.1 Dockerfile

```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Dependencies
COPY go.mod go.sum ./
RUN go mod download

# Source
COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/server

# Final stage
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

COPY --from=builder /server .
COPY migrations ./migrations

EXPOSE 8080

ENTRYPOINT ["./server"]
```

### 9.2 Docker Compose

```yaml
# deployments/docker/docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: ../..
      dockerfile: deployments/docker/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - APP_ENV=development
      - DATABASE_URL=postgres://neylin:neylin@postgres:5432/neylin?sslmode=disable
      - REDIS_URL=redis://redis:6379/0
      - JWT_PRIVATE_KEY_PATH=/secrets/jwt-private.pem
      - JWT_PUBLIC_KEY_PATH=/secrets/jwt-public.pem
    volumes:
      - ./secrets:/secrets:ro
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=neylin
      - POSTGRES_PASSWORD=neylin
      - POSTGRES_DB=neylin
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  migrate:
    image: migrate/migrate:v4.17.0
    volumes:
      - ../../migrations:/migrations
    command: ["-path", "/migrations", "-database", "postgres://neylin:neylin@postgres:5432/neylin?sslmode=disable", "up"]
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 9.3 Makefile

```makefile
.PHONY: build run test lint migrate

# Build
build:
	go build -o bin/server ./cmd/server

# Run locally
run:
	go run ./cmd/server

# Run with hot reload
dev:
	air

# Tests
test:
	go test -v ./...

test-coverage:
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

# Linting
lint:
	golangci-lint run

# Database
migrate-up:
	migrate -path migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path migrations -database "$(DATABASE_URL)" down 1

migrate-create:
	migrate create -ext sql -dir migrations -seq $(name)

# Docker
docker-build:
	docker build -f deployments/docker/Dockerfile -t neylin-api .

docker-up:
	docker-compose -f deployments/docker/docker-compose.yml up -d

docker-down:
	docker-compose -f deployments/docker/docker-compose.yml down

# Code generation
generate:
	go generate ./...

wire:
	cd cmd/server && wire

# Mock generation
mocks:
	mockery --all --dir internal/application/port --output internal/mocks
```

---

## 10. Чеклист разработки

### При создании нового Use Case

- [ ] Определить Input/Output DTOs
- [ ] Определить необходимые порты (репозитории, сервисы)
- [ ] Реализовать бизнес-логику
- [ ] Добавить валидацию входных данных
- [ ] Добавить проверку прав доступа
- [ ] Написать unit-тесты с моками
- [ ] Добавить в Wire

### При создании нового Handler

- [ ] Создать Request/Response DTOs
- [ ] Реализовать парсинг и валидацию запроса
- [ ] Вызвать Use Case
- [ ] Маппинг ошибок на HTTP статусы
- [ ] Добавить роут в router
- [ ] Написать интеграционные тесты

### При создании новой Entity

- [ ] Определить поля и типы
- [ ] Создать Value Objects для сложных полей
- [ ] Добавить конструктор с валидацией
- [ ] Добавить бизнес-методы
- [ ] Создать миграцию БД
- [ ] Реализовать репозиторий
- [ ] Написать unit-тесты

---

## 11. Quick Reference

| Слой | Что содержит | Может зависеть от |
|------|--------------|-------------------|
| Domain | Entities, Value Objects, Domain Services | Ничего |
| Application | Use Cases, Ports (Interfaces), DTOs | Domain |
| Adapter | Handlers, Repositories, Middleware | Application, Domain |
| Infrastructure | Config, DB, External Services | Все слои |

| Паттерн | Использование |
|---------|---------------|
| Repository | Абстракция доступа к данным |
| Use Case | Один бизнес-сценарий |
| DTO | Передача данных между слоями |
| Value Object | Иммутабельный объект с валидацией |
| Port | Интерфейс внешней зависимости |

| Тип теста | Что тестирует | Где находится |
|-----------|---------------|---------------|
| Unit | Domain logic, Use Cases | `*_test.go` рядом с кодом |
| Integration | Repositories, Handlers | `*_test.go` рядом с кодом |
| E2E | Full API flow | `tests/e2e/` |

---

## 12. Redis Architecture

### 12.1 Enhanced Configuration

```go
// internal/infrastructure/config/config.go
type RedisConfig struct {
    URL              string        `envconfig:"REDIS_URL" required:"true"`
    ClusterURLs      string        `envconfig:"REDIS_CLUSTER_URLS"`           // Comma-separated for cluster mode
    Mode             string        `envconfig:"REDIS_MODE" default:"single"`  // single, sentinel, cluster
    SentinelMaster   string        `envconfig:"REDIS_SENTINEL_MASTER"`
    Password         string        `envconfig:"REDIS_PASSWORD"`
    DB               int           `envconfig:"REDIS_DB" default:"0"`

    // Connection Pool
    PoolSize         int           `envconfig:"REDIS_POOL_SIZE" default:"100"`
    MinIdleConns     int           `envconfig:"REDIS_MIN_IDLE" default:"10"`
    MaxRetries       int           `envconfig:"REDIS_MAX_RETRIES" default:"3"`

    // Timeouts
    DialTimeout      time.Duration `envconfig:"REDIS_DIAL_TIMEOUT" default:"5s"`
    ReadTimeout      time.Duration `envconfig:"REDIS_READ_TIMEOUT" default:"3s"`
    WriteTimeout     time.Duration `envconfig:"REDIS_WRITE_TIMEOUT" default:"3s"`
    PoolTimeout      time.Duration `envconfig:"REDIS_POOL_TIMEOUT" default:"4s"`

    // TLS
    TLSEnabled       bool          `envconfig:"REDIS_TLS_ENABLED" default:"false"`
    TLSCertPath      string        `envconfig:"REDIS_TLS_CERT_PATH"`
}
```

### 12.2 Key Naming Convention

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

import (
    "fmt"
    "os"
)

var env = os.Getenv("APP_ENV")

type KeyBuilder struct {
    prefix string
}

func NewKeyBuilder() *KeyBuilder {
    return &KeyBuilder{prefix: fmt.Sprintf("neylin:%s", env)}
}

// Session keys
func (k *KeyBuilder) Session(userID string) string {
    return fmt.Sprintf("%s:session:%s", k.prefix, userID)
}

func (k *KeyBuilder) SessionRefresh(tokenID string) string {
    return fmt.Sprintf("%s:session:refresh:%s", k.prefix, tokenID)
}

// Rate limiting keys
func (k *KeyBuilder) RateGlobal() string {
    return fmt.Sprintf("%s:rate:global", k.prefix)
}

func (k *KeyBuilder) RateIP(ip string) string {
    return fmt.Sprintf("%s:rate:ip:%s", k.prefix, ip)
}

func (k *KeyBuilder) RateUser(userID string) string {
    return fmt.Sprintf("%s:rate:user:%s", k.prefix, userID)
}

func (k *KeyBuilder) RateEndpoint(userID, endpoint string) string {
    return fmt.Sprintf("%s:rate:endpoint:%s:%s", k.prefix, userID, endpoint)
}

func (k *KeyBuilder) RateResource(resourceType, resourceID string) string {
    return fmt.Sprintf("%s:rate:resource:%s:%s", k.prefix, resourceType, resourceID)
}

// Cache keys
func (k *KeyBuilder) CacheMap(mapID string) string {
    return fmt.Sprintf("%s:cache:map:%s", k.prefix, mapID)
}

func (k *KeyBuilder) CacheMapFull(mapID string) string {
    return fmt.Sprintf("%s:cache:map:full:%s", k.prefix, mapID)
}

func (k *KeyBuilder) CacheUserMaps(userID string) string {
    return fmt.Sprintf("%s:cache:user:maps:%s", k.prefix, userID)
}

func (k *KeyBuilder) CacheUserSubscription(userID string) string {
    return fmt.Sprintf("%s:cache:user:subscription:%s", k.prefix, userID)
}

// Lock keys
func (k *KeyBuilder) LockMap(mapID string) string {
    return fmt.Sprintf("%s:lock:map:%s", k.prefix, mapID)
}

func (k *KeyBuilder) LockUser(userID string) string {
    return fmt.Sprintf("%s:lock:user:%s", k.prefix, userID)
}

func (k *KeyBuilder) LockSubscription(userID string) string {
    return fmt.Sprintf("%s:lock:subscription:%s", k.prefix, userID)
}

// Idempotency keys
func (k *KeyBuilder) Idempotency(key string) string {
    return fmt.Sprintf("%s:idempotency:%s", k.prefix, key)
}

// Queue keys
func (k *KeyBuilder) QueueAIAnalyze() string {
    return fmt.Sprintf("%s:queue:ai:analyze", k.prefix)
}

func (k *KeyBuilder) QueueEmail() string {
    return fmt.Sprintf("%s:queue:email", k.prefix)
}

// Pub/Sub channels
func (k *KeyBuilder) PubSubMapUpdates(mapID string) string {
    return fmt.Sprintf("%s:pubsub:map:%s", k.prefix, mapID)
}

func (k *KeyBuilder) PubSubUserNotifications(userID string) string {
    return fmt.Sprintf("%s:pubsub:user:%s", k.prefix, userID)
}

// Circuit breaker keys
func (k *KeyBuilder) CircuitBreaker(service string) string {
    return fmt.Sprintf("%s:circuit:%s", k.prefix, service)
}
```

### 12.3 Redis Client Factory

```go
// internal/infrastructure/database/redis.go
package database

import (
    "context"
    "crypto/tls"
    "strings"
    "time"

    "github.com/redis/go-redis/v9"
    "neylin/internal/infrastructure/config"
)

type RedisClient interface {
    redis.Cmdable
    Close() error
    Subscribe(ctx context.Context, channels ...string) *redis.PubSub
}

func NewRedis(cfg config.RedisConfig) (RedisClient, error) {
    var client RedisClient
    var err error

    switch cfg.Mode {
    case "cluster":
        client, err = newClusterClient(cfg)
    case "sentinel":
        client, err = newSentinelClient(cfg)
    default:
        client, err = newSingleClient(cfg)
    }

    if err != nil {
        return nil, err
    }

    // Verify connection
    ctx, cancel := context.WithTimeout(context.Background(), cfg.DialTimeout)
    defer cancel()

    if err := client.Ping(ctx).Err(); err != nil {
        return nil, err
    }

    return client, nil
}

func newSingleClient(cfg config.RedisConfig) (*redis.Client, error) {
    opts, err := redis.ParseURL(cfg.URL)
    if err != nil {
        return nil, err
    }

    opts.PoolSize = cfg.PoolSize
    opts.MinIdleConns = cfg.MinIdleConns
    opts.MaxRetries = cfg.MaxRetries
    opts.DialTimeout = cfg.DialTimeout
    opts.ReadTimeout = cfg.ReadTimeout
    opts.WriteTimeout = cfg.WriteTimeout
    opts.PoolTimeout = cfg.PoolTimeout

    if cfg.TLSEnabled {
        opts.TLSConfig = &tls.Config{
            MinVersion: tls.VersionTLS12,
        }
    }

    return redis.NewClient(opts), nil
}

func newClusterClient(cfg config.RedisConfig) (*redis.ClusterClient, error) {
    addrs := strings.Split(cfg.ClusterURLs, ",")

    opts := &redis.ClusterOptions{
        Addrs:        addrs,
        Password:     cfg.Password,
        PoolSize:     cfg.PoolSize,
        MinIdleConns: cfg.MinIdleConns,
        MaxRetries:   cfg.MaxRetries,
        DialTimeout:  cfg.DialTimeout,
        ReadTimeout:  cfg.ReadTimeout,
        WriteTimeout: cfg.WriteTimeout,
        PoolTimeout:  cfg.PoolTimeout,
    }

    if cfg.TLSEnabled {
        opts.TLSConfig = &tls.Config{
            MinVersion: tls.VersionTLS12,
        }
    }

    return redis.NewClusterClient(opts), nil
}

func newSentinelClient(cfg config.RedisConfig) (*redis.Client, error) {
    addrs := strings.Split(cfg.ClusterURLs, ",")

    opts := &redis.FailoverOptions{
        MasterName:    cfg.SentinelMaster,
        SentinelAddrs: addrs,
        Password:      cfg.Password,
        DB:            cfg.DB,
        PoolSize:      cfg.PoolSize,
        MinIdleConns:  cfg.MinIdleConns,
        MaxRetries:    cfg.MaxRetries,
        DialTimeout:   cfg.DialTimeout,
        ReadTimeout:   cfg.ReadTimeout,
        WriteTimeout:  cfg.WriteTimeout,
        PoolTimeout:   cfg.PoolTimeout,
    }

    if cfg.TLSEnabled {
        opts.TLSConfig = &tls.Config{
            MinVersion: tls.VersionTLS12,
        }
    }

    return redis.NewFailoverClient(opts), nil
}
```

### 12.4 Session Management

```go
// internal/infrastructure/redis/session.go
package redis

import (
    "context"
    "encoding/json"
    "time"

    "github.com/redis/go-redis/v9"
)

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

    jsonData, err := json.Marshal(data)
    if err != nil {
        return err
    }

    // Use HSET for storing session data with device-specific field
    return m.client.HSet(ctx, key, data.DeviceID, jsonData).Err()
}

// GetSession retrieves session data
func (m *SessionManager) GetSession(ctx context.Context, userID, deviceID string) (*SessionData, error) {
    key := m.keys.Session(userID)

    jsonData, err := m.client.HGet(ctx, key, deviceID).Bytes()
    if err == redis.Nil {
        return nil, nil
    }
    if err != nil {
        return nil, err
    }

    var data SessionData
    if err := json.Unmarshal(jsonData, &data); err != nil {
        return nil, err
    }

    return &data, nil
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

// UpdateActivity updates last activity timestamp
func (m *SessionManager) UpdateActivity(ctx context.Context, userID, deviceID string) error {
    session, err := m.GetSession(ctx, userID, deviceID)
    if err != nil || session == nil {
        return err
    }

    session.LastActivity = time.Now()
    return m.CreateSession(ctx, session)
}

// DeleteSession removes a specific session
func (m *SessionManager) DeleteSession(ctx context.Context, userID, deviceID string) error {
    key := m.keys.Session(userID)
    return m.client.HDel(ctx, key, deviceID).Err()
}

// DeleteAllSessions removes all sessions for user (logout all devices)
func (m *SessionManager) DeleteAllSessions(ctx context.Context, userID string) error {
    key := m.keys.Session(userID)
    return m.client.Del(ctx, key).Err()
}

// Refresh token storage
func (m *SessionManager) StoreRefreshToken(ctx context.Context, tokenID, userID string, ttl time.Duration) error {
    key := m.keys.SessionRefresh(tokenID)
    return m.client.Set(ctx, key, userID, ttl).Err()
}

func (m *SessionManager) GetRefreshTokenUser(ctx context.Context, tokenID string) (string, error) {
    key := m.keys.SessionRefresh(tokenID)
    return m.client.Get(ctx, key).Result()
}

func (m *SessionManager) RevokeRefreshToken(ctx context.Context, tokenID string) error {
    key := m.keys.SessionRefresh(tokenID)
    return m.client.Del(ctx, key).Err()
}
```

### 12.5 Rate Limiting Implementation

```go
// internal/infrastructure/redis/ratelimit.go
package redis

import (
    "context"
    "fmt"
    "time"

    "github.com/redis/go-redis/v9"
)

// Token Bucket Algorithm implemented with Lua script
var tokenBucketScript = redis.NewScript(`
    local key = KEYS[1]
    local capacity = tonumber(ARGV[1])
    local refill_rate = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])
    local requested = tonumber(ARGV[4])

    local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
    local tokens = tonumber(bucket[1])
    local last_refill = tonumber(bucket[2])

    -- Initialize bucket if not exists
    if tokens == nil then
        tokens = capacity
        last_refill = now
    end

    -- Calculate refill
    local elapsed = now - last_refill
    local refill = elapsed * refill_rate
    tokens = math.min(capacity, tokens + refill)

    -- Check if we have enough tokens
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

    -- Save state
    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
    redis.call('EXPIRE', key, 3600)

    return {allowed, remaining, retry_after}
`)

type RateLimitResult struct {
    Allowed    bool
    Remaining  int
    RetryAfter int // seconds
    Limit      int
}

type RateLimiter struct {
    client RedisClient
    keys   *KeyBuilder
}

func NewRateLimiter(client RedisClient) *RateLimiter {
    return &RateLimiter{
        client: client,
        keys:   NewKeyBuilder(),
    }
}

// CheckLimit checks rate limit using token bucket algorithm
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

// Multi-layer rate limiting
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
            struct {
                key      string
                capacity int
                rate     int
                name     string
            }{r.keys.RateUser(userID), 1000, 100, "user"},
            struct {
                key      string
                capacity int
                rate     int
                name     string
            }{r.keys.RateEndpoint(userID, endpoint), 60, 6, "endpoint"},
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

    return &RateLimitResult{Allowed: true, Remaining: -1, Limit: -1}, "", nil
}

// Sliding window counter for specific operations
var slidingWindowScript = redis.NewScript(`
    local key = KEYS[1]
    local window = tonumber(ARGV[1])
    local limit = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])

    -- Remove old entries
    redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)

    -- Count current entries
    local count = redis.call('ZCARD', key)

    if count < limit then
        redis.call('ZADD', key, now, now .. ':' .. math.random())
        redis.call('EXPIRE', key, window)
        return {1, limit - count - 1}
    end

    -- Calculate retry after
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local retry_after = 0
    if #oldest > 0 then
        retry_after = window - (now - tonumber(oldest[2]))
    end

    return {0, retry_after}
`)

// CheckSlidingWindow for precise rate limiting (e.g., AI requests per month)
func (r *RateLimiter) CheckSlidingWindow(ctx context.Context, key string, windowSeconds, limit int) (*RateLimitResult, error) {
    now := time.Now().Unix()

    result, err := slidingWindowScript.Run(ctx, r.client, []string{key}, windowSeconds, limit, now).Int64Slice()
    if err != nil {
        return nil, err
    }

    return &RateLimitResult{
        Allowed:    result[0] == 1,
        Remaining:  int(result[1]),
        RetryAfter: int(result[1]),
        Limit:      limit,
    }, nil
}
```

### 12.6 Distributed Locking

```go
// internal/infrastructure/redis/lock.go
package redis

import (
    "context"
    "crypto/rand"
    "encoding/hex"
    "errors"
    "time"

    "github.com/redis/go-redis/v9"
)

var (
    ErrLockNotAcquired = errors.New("lock not acquired")
    ErrLockNotOwned    = errors.New("lock not owned by this instance")
)

// Lua script for safe lock release (only if we own it)
var releaseLockScript = redis.NewScript(`
    if redis.call('GET', KEYS[1]) == ARGV[1] then
        return redis.call('DEL', KEYS[1])
    end
    return 0
`)

// Lua script for lock extension
var extendLockScript = redis.NewScript(`
    if redis.call('GET', KEYS[1]) == ARGV[1] then
        return redis.call('PEXPIRE', KEYS[1], ARGV[2])
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

func NewLockManager(client RedisClient) *LockManager {
    return &LockManager{
        client: client,
        keys:   NewKeyBuilder(),
    }
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

    return &Lock{
        key:    key,
        token:  token,
        client: m.client,
        ttl:    ttl,
    }, nil
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

// LockMap acquires lock for map editing
func (m *LockManager) LockMap(ctx context.Context, mapID string, ttl time.Duration) (*Lock, error) {
    return m.AcquireLock(ctx, m.keys.LockMap(mapID), ttl)
}

// LockUser acquires lock for user operations
func (m *LockManager) LockUser(ctx context.Context, userID string, ttl time.Duration) (*Lock, error) {
    return m.AcquireLock(ctx, m.keys.LockUser(userID), ttl)
}

// LockSubscription acquires lock for subscription changes
func (m *LockManager) LockSubscription(ctx context.Context, userID string, ttl time.Duration) (*Lock, error) {
    return m.AcquireLock(ctx, m.keys.LockSubscription(userID), ttl)
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

// Extend extends the lock TTL
func (l *Lock) Extend(ctx context.Context, ttl time.Duration) error {
    result, err := extendLockScript.Run(ctx, l.client, []string{l.key}, l.token, ttl.Milliseconds()).Int64()
    if err != nil {
        return err
    }
    if result == 0 {
        return ErrLockNotOwned
    }
    l.ttl = ttl
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

func generateToken() string {
    b := make([]byte, 16)
    rand.Read(b)
    return hex.EncodeToString(b)
}
```

### 12.7 Cache Layer

```go
// internal/infrastructure/redis/cache.go
package redis

import (
    "context"
    "encoding/json"
    "time"

    "github.com/redis/go-redis/v9"
)

type CacheEntry struct {
    Data      []byte    `json:"data"`
    Version   int64     `json:"version"`
    CreatedAt time.Time `json:"created_at"`
    Tags      []string  `json:"tags"`
}

type CacheManager struct {
    client RedisClient
    keys   *KeyBuilder
}

func NewCacheManager(client RedisClient) *CacheManager {
    return &CacheManager{
        client: client,
        keys:   NewKeyBuilder(),
    }
}

// Get retrieves item from cache
func (c *CacheManager) Get(ctx context.Context, key string, dest interface{}) (bool, error) {
    data, err := c.client.Get(ctx, key).Bytes()
    if err == redis.Nil {
        return false, nil
    }
    if err != nil {
        return false, err
    }

    var entry CacheEntry
    if err := json.Unmarshal(data, &entry); err != nil {
        return false, err
    }

    if err := json.Unmarshal(entry.Data, dest); err != nil {
        return false, err
    }

    return true, nil
}

// Set stores item in cache with TTL and optional tags
func (c *CacheManager) Set(ctx context.Context, key string, value interface{}, ttl time.Duration, tags ...string) error {
    data, err := json.Marshal(value)
    if err != nil {
        return err
    }

    entry := CacheEntry{
        Data:      data,
        Version:   time.Now().UnixNano(),
        CreatedAt: time.Now(),
        Tags:      tags,
    }

    entryData, err := json.Marshal(entry)
    if err != nil {
        return err
    }

    pipe := c.client.Pipeline()
    pipe.Set(ctx, key, entryData, ttl)

    // Add key to tag sets for invalidation
    for _, tag := range tags {
        tagKey := c.keys.prefix + ":cache:tag:" + tag
        pipe.SAdd(ctx, tagKey, key)
        pipe.Expire(ctx, tagKey, ttl+time.Hour) // Keep tag set slightly longer
    }

    _, err = pipe.Exec(ctx)
    return err
}

// Delete removes item from cache
func (c *CacheManager) Delete(ctx context.Context, keys ...string) error {
    if len(keys) == 0 {
        return nil
    }
    return c.client.Del(ctx, keys...).Err()
}

// InvalidateByTag removes all cache entries with given tag
func (c *CacheManager) InvalidateByTag(ctx context.Context, tag string) error {
    tagKey := c.keys.prefix + ":cache:tag:" + tag

    keys, err := c.client.SMembers(ctx, tagKey).Result()
    if err != nil {
        return err
    }

    if len(keys) == 0 {
        return nil
    }

    pipe := c.client.Pipeline()
    pipe.Del(ctx, keys...)
    pipe.Del(ctx, tagKey)
    _, err = pipe.Exec(ctx)
    return err
}

// GetOrSet implements cache-aside pattern
func (c *CacheManager) GetOrSet(ctx context.Context, key string, dest interface{}, ttl time.Duration, loader func() (interface{}, error), tags ...string) error {
    // Try to get from cache
    found, err := c.Get(ctx, key, dest)
    if err != nil {
        return err
    }
    if found {
        return nil
    }

    // Load from source
    value, err := loader()
    if err != nil {
        return err
    }

    // Store in cache
    if err := c.Set(ctx, key, value, ttl, tags...); err != nil {
        // Log but don't fail - cache miss is acceptable
    }

    // Marshal to destination
    data, err := json.Marshal(value)
    if err != nil {
        return err
    }
    return json.Unmarshal(data, dest)
}

// Cache TTL constants
const (
    CacheTTLShort  = 5 * time.Minute   // Frequently changing data
    CacheTTLMedium = 30 * time.Minute  // Semi-stable data
    CacheTTLLong   = 2 * time.Hour     // Stable data
    CacheTTLDay    = 24 * time.Hour    // Very stable data
)

// Specific cache methods for domain objects
func (c *CacheManager) GetMap(ctx context.Context, mapID string) (map[string]interface{}, bool, error) {
    var data map[string]interface{}
    found, err := c.Get(ctx, c.keys.CacheMap(mapID), &data)
    return data, found, err
}

func (c *CacheManager) SetMap(ctx context.Context, mapID string, data interface{}) error {
    return c.Set(ctx, c.keys.CacheMap(mapID), data, CacheTTLMedium, "map:"+mapID)
}

func (c *CacheManager) InvalidateMap(ctx context.Context, mapID string) error {
    return c.InvalidateByTag(ctx, "map:"+mapID)
}

func (c *CacheManager) InvalidateUserMaps(ctx context.Context, userID string) error {
    return c.Delete(ctx, c.keys.CacheUserMaps(userID))
}
```

### 12.8 Pub/Sub for Real-Time Updates

```go
// internal/infrastructure/redis/pubsub.go
package redis

import (
    "context"
    "encoding/json"
    "time"

    "github.com/redis/go-redis/v9"
)

type EventType string

const (
    EventNodeCreated   EventType = "node.created"
    EventNodeUpdated   EventType = "node.updated"
    EventNodeDeleted   EventType = "node.deleted"
    EventEdgeCreated   EventType = "edge.created"
    EventEdgeDeleted   EventType = "edge.deleted"
    EventMapAnalyzed   EventType = "map.analyzed"
    EventUserUpdated   EventType = "user.updated"
)

type Event struct {
    Type      EventType              `json:"type"`
    MapID     string                 `json:"map_id,omitempty"`
    UserID    string                 `json:"user_id,omitempty"`
    EntityID  string                 `json:"entity_id,omitempty"`
    Data      map[string]interface{} `json:"data,omitempty"`
    Timestamp time.Time              `json:"timestamp"`
}

type PubSubManager struct {
    client RedisClient
    keys   *KeyBuilder
}

func NewPubSubManager(client RedisClient) *PubSubManager {
    return &PubSubManager{
        client: client,
        keys:   NewKeyBuilder(),
    }
}

// Publish sends event to channel
func (p *PubSubManager) Publish(ctx context.Context, channel string, event *Event) error {
    event.Timestamp = time.Now()

    data, err := json.Marshal(event)
    if err != nil {
        return err
    }

    return p.client.Publish(ctx, channel, data).Err()
}

// PublishMapEvent publishes event to map channel
func (p *PubSubManager) PublishMapEvent(ctx context.Context, mapID string, event *Event) error {
    event.MapID = mapID
    return p.Publish(ctx, p.keys.PubSubMapUpdates(mapID), event)
}

// PublishUserEvent publishes event to user channel
func (p *PubSubManager) PublishUserEvent(ctx context.Context, userID string, event *Event) error {
    event.UserID = userID
    return p.Publish(ctx, p.keys.PubSubUserNotifications(userID), event)
}

// Subscribe creates subscription to channel
func (p *PubSubManager) Subscribe(ctx context.Context, channels ...string) *Subscription {
    pubsub := p.client.Subscribe(ctx, channels...)
    return &Subscription{pubsub: pubsub}
}

// SubscribeToMap subscribes to map updates
func (p *PubSubManager) SubscribeToMap(ctx context.Context, mapID string) *Subscription {
    return p.Subscribe(ctx, p.keys.PubSubMapUpdates(mapID))
}

// SubscribeToUser subscribes to user notifications
func (p *PubSubManager) SubscribeToUser(ctx context.Context, userID string) *Subscription {
    return p.Subscribe(ctx, p.keys.PubSubUserNotifications(userID))
}

type Subscription struct {
    pubsub *redis.PubSub
}

// Channel returns channel for receiving events
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

// Close closes the subscription
func (s *Subscription) Close() error {
    return s.pubsub.Close()
}
```

### 12.9 Idempotency Support

```go
// internal/infrastructure/redis/idempotency.go
package redis

import (
    "context"
    "encoding/json"
    "time"

    "github.com/redis/go-redis/v9"
)

type IdempotencyResult struct {
    Status     string          `json:"status"` // "processing", "completed", "failed"
    Response   json.RawMessage `json:"response,omitempty"`
    StatusCode int             `json:"status_code,omitempty"`
    Error      string          `json:"error,omitempty"`
    CreatedAt  time.Time       `json:"created_at"`
}

type IdempotencyManager struct {
    client RedisClient
    keys   *KeyBuilder
    ttl    time.Duration
}

func NewIdempotencyManager(client RedisClient, ttl time.Duration) *IdempotencyManager {
    return &IdempotencyManager{
        client: client,
        keys:   NewKeyBuilder(),
        ttl:    ttl,
    }
}

// Check checks if request was already processed
// Returns (result, isProcessing, error)
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
    if err := json.Unmarshal(data, &result); err != nil {
        return nil, false, err
    }

    return &result, result.Status == "processing", nil
}

// Start marks request as being processed
func (m *IdempotencyManager) Start(ctx context.Context, key string) error {
    fullKey := m.keys.Idempotency(key)

    result := IdempotencyResult{
        Status:    "processing",
        CreatedAt: time.Now(),
    }

    data, err := json.Marshal(result)
    if err != nil {
        return err
    }

    // Use SetNX to ensure only one request wins
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

    respData, err := json.Marshal(response)
    if err != nil {
        return err
    }

    result := IdempotencyResult{
        Status:     "completed",
        Response:   respData,
        StatusCode: statusCode,
        CreatedAt:  time.Now(),
    }

    data, err := json.Marshal(result)
    if err != nil {
        return err
    }

    return m.client.Set(ctx, fullKey, data, m.ttl).Err()
}

// Fail stores error response
func (m *IdempotencyManager) Fail(ctx context.Context, key string, statusCode int, errMsg string) error {
    fullKey := m.keys.Idempotency(key)

    result := IdempotencyResult{
        Status:     "failed",
        StatusCode: statusCode,
        Error:      errMsg,
        CreatedAt:  time.Now(),
    }

    data, err := json.Marshal(result)
    if err != nil {
        return err
    }

    return m.client.Set(ctx, fullKey, data, m.ttl).Err()
}
```

### 12.10 Circuit Breaker State Storage

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

func NewCircuitBreakerStorage(client RedisClient) *CircuitBreakerStorage {
    return &CircuitBreakerStorage{
        client: client,
        keys:   NewKeyBuilder(),
    }
}

func (s *CircuitBreakerStorage) GetState(ctx context.Context, service string) (*CircuitBreakerState, error) {
    key := s.keys.CircuitBreaker(service)

    data, err := s.client.Get(ctx, key).Bytes()
    if err == redis.Nil {
        return &CircuitBreakerState{
            State:           CircuitClosed,
            LastStateChange: time.Now(),
        }, nil
    }
    if err != nil {
        return nil, err
    }

    var state CircuitBreakerState
    if err := json.Unmarshal(data, &state); err != nil {
        return nil, err
    }

    return &state, nil
}

func (s *CircuitBreakerStorage) SetState(ctx context.Context, service string, state *CircuitBreakerState) error {
    key := s.keys.CircuitBreaker(service)

    data, err := json.Marshal(state)
    if err != nil {
        return err
    }

    return s.client.Set(ctx, key, data, 5*time.Minute).Err()
}

func (s *CircuitBreakerStorage) RecordFailure(ctx context.Context, service string) (*CircuitBreakerState, error) {
    state, err := s.GetState(ctx, service)
    if err != nil {
        return nil, err
    }

    state.Failures++
    state.LastFailureTime = time.Now()

    if err := s.SetState(ctx, service, state); err != nil {
        return nil, err
    }

    return state, nil
}

func (s *CircuitBreakerStorage) RecordSuccess(ctx context.Context, service string) error {
    state, err := s.GetState(ctx, service)
    if err != nil {
        return err
    }

    state.Successes++

    return s.SetState(ctx, service, state)
}

func (s *CircuitBreakerStorage) TransitionState(ctx context.Context, service string, newState CircuitState) error {
    state, err := s.GetState(ctx, service)
    if err != nil {
        return err
    }

    state.State = newState
    state.LastStateChange = time.Now()

    if newState == CircuitClosed {
        state.Failures = 0
        state.Successes = 0
    }

    return s.SetState(ctx, service, state)
}
```

---

## 13. Observability

### 13.1 Configuration

```go
// internal/infrastructure/config/config.go
type ObservabilityConfig struct {
    // Tracing
    TracingEnabled    bool   `envconfig:"TRACING_ENABLED" default:"true"`
    TracingEndpoint   string `envconfig:"TRACING_ENDPOINT" default:"localhost:4317"`
    TracingSampler    string `envconfig:"TRACING_SAMPLER" default:"parentbased_traceidratio"`
    TracingSampleRate float64 `envconfig:"TRACING_SAMPLE_RATE" default:"0.1"`

    // Metrics
    MetricsEnabled bool   `envconfig:"METRICS_ENABLED" default:"true"`
    MetricsPath    string `envconfig:"METRICS_PATH" default:"/metrics"`
    MetricsPort    int    `envconfig:"METRICS_PORT" default:"9090"`

    // Logging
    LogLevel  string `envconfig:"LOG_LEVEL" default:"info"`
    LogFormat string `envconfig:"LOG_FORMAT" default:"json"`

    // Service info
    ServiceName    string `envconfig:"SERVICE_NAME" default:"neylin-api"`
    ServiceVersion string `envconfig:"SERVICE_VERSION" default:"1.0.0"`
    Environment    string `envconfig:"APP_ENV" default:"development"`
}
```

### 13.2 OpenTelemetry Setup

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
    "neylin/internal/infrastructure/config"
)

type TracerProvider struct {
    provider *sdktrace.TracerProvider
    tracer   trace.Tracer
}

func NewTracerProvider(cfg config.ObservabilityConfig) (*TracerProvider, error) {
    if !cfg.TracingEnabled {
        return &TracerProvider{
            tracer: otel.Tracer(cfg.ServiceName),
        }, nil
    }

    ctx := context.Background()

    // Create OTLP exporter
    exporter, err := otlptracegrpc.New(ctx,
        otlptracegrpc.WithEndpoint(cfg.TracingEndpoint),
        otlptracegrpc.WithInsecure(), // Use TLS in production
    )
    if err != nil {
        return nil, err
    }

    // Create resource with service info
    res, err := resource.New(ctx,
        resource.WithAttributes(
            semconv.ServiceName(cfg.ServiceName),
            semconv.ServiceVersion(cfg.ServiceVersion),
            semconv.DeploymentEnvironment(cfg.Environment),
        ),
    )
    if err != nil {
        return nil, err
    }

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

    // Set global provider
    otel.SetTracerProvider(provider)
    otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
        propagation.TraceContext{},
        propagation.Baggage{},
    ))

    return &TracerProvider{
        provider: provider,
        tracer:   provider.Tracer(cfg.ServiceName),
    }, nil
}

func (t *TracerProvider) Tracer() trace.Tracer {
    return t.tracer
}

func (t *TracerProvider) Shutdown(ctx context.Context) error {
    if t.provider != nil {
        return t.provider.Shutdown(ctx)
    }
    return nil
}

// Span helpers
func StartSpan(ctx context.Context, name string, opts ...trace.SpanStartOption) (context.Context, trace.Span) {
    return otel.Tracer("neylin").Start(ctx, name, opts...)
}

func SpanFromContext(ctx context.Context) trace.Span {
    return trace.SpanFromContext(ctx)
}

func AddSpanAttributes(ctx context.Context, attrs ...attribute.KeyValue) {
    span := trace.SpanFromContext(ctx)
    span.SetAttributes(attrs...)
}

func RecordSpanError(ctx context.Context, err error) {
    span := trace.SpanFromContext(ctx)
    span.RecordError(err)
}

// Common attribute keys
var (
    AttrUserID    = attribute.Key("user.id")
    AttrMapID     = attribute.Key("map.id")
    AttrNodeID    = attribute.Key("node.id")
    AttrEdgeID    = attribute.Key("edge.id")
    AttrRequestID = attribute.Key("request.id")
    AttrEndpoint  = attribute.Key("http.endpoint")
    AttrMethod    = attribute.Key("http.method")
    AttrStatus    = attribute.Key("http.status_code")
    AttrDuration  = attribute.Key("duration_ms")
    AttrDBQuery   = attribute.Key("db.query")
    AttrCacheHit  = attribute.Key("cache.hit")
)
```

### 13.3 Prometheus Metrics

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

    HTTPRequestSize = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "neylin_http_request_size_bytes",
            Help:    "HTTP request size in bytes",
            Buckets: prometheus.ExponentialBuckets(100, 10, 8),
        },
        []string{"method", "endpoint"},
    )

    HTTPResponseSize = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "neylin_http_response_size_bytes",
            Help:    "HTTP response size in bytes",
            Buckets: prometheus.ExponentialBuckets(100, 10, 8),
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

    DBConnectionsIdle = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "neylin_db_connections_idle",
            Help: "Number of idle database connections",
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

    RedisOperationDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "neylin_redis_operation_duration_seconds",
            Help:    "Redis operation duration in seconds",
            Buckets: []float64{.0001, .0005, .001, .005, .01, .025, .05, .1},
        },
        []string{"operation"},
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

    ActiveUsersGauge = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "neylin_active_users",
            Help: "Number of active users (sessions)",
        },
    )

    SubscriptionsByPlan = promauto.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "neylin_subscriptions_by_plan",
            Help: "Number of subscriptions by plan type",
        },
        []string{"plan"},
    )
)

// Rate limiting metrics
var (
    RateLimitHits = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "neylin_rate_limit_hits_total",
            Help: "Total number of rate limit hits",
        },
        []string{"layer", "endpoint"},
    )
)

// Circuit breaker metrics
var (
    CircuitBreakerState = promauto.NewGaugeVec(
        prometheus.GaugeOpts{
            Name: "neylin_circuit_breaker_state",
            Help: "Circuit breaker state (0=closed, 1=open, 2=half-open)",
        },
        []string{"service"},
    )

    CircuitBreakerTrips = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "neylin_circuit_breaker_trips_total",
            Help: "Total number of circuit breaker trips",
        },
        []string{"service"},
    )
)
```

### 13.4 Structured Logging

```go
// internal/infrastructure/observability/logger.go
package observability

import (
    "context"
    "os"

    "go.opentelemetry.io/otel/trace"
    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"
    "neylin/internal/infrastructure/config"
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

    // Set log level
    level, err := zapcore.ParseLevel(cfg.LogLevel)
    if err != nil {
        level = zapcore.InfoLevel
    }
    zapConfig.Level = zap.NewAtomicLevelAt(level)

    // Set format
    if cfg.LogFormat == "json" {
        zapConfig.Encoding = "json"
    } else {
        zapConfig.Encoding = "console"
    }

    // Add common fields
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

// WithRequestID adds request ID to logger
func (l *Logger) WithRequestID(requestID string) *zap.Logger {
    return l.Logger.With(zap.String("request_id", requestID))
}

// WithUserID adds user ID to logger
func (l *Logger) WithUserID(userID string) *zap.Logger {
    return l.Logger.With(zap.String("user_id", userID))
}

// Request logger fields
func RequestFields(method, path, ip, userAgent string) []zap.Field {
    return []zap.Field{
        zap.String("method", method),
        zap.String("path", path),
        zap.String("ip", ip),
        zap.String("user_agent", userAgent),
    }
}

// Response logger fields
func ResponseFields(status int, duration float64, size int) []zap.Field {
    return []zap.Field{
        zap.Int("status", status),
        zap.Float64("duration_ms", duration),
        zap.Int("response_size", size),
    }
}

// Error logger fields
func ErrorFields(err error, code string) []zap.Field {
    return []zap.Field{
        zap.Error(err),
        zap.String("error_code", code),
    }
}

// DB logger fields
func DBFields(operation, table string, duration float64) []zap.Field {
    return []zap.Field{
        zap.String("db_operation", operation),
        zap.String("db_table", table),
        zap.Float64("db_duration_ms", duration),
    }
}
```

### 13.5 Metrics Middleware

```go
// internal/adapter/http/middleware/metrics.go
package middleware

import (
    "strconv"
    "time"

    "github.com/gofiber/fiber/v2"
    "neylin/internal/infrastructure/observability"
)

func MetricsMiddleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        start := time.Now()

        // Track active requests
        observability.HTTPActiveRequests.Inc()
        defer observability.HTTPActiveRequests.Dec()

        // Get endpoint pattern (use route pattern, not actual path)
        endpoint := c.Route().Path
        method := c.Method()

        // Track request size
        observability.HTTPRequestSize.WithLabelValues(method, endpoint).
            Observe(float64(len(c.Body())))

        // Process request
        err := c.Next()

        // Record metrics
        duration := time.Since(start).Seconds()
        status := strconv.Itoa(c.Response().StatusCode())

        observability.HTTPRequestsTotal.WithLabelValues(method, endpoint, status).Inc()
        observability.HTTPRequestDuration.WithLabelValues(method, endpoint).Observe(duration)
        observability.HTTPResponseSize.WithLabelValues(method, endpoint).
            Observe(float64(len(c.Response().Body())))

        return err
    }
}
```

### 13.6 Tracing Middleware

```go
// internal/adapter/http/middleware/tracing.go
package middleware

import (
    "github.com/gofiber/fiber/v2"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/propagation"
    semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
    "go.opentelemetry.io/otel/trace"
)

func TracingMiddleware(serviceName string) fiber.Handler {
    tracer := otel.Tracer(serviceName)
    propagator := otel.GetTextMapPropagator()

    return func(c *fiber.Ctx) error {
        // Extract trace context from headers
        ctx := propagator.Extract(c.Context(), propagation.HeaderCarrier(c.GetReqHeaders()))

        // Start span
        spanName := c.Method() + " " + c.Route().Path
        ctx, span := tracer.Start(ctx, spanName,
            trace.WithSpanKind(trace.SpanKindServer),
            trace.WithAttributes(
                semconv.HTTPMethod(c.Method()),
                semconv.HTTPRoute(c.Route().Path),
                semconv.HTTPTarget(c.OriginalURL()),
                semconv.NetHostName(c.Hostname()),
                semconv.HTTPUserAgent(c.Get("User-Agent")),
                attribute.String("http.client_ip", c.IP()),
            ),
        )
        defer span.End()

        // Store in context
        c.SetUserContext(ctx)

        // Add trace ID to response headers
        if span.SpanContext().IsValid() {
            c.Set("X-Trace-ID", span.SpanContext().TraceID().String())
        }

        // Process request
        err := c.Next()

        // Record status
        span.SetAttributes(semconv.HTTPStatusCode(c.Response().StatusCode()))

        if err != nil {
            span.RecordError(err)
        }

        return err
    }
}
```

### 13.7 Health Checks

```go
// internal/adapter/http/handler/health.go
package handler

import (
    "context"
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/jmoiron/sqlx"
    "github.com/redis/go-redis/v9"
)

type HealthHandler struct {
    db      *sqlx.DB
    redis   redis.Cmdable
    version string
}

type HealthResponse struct {
    Status    string            `json:"status"`
    Version   string            `json:"version"`
    Timestamp string            `json:"timestamp"`
    Checks    map[string]Check  `json:"checks"`
}

type Check struct {
    Status   string `json:"status"`
    Duration string `json:"duration,omitempty"`
    Error    string `json:"error,omitempty"`
}

func NewHealthHandler(db *sqlx.DB, redis redis.Cmdable, version string) *HealthHandler {
    return &HealthHandler{
        db:      db,
        redis:   redis,
        version: version,
    }
}

// Liveness - simple check that service is running
// GET /health/live
func (h *HealthHandler) Liveness(c *fiber.Ctx) error {
    return c.JSON(fiber.Map{
        "status": "ok",
    })
}

// Readiness - check all dependencies
// GET /health/ready
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
        return Check{
            Status:   "unhealthy",
            Duration: time.Since(start).String(),
            Error:    err.Error(),
        }
    }

    return Check{
        Status:   "healthy",
        Duration: time.Since(start).String(),
    }
}

func (h *HealthHandler) checkRedis(ctx context.Context) Check {
    start := time.Now()

    if err := h.redis.Ping(ctx).Err(); err != nil {
        return Check{
            Status:   "unhealthy",
            Duration: time.Since(start).String(),
            Error:    err.Error(),
        }
    }

    return Check{
        Status:   "healthy",
        Duration: time.Since(start).String(),
    }
}

// Detailed metrics endpoint
// GET /health/metrics
func (h *HealthHandler) Metrics(c *fiber.Ctx) error {
    ctx := c.Context()

    // Get DB stats
    dbStats := h.db.Stats()

    // Get Redis info
    redisInfo, _ := h.redis.Info(ctx, "clients", "memory", "stats").Result()

    return c.JSON(fiber.Map{
        "database": fiber.Map{
            "open_connections":    dbStats.OpenConnections,
            "in_use":              dbStats.InUse,
            "idle":                dbStats.Idle,
            "wait_count":          dbStats.WaitCount,
            "wait_duration":       dbStats.WaitDuration.String(),
            "max_idle_closed":     dbStats.MaxIdleClosed,
            "max_lifetime_closed": dbStats.MaxLifetimeClosed,
        },
        "redis": redisInfo,
    })
}
