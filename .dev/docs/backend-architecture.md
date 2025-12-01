# Архитектура Backend: Arbor

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
arbor-backend/
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
    "arbor/internal/domain/valueobject"
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
    "arbor/internal/domain/valueobject"
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
    "arbor/internal/domain/valueobject"
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

    "arbor/internal/domain/error"
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

    "arbor/internal/domain/error"
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

import "arbor/internal/domain/error"

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

import "arbor/internal/domain/error"

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
    "arbor/internal/domain/entity"
    "arbor/internal/domain/valueobject"
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
    "arbor/internal/domain/entity"
    "arbor/internal/domain/valueobject"
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
    "arbor/internal/domain/entity"
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
    "arbor/internal/domain/entity"
    "arbor/internal/domain/valueobject"
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
    "arbor/internal/domain/entity"
    "arbor/internal/domain/valueobject"
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

    "arbor/internal/domain/entity"
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

    "arbor/internal/application/dto"
    "arbor/internal/application/port/repository"
    "arbor/internal/application/port/service"
    "arbor/internal/domain/entity"
    "arbor/internal/domain/error"
    "arbor/internal/domain/valueobject"
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
    "arbor/internal/application/dto"
    "arbor/internal/application/port/repository"
    "arbor/internal/domain/entity"
    "arbor/internal/domain/error"
    "arbor/internal/domain/service"
    "arbor/internal/domain/valueobject"
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
    "arbor/internal/application/dto"
    "arbor/internal/application/port/repository"
    "arbor/internal/domain/entity"
    "arbor/internal/domain/error"
    "arbor/internal/domain/service"
    "arbor/internal/domain/valueobject"
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
    "arbor/internal/domain/entity"
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
    "arbor/internal/domain/entity"
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
    "arbor/internal/adapter/http/request"
    "arbor/internal/adapter/http/response"
    "arbor/internal/application/usecase/auth"
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
    "arbor/internal/adapter/http/request"
    "arbor/internal/adapter/http/response"
    mapuc "arbor/internal/application/usecase/map"
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
    "arbor/internal/adapter/http/response"
    "arbor/internal/application/port/service"
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
    "arbor/internal/domain/error"
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
    "arbor/internal/adapter/http/handler"
    "arbor/internal/adapter/http/middleware"
    "arbor/internal/application/port/service"
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
    "arbor/internal/domain/entity"
    "arbor/internal/domain/valueobject"
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
    BucketAvatars string `envconfig:"S3_BUCKET_AVATARS" default:"arbor-avatars"`
    BucketPreviews string `envconfig:"S3_BUCKET_PREVIEWS" default:"arbor-previews"`
}

type SMTPConfig struct {
    Host     string `envconfig:"SMTP_HOST"`
    Port     int    `envconfig:"SMTP_PORT" default:"587"`
    User     string `envconfig:"SMTP_USER"`
    Password string `envconfig:"SMTP_PASSWORD"`
    From     string `envconfig:"EMAIL_FROM" default:"noreply@arbor.io"`
    FromName string `envconfig:"EMAIL_FROM_NAME" default:"Arbor"`
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
    "arbor/internal/infrastructure/config"
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
    "arbor/internal/infrastructure/config"
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
    "arbor/internal/application/port/service"
    "arbor/internal/domain/entity"
    "arbor/internal/domain/valueobject"
    "arbor/internal/infrastructure/config"
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
    "arbor/internal/domain/entity"
    "arbor/internal/infrastructure/config"
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
    "arbor/internal/infrastructure/config"
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
    "arbor/internal/adapter/http/handler"
    "arbor/internal/adapter/http/router"
    "arbor/internal/adapter/repository/postgres"
    "arbor/internal/application/usecase/auth"
    "arbor/internal/application/usecase/map"
    // ... other imports
    "arbor/internal/infrastructure/config"
    "arbor/internal/infrastructure/database"
    infraAuth "arbor/internal/infrastructure/auth"
    "arbor/internal/infrastructure/external/stripe"
    "arbor/internal/infrastructure/external/openai"
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
    "arbor/internal/infrastructure/config"
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
arbor-backend/
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
    "arbor/internal/domain/entity"
    "arbor/internal/domain/valueobject"
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
    "arbor/internal/application/usecase/auth"
    "arbor/internal/domain/entity"
    "arbor/internal/domain/valueobject"
    "arbor/internal/mocks"
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
    "arbor/internal/adapter/repository/postgres"
    "arbor/internal/domain/entity"
    "arbor/internal/domain/valueobject"
    "arbor/tests/testdb"
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
    "arbor/tests/testapp"
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
      - DATABASE_URL=postgres://arbor:arbor@postgres:5432/arbor?sslmode=disable
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
      - POSTGRES_USER=arbor
      - POSTGRES_PASSWORD=arbor
      - POSTGRES_DB=arbor
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
    command: ["-path", "/migrations", "-database", "postgres://arbor:arbor@postgres:5432/arbor?sslmode=disable", "up"]
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
	docker build -f deployments/docker/Dockerfile -t arbor-api .

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
