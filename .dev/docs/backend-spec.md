# Техническое задание: Arbor Backend

## 1. Обзор проекта

### 1.1 Назначение

**Arbor** — платформа для создания и визуализации карт знаний (knowledge graphs). Система позволяет пользователям организовывать знания в виде связанных концепций с семантическими отношениями.

### 1.2 Стек технологий

| Компонент | Технология |
|-----------|------------|
| Язык | Go 1.22+ |
| Web Framework | Fiber v2 |
| База данных | PostgreSQL 16+ |
| Кэш | Redis 7+ |
| Очереди | Redis Streams / NATS |
| Хранилище файлов | S3-compatible (MinIO / Cloudflare R2) |
| AI интеграции | OpenAI API, Anthropic API |
| Платежи | Stripe, Crypto (USDT/USDC) |

### 1.3 Целевая аудитория

- Студенты и преподаватели
- Исследователи
- Knowledge workers
- Команды для совместной работы (Pro/Ultra)

---

## 2. Функциональные требования

### 2.1 Аутентификация и авторизация

#### FR-AUTH-001: Регистрация пользователя
- Email + пароль
- Валидация email (уникальность, формат)
- Пароль: минимум 8 символов
- Хеширование: bcrypt (cost 12)
- Подтверждение email (опционально, v2)

#### FR-AUTH-002: Вход в систему
- Email + пароль
- Выдача JWT access token (15 min) + refresh token (30 days)
- Rate limiting: 5 попыток / 15 минут на IP

#### FR-AUTH-003: Выход
- Инвалидация refresh token
- Опционально: blacklist access token в Redis

#### FR-AUTH-004: Сброс пароля
- Запрос сброса по email
- Токен сброса: 1 час TTL
- Одноразовое использование

#### FR-AUTH-005: Refresh токена
- Обновление access token по refresh token
- Ротация refresh token при каждом обновлении

---

### 2.2 Управление пользователем

#### FR-USER-001: Получение профиля
- Текущий пользователь по JWT
- Включает: id, email, displayName, username, bio, avatarUrl, role, preferences

#### FR-USER-002: Обновление профиля
- displayName (max 50 chars)
- username (3-30 chars, alphanumeric + underscore/dash, уникальный)
- bio (max 500 chars)

#### FR-USER-003: Загрузка аватара
- Форматы: JPEG, PNG, WebP
- Максимальный размер: 5MB
- Ресайз до 256x256
- Хранение в S3

#### FR-USER-004: Смена email
- Требует текущий пароль
- Проверка уникальности нового email

#### FR-USER-005: Смена пароля
- Требует текущий пароль
- Валидация нового пароля

#### FR-USER-006: Удаление аккаунта
- Требует пароль
- Soft delete с grace period 30 дней
- Каскадное удаление всех данных после grace period

#### FR-USER-007: Настройки уведомлений
```json
{
  "notifications": {
    "email": true,
    "marketing": false,
    "updates": true
  }
}
```

#### FR-USER-008: Настройки интерфейса
```json
{
  "interface": {
    "density": "comfortable",
    "animations": true,
    "sound": false
  }
}
```

---

### 2.3 Управление картами знаний (Maps)

#### FR-MAP-001: Создание карты
- title (required, max 100 chars)
- description (optional, max 500 chars)
- Автоматическое создание createdAt, updatedAt

#### FR-MAP-002: Получение списка карт
- Только карты текущего пользователя
- Сортировка по updatedAt DESC
- Включает: id, title, description, nodesCount, previewUrl, createdAt, updatedAt

#### FR-MAP-003: Получение карты
- Метаданные карты
- Опционально: с узлами и связями (full)

#### FR-MAP-004: Обновление карты
- title, description
- Автообновление updatedAt

#### FR-MAP-005: Удаление карты
- Каскадное удаление всех узлов и связей
- Hard delete

#### FR-MAP-006: AI-анализ карты
- Асинхронная задача
- Результат:
  - gaps: пробелы в знаниях
  - suggestions: предложения по развитию
  - complexityScore: 0-1
  - completenessScore: 0-1
  - structuralIssues: структурные проблемы

---

### 2.4 Управление узлами (Nodes)

#### FR-NODE-001: Создание узла
```json
{
  "mapId": "uuid",
  "label": "string (required, max 100)",
  "description": "string (optional, max 500)",
  "content": "string (optional, HTML)",
  "type": "concept|fact|theory|example|question|hypothesis|person|school",
  "position": { "x": 0, "y": 0 },
  "metadata": {
    "confidence": 0.5,
    "complexity": "basic|intermediate|advanced",
    "sources": ["url1", "url2"],
    "tags": ["tag1", "tag2"]
  }
}
```

#### FR-NODE-002: Получение узлов карты
- Lightweight версия (без content) для графа
- Полная версия для редактирования

#### FR-NODE-003: Получение узла
- Полные данные включая content

#### FR-NODE-004: Обновление узла
- Любые поля кроме id, mapId
- Автообновление updatedAt узла и карты

#### FR-NODE-005: Удаление узла
- Каскадное удаление всех связей узла
- Обновление nodesCount карты

#### FR-NODE-006: Обновление позиции узла
- Batch update позиций (для drag & drop)
- Оптимизированный endpoint

---

### 2.5 Управление связями (Edges)

#### FR-EDGE-001: Создание связи
```json
{
  "mapId": "uuid",
  "sourceNodeId": "uuid",
  "targetNodeId": "uuid",
  "relationType": "is-a|has-a|causes|explains|related-to|influences|part-of|prerequisite|contradicts|similar-to",
  "label": "string (optional, max 100)",
  "strength": 0.5,
  "bidirectional": false,
  "metadata": {
    "confidence": 0.5,
    "evidence": ["source1"],
    "examples": ["example1"],
    "createdBy": "user|ai|both"
  }
}
```

#### FR-EDGE-002: Получение связей карты
- Все связи карты
- Опционально: фильтр по типу

#### FR-EDGE-003: Обновление связи
- relationType, label, strength, bidirectional, metadata

#### FR-EDGE-004: Удаление связи
- Hard delete

#### FR-EDGE-005: Валидация связи
- sourceNodeId и targetNodeId должны принадлежать одной карте
- Нельзя создать связь узла с самим собой
- Уникальность: одна связь между парой узлов (с учетом direction)

---

### 2.6 Подписки и биллинг

#### FR-SUB-001: Получение текущей подписки
```json
{
  "id": "uuid",
  "planType": "free|pro|ultra",
  "status": "active|cancelled|past_due|trialing",
  "currentPeriodStart": "datetime",
  "currentPeriodEnd": "datetime",
  "cancelAtPeriodEnd": false
}
```

#### FR-SUB-002: Получение доступных планов
| План | Цена/мес | Карт | Узлов/карта | Всего узлов | AI модели | AI запросов |
|------|----------|------|-------------|-------------|-----------|-------------|
| Free | $0 | 3 | 50 | 150 | GPT-3.5 | 20 |
| Pro | $12 | 20 | 500 | 5000 | GPT-4, Claude | 200 |
| Ultra | $29 | ∞ | ∞ | ∞ | Все | ∞ |

#### FR-SUB-003: Создание checkout сессии
- Интеграция со Stripe Checkout
- Возврат URL для редиректа

#### FR-SUB-004: Upgrade/Downgrade плана
- Prorating при upgrade
- Отложенный downgrade (в конце периода)

#### FR-SUB-005: Отмена подписки
- cancelAtPeriodEnd = true
- Сохранение доступа до конца периода

#### FR-SUB-006: Возобновление подписки
- Только если cancelAtPeriodEnd = true
- До окончания текущего периода

#### FR-SUB-007: Получение использования
```json
{
  "mapsCount": 2,
  "totalNodesCount": 87,
  "aiRequestsThisMonth": 15,
  "storageUsedMB": 12.5
}
```

---

### 2.7 Платежные методы

#### FR-PAY-001: Список платежных методов
- Карты и крипто-кошельки пользователя

#### FR-PAY-002: Добавление карты
- Интеграция со Stripe Elements
- Хранение только last4, brand, expiry

#### FR-PAY-003: Добавление крипто-кошелька
- Поддерживаемые сети: Bitcoin, Ethereum, Solana, TRON
- Валюты: BTC, ETH, USDT, USDC, SOL

#### FR-PAY-004: Удаление платежного метода
- Нельзя удалить последний метод при активной подписке

#### FR-PAY-005: Установка метода по умолчанию

#### FR-PAY-006: История платежей
- Список транзакций с пагинацией
- Поля: amount, currency, status, description, invoiceUrl, createdAt

---

### 2.8 AI-функции

#### FR-AI-001: Анализ графа знаний
- Вход: полный граф (узлы + связи)
- Выход: gaps, suggestions, scores, issues
- Лимит: согласно плану пользователя

#### FR-AI-002: Предложение связей
- Вход: два узла
- Выход: предлагаемый тип связи с confidence

#### FR-AI-003: Модели по планам
| План | Доступные модели |
|------|------------------|
| Free | gpt-3.5-turbo |
| Pro | gpt-4, claude-3-sonnet |
| Ultra | gpt-4, gpt-4-turbo, claude-3-opus, claude-3-sonnet |

---

## 3. REST API Resources

### 3.1 Общие принципы

#### Базовый URL
```
/api/v1
```

#### Формат ответа
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### Формат ошибки
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {
      "field": ["error1", "error2"]
    }
  }
}
```

#### HTTP статусы
| Статус | Использование |
|--------|---------------|
| 200 | Успешный GET, PUT, PATCH |
| 201 | Успешный POST (создание) |
| 204 | Успешный DELETE |
| 400 | Ошибка валидации |
| 401 | Не аутентифицирован |
| 403 | Нет доступа |
| 404 | Ресурс не найден |
| 409 | Конфликт (дубликат) |
| 422 | Бизнес-правило нарушено |
| 429 | Rate limit |
| 500 | Внутренняя ошибка |

#### Аутентификация
```
Authorization: Bearer <access_token>
```

---

### 3.2 Auth Resources

#### POST /auth/register
Регистрация нового пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response 201:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Errors:**
- 400: Невалидный email или пароль
- 409: Email уже зарегистрирован

---

#### POST /auth/login
Вход в систему.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response 200:**
```json
{
  "data": {
    "user": { ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Errors:**
- 401: Неверный email или пароль
- 429: Слишком много попыток

---

#### POST /auth/logout
Выход из системы.

**Headers:** `Authorization: Bearer <token>`

**Response 204:** No content

---

#### POST /auth/refresh
Обновление access token.

**Request:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response 200:**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

#### POST /auth/forgot-password
Запрос сброса пароля.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response 200:**
```json
{
  "data": {
    "message": "If email exists, reset link was sent"
  }
}
```

---

#### POST /auth/reset-password
Сброс пароля по токену.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "password": "newSecurePassword123"
}
```

**Response 200:**
```json
{
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

### 3.3 User Resources

#### GET /users/me
Получение текущего пользователя.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "Johnny",
    "username": "johnny_doe",
    "bio": "Knowledge enthusiast",
    "avatarUrl": "https://storage.arbor.app/avatars/uuid.jpg",
    "role": "user",
    "preferences": {
      "notifications": {
        "email": true,
        "marketing": false,
        "updates": true
      },
      "interface": {
        "density": "comfortable",
        "animations": true,
        "sound": false
      }
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### PATCH /users/me/profile
Обновление профиля.

**Request:**
```json
{
  "displayName": "Johnny",
  "username": "johnny_doe",
  "bio": "Knowledge enthusiast"
}
```

**Response 200:** Updated user object

---

#### POST /users/me/avatar
Загрузка аватара.

**Request:** `multipart/form-data`
- `avatar`: file (image/jpeg, image/png, image/webp)

**Response 200:**
```json
{
  "data": {
    "avatarUrl": "https://storage.arbor.app/avatars/uuid.jpg"
  }
}
```

---

#### PATCH /users/me/email
Смена email.

**Request:**
```json
{
  "email": "new@example.com",
  "password": "currentPassword123"
}
```

**Response 200:** Updated user object

---

#### PATCH /users/me/password
Смена пароля.

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword123"
}
```

**Response 204:** No content

---

#### PATCH /users/me/preferences
Обновление настроек.

**Request:**
```json
{
  "notifications": {
    "email": true,
    "marketing": false
  },
  "interface": {
    "density": "compact"
  }
}
```

**Response 200:** Updated preferences

---

#### DELETE /users/me
Удаление аккаунта.

**Request:**
```json
{
  "password": "currentPassword123"
}
```

**Response 204:** No content

---

### 3.4 Map Resources

#### GET /maps
Список карт пользователя.

**Query params:**
- `sort`: `updated_at` (default), `created_at`, `title`
- `order`: `desc` (default), `asc`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Neural Networks",
      "description": "ML concepts map",
      "nodesCount": 42,
      "previewUrl": "https://storage.arbor.app/previews/uuid.png",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T15:45:00Z"
    }
  ]
}
```

---

#### POST /maps
Создание карты.

**Request:**
```json
{
  "title": "Philosophy Concepts",
  "description": "Key philosophical ideas"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "title": "Philosophy Concepts",
    "description": "Key philosophical ideas",
    "nodesCount": 0,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- 422: Превышен лимит карт по плану

---

#### GET /maps/:id
Получение карты.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "title": "Philosophy Concepts",
    "description": "Key philosophical ideas",
    "nodesCount": 15,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### GET /maps/:id/full
Получение карты с узлами и связями.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "title": "Philosophy Concepts",
    "description": "Key philosophical ideas",
    "nodesCount": 15,
    "nodes": [
      {
        "id": "uuid",
        "label": "Existentialism",
        "description": "Philosophy emphasizing individual existence",
        "type": "theory",
        "position": { "x": 100, "y": 200 },
        "metadata": {
          "confidence": 0.9,
          "complexity": "advanced",
          "sources": [],
          "tags": ["modern", "continental"]
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "edges": [
      {
        "id": "uuid",
        "sourceNodeId": "uuid1",
        "targetNodeId": "uuid2",
        "relationType": "influences",
        "label": "shaped by",
        "strength": 0.8,
        "bidirectional": false,
        "metadata": {
          "confidence": 0.7,
          "evidence": [],
          "examples": [],
          "createdBy": "user"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "aiAnalysis": {
      "lastAnalyzed": "2024-01-18T12:00:00Z",
      "gaps": ["Missing connection between X and Y"],
      "suggestions": ["Consider adding Z concept"],
      "complexityScore": 0.7,
      "completenessScore": 0.6,
      "structuralIssues": []
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### PATCH /maps/:id
Обновление карты.

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response 200:** Updated map object

---

#### DELETE /maps/:id
Удаление карты.

**Response 204:** No content

---

#### POST /maps/:id/analyze
Запуск AI-анализа карты.

**Request:**
```json
{
  "model": "gpt-4"
}
```

**Response 202:**
```json
{
  "data": {
    "taskId": "uuid",
    "status": "processing"
  }
}
```

**Polling endpoint:** GET /maps/:id/analyze/:taskId

**Final response:**
```json
{
  "data": {
    "status": "completed",
    "result": {
      "gaps": [...],
      "suggestions": [...],
      "complexityScore": 0.7,
      "completenessScore": 0.6,
      "structuralIssues": [...]
    }
  }
}
```

---

### 3.5 Node Resources

#### GET /maps/:mapId/nodes
Список узлов карты (lightweight).

**Query params:**
- `type`: фильтр по типу узла
- `full`: `true` для включения content

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "mapId": "uuid",
      "label": "Concept Name",
      "description": "Short description",
      "type": "concept",
      "position": { "x": 100, "y": 200 },
      "metadata": { ... },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### POST /maps/:mapId/nodes
Создание узла.

**Request:**
```json
{
  "label": "New Concept",
  "description": "Description here",
  "content": "<p>Rich HTML content</p>",
  "type": "concept",
  "position": { "x": 150, "y": 250 },
  "metadata": {
    "confidence": 0.8,
    "complexity": "intermediate",
    "sources": ["https://example.com"],
    "tags": ["philosophy"]
  }
}
```

**Response 201:** Created node object

**Errors:**
- 422: Превышен лимит узлов

---

#### GET /nodes/:id
Получение узла с полным content.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "mapId": "uuid",
    "label": "Concept Name",
    "description": "Short description",
    "content": "<p>Full HTML content with <strong>formatting</strong></p>",
    "type": "concept",
    "position": { "x": 100, "y": 200 },
    "metadata": { ... },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### PATCH /nodes/:id
Обновление узла.

**Request:**
```json
{
  "label": "Updated Label",
  "content": "<p>Updated content</p>",
  "metadata": {
    "confidence": 0.9
  }
}
```

**Response 200:** Updated node object

---

#### DELETE /nodes/:id
Удаление узла.

**Response 204:** No content

Каскадно удаляет все связи узла.

---

#### PATCH /maps/:mapId/nodes/positions
Batch обновление позиций узлов.

**Request:**
```json
{
  "positions": [
    { "id": "uuid1", "x": 100, "y": 200 },
    { "id": "uuid2", "x": 300, "y": 400 }
  ]
}
```

**Response 204:** No content

---

### 3.6 Edge Resources

#### GET /maps/:mapId/edges
Список связей карты.

**Query params:**
- `relationType`: фильтр по типу связи

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "mapId": "uuid",
      "sourceNodeId": "uuid1",
      "targetNodeId": "uuid2",
      "relationType": "causes",
      "label": "leads to",
      "strength": 0.8,
      "bidirectional": false,
      "metadata": {
        "confidence": 0.7,
        "evidence": ["Source 1"],
        "examples": ["Example 1"],
        "createdBy": "user"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### POST /maps/:mapId/edges
Создание связи.

**Request:**
```json
{
  "sourceNodeId": "uuid1",
  "targetNodeId": "uuid2",
  "relationType": "causes",
  "label": "leads to",
  "strength": 0.8,
  "bidirectional": false,
  "metadata": {
    "confidence": 0.7,
    "evidence": ["Research paper X"],
    "examples": ["Example scenario"],
    "createdBy": "user"
  }
}
```

**Response 201:** Created edge object

**Errors:**
- 400: sourceNodeId == targetNodeId
- 404: Узел не найден
- 409: Связь уже существует
- 422: Узлы принадлежат разным картам

---

#### PATCH /edges/:id
Обновление связи.

**Request:**
```json
{
  "relationType": "explains",
  "strength": 0.9
}
```

**Response 200:** Updated edge object

---

#### DELETE /edges/:id
Удаление связи.

**Response 204:** No content

---

### 3.7 Subscription Resources

#### GET /subscriptions/current
Текущая подписка пользователя.

**Response 200:**
```json
{
  "data": {
    "id": "uuid",
    "planType": "pro",
    "status": "active",
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-02-01T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET /subscriptions/usage
Использование ресурсов.

**Response 200:**
```json
{
  "data": {
    "mapsCount": 5,
    "totalNodesCount": 234,
    "aiRequestsThisMonth": 45,
    "storageUsedMB": 25.7,
    "limits": {
      "maxMaps": 20,
      "maxNodesPerMap": 500,
      "maxTotalNodes": 5000,
      "aiRequestsPerMonth": 200
    }
  }
}
```

---

#### GET /plans
Список доступных планов.

**Response 200:**
```json
{
  "data": [
    {
      "type": "free",
      "name": "Free",
      "priceMonthly": 0,
      "priceYearly": 0,
      "features": [...],
      "limits": {
        "maxMaps": 3,
        "maxNodesPerMap": 50,
        "maxTotalNodes": 150,
        "aiModels": ["gpt-3.5-turbo"],
        "aiRequestsPerMonth": 20
      }
    },
    {
      "type": "pro",
      "name": "Pro",
      "priceMonthly": 1200,
      "priceYearly": 9600,
      "features": [...],
      "limits": { ... }
    },
    {
      "type": "ultra",
      "name": "Ultra",
      "priceMonthly": 2900,
      "priceYearly": 23200,
      "features": [...],
      "limits": {
        "maxMaps": null,
        "maxNodesPerMap": null,
        "maxTotalNodes": null,
        "aiModels": ["gpt-4", "gpt-4-turbo", "claude-3-opus", "claude-3-sonnet"],
        "aiRequestsPerMonth": null
      }
    }
  ]
}
```

---

#### POST /subscriptions/checkout
Создание Stripe checkout сессии.

**Request:**
```json
{
  "planType": "pro",
  "billingPeriod": "monthly",
  "successUrl": "https://app.arbor.io/dashboard?success=true",
  "cancelUrl": "https://app.arbor.io/pricing"
}
```

**Response 200:**
```json
{
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/..."
  }
}
```

---

#### POST /subscriptions/change
Смена плана.

**Request:**
```json
{
  "planType": "ultra"
}
```

**Response 200:** Updated subscription object

---

#### POST /subscriptions/cancel
Отмена подписки.

**Response 200:**
```json
{
  "data": {
    "cancelAtPeriodEnd": true,
    "currentPeriodEnd": "2024-02-01T00:00:00Z"
  }
}
```

---

#### POST /subscriptions/resume
Возобновление отменённой подписки.

**Response 200:** Updated subscription object

---

### 3.8 Payment Method Resources

#### GET /payment-methods
Список платежных методов.

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "card",
      "last4": "4242",
      "brand": "visa",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "isDefault": true,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "type": "crypto",
      "walletAddress": "0x1234...5678",
      "walletAddressShort": "0x1234...5678",
      "network": "ethereum",
      "currency": "USDT",
      "isDefault": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### POST /payment-methods/card
Добавление карты.

**Request:**
```json
{
  "paymentMethodId": "pm_xxx"
}
```

Где `paymentMethodId` — ID от Stripe Elements.

**Response 201:** Created payment method object

---

#### POST /payment-methods/crypto
Добавление крипто-кошелька.

**Request:**
```json
{
  "walletAddress": "0x1234567890abcdef...",
  "network": "ethereum",
  "currency": "USDT"
}
```

**Response 201:** Created payment method object

---

#### DELETE /payment-methods/:id
Удаление платежного метода.

**Response 204:** No content

**Errors:**
- 422: Нельзя удалить последний метод при активной платной подписке

---

#### PATCH /payment-methods/:id/default
Установка метода по умолчанию.

**Response 200:** Updated payment method object

---

#### GET /payment-history
История платежей.

**Query params:**
- `limit`: 10 (default), max 100
- `offset`: 0 (default)

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 1200,
      "currency": "usd",
      "status": "succeeded",
      "description": "Pro plan - January 2024",
      "invoiceUrl": "https://invoice.stripe.com/...",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "limit": 10,
    "offset": 0
  }
}
```

---

### 3.9 Webhooks

#### POST /webhooks/stripe
Обработка Stripe webhooks.

**Events:**
- `checkout.session.completed` — успешная оплата
- `customer.subscription.updated` — изменение подписки
- `customer.subscription.deleted` — отмена подписки
- `invoice.payment_failed` — неуспешный платёж

**Security:**
- Верификация подписи Stripe
- Header: `Stripe-Signature`

---

## 4. Модели данных (PostgreSQL)

### 4.1 Таблица users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(50),
    username VARCHAR(30) UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    preferences JSONB NOT NULL DEFAULT '{}',

    stripe_customer_id VARCHAR(255) UNIQUE,

    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
```

### 4.2 Таблица refresh_tokens

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
```

### 4.3 Таблица password_reset_tokens

```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.4 Таблица maps

```sql
CREATE TABLE maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    preview_url TEXT,
    ai_analysis JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maps_user_id ON maps(user_id);
CREATE INDEX idx_maps_updated_at ON maps(updated_at DESC);
```

### 4.5 Таблица nodes

```sql
CREATE TYPE node_type AS ENUM (
    'concept', 'fact', 'theory', 'example',
    'question', 'hypothesis', 'person', 'school'
);

CREATE TYPE complexity_level AS ENUM (
    'basic', 'intermediate', 'advanced'
);

CREATE TABLE nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    content TEXT,
    type node_type NOT NULL DEFAULT 'concept',
    position_x FLOAT NOT NULL DEFAULT 0,
    position_y FLOAT NOT NULL DEFAULT 0,

    -- Metadata fields (denormalized for query performance)
    confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
    complexity complexity_level DEFAULT 'basic',
    sources TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    last_reviewed TIMESTAMPTZ,
    review_count INT DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nodes_map_id ON nodes(map_id);
CREATE INDEX idx_nodes_type ON nodes(type);
CREATE INDEX idx_nodes_tags ON nodes USING GIN(tags);
```

### 4.6 Таблица edges

```sql
CREATE TYPE relation_type AS ENUM (
    'is-a', 'has-a', 'causes', 'explains', 'related-to',
    'influences', 'part-of', 'prerequisite', 'contradicts', 'similar-to'
);

CREATE TYPE edge_creator AS ENUM ('user', 'ai', 'both');

CREATE TABLE edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    source_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    relation_type relation_type NOT NULL,
    label VARCHAR(100),
    strength FLOAT NOT NULL DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
    bidirectional BOOLEAN NOT NULL DEFAULT FALSE,

    -- Metadata
    confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
    evidence TEXT[] DEFAULT '{}',
    examples TEXT[] DEFAULT '{}',
    created_by edge_creator DEFAULT 'user',
    last_validated TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT edges_no_self_loop CHECK (source_node_id != target_node_id),
    CONSTRAINT edges_unique_pair UNIQUE (source_node_id, target_node_id)
);

CREATE INDEX idx_edges_map_id ON edges(map_id);
CREATE INDEX idx_edges_source ON edges(source_node_id);
CREATE INDEX idx_edges_target ON edges(target_node_id);
CREATE INDEX idx_edges_relation_type ON edges(relation_type);
```

### 4.7 Таблица subscriptions

```sql
CREATE TYPE plan_type AS ENUM ('free', 'pro', 'ultra');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    plan_type plan_type NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',

    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255),

    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '100 years',
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
```

### 4.8 Таблица payment_methods

```sql
CREATE TYPE payment_method_type AS ENUM ('card', 'crypto');
CREATE TYPE card_brand AS ENUM ('visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay');
CREATE TYPE crypto_network AS ENUM ('bitcoin', 'ethereum', 'solana', 'tron');
CREATE TYPE crypto_currency AS ENUM ('BTC', 'ETH', 'USDT', 'USDC', 'SOL');

CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type payment_method_type NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    -- Card fields
    stripe_payment_method_id VARCHAR(255) UNIQUE,
    card_last4 VARCHAR(4),
    card_brand card_brand,
    card_expiry_month INT,
    card_expiry_year INT,

    -- Crypto fields
    wallet_address VARCHAR(255),
    crypto_network crypto_network,
    crypto_currency crypto_currency,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
```

### 4.9 Таблица payments

```sql
CREATE TYPE payment_status AS ENUM ('succeeded', 'pending', 'failed', 'refunded');

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),

    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_invoice_id VARCHAR(255),

    amount INT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    status payment_status NOT NULL,
    description TEXT,
    invoice_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
```

### 4.10 Таблица ai_tasks

```sql
CREATE TYPE ai_task_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE ai_task_type AS ENUM ('map_analysis', 'suggest_edges');

CREATE TABLE ai_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    map_id UUID REFERENCES maps(id) ON DELETE CASCADE,

    type ai_task_type NOT NULL,
    status ai_task_status NOT NULL DEFAULT 'pending',
    model VARCHAR(50) NOT NULL,

    input JSONB NOT NULL,
    result JSONB,
    error TEXT,

    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_tasks_user_id ON ai_tasks(user_id);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
```

### 4.11 Таблица usage_stats (месячная статистика)

```sql
CREATE TABLE usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month DATE NOT NULL,

    ai_requests_count INT NOT NULL DEFAULT 0,
    storage_used_bytes BIGINT NOT NULL DEFAULT 0,

    UNIQUE (user_id, month)
);

CREATE INDEX idx_usage_stats_user_month ON usage_stats(user_id, month);
```

---

## 5. Бизнес-правила

### 5.1 Лимиты по планам

| Правило | Free | Pro | Ultra |
|---------|------|-----|-------|
| Макс. карт | 3 | 20 | ∞ |
| Узлов на карту | 50 | 500 | ∞ |
| Всего узлов | 150 | 5000 | ∞ |
| AI запросов/мес | 20 | 200 | ∞ |
| Хранилище | 50 MB | 1 GB | 10 GB |

### 5.2 Проверка лимитов

При создании карты:
```sql
SELECT COUNT(*) FROM maps WHERE user_id = $1 AND deleted_at IS NULL
```
Сравнить с лимитом плана.

При создании узла:
```sql
-- Узлов в карте
SELECT COUNT(*) FROM nodes WHERE map_id = $1

-- Всего узлов пользователя
SELECT COUNT(*) FROM nodes n
JOIN maps m ON n.map_id = m.id
WHERE m.user_id = $1
```

### 5.3 Права доступа

| Ресурс | Owner | Admin | Viewer |
|--------|-------|-------|--------|
| Map CRUD | ✓ | ✓ | R only |
| Node CRUD | ✓ | ✓ | R only |
| Edge CRUD | ✓ | ✓ | R only |
| AI Analysis | ✓ | ✓ | ✗ |
| Billing | ✓ | ✗ | ✗ |

### 5.4 Каскадное удаление

- User → Maps, Subscriptions, PaymentMethods, Payments, UsageStats
- Map → Nodes, Edges, AITasks
- Node → Edges (source и target)

### 5.5 Soft Delete

Только для Users:
- `deleted_at` timestamp
- Grace period: 30 дней
- Cron job для hard delete после grace period
- Во время grace period: login восстанавливает аккаунт

---

## 6. Интеграции

### 6.1 OpenAI / Anthropic

**Конфигурация:**
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

**Rate Limiting:**
- Глобальный: 1000 req/min на приложение
- Per-user: согласно плану

**Retry Policy:**
- 3 попытки с exponential backoff
- Таймаут: 60 секунд

**Модели:**
```go
var ModelPricing = map[string]float64{
    "gpt-3.5-turbo":    0.002,  // per 1K tokens
    "gpt-4":            0.06,
    "gpt-4-turbo":      0.03,
    "claude-3-sonnet":  0.015,
    "claude-3-opus":    0.075,
}
```

### 6.2 Stripe

**Конфигурация:**
```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_ULTRA_MONTHLY=price_...
STRIPE_PRICE_ULTRA_YEARLY=price_...
```

**Webhooks:**
- Endpoint: `/api/v1/webhooks/stripe`
- Верификация подписи обязательна
- Idempotency через `stripe_event_id`

### 6.3 S3-compatible Storage

**Конфигурация:**
```env
S3_ENDPOINT=https://...
S3_REGION=auto
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET_AVATARS=arbor-avatars
S3_BUCKET_PREVIEWS=arbor-previews
```

**Buckets:**
- `avatars/` — аватары пользователей (256x256)
- `previews/` — превью карт (автогенерация)

### 6.4 Email (SMTP / SendGrid)

**Конфигурация:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG...
EMAIL_FROM=noreply@arbor.io
EMAIL_FROM_NAME=Arbor
```

**Templates:**
- Welcome email
- Password reset
- Subscription confirmation
- Payment failed

### 6.5 Redis

**Конфигурация:**
```env
REDIS_URL=redis://localhost:6379/0
```

**Use cases:**
- Session/token blacklist
- Rate limiting (sliding window)
- AI task queue
- Caching (user limits, plans)

---

## 7. Нефункциональные требования

### 7.1 Производительность

| Метрика | Требование |
|---------|------------|
| API Latency (p95) | < 200ms |
| API Latency (p99) | < 500ms |
| Throughput | 1000 req/s |
| DB Connection Pool | 20-50 connections |
| Graph Load (1000 nodes) | < 1s |

### 7.2 Масштабируемость

- Horizontal scaling через load balancer
- Stateless API servers
- Redis для shared state
- DB read replicas для read-heavy operations

### 7.3 Безопасность

#### Authentication
- JWT с RS256 (asymmetric)
- Access token: 15 min TTL
- Refresh token: 30 days TTL, one-time use
- Password: bcrypt, cost 12

#### Authorization
- RBAC (role-based access control)
- Resource ownership validation
- Rate limiting per IP и per user

#### Data Protection
- TLS 1.3 everywhere
- Encryption at rest (PostgreSQL)
- PII minimization
- GDPR compliance (data export, deletion)

#### Input Validation
- Strict schema validation (все endpoints)
- SQL injection prevention (parameterized queries)
- XSS prevention (HTML sanitization для content)

### 7.4 Observability

#### Logging
- Structured JSON logs
- Levels: debug, info, warn, error
- Request ID tracing
- PII masking

#### Metrics (Prometheus)
- `http_requests_total`
- `http_request_duration_seconds`
- `db_query_duration_seconds`
- `ai_requests_total`
- `active_subscriptions`

#### Tracing (OpenTelemetry)
- Distributed tracing
- Span per handler/repository/external call

### 7.5 Availability

- Target: 99.9% uptime
- Health check endpoint: `GET /health`
- Readiness probe: `GET /ready`
- Graceful shutdown (30s timeout)

---

## 8. Переменные окружения

```env
# Application
APP_ENV=production
APP_PORT=8080
APP_HOST=0.0.0.0

# Database
DATABASE_URL=postgres://user:pass@host:5432/arbor?sslmode=require
DATABASE_MAX_CONNECTIONS=50

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_PRIVATE_KEY_PATH=/secrets/jwt-private.pem
JWT_PUBLIC_KEY_PATH=/secrets/jwt-public.pem
JWT_ACCESS_TOKEN_TTL=15m
JWT_REFRESH_TOKEN_TTL=720h

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_ULTRA_MONTHLY=price_...
STRIPE_PRICE_ULTRA_YEARLY=price_...

# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AI_DEFAULT_MODEL=gpt-3.5-turbo
AI_REQUEST_TIMEOUT=60s

# S3
S3_ENDPOINT=https://s3.amazonaws.com
S3_REGION=us-east-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET_AVATARS=arbor-avatars
S3_BUCKET_PREVIEWS=arbor-previews

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG...
EMAIL_FROM=noreply@arbor.io
EMAIL_FROM_NAME=Arbor

# Observability
LOG_LEVEL=info
LOG_FORMAT=json
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317

# Security
CORS_ORIGINS=https://app.arbor.io
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1m
```

---

## 9. Приложения

### 9.1 Коды ошибок

| Код | Описание |
|-----|----------|
| `AUTH_INVALID_CREDENTIALS` | Неверный email или пароль |
| `AUTH_TOKEN_EXPIRED` | Токен истёк |
| `AUTH_TOKEN_INVALID` | Невалидный токен |
| `AUTH_RATE_LIMITED` | Превышен лимит попыток |
| `USER_NOT_FOUND` | Пользователь не найден |
| `USER_EMAIL_EXISTS` | Email уже используется |
| `USER_USERNAME_EXISTS` | Username уже занят |
| `MAP_NOT_FOUND` | Карта не найдена |
| `MAP_LIMIT_EXCEEDED` | Превышен лимит карт |
| `NODE_NOT_FOUND` | Узел не найден |
| `NODE_LIMIT_EXCEEDED` | Превышен лимит узлов |
| `EDGE_NOT_FOUND` | Связь не найдена |
| `EDGE_SELF_LOOP` | Нельзя связать узел с самим собой |
| `EDGE_DUPLICATE` | Связь уже существует |
| `EDGE_CROSS_MAP` | Узлы принадлежат разным картам |
| `SUBSCRIPTION_NOT_FOUND` | Подписка не найдена |
| `PAYMENT_METHOD_LAST` | Нельзя удалить последний метод |
| `AI_QUOTA_EXCEEDED` | Превышен лимит AI запросов |
| `AI_MODEL_NOT_ALLOWED` | Модель недоступна для плана |
| `VALIDATION_ERROR` | Ошибка валидации |
| `INTERNAL_ERROR` | Внутренняя ошибка сервера |

### 9.2 Типы узлов

| Тип | Описание | Иконка |
|-----|----------|--------|
| `concept` | Абстрактное понятие | Brain |
| `fact` | Установленный факт | FileText |
| `theory` | Теория, гипотеза | Lightbulb |
| `example` | Пример, иллюстрация | BookOpen |
| `question` | Открытый вопрос | HelpCircle |
| `hypothesis` | Предположение | FlaskConical |
| `person` | Персона, автор | User |
| `school` | Школа мысли, течение | GraduationCap |

### 9.3 Типы связей

| Тип | Описание | Пример |
|-----|----------|--------|
| `is-a` | Наследование | Dog is-a Mammal |
| `has-a` | Композиция | Car has-a Engine |
| `causes` | Причинность | Smoking causes Cancer |
| `explains` | Объяснение | Quantum mechanics explains Atom |
| `related-to` | Общая связь | — |
| `influences` | Влияние | — |
| `part-of` | Часть целого | Wheel part-of Car |
| `prerequisite` | Пререквизит | Algebra prerequisite Calculus |
| `contradicts` | Противоречие | — |
| `similar-to` | Сходство | — |
