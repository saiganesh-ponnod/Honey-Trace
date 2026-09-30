# HoneyTrace — Architecture

| Field | Value |
|---|---|
| Version | 1.0 (MVP) |
| Read with | `PRD.md` (what/why), `AGENTS.md` (how the agent must work) |
| Rule | If this document and the PRD conflict on *behavior*, PRD wins. On *technical structure*, this document wins. Update both when changing either. |

---

## 1. Architecture Overview

HoneyTrace is a **modular monolith**: one React SPA, one Express REST API, one PostgreSQL database, plus IoT clients (ESP32 or simulator) that call the same API.

**Key decisions**

| Decision | Choice | Reason |
|---|---|---|
| Language | TypeScript (strict) on client and server | Fewer runtime errors, better AI-agent output |
| Backend | Node 20 LTS, Express 4, layered (routes → controllers → services → Prisma) | Simple, beginner-friendly |
| ORM/migrations | Prisma + Prisma Migrate | Parameterized queries, typed models, migrations |
| Validation | Zod (shared shape per endpoint) | Runtime validation + types |
| Frontend | React 18 + Vite + Tailwind CSS | Per requirements |
| Server state (FE) | TanStack Query | Loading/error/cache handling |
| Forms | react-hook-form + zod resolver | Consistent validation |
| Auth | JWT bearer (HS256, 60 min) + bcrypt | Works cross-origin (Vercel ↔ Render) without cookie issues |
| QR | `qrcode` (server generate) + `html5-qrcode` (browser scan) | Mature, small |
| Charts | `recharts` (only sensor line chart + status distribution) | Charts only where they help |
| Tests | Vitest + Supertest (API), Vitest + React Testing Library (few UI) | One toolchain |
| Integrity | Per-batch SHA-256 **hash chain** on events (no blockchain in MVP) | Tamper evidence, cheap |
| Deploy | Vercel (client) · Render or Railway (API) · Neon/Supabase/Render Postgres | Free-tier friendly |

**Non-decisions (explicitly avoided):** microservices, message queues, Redis, GraphQL, WebSockets, blockchain, Kubernetes. Live sensor charts use polling (every 10 s) via TanStack Query `refetchInterval`.

---

## 2. System Context

```mermaid
flowchart LR
  PR["Producer"] --> HT["HoneyTrace Platform"]
  PC["Processor / Inspector"] --> HT
  DI["Distributor"] --> HT
  RE["Retailer"] --> HT
  AD["Admin"] --> HT
  CO["Consumer - no account"] -->|"scans QR"| HT
  IOT["ESP32 sensors / simulator"] -->|"readings"| HT
  HT --> DB[("PostgreSQL")]
```

External systems in MVP: none (no email, no payment, no third-party APIs). Hosting providers only.

---

## 3. High-Level Architecture

```mermaid
flowchart LR
  subgraph Clients
    W["React SPA - staff dashboards"]
    C["Consumer phone - camera or browser"]
    E["ESP32 or simulator script"]
  end
  subgraph API["Express API - Node.js"]
    SEC["Security middleware: helmet, cors, rate limit, request id, body limit"]
    AUTHN["authenticate JWT or device key"]
    AUTHZ["authorize roles and scope"]
    VAL["Zod validation"]
    CTRL["Controllers"]
    SVC["Services: auth, user, batch, processing, quality, supplyChain, sensor, verification, alert, audit, qr"]
    ERR["Central error handler"]
  end
  DB[("PostgreSQL via Prisma")]
  W -->|"HTTPS JSON, Bearer JWT"| SEC
  C -->|"opens /verify/code in SPA"| W
  W -->|"GET public verify"| SEC
  E -->|"POST readings, X-Device-Key"| SEC
  SEC --> AUTHN --> AUTHZ --> VAL --> CTRL --> SVC --> DB
  CTRL --> ERR
```

---

## 4. Component Architecture

| Component | Responsibility | Depends on |
|---|---|---|
| **Client SPA** | UI, routing, role-based navigation, forms, QR display/scan | API |
| **API Gateway layer** (middleware) | Security headers, CORS, rate limit, auth, RBAC, validation, error shape | – |
| **Domain services** | Business rules, state machine, transactions | Prisma, config |
| **Verification engine** (`verification.service`) | Computes status, reasons, checks; writes verification log | batch, events, alerts, sensors |
| **Alert engine** (`alert.service`) | Creates/dedupes alerts from rule checks; recomputes verification | verification |
| **Event ledger** (`supplyChainEvent.service`) | Append event with hash chain under row lock | Prisma |
| **Audit** (`audit.service`) | Append audit rows | Prisma |
| **Sensor service** | Validates, stores readings, threshold evaluation | alert |
| **QR service** | Builds URL, generates PNG/SVG | config |
| **Simulator** (`/simulator`) | CLI generating plausible readings to real endpoint | API |
| **Seed** (`prisma/seed.ts`) | Deterministic demo data incl. flagged cases | Prisma |

---

## 5. Frontend Architecture

### 5.1 Structure
```
client/src/
  main.tsx, App.tsx, routes.tsx
  api/            axios instance + typed endpoint functions (one file per resource)
  auth/           AuthContext, useAuth, ProtectedRoute, RoleRoute, token storage
  components/
    ui/           Button, Input, Select, Card, Badge, Modal, Table, Spinner, EmptyState, ErrorState, Toast
    layout/       PublicLayout, DashboardLayout, Sidebar, Topbar
    batch/        BatchForm, BatchTable, BatchSummary, StatusBadge, VerificationBadge
    timeline/     SupplyChainTimeline
    sensors/      SensorChart, SensorLatestCard
    alerts/       AlertList, AlertSeverityBadge
    qr/           QrCard, QrScanner
    verify/       StatusBanner, ChecksList, OriginCard, QualityCard, WarningBox
  pages/
    public/       Landing, HowItWorks, Verify, Scan, Login, RequestAccess, NotFound
    producer/ processor/ distributor/ retailer/ admin/
  hooks/          useBatches, useBatch, useTimeline, useSensorReadings, ...
  lib/            formatters (date, kg), constants (enums, labels, colors), zod schemas
  styles/         tailwind.css
```

### 5.2 Routing & guards
React Router v6. `ProtectedRoute` (requires auth) and `RoleRoute allowed={[...]}` wrap dashboards. Guards are **UX only**; the server enforces access. After login, redirect by role: `PRODUCER→/producer`, `PROCESSOR→/processor`, `DISTRIBUTOR→/distributor`, `RETAILER→/retailer`, `ADMIN→/admin`.

### 5.3 State & data
- Server state: TanStack Query (keys like `['batches', filters]`, `['batch', id]`, `['timeline', id]`). Mutations invalidate relevant keys.
- Auth state: React Context; token in memory + `sessionStorage`; axios interceptor adds `Authorization`, and on 401 clears auth and redirects to `/login`.
- No global store library.

### 5.4 UI conventions
Honey/amber brand palette (Tailwind custom `honey` colors). Status colors with icon+text: VERIFIED (green, check-circle), INFORMATION INCOMPLETE (amber, alert-circle), FLAGGED (red, alert-triangle), NOT FOUND (gray, search-x). Every data view implements **loading skeleton, empty state, error state with retry**. Consumer page is a single-column mobile-first layout using its own `PublicLayout`.

---

## 6. Backend Architecture

### 6.1 Structure
```
server/
  prisma/ schema.prisma, migrations/, seed.ts
  src/
    index.ts                 (listen)            app.ts (express app factory, used by tests)
    config/ env.ts (zod-validated env), qualityLimits.ts, sensorThresholds.ts, constants.ts
    middleware/ requestId, security, rateLimiters, authenticate, authenticateDevice, authorize, scope helpers, validate, errorHandler, notFound
    routes/ index.ts, auth.routes.ts, user.routes.ts, source.routes.ts, batch.routes.ts,
            processing.routes.ts, quality.routes.ts, supplyChain.routes.ts, iot.routes.ts,
            qr.routes.ts, public.routes.ts, alert.routes.ts, admin.routes.ts, dashboard.routes.ts
    controllers/   thin: parse req → call service → shape response
    services/      auth, user, source, batch, processing, quality, supplyChain, supplyChainEvent, sensor,
                   qr, verification, alert, audit, dashboard, batchAccess (scoping), hashChain
    schemas/       zod schemas per resource
    utils/         ApiError, asyncHandler, codeGenerator, hash, pagination, logger (pino)
    types/
  tests/           api/*.test.ts, services/*.test.ts, helpers (testApp, factories, resetDb)
```

### 6.2 Layering rules
- **Routes**: path + middleware chain (`authenticate → authorize(roles) → validate(schema) → controller`).
- **Controllers**: no business logic, no Prisma.
- **Services**: all business rules, transactions, state machine, audit calls. Receive `actor` (`{id, role}` loaded from DB) explicitly.
- **Prisma** is imported only in services/seed/tests.

### 6.3 Request pipeline order
`requestId → helmet → cors → json(100kb) → pino-http → rateLimit(general) → routes[ route-specific limiter → authenticate → authorize → validate → controller ] → notFound → errorHandler`.

### 6.4 Domain services (key logic)

**`batchAccess.service`**: returns Prisma `where` fragments per role (scope rules, PRD §15.3) and `assertCanRead/Write(batch, actor)`.

**State machine** (`batch.stateMachine.ts`): pure function `assertTransition(currentStatus, action)`; table in §13.

**`supplyChainEvent.appendEvent(tx, {batchId, eventType, actorId, locationName, lat, lng, payload, statusAfter, notes})`**: (1) `SELECT id FROM batches WHERE id=$1 FOR UPDATE` via `tx.$queryRaw` tagged template (the only allowed raw SQL), (2) read last event hash (or `GENESIS`), (3) compute `eventHash = sha256(prevHash + "|" + canonicalJSON({batchId,eventType,actorId,occurredAt,locationName,lat,lng,payload,notes}))`, (4) insert. `canonicalJSON` = stable key order.

**`verification.service.computeVerification(batchId)`**: loads data, runs checklist C1–C8 and rules (PRD §12.4), returns `{status, reasons, checks}`. `recompute(batchId)` persists `batches.verificationStatus`. Called after: any event, sensor reading, alert creation/status change, recall.

**`alert.service.raise({type, batchId?, severity, title, description, evidence, dedupeKey, affectsVerification})`**: upsert-like: if an active (OPEN/ACKNOWLEDGED) alert with same `(type, batchId, dedupeKey)` exists → skip; else insert; then `recompute(batchId)`.

**`alert.service.runTimeChecks()`**: stale sensors, stuck in transit, expired batches, chain integrity; invoked lazily by verify (single batch) and by `POST /admin/checks/run` (all active batches).

**Location plausibility**: haversine distance between consecutive geo-tagged events ÷ time delta; > 120 km/h → `UNEXPECTED_LOCATION`.

---

## 7. Database Architecture

PostgreSQL 15+. Prisma models map to `snake_case` tables via `@@map`. IDs are `uuid` (`@default(uuid())`). All times `timestamptz`.

### 7.1 Enums
- `Role`: PRODUCER, PROCESSOR, DISTRIBUTOR, RETAILER, ADMIN
- `UserStatus`: PENDING, APPROVED, SUSPENDED
- `BatchStatus`: REGISTERED, PROCESSING, PROCESSED, QUALITY_APPROVED, QUALITY_REJECTED, IN_TRANSIT, AT_RETAILER, RECALLED
- `VerificationStatus`: VERIFIED, INFORMATION_INCOMPLETE, FLAGGED *(NOT_FOUND is response-only)*
- `EventType`: BATCH_REGISTERED, HARVEST_RECORDED, PROCESSING_RECORDED, QUALITY_TESTED, PICKED_UP_BY_DISTRIBUTOR, LOCATION_UPDATE, DISPATCHED_TO_RETAILER, RECEIVED_BY_RETAILER, BATCH_RECALLED
- `QualityResult`: PASS, FAIL
- `AlertSeverity`: LOW, MEDIUM, HIGH, CRITICAL
- `AlertStatus`: OPEN, ACKNOWLEDGED, RESOLVED, DISMISSED
- `AlertType`: see PRD §12.5

### 7.2 Tables (fields, keys, indexes)

**users** — `id PK`, `name`, `email UNIQUE (lowercase)`, `password_hash`, `role Role`, `status UserStatus default PENDING`, `organization_name`, `phone?`, `location_text?`, `approved_by FK users.id?`, `approved_at?`, `last_login_at?`, `created_at`, `updated_at`. Indexes: `(role,status)`.

**honey_sources** — `id PK`, `producer_id FK users`, `name`, `village`, `district`, `state`, `country default 'IN'`, `latitude numeric(9,6)?`, `longitude numeric(9,6)?`, `floral_source?`, `created_at`, `updated_at`. Index `(producer_id)`.

**batches** — `id PK`, `batch_code UNIQUE`, `producer_id FK users`, `source_id FK honey_sources`, `assigned_processor_id FK users`, `current_custodian_id FK users?`, `pending_retailer_id FK users?`, `producer_lot_number`, `product_name`, `honey_type`, `harvest_date date`, `harvest_method?`, `quantity_kg numeric(10,2)`, `packaging_type?`, `expiry_date date`, `status BatchStatus default REGISTERED`, `verification_status VerificationStatus default INFORMATION_INCOMPLETE`, `recall_reason?`, `recalled_at?`, `notes?`, `created_at`, `updated_at`. Constraints: `UNIQUE (producer_id, producer_lot_number)`. Indexes: `(producer_id,status)`, `(assigned_processor_id,status)`, `(status)`, `(verification_status)`, `(current_custodian_id)`, `(pending_retailer_id)`.

**processing_records** — `id PK`, `batch_id FK`, `processor_id FK users`, `process_type`, `facility_name`, `facility_location`, `started_at`, `completed_at`, `max_temperature_c numeric(5,2)?`, `input_quantity_kg numeric(10,2)?`, `output_quantity_kg numeric(10,2)?`, `additives_declared boolean default false`, `additives_notes?`, `is_final boolean`, `notes?`, `created_at`. Index `(batch_id, created_at)`.

**quality_tests** — `id PK`, `batch_id FK`, `inspector_id FK users`, `test_type`, `lab_name`, `report_reference?`, `tested_at`, `moisture_pct numeric(5,2)?`, `hmf_mg_kg numeric(7,2)?`, `electrical_conductivity_ms_cm numeric(5,3)?`, `ph numeric(4,2)?`, `diastase_number numeric(5,2)?`, `overall_result QualityResult`, `out_of_limit_params jsonb default '[]'`, `notes?`, `created_at`. Index `(batch_id, created_at)`.

**iot_devices** — `id PK`, `owner_id FK users`, `batch_id FK batches?`, `name`, `api_key_hash UNIQUE`, `key_prefix` (first 6 chars for display), `is_active default true`, `last_seen_at?`, `created_at`, `updated_at`. Indexes `(owner_id)`, `(batch_id)`.

**sensor_readings** — `id PK`, `batch_id FK`, `device_id FK`, `temperature_c numeric(5,2)?`, `humidity_pct numeric(5,2)?`, `weight_kg numeric(10,3)?`, `tds_ppm numeric(8,2)?`, `is_abnormal boolean default false`, `abnormal_reasons jsonb default '[]'`, `recorded_at timestamptz`, `received_at timestamptz default now()`. Constraints: `UNIQUE (device_id, recorded_at)`. Indexes: `(batch_id, recorded_at DESC)`.

**supply_chain_events** — `id PK`, `batch_id FK`, `event_type EventType`, `actor_id FK users`, `actor_role Role`, `location_name?`, `latitude?`, `longitude?`, `status_after BatchStatus`, `notes?`, `payload jsonb default '{}'`, `occurred_at timestamptz default now()`, `sequence int` (1..n per batch), `prev_hash`, `event_hash`, `created_at`. Constraints: `UNIQUE (batch_id, sequence)`. Indexes `(batch_id, sequence)`, `(actor_id)`. **Append-only** (no update/delete code path).

**retailer_inventory** — `id PK`, `batch_id FK`, `retailer_id FK users`, `quantity_received_kg`, `quantity_on_hand_kg`, `shelf_location?`, `condition`, `received_at`, `created_at`, `updated_at`. `UNIQUE (batch_id, retailer_id)`. Index `(retailer_id)`.

**qr_codes** — `id PK`, `batch_id FK UNIQUE`, `verify_url`, `generated_by FK users`, `generated_at`, `revoked_at?`. (Image regenerated on demand, not stored.)

**verification_logs** — `id PK`, `batch_id FK?`, `scanned_code`, `result_status` (incl. NOT_FOUND), `ip_hash`, `user_agent?`, `created_at`. Indexes `(batch_id, created_at)`, `(scanned_code, created_at)`.

**alerts** — `id PK`, `batch_id FK?`, `type AlertType`, `severity`, `status default OPEN`, `title`, `description`, `evidence jsonb`, `dedupe_key`, `affects_verification boolean`, `triggered_by FK users?`, `resolved_by FK users?`, `resolved_at?`, `resolution_note?`, `created_at`, `updated_at`. Indexes `(status, severity)`, `(batch_id, status)`, `(type, batch_id, dedupe_key)` (partial unique on active statuses via migration SQL; fallback: check in service inside transaction).

**audit_logs** — `id PK`, `actor_id FK?`, `actor_role?`, `action`, `entity_type`, `entity_id?`, `ip_hash?`, `user_agent?`, `metadata jsonb`, `created_at`. Indexes `(actor_id, created_at)`, `(entity_type, entity_id)`, `(action, created_at)`.

### 7.3 Audit fields convention
Mutable tables: `created_at`, `updated_at`. Who-did-it: explicit FK (`producer_id`, `processor_id`, `actor_id`, `generated_by`, `resolved_by`). Append-only tables: `created_at` only.

### 7.4 Migration policy
Prisma Migrate (`prisma migrate dev` locally, `prisma migrate deploy` in CI/production). One migration per logical change. No destructive changes (drop table/column, type narrowing) without explicit human approval.

---

## 8. IoT Architecture

```mermaid
flowchart LR
  S["Sensors: DHT22 temp and humidity, HX711 load cell, TDS probe"] --> M["ESP32 firmware"]
  M -->|"HTTPS POST every 60 s, X-Device-Key"| A["POST /iot/readings"]
  SIM["Simulator CLI or POST /iot/simulate"] --> A
  A --> D["authenticateDevice: hash key, lookup device, check active"]
  D --> V["Zod validation and plausibility"]
  V --> T["Threshold evaluation"]
  T --> DB[("sensor_readings")]
  T -->|"abnormal"| AL["alert.raise SENSOR_ABNORMAL"]
  AL --> VR["recompute verification"]
  DB --> UI["Batch page chart, polling every 10 s"]
```

- Device identity = API key (32 random bytes base64url). Stored `sha256(key)`; lookup by hash (constant-time not needed for hash lookup).
- Device assigned to ≤ 1 batch at a time via `batch_id`. Reading's `batch_id` = device's batch (payload `batchCode` is optional cross-check).
- ESP32 sends JSON over HTTPS (`WiFiClientSecure`); time from NTP; if no RTC, omit `recordedAt` and server uses `receivedAt`.
- Simulator modes: `normal` (temp 22–28 °C ± noise, humidity 40–55 %, weight ≈ batch quantity ± 0.2 %, TDS 280–340) and `abnormal` (temp drift to 40–46 °C, humidity 80 %+).
- The UI and API never label sensor data as proof of authenticity.

---

## 9. QR Verification Architecture

- QR payload = `${PUBLIC_APP_URL}/verify/${batchCode}`. `batchCode` format `HT-YYYY-XXXXXX`, alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no 0/O/1/I), generated via `crypto.randomInt`; retry on unique collision (max 5).
- Generation: server builds URL, stores `qr_codes` row, returns PNG data URL (`qrcode.toDataURL`, error correction `M`, width 512) and SVG string. Frontend also offers "Download PNG".
- Scanning: phone camera opens URL directly → SPA route `/verify/:code`. In-app `/scan` uses `html5-qrcode`, extracts `/verify/<code>` from decoded text, navigates (ignore any URL whose origin ≠ `PUBLIC_APP_URL` origin).
- Verification: SPA calls `GET /public/verify/:code` → `verification.service` → public DTO mapper (whitelist) → logs.

---

## 10. Authentication Architecture

```mermaid
sequenceDiagram
  participant U as User
  participant FE as React SPA
  participant API as Express API
  participant DB as PostgreSQL
  U->>FE: email and password
  FE->>API: POST /auth/login
  API->>DB: find user by email
  API->>API: bcrypt.compare, check status APPROVED
  API->>DB: audit LOGIN_SUCCESS, update last_login_at
  API-->>FE: token, expiresIn, user
  FE->>API: request with Authorization Bearer token
  API->>API: verify signature and expiry
  API->>DB: load user and status by sub
  API->>API: attach req.actor id and role from DB
```

- JWT HS256 signed with `JWT_SECRET` (≥ 32 chars), claims `sub`, `iat`, `exp` only.
- Login errors are generic (`INVALID_CREDENTIALS`) for wrong email/password; `ACCOUNT_PENDING/SUSPENDED` only returned after password is correct.
- Password policy: 8–72 chars, ≥ 1 letter and 1 digit.
- Device auth: separate middleware on `/iot/readings` only.

---

## 11. Authorization / RBAC

Three layers, all server-side:
1. **Role gate**: `authorize('PRODUCER')` etc. on route. Denied → `403 FORBIDDEN` + audit `AUTHZ_DENIED` (+ `UNAUTHORIZED_UPDATE_ATTEMPT` alert when a known batch id is in the path and method is a write).
2. **Ownership / assignment gate** in service: producer owns batch; processor is `assignedProcessorId`; distributor is custodian (for location/dispatch); retailer is `pendingRetailerId`.
3. **State gate**: state machine (§13).

Read scoping uses `batchAccess.where(actor)`; out-of-scope → 404.

Role matrix: PRD §15.2 is authoritative. Implement as a single `permissions.ts` map consumed by `authorize`, and unit test it.

---

## 12. Data Flow

```mermaid
flowchart TD
  P["Producer UI"] -->|"create batch"| API["API"]
  PR["Processor UI"] -->|"processing and quality"| API
  DI["Distributor UI"] -->|"pickup, location, dispatch"| API
  RE["Retailer UI"] -->|"receive, inventory"| API
  IOT["Device or simulator"] -->|"readings"| API
  API --> SVC["Services in transactions"]
  SVC --> T1[("batches and records")]
  SVC --> T2[("supply_chain_events with hash chain")]
  SVC --> T3[("sensor_readings")]
  SVC --> T4[("alerts")]
  SVC --> T5[("audit_logs")]
  SVC --> VR["recompute verification_status"]
  VR --> T1
  CON["Consumer scan"] -->|"GET public verify"| API
  API --> VE["verification engine reads T1 to T4"]
  VE --> LOG[("verification_logs")]
  VE --> CON
```

---

## 13. Batch Lifecycle

```mermaid
stateDiagram-v2
  [*] --> REGISTERED: producer registers batch
  REGISTERED --> PROCESSING: first processing record
  PROCESSING --> PROCESSING: more processing records
  PROCESSING --> PROCESSED: final processing record
  PROCESSED --> QUALITY_APPROVED: quality test PASS
  PROCESSED --> QUALITY_REJECTED: quality test FAIL
  QUALITY_APPROVED --> IN_TRANSIT: distributor pickup
  IN_TRANSIT --> IN_TRANSIT: location update or dispatch
  IN_TRANSIT --> AT_RETAILER: retailer confirms receipt
  REGISTERED --> RECALLED: recall
  PROCESSING --> RECALLED: recall
  PROCESSED --> RECALLED: recall
  QUALITY_APPROVED --> RECALLED: recall
  QUALITY_REJECTED --> RECALLED: recall
  IN_TRANSIT --> RECALLED: recall
  AT_RETAILER --> RECALLED: recall
  RECALLED --> [*]
```

**Transition table (`batch.stateMachine.ts`)**

| Action | Allowed from | Actor | Result status | Event type |
|---|---|---|---|---|
| createBatch | – | PRODUCER | REGISTERED | BATCH_REGISTERED (+ HARVEST_RECORDED) |
| addProcessing (not final) | REGISTERED, PROCESSING | PROCESSOR assigned | PROCESSING | PROCESSING_RECORDED |
| addProcessing (final) | REGISTERED, PROCESSING | PROCESSOR assigned | PROCESSED | PROCESSING_RECORDED |
| addQualityTest PASS | PROCESSED | PROCESSOR assigned | QUALITY_APPROVED | QUALITY_TESTED |
| addQualityTest FAIL | PROCESSED | PROCESSOR assigned | QUALITY_REJECTED | QUALITY_TESTED |
| pickup | QUALITY_APPROVED (custodian null) | DISTRIBUTOR | IN_TRANSIT | PICKED_UP_BY_DISTRIBUTOR |
| locationUpdate | IN_TRANSIT | custodian | IN_TRANSIT | LOCATION_UPDATE |
| dispatch | IN_TRANSIT (pendingRetailer null) | custodian | IN_TRANSIT (+pendingRetailerId) | DISPATCHED_TO_RETAILER |
| receive | IN_TRANSIT (pendingRetailer = actor) | RETAILER | AT_RETAILER (custodian = retailer) | RECEIVED_BY_RETAILER |
| recall | any except RECALLED | PRODUCER own / ADMIN | RECALLED | BATCH_RECALLED |

Expiry is a **computed condition** (`expiryDate < today`), not a status. Seed data for DEMO03 inserts events directly (bypassing the state machine) to create the missing-handover gap.

---

## 14. Supply-Chain Event Flow

```mermaid
flowchart TD
  R["Request: POST action on /batches/:id"] --> A["authenticate and authorize role"]
  A --> V["validate body with Zod"]
  V --> L["BEGIN transaction and lock batch row FOR UPDATE"]
  L --> O{"actor owns or is assigned?"}
  O -->|"no"| F1["403, audit AUTHZ_DENIED, alert UNAUTHORIZED_UPDATE_ATTEMPT"]
  O -->|"yes"| S{"state machine allows action?"}
  S -->|"no"| F2["409 INVALID_STATE_TRANSITION, audit, low alert"]
  S -->|"yes"| W["write domain record if any: processing, quality, inventory"]
  W --> E["append event with prev_hash and event_hash"]
  E --> U["update batch status, custodian, pending retailer"]
  U --> C["run consistency checks: quantities, limits, location plausibility"]
  C --> AL["raise alerts if needed"]
  AL --> AU["write audit log"]
  AU --> CM["COMMIT"]
  CM --> RV["recompute verification status"]
  RV --> RES["201 response"]
```
Audit and alert rows for **denied** requests are written in a separate short transaction (the main one is rolled back).

**Hash chain:** event `n` stores `prev_hash = event_hash(n-1)` (`GENESIS` for n=1) and `event_hash = sha256(prev_hash|canonicalJSON(content))`. `verification.service` walks the chain; mismatch → `CHAIN_INTEGRITY_FAILURE` (CRITICAL) → FLAGGED.

---

## 15. IoT Data Flow

```mermaid
sequenceDiagram
  participant D as ESP32 or Simulator
  participant API as API
  participant DB as PostgreSQL
  participant AL as Alert service
  participant UI as Batch page
  D->>API: POST /iot/readings with X-Device-Key
  API->>DB: find device by sha256 of key, is_active
  alt invalid key
    API-->>D: 401 INVALID_DEVICE_KEY
  else valid
    API->>API: Zod validate and plausibility checks
    API->>DB: insert reading, update device last_seen_at
    API->>API: evaluate thresholds
    opt abnormal
      API->>AL: raise SENSOR_ABNORMAL
      AL->>DB: insert alert and recompute verification
    end
    API-->>D: 201 id, isAbnormal, flags
  end
  UI->>API: GET sensor-readings every 10 s
  API->>DB: query by batch and time range
  API-->>UI: readings
```

Abnormal escalation: a single abnormal reading → MEDIUM; ≥ 3 consecutive abnormal or extreme (> 40 °C) → HIGH. Dedupe key: `SENSOR_ABNORMAL:<metric>:<date>`.

---

## 16. Verification Flow

```mermaid
sequenceDiagram
  participant C as Consumer phone
  participant FE as SPA /verify/:code
  participant API as Public API
  participant VS as Verification service
  participant DB as PostgreSQL
  C->>FE: scans QR, opens URL
  FE->>API: GET /public/verify/:code
  API->>API: rate limit and code format check
  alt invalid format
    API-->>FE: 400 INVALID_CODE_FORMAT
    FE-->>C: NOT FOUND page
  else valid format
    API->>DB: find batch by batch_code
    alt not found
      API->>DB: insert verification_log NOT_FOUND, upsert UNKNOWN_BATCH_SCAN alert
      API-->>FE: status NOT_FOUND
    else found
      API->>VS: computeVerification(batch)
      VS->>DB: load records, events, readings, active alerts
      VS->>VS: time checks, chain walk, rules C1 to C8
      VS->>DB: update batch verification_status, insert verification_log
      VS-->>API: status, reasons, checks
      API->>API: map to whitelist public DTO
      API-->>FE: PublicVerification
    end
  end
  FE-->>C: banner, details, timeline, sensors, warnings
```

---

## 17. API Architecture

- Base `/api/v1`, JSON, kebab-case paths, camelCase fields. Full endpoint contracts: **PRD §17**.
- Envelope: success `{ data, meta? }`; error `{ error: { code, message, details? } }`.
- Pagination: `?page=1&pageSize=20` (max 100) → `meta: {page,pageSize,total}`. Sorting: `?sort=createdAt:desc` whitelist per resource.
- Each route file declares: path, limiter, `authenticate`, `authorize`, `validate({body,query,params})`, controller.
- Zod schemas live in `server/src/schemas`; request types inferred from them. Responses are mapped by explicit `toDto` functions (never return raw Prisma rows containing `passwordHash`, `apiKeyHash`).
- Dates: ISO-8601 UTC strings. Decimals returned as numbers.
- Idempotency: QR generation idempotent; sensor readings deduped by `(deviceId, recordedAt)`.
- Health: `GET /health` (DB ping).

---

## 18. Database ERD

```mermaid
erDiagram
  users ||--o{ honey_sources : "owns"
  users ||--o{ batches : "produces"
  users ||--o{ batches : "assigned processor"
  honey_sources ||--o{ batches : "origin of"
  batches ||--o{ processing_records : "has"
  batches ||--o{ quality_tests : "has"
  batches ||--o{ supply_chain_events : "history"
  batches ||--o{ sensor_readings : "measured by"
  batches ||--o| qr_codes : "identified by"
  batches ||--o{ retailer_inventory : "stocked as"
  batches ||--o{ alerts : "raises"
  batches ||--o{ verification_logs : "scanned"
  users ||--o{ iot_devices : "registers"
  iot_devices ||--o{ sensor_readings : "sends"
  users ||--o{ supply_chain_events : "acts in"
  users ||--o{ retailer_inventory : "holds"
  users ||--o{ audit_logs : "performs"

  users {
    uuid id PK
    string email UK
    string password_hash
    string role
    string status
    string organization_name
  }
  honey_sources {
    uuid id PK
    uuid producer_id FK
    string village
    string district
    string state
  }
  batches {
    uuid id PK
    string batch_code UK
    uuid producer_id FK
    uuid source_id FK
    uuid assigned_processor_id FK
    uuid current_custodian_id FK
    uuid pending_retailer_id FK
    string producer_lot_number
    string status
    string verification_status
    date expiry_date
  }
  processing_records {
    uuid id PK
    uuid batch_id FK
    uuid processor_id FK
    boolean is_final
  }
  quality_tests {
    uuid id PK
    uuid batch_id FK
    uuid inspector_id FK
    string overall_result
  }
  iot_devices {
    uuid id PK
    uuid owner_id FK
    uuid batch_id FK
    string api_key_hash UK
    boolean is_active
  }
  sensor_readings {
    uuid id PK
    uuid batch_id FK
    uuid device_id FK
    decimal temperature_c
    decimal humidity_pct
    timestamptz recorded_at
  }
  supply_chain_events {
    uuid id PK
    uuid batch_id FK
    uuid actor_id FK
    string event_type
    int sequence
    string prev_hash
    string event_hash
  }
  retailer_inventory {
    uuid id PK
    uuid batch_id FK
    uuid retailer_id FK
    decimal quantity_on_hand_kg
  }
  qr_codes {
    uuid id PK
    uuid batch_id FK
    string verify_url
    uuid generated_by FK
  }
  verification_logs {
    uuid id PK
    uuid batch_id FK
    string scanned_code
    string result_status
    string ip_hash
  }
  alerts {
    uuid id PK
    uuid batch_id FK
    string type
    string severity
    string status
    string dedupe_key
  }
  audit_logs {
    uuid id PK
    uuid actor_id FK
    string action
    string entity_type
    string entity_id
  }
```

Relationship notes: `batches.producer_id`, `assigned_processor_id`, `current_custodian_id`, `pending_retailer_id` all reference `users`. `qr_codes.batch_id` and `alerts.batch_id` semantics: QR one-to-one; alert batch optional (unknown-scan alerts have none). FK delete rule: `RESTRICT` everywhere.

---

## 19. Security Architecture

| Layer | Controls |
|---|---|
| Transport | HTTPS via Vercel/Render; HSTS via helmet in production |
| Edge/app | `helmet`, CORS allow-list (`CLIENT_URL`, comma-separated), `express-rate-limit`, 100 kb body limit, `x-powered-by` off, request IDs |
| AuthN | bcrypt(12), JWT HS256 60 min, device key hashed SHA-256 |
| AuthZ | `permissions.ts` RBAC + ownership + state gates, DB-loaded role/status |
| Input | Zod on body/query/params, unknown keys stripped, enum whitelists, length caps |
| Data | Prisma parameterized; single allowed raw query (`FOR UPDATE`) uses tagged template; DTO whitelists; no PII on public API |
| Privacy | Verification IP stored as `sha256(ip + IP_HASH_SALT)`; no cookies set on public pages |
| Integrity | Hash-chained events; append-only tables; audit logs |
| Secrets | `.env` only, validated at boot (app refuses to start on missing/weak secrets), `.env.example` committed |
| Logging | pino with redaction of `authorization`, `x-device-key`, `password`, `token` |
| Frontend | CSP-friendly (no inline user HTML), token never in URL, logout clears storage |
| Dependencies | `npm audit` before release; lockfile committed |

Rate-limit table: PRD SEC-08. Threat notes (MVP): XSS stealing token from `sessionStorage` (mitigated by no raw HTML rendering + CSP on Vercel headers), brute force (limiter + bcrypt), IDOR (scoping + tests), device key leak (revocation), replay readings (unique constraint + recordedAt window), enumeration of batch codes (random 30-bit code + rate limit; data is intentionally public anyway).

*No claim of complete security is made.*

---

## 20. Error Handling

- `ApiError(status, code, message, details?)` thrown from services; `asyncHandler` forwards rejections.
- `errorHandler`: maps `ApiError`, `ZodError` (→ 400 `VALIDATION_ERROR` with `details`), Prisma errors (`P2002` unique → 409 with specific code when known; `P2025` → 404; others → 500), JWT errors (→ 401), body-too-large (→ 413). Unknown → 500 `INTERNAL_ERROR` with generic message; full error logged with `requestId`.
- Transactions roll back on any thrown error.
- Client: axios interceptor normalizes error to `{status, code, message, details}`; mutation toasts; form field errors from `details`; route-level error boundary; 401 → logout.
- Error code catalog: PRD §18.

---

## 21. Deployment Architecture

```mermaid
flowchart LR
  U["Users and phones"] --> V["Vercel: React static build"]
  V -->|"HTTPS API calls"| R["Render or Railway: Express API"]
  ESP["ESP32 / simulator"] -->|"HTTPS"| R
  R --> N[("Managed PostgreSQL: Neon, Supabase or Render")]
```

- **Client** (Vercel): root `client/`, build `npm run build`, output `dist`, env `VITE_API_BASE_URL`. `vercel.json` SPA rewrite `/(.*) → /index.html` and security headers (CSP `default-src 'self'; connect-src 'self' <API origin>; img-src 'self' data:`).
- **API** (Render web service): root `server/`, build `npm ci && npx prisma generate && npm run build`, pre-deploy/release `npx prisma migrate deploy`, start `node dist/index.js`, health check `/api/v1/health`. Free tier sleeps → hit `/health` before the demo.
- **DB**: managed Postgres; `DATABASE_URL` with `sslmode=require`.
- **Seed on hosted demo**: run once manually with `SEED_ALLOW_PRODUCTION=true npm run seed` (then unset). Change seed passwords for any public deployment.
- **Local**: `docker compose up -d db` (Postgres 15), `npm run dev` at root runs server (4000) + client (5173).
- **Branches**: `main` (deployable), feature branches; CI (optional GitHub Actions): install → lint → typecheck → test.

---

## 22. Environment Variables

### server/.env
| Variable | Example / notes |
|---|---|
| `NODE_ENV` | `development` / `test` / `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | `postgresql://honey:honey@localhost:5432/honeytrace` |
| `TEST_DATABASE_URL` | separate DB for tests |
| `JWT_SECRET` | ≥ 32 random chars (required) |
| `JWT_EXPIRES_IN` | `60m` |
| `BCRYPT_COST` | `12` |
| `CLIENT_URL` | `http://localhost:5173` (comma-separated allow-list) |
| `PUBLIC_APP_URL` | `http://localhost:5173` (used inside QR) |
| `IP_HASH_SALT` | random string ≥ 16 chars |
| `ENABLE_SIMULATOR` | `true` in dev/demo, `false` otherwise |
| `TRANSIT_MAX_DAYS` | `7` |
| `SENSOR_STALE_HOURS` | `24` |
| `SEED_ALLOW_PRODUCTION` | `false` (only set temporarily) |
| `LOG_LEVEL` | `info` |

### client/.env
| Variable | Example |
|---|---|
| `VITE_API_BASE_URL` | `http://localhost:4000/api/v1` |
| `VITE_PUBLIC_APP_URL` | `http://localhost:5173` |

### simulator/.env (or CLI flags)
`API_BASE_URL`, `DEVICE_KEY`, `BATCH_CODE`, `INTERVAL_SECONDS`, `SCENARIO`.

Rules: real `.env` files are git-ignored; `env.ts` validates with Zod at startup; never use `VITE_` prefix for secrets.

---

## 23. Scalability Considerations (future-facing, not MVP work)

- Stateless API → horizontal scaling behind a load balancer; move rate-limit store to Redis when > 1 instance.
- `sensor_readings` growth: partition by month or move to TimescaleDB; downsample for charts (server-side bucketing).
- Cache public verification (short TTL, e.g., 30 s) keyed by code; invalidate on batch change.
- Background jobs (BullMQ/cron) to replace lazy time checks.
- Read replicas for analytics; object storage for lab report PDFs.
- MQTT broker (Mosquitto/EMQX) for high-frequency devices.
- Multi-tenancy via `organization_id` when onboarding many companies.

---

## 24. Future Blockchain Integration (optional module, NOT in MVP)

Why not now: complexity with no benefit for a single-operator demo; the hash chain already gives tamper evidence.

If added later, keep it a **separate module** behind an interface `LedgerAnchor { anchor(batchId, eventHash): Promise<txRef> }`:
1. Periodically (or per event) publish the latest `event_hash` of each batch (or a Merkle root of all batches) to a public/permissioned chain (e.g., Polygon testnet, Hyperledger Fabric).
2. Store `anchor_tx_ref` and `anchored_at` on events/batches (additive migration).
3. Verification page shows "Anchored on-chain" when the recomputed chain head equals anchored hash.
4. No personal data on-chain; only hashes. No tokens.
Data stays in PostgreSQL as the source of truth.

## 25. Future AI/ML Integration (optional module, NOT in MVP)

- Anomaly detection on sensor time series (isolation forest / z-score per batch profile) producing `SENSOR_ANOMALY_ML` alerts as **suggestions** for admin review.
- Supplier risk scoring from alert history, quality trends and handover delays.
- Image/spectral classification only with validated lab datasets and clear accuracy statements.
- Architecture: separate Python service behind an internal API, fed by read-only DB views; results stored in `alerts` with `triggered_by = NULL` and `evidence.model_version`.
- Guardrail: ML output is decision support; never auto-label a product "fake".
