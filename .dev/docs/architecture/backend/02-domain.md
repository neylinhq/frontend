# Domain Layer

Domain — центральный слой с бизнес-логикой. Не зависит от внешних библиотек.

---

## Entities

### User

```go
// internal/domain/entity/user.go
package entity

import (
    "time"
    "github.com/google/uuid"
    "neylin/internal/domain/valueobject"
)

type Role string

const (
    RoleUser  Role = "user"
    RoleAdmin Role = "admin"
)

type User struct {
    ID               uuid.UUID
    Email            valueobject.Email
    Password         valueobject.HashedPassword
    FirstName        string
    LastName         string
    DisplayName      string
    Username         string
    Bio              string
    AvatarURL        string
    Role             Role
    Preferences      UserPreferences
    StripeCustomerID string
    DeletedAt        *time.Time
    CreatedAt        time.Time
    UpdatedAt        time.Time
}

type UserPreferences struct {
    Notifications NotificationPreferences
    Interface     InterfacePreferences
}

func NewUser(email valueobject.Email, password valueobject.HashedPassword) *User {
    now := time.Now()
    return &User{
        ID:        uuid.New(),
        Email:     email,
        Password:  password,
        Role:      RoleUser,
        CreatedAt: now,
        UpdatedAt: now,
    }
}

func (u *User) IsDeleted() bool {
    return u.DeletedAt != nil
}

func (u *User) CanAccessMap(ownerID uuid.UUID) bool {
    return u.ID == ownerID || u.Role == RoleAdmin
}
```

### Map

```go
// internal/domain/entity/map.go
package entity

type Map struct {
    ID          uuid.UUID
    UserID      uuid.UUID
    Title       string
    Description string
    PreviewURL  string
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

type FullMap struct {
    Map
    Nodes      []Node
    Edges      []Edge
    AIAnalysis *AIAnalysis
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

### Node

```go
// internal/domain/entity/node.go
package entity

type Node struct {
    ID          uuid.UUID
    MapID       uuid.UUID
    Label       string
    Description string
    Content     string
    Type        valueobject.NodeType
    Position    valueobject.Position
    Metadata    NodeMetadata
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

type NodeMetadata struct {
    Color      string
    Icon       string
    Priority   int
    Tags       []string
    References []string
}

func NewNode(mapID uuid.UUID, label string, nodeType valueobject.NodeType, pos valueobject.Position) *Node {
    now := time.Now()
    return &Node{
        ID:        uuid.New(),
        MapID:     mapID,
        Label:     label,
        Type:      nodeType,
        Position:  pos,
        CreatedAt: now,
        UpdatedAt: now,
    }
}
```

### Edge

```go
// internal/domain/entity/edge.go
package entity

type Edge struct {
    ID           uuid.UUID
    MapID        uuid.UUID
    SourceID     uuid.UUID
    TargetID     uuid.UUID
    RelationType valueobject.RelationType
    Label        string
    Metadata     EdgeMetadata
    CreatedAt    time.Time
}

type EdgeMetadata struct {
    Weight    float64
    Style     string
    Animated  bool
}

func NewEdge(mapID, sourceID, targetID uuid.UUID, relationType valueobject.RelationType) *Edge {
    return &Edge{
        ID:           uuid.New(),
        MapID:        mapID,
        SourceID:     sourceID,
        TargetID:     targetID,
        RelationType: relationType,
        CreatedAt:    time.Now(),
    }
}
```

### Subscription

```go
// internal/domain/entity/subscription.go
package entity

type Subscription struct {
    ID                   uuid.UUID
    UserID               uuid.UUID
    PlanType             valueobject.PlanType
    Status               SubscriptionStatus
    StripeSubscriptionID string
    CurrentPeriodStart   time.Time
    CurrentPeriodEnd     time.Time
    CancelAtPeriodEnd    bool
    CreatedAt            time.Time
    UpdatedAt            time.Time
}

type SubscriptionStatus string

const (
    StatusActive   SubscriptionStatus = "active"
    StatusPastDue  SubscriptionStatus = "past_due"
    StatusCanceled SubscriptionStatus = "canceled"
    StatusTrialing SubscriptionStatus = "trialing"
)

func NewSubscription(userID uuid.UUID, planType valueobject.PlanType) *Subscription {
    now := time.Now()
    return &Subscription{
        ID:        uuid.New(),
        UserID:    userID,
        PlanType:  planType,
        Status:    StatusActive,
        CreatedAt: now,
        UpdatedAt: now,
    }
}
```

---

## Value Objects

Value Objects — иммутабельные объекты с валидацией.

### Email

```go
// internal/domain/valueobject/email.go
package valueobject

import (
    "regexp"
    "strings"
    domainerror "neylin/internal/domain/error"
)

type Email string

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func NewEmail(value string) (Email, error) {
    normalized := strings.ToLower(strings.TrimSpace(value))
    if !emailRegex.MatchString(normalized) {
        return "", domainerror.ErrInvalidEmail
    }
    return Email(normalized), nil
}

func (e Email) String() string {
    return string(e)
}
```

### Password

```go
// internal/domain/valueobject/password.go
package valueobject

type Password string
type HashedPassword string

func NewPassword(value string) (Password, error) {
    if len(value) < 8 {
        return "", domainerror.ErrPasswordTooShort
    }
    if len(value) > 72 { // bcrypt limit
        return "", domainerror.ErrPasswordTooLong
    }
    return Password(value), nil
}

func (p Password) String() string {
    return string(p)
}
```

### NodeType

```go
// internal/domain/valueobject/node_type.go
package valueobject

type NodeType string

const (
    NodeTypeConcept    NodeType = "concept"
    NodeTypeIdea       NodeType = "idea"
    NodeTypeQuestion   NodeType = "question"
    NodeTypeResource   NodeType = "resource"
    NodeTypeTask       NodeType = "task"
    NodeTypeNote       NodeType = "note"
)

func NewNodeType(value string) (NodeType, error) {
    nodeType := NodeType(value)
    switch nodeType {
    case NodeTypeConcept, NodeTypeIdea, NodeTypeQuestion,
         NodeTypeResource, NodeTypeTask, NodeTypeNote:
        return nodeType, nil
    default:
        return "", domainerror.ErrInvalidNodeType
    }
}
```

### RelationType

```go
// internal/domain/valueobject/relation_type.go
package valueobject

type RelationType string

const (
    RelationRelatedTo   RelationType = "related_to"
    RelationDependsOn   RelationType = "depends_on"
    RelationLeadsTo     RelationType = "leads_to"
    RelationContradicts RelationType = "contradicts"
    RelationSupports    RelationType = "supports"
    RelationPartOf      RelationType = "part_of"
)

func NewRelationType(value string) (RelationType, error) {
    relType := RelationType(value)
    switch relType {
    case RelationRelatedTo, RelationDependsOn, RelationLeadsTo,
         RelationContradicts, RelationSupports, RelationPartOf:
        return relType, nil
    default:
        return "", domainerror.ErrInvalidRelationType
    }
}
```

### Position

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

### PlanType

```go
// internal/domain/valueobject/plan_type.go
package valueobject

type PlanType string

const (
    PlanFree  PlanType = "free"
    PlanPro   PlanType = "pro"
    PlanUltra PlanType = "ultra"
)
```

---

## Domain Services

Логика, которая не принадлежит одной Entity.

```go
// internal/domain/service/plan_limits.go
package service

import "neylin/internal/domain/valueobject"

type PlanLimits struct {
    MaxMaps           int
    MaxNodesPerMap    int
    MaxTotalNodes     int
    AIRequestsPerDay  int
}

var limits = map[valueobject.PlanType]PlanLimits{
    valueobject.PlanFree:  {MaxMaps: 3, MaxNodesPerMap: 50, MaxTotalNodes: 100, AIRequestsPerDay: 5},
    valueobject.PlanPro:   {MaxMaps: 20, MaxNodesPerMap: 500, MaxTotalNodes: 2000, AIRequestsPerDay: 50},
    valueobject.PlanUltra: {MaxMaps: -1, MaxNodesPerMap: -1, MaxTotalNodes: -1, AIRequestsPerDay: -1},
}

func GetLimits(plan valueobject.PlanType) PlanLimits {
    return limits[plan]
}

func CanCreateMap(plan valueobject.PlanType, currentMaps int) bool {
    l := limits[plan]
    return l.MaxMaps == -1 || currentMaps < l.MaxMaps
}

func CanCreateNode(plan valueobject.PlanType, nodesInMap, totalNodes int) bool {
    l := limits[plan]
    mapOK := l.MaxNodesPerMap == -1 || nodesInMap < l.MaxNodesPerMap
    totalOK := l.MaxTotalNodes == -1 || totalNodes < l.MaxTotalNodes
    return mapOK && totalOK
}
```

---

## Domain Errors

```go
// internal/domain/error/errors.go
package domainerror

import "errors"

// Validation errors
var (
    ErrInvalidEmail        = errors.New("invalid email format")
    ErrPasswordTooShort    = errors.New("password must be at least 8 characters")
    ErrPasswordTooLong     = errors.New("password must not exceed 72 characters")
    ErrInvalidNodeType     = errors.New("invalid node type")
    ErrInvalidRelationType = errors.New("invalid relation type")
)

// Business errors
var (
    ErrUserNotFound       = errors.New("user not found")
    ErrUserEmailExists    = errors.New("email already registered")
    ErrInvalidCredentials = errors.New("invalid email or password")
    ErrMapNotFound        = errors.New("map not found")
    ErrNodeNotFound       = errors.New("node not found")
    ErrEdgeNotFound       = errors.New("edge not found")
    ErrMapLimitExceeded   = errors.New("map limit exceeded for your plan")
    ErrNodeLimitExceeded  = errors.New("node limit exceeded for your plan")
    ErrForbidden          = errors.New("access denied")
)
```

---

## Правила

1. **Entities** содержат бизнес-логику и валидацию
2. **Value Objects** иммутабельны и self-validating
3. **Domain Services** для cross-entity логики
4. **Нет зависимостей** от внешних пакетов (кроме stdlib + uuid)
5. **Конструкторы** возвращают ошибки при невалидных данных
