# Testing

Структура тестирования: Unit → Integration → E2E.

---

## Структура тестов

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

---

## Unit Tests (Domain)

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
        name       string
        userID     string
        userRole   entity.Role
        mapOwnerID string
        expected   bool
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

---

## Unit Tests (Use Case with Mocks)

```go
// internal/application/usecase/auth/register_test.go
package auth_test

import (
    "context"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "neylin/internal/application/usecase/auth"
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

    t.Run("invalid email", func(t *testing.T) {
        uc := auth.NewRegisterUseCase(nil, nil, nil, nil)

        output, err := uc.Execute(ctx, auth.RegisterInput{
            Email:    "not-an-email",
            Password: "SecurePass123",
        })

        assert.Error(t, err)
        assert.Nil(t, output)
        assert.Equal(t, domainerror.ErrInvalidEmail, err)
    })

    t.Run("password too short", func(t *testing.T) {
        userRepo := new(mocks.UserRepository)
        userRepo.On("ExistsByEmail", ctx, mock.Anything).Return(false, nil)

        uc := auth.NewRegisterUseCase(userRepo, nil, nil, nil)

        output, err := uc.Execute(ctx, auth.RegisterInput{
            Email:    "test@example.com",
            Password: "short",
        })

        assert.Error(t, err)
        assert.Nil(t, output)
        assert.Equal(t, domainerror.ErrPasswordTooShort, err)
    })
}
```

---

## Integration Tests (Repository)

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

func (s *UserRepositoryTestSuite) TestExistsByEmail() {
    ctx := context.Background()
    email, _ := valueobject.NewEmail("exists@example.com")
    user := entity.NewUser(email, "hashed")
    s.repo.Create(ctx, user)

    exists, err := s.repo.ExistsByEmail(ctx, email)

    assert.NoError(s.T(), err)
    assert.True(s.T(), exists)
}

func TestUserRepositoryTestSuite(t *testing.T) {
    suite.Run(t, new(UserRepositoryTestSuite))
}
```

---

## E2E Tests

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

    var accessToken string

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

        accessToken = data["accessToken"].(string)
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

    t.Run("get profile", func(t *testing.T) {
        req := httptest.NewRequest("GET", "/api/v1/users/me", nil)
        req.Header.Set("Authorization", "Bearer "+accessToken)

        resp, _ := app.Test(req)

        assert.Equal(t, http.StatusOK, resp.StatusCode)
    })

    t.Run("get profile unauthorized", func(t *testing.T) {
        req := httptest.NewRequest("GET", "/api/v1/users/me", nil)

        resp, _ := app.Test(req)

        assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
    })
}
```

---

## Test Utilities

### Test Database

```go
// tests/testdb/testdb.go
package testdb

import (
    "os"

    "github.com/jmoiron/sqlx"
    _ "github.com/lib/pq"
)

type TestDB struct {
    DB *sqlx.DB
}

func New() *TestDB {
    url := os.Getenv("TEST_DATABASE_URL")
    if url == "" {
        url = "postgres://test:test@localhost:5432/neylin_test?sslmode=disable"
    }

    db, err := sqlx.Connect("postgres", url)
    if err != nil {
        panic(err)
    }

    return &TestDB{DB: db}
}

func (t *TestDB) Truncate(tables ...string) {
    for _, table := range tables {
        t.DB.MustExec("TRUNCATE TABLE " + table + " CASCADE")
    }
}

func (t *TestDB) Close() {
    t.DB.Close()
}
```

### Test App

```go
// tests/testapp/testapp.go
package testapp

import (
    "github.com/gofiber/fiber/v2"
    "neylin/internal/infrastructure/config"
)

type TestApp struct {
    *fiber.App
    cleanup func()
}

func New() *TestApp {
    cfg := config.LoadTest()
    app, cleanup := InitializeTestApp(cfg)

    return &TestApp{
        App:     app,
        cleanup: cleanup,
    }
}

func (a *TestApp) Close() {
    a.cleanup()
}
```

### Mock Generation

```bash
# Makefile
mocks:
	mockery --all --dir internal/application/port --output internal/mocks
```

---

## Правила

| Тип теста | Что тестирует | Где находится |
|-----------|---------------|---------------|
| Unit | Domain logic, Use Cases | `*_test.go` рядом с кодом |
| Integration | Repositories, Handlers | `*_test.go` рядом с кодом |
| E2E | Full API flow | `tests/e2e/` |

1. **Table-driven tests** для edge cases
2. **Mocks** для Use Case зависимостей
3. **Test suites** для integration tests
4. **Isolated database** для тестов
5. **Mockery** для генерации моков
