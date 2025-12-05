# Application Layer

Application layer содержит use cases и определяет порты (интерфейсы) для внешних зависимостей.

---

## Ports (Interfaces)

### Repository Interfaces

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
    Update(ctx context.Context, user *entity.User) error
    SoftDelete(ctx context.Context, id uuid.UUID) error
    ExistsByEmail(ctx context.Context, email valueobject.Email) (bool, error)
}
```

```go
// internal/application/port/repository/map.go
package repository

type MapRepository interface {
    Create(ctx context.Context, m *entity.Map) error
    GetByID(ctx context.Context, id uuid.UUID) (*entity.Map, error)
    GetFullByID(ctx context.Context, id uuid.UUID) (*entity.FullMap, error)
    ListByUserID(ctx context.Context, userID uuid.UUID, opts MapListOptions) ([]entity.Map, error)
    Update(ctx context.Context, m *entity.Map) error
    Delete(ctx context.Context, id uuid.UUID) error
    CountByUserID(ctx context.Context, userID uuid.UUID) (int, error)
}

type MapListOptions struct {
    SortBy    string
    SortOrder string
    Limit     int
    Offset    int
}
```

```go
// internal/application/port/repository/node.go
package repository

type NodeRepository interface {
    Create(ctx context.Context, node *entity.Node) error
    GetByID(ctx context.Context, id uuid.UUID) (*entity.Node, error)
    ListByMapID(ctx context.Context, mapID uuid.UUID, opts NodeListOptions) ([]entity.Node, error)
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

### Service Interfaces

```go
// internal/application/port/service/auth.go
package service

type AuthService interface {
    HashPassword(password valueobject.Password) (valueobject.HashedPassword, error)
    VerifyPassword(hashed valueobject.HashedPassword, plain valueobject.Password) bool
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

type StorageService interface {
    UploadAvatar(ctx context.Context, userID string, file io.Reader, contentType string) (string, error)
    DeleteAvatar(ctx context.Context, userID string) error
    UploadMapPreview(ctx context.Context, mapID string, file io.Reader) (string, error)
}
```

```go
// internal/application/port/service/ai.go
package service

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

---

## Use Cases

Каждый Use Case — один бизнес-сценарий.

### Register Use Case

```go
// internal/application/usecase/auth/register.go
package auth

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

### CreateMap Use Case

```go
// internal/application/usecase/map/create.go
package mapuc

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

### CreateNode Use Case

```go
// internal/application/usecase/node/create.go
package nodeuc

type CreateNodeUseCase struct {
    nodeRepo repository.NodeRepository
    mapRepo  repository.MapRepository
    subRepo  repository.SubscriptionRepository
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

    if err := uc.nodeRepo.Create(ctx, node); err != nil {
        return nil, err
    }

    result := dto.NodeToDTO(node)
    return &result, nil
}
```

---

## DTOs

DTOs — объекты для передачи данных между слоями.

```go
// internal/application/dto/user.go
package dto

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
        CreatedAt:   u.CreatedAt,
    }
}
```

```go
// internal/application/dto/node.go
package dto

// NodeMetadataInput используется при создании/обновлении нод
type NodeMetadataInput struct {
    Color    string   `json:"color,omitempty"`
    Icon     string   `json:"icon,omitempty"`
    Tags     []string `json:"tags,omitempty"`
    Priority int      `json:"priority,omitempty"`
}
```

```go
// internal/application/dto/map.go
package dto

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

    return FullMapDTO{
        MapDTO: MapToDTO(&m.Map),
        Nodes:  nodes,
        Edges:  edges,
    }
}
```

---

## Правила

1. **Один Use Case = один бизнес-сценарий**
2. **Input/Output DTOs** для каждого Use Case
3. **Зависимости через интерфейсы (Ports)**
4. **Конструкторы** принимают только интерфейсы
5. **Валидация** на входе в Execute
6. **Проверка прав доступа** внутри Use Case
