# Deployment

Docker, Docker Compose и Makefile для development и production.

---

## Dockerfile

Multi-stage build для минимального размера образа.

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

---

## Docker Compose

### Development

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

### Production

```yaml
# deployments/docker/docker-compose.prod.yml
version: '3.8'

services:
  api:
    image: ghcr.io/neylin/api:${VERSION:-latest}
    ports:
      - "8080:8080"
    environment:
      - APP_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_PRIVATE_KEY_PATH=/secrets/jwt-private.pem
      - JWT_PUBLIC_KEY_PATH=/secrets/jwt-public.pem
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./secrets:/secrets:ro
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8080/health/ready"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

---

## Makefile

```makefile
.PHONY: build run test lint migrate docker

# Variables
BINARY_NAME=server
MAIN_PATH=./cmd/server

# Build
build:
	go build -o bin/$(BINARY_NAME) $(MAIN_PATH)

build-linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/$(BINARY_NAME) $(MAIN_PATH)

# Run
run:
	go run $(MAIN_PATH)

dev:
	air

# Tests
test:
	go test -v ./...

test-coverage:
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

test-race:
	go test -race -v ./...

# Linting
lint:
	golangci-lint run

lint-fix:
	golangci-lint run --fix

# Database
migrate-up:
	migrate -path migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path migrations -database "$(DATABASE_URL)" down 1

migrate-create:
	migrate create -ext sql -dir migrations -seq $(name)

migrate-force:
	migrate -path migrations -database "$(DATABASE_URL)" force $(version)

# Docker
docker-build:
	docker build -f deployments/docker/Dockerfile -t neylin-api .

docker-up:
	docker-compose -f deployments/docker/docker-compose.yml up -d

docker-down:
	docker-compose -f deployments/docker/docker-compose.yml down

docker-logs:
	docker-compose -f deployments/docker/docker-compose.yml logs -f api

docker-clean:
	docker-compose -f deployments/docker/docker-compose.yml down -v --rmi local

# Code generation
generate:
	go generate ./...

wire:
	cd cmd/server && wire

# Mock generation
mocks:
	mockery --all --dir internal/application/port --output internal/mocks

# Security
security:
	gosec ./...

# All checks before commit
check: lint test security
	@echo "All checks passed!"

# Help
help:
	@echo "Available targets:"
	@echo "  build          - Build the binary"
	@echo "  run            - Run the server"
	@echo "  dev            - Run with hot reload (air)"
	@echo "  test           - Run tests"
	@echo "  test-coverage  - Run tests with coverage"
	@echo "  lint           - Run linter"
	@echo "  migrate-up     - Run migrations"
	@echo "  migrate-down   - Rollback last migration"
	@echo "  docker-up      - Start Docker containers"
	@echo "  docker-down    - Stop Docker containers"
	@echo "  wire           - Generate Wire DI"
	@echo "  mocks          - Generate mocks"
```

---

## Air Configuration (Hot Reload)

```toml
# .air.toml
root = "."
tmp_dir = "tmp"

[build]
  bin = "./tmp/main"
  cmd = "go build -o ./tmp/main ./cmd/server"
  delay = 1000
  exclude_dir = ["tmp", "vendor", "tests"]
  exclude_file = []
  exclude_regex = ["_test.go"]
  exclude_unchanged = false
  follow_symlink = false
  include_ext = ["go", "tpl", "tmpl", "html"]
  kill_delay = "2s"
  log = "build-errors.log"
  send_interrupt = false
  stop_on_error = true

[color]
  build = "yellow"
  main = "magenta"
  runner = "green"
  watcher = "cyan"

[log]
  time = false

[misc]
  clean_on_exit = true
```

---

## Migrations Structure

```
migrations/
├── 000001_create_users.up.sql
├── 000001_create_users.down.sql
├── 000002_create_maps.up.sql
├── 000002_create_maps.down.sql
├── 000003_create_nodes.up.sql
├── 000003_create_nodes.down.sql
├── 000004_create_edges.up.sql
├── 000004_create_edges.down.sql
├── 000005_create_subscriptions.up.sql
└── 000005_create_subscriptions.down.sql
```

### Example Migration

```sql
-- 000001_create_users.up.sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    preferences JSONB NOT NULL DEFAULT '{}',
    stripe_customer_id VARCHAR(255),
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
```

```sql
-- 000001_create_users.down.sql
DROP TABLE IF EXISTS users;
```

---

## Migration Strategy

### Zero-Downtime Migrations

```
┌─────────────────────────────────────────────────────────────────┐
│ EXPAND-CONTRACT PATTERN                                          │
│                                                                  │
│ Phase 1: EXPAND                                                  │
│ - Add new column (nullable or with default)                     │
│ - Add new table                                                  │
│ - Add new index CONCURRENTLY                                    │
│                                                                  │
│ Phase 2: MIGRATE DATA                                            │
│ - Backfill new columns                                          │
│ - Transform data if needed                                      │
│                                                                  │
│ Phase 3: CODE DEPLOY                                             │
│ - Deploy code that writes to both old and new                   │
│ - Deploy code that reads from new                               │
│                                                                  │
│ Phase 4: CONTRACT                                                │
│ - Remove old column/table (separate migration)                  │
│ - Remove old code paths                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Safe Migration Examples

```sql
-- ✅ SAFE: Add nullable column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- ✅ SAFE: Add column with default (Postgres 11+)
ALTER TABLE users ADD COLUMN verified BOOLEAN NOT NULL DEFAULT false;

-- ✅ SAFE: Create index concurrently
CREATE INDEX CONCURRENTLY idx_users_phone ON users(phone);

-- ✅ SAFE: Add new table
CREATE TABLE user_preferences (...);

-- ❌ DANGEROUS: Rename column (breaks running code)
ALTER TABLE users RENAME COLUMN name TO full_name;

-- ❌ DANGEROUS: Change column type
ALTER TABLE users ALTER COLUMN age TYPE BIGINT;

-- ❌ DANGEROUS: Add NOT NULL to existing column
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
```

### Rename Column (Safe Pattern)

```sql
-- Migration 1: Add new column
ALTER TABLE users ADD COLUMN full_name VARCHAR(200);

-- Migration 2: Backfill (run in batches)
UPDATE users SET full_name = name WHERE full_name IS NULL LIMIT 1000;

-- Deploy code: write to both, read from full_name with fallback
-- SELECT COALESCE(full_name, name) as full_name FROM users

-- Migration 3: Set NOT NULL (after all data migrated)
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

-- Deploy code: write/read only full_name

-- Migration 4: Drop old column
ALTER TABLE users DROP COLUMN name;
```

### Pre-Deploy Migrations

Миграции запускаются ДО деплоя нового кода:

```yaml
# GitHub Actions
deploy:
  steps:
    - name: Run migrations
      run: migrate -path migrations -database "$DATABASE_URL" up

    - name: Wait for migrations
      run: sleep 10  # Ensure replicas synced

    - name: Deploy new code
      run: kubectl rollout restart deployment/api
```

### Rollback Strategy

```makefile
# Rollback last migration
migrate-down:
	migrate -path migrations -database "$(DATABASE_URL)" down 1

# Force version (after failed migration)
migrate-force:
	migrate -path migrations -database "$(DATABASE_URL)" force $(version)
```

**Правило**: Каждая миграция должна иметь рабочий `down.sql`:

```sql
-- 000010_add_user_phone.up.sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 000010_add_user_phone.down.sql
ALTER TABLE users DROP COLUMN phone;
```

---

## Deployment Strategies

### Blue-Green Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOAD BALANCER                            │
│                              │                                   │
│              ┌───────────────┼───────────────┐                  │
│              ▼                               ▼                   │
│      ┌──────────────┐               ┌──────────────┐            │
│      │  BLUE (v1)   │               │  GREEN (v2)  │            │
│      │   3 pods     │               │   3 pods     │            │
│      │   ACTIVE     │               │   STANDBY    │            │
│      └──────────────┘               └──────────────┘            │
│                                                                  │
│  1. Deploy v2 to GREEN                                          │
│  2. Run smoke tests on GREEN                                    │
│  3. Switch traffic to GREEN                                     │
│  4. Keep BLUE for rollback                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Canary Deployment

```yaml
# Kubernetes canary with Istio
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
spec:
  http:
    - route:
        - destination:
            host: api
            subset: stable
          weight: 90
        - destination:
            host: api
            subset: canary
          weight: 10  # 10% traffic to new version
```

### Rolling Update (Default)

```yaml
# deployments/k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Max pods above desired
      maxUnavailable: 0  # Zero downtime
  template:
    spec:
      containers:
        - name: api
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 10
```

---

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: neylin_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Run tests
        env:
          TEST_DATABASE_URL: postgres://test:test@localhost:5432/neylin_test?sslmode=disable
        run: make test

      - name: Run linter
        uses: golangci/golangci-lint-action@v4
        with:
          version: latest

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: make docker-build
```
