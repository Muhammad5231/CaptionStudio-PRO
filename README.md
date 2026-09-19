# CaptionStudio PRO — Modern Cloud Infrastructure (Supabase & Managed Redis)

> **CaptionStudio PRO** is a commercial-grade, web-based video caption and subtitle creation SaaS platform designed for high-growth video creators, podcasters, and media production agencies.

---

## Target Architecture

CaptionStudio PRO is organized as a high-performance TypeScript monorepo powered by **Turborepo** and **pnpm workspaces**. The platform runs entirely cloud-native without requiring local Docker containers for core databases or object storage.

```mermaid
flowchart TD
    subgraph Client ["Frontend Client (apps/web)"]
        Landing["Marketing Site"]
        Auth["Authentication UI"]
        Dashboard["SaaS Shell (/dashboard)"]
        Editor["Timeline Studio (/editor/:id)"]
        AdminUI["Admin Panel (/admin)"]
    end

    subgraph DirectUpload ["Direct Signed Upload"]
        UploadDirect["Direct HTTP PUT via Signed Upload URL"]
    end

    subgraph API ["Backend API (apps/api)"]
        AuthRoute["/api/v1/auth (Custom Session & Password Scrypt)"]
        UploadRoute["/api/v1/uploads (Server-generated UploadIntents)"]
        ProjectRoute["/api/v1/projects (Versioning & Metadata)"]
        JobsRoute["/api/v1/jobs (SSE Progress Streams)"]
        AdminRoute["/api/v1/admin (Postgres & Redis Live Metrics)"]
        HealthRoute["/health & /health/dependencies"]
    end

    subgraph SupabaseCloud ["Supabase Cloud Platform"]
        SupabasePostgres[(Supabase PostgreSQL 16 via Prisma)]
        SupabasePooler["Supavisor Connection Pooler (Port 6543)"]
        SupabaseStorage["Supabase Storage (Private Media Bucket)"]
    end

    subgraph Broker ["Managed Redis & BullMQ"]
        ManagedRedis[(Managed Redis Cloud / Upstash / Aiven)]
        AnalysisQueue["media-analysis Queue"]
        TranscribeQueue["transcription Queue"]
    end

    subgraph Workers ["Background Worker Services (apps/worker)"]
        WorkerService["BullMQ Worker Daemon"]
        FFmpegProbe["FFprobe Media Stream Inspector"]
        WhisperASR["Whisper AI Speech-to-Text Engine"]
    end

    Client -->|HTTP / REST API| API
    Client -->|Signed Upload (Bypasses API)| UploadDirect
    UploadDirect -->|Stores Raw Media| SupabaseStorage
    API -->|Session & User Queries| SupabasePooler
    SupabasePooler --> SupabasePostgres
    API -->|Generate Signed URLs & Probe| SupabaseStorage
    API -->|Enqueue Jobs| ManagedRedis
    ManagedRedis --> AnalysisQueue
    ManagedRedis --> TranscribeQueue
    WorkerService -->|Process Tasks| ManagedRedis
    WorkerService -->|Fetch Media via Temp Stream| SupabaseStorage
    WorkerService -->|Deep Stream Inspection| FFmpegProbe
    WorkerService -->|Word-Level Timestamps| WhisperASR
    WorkerService -->|Record Usage & Assets| SupabasePooler
```

---

## Infrastructure Overview

| Infrastructure Component | Provider | Configuration / Role |
| :--- | :--- | :--- |
| **Relational Database** | **Supabase PostgreSQL 16** | Backed by Prisma ORM with Supavisor transaction pooler (`DATABASE_URL`) and direct migration connection (`DIRECT_URL`). |
| **Object Storage** | **Supabase Storage** | Server-controlled private bucket (`captionstudio-media`) with time-limited signed upload & download URLs. |
| **Message Queue / Cache** | **Managed Redis** | BullMQ queue broker compatible with Upstash, Redis Cloud, Aiven, or any Redis 7+ instance via `REDIS_URL` (supports `rediss://` TLS). |
| **Media Engines** | **Host / System Binaries** | Native FFmpeg, FFprobe, and Python OpenAI Whisper for local AI speech transcription. |
| **Docker** | **Optional** | Retained strictly as an optional offline development alternative. **Docker Desktop is NOT required.** |

---

## Monorepo Workspace Structure

```
CaptionStudio PRO/
├── apps/
│   ├── web/                     # Next.js 14 App Router (Marketing, Auth, Studio Editor, Dashboard, Admin)
│   ├── api/                     # Express REST API (/api/v1, /health, /health/dependencies)
│   └── worker/                  # BullMQ background processing worker daemon (FFprobe & Whisper STT)
│
├── packages/
│   ├── database/                # Prisma ORM schema, migrations, system seed script
│   ├── storage/                 # StorageProvider abstraction (SupabaseStorageProvider & LocalStorageProvider)
│   ├── queue/                   # Managed Redis connection, BullMQ queue definitions, job contracts
│   ├── captions/                # Defensive parsers (SRT, WebVTT, ASS), timing tokenizers, serializers
│   ├── media/                   # FFmpeg abstractions, media probe, audio extraction
│   ├── auth/                    # Scrypt password hashing, session tokens, RBAC permissions
│   ├── billing/                 # Idempotent UsageService, plan quotas, usage ledger math
│   ├── ui/                      # Shared design tokens & Radix UI primitives
│   ├── config/                  # Shared tsconfig and tailwind configurations
│   └── types/                   # Shared domain interfaces, DTOs, and Zod schemas
│
├── tests/                       # Monorepo automated test suite (83+ unit and integration tests)
├── docker-compose.yml           # Optional offline local infrastructure
└── .env.example                 # Cloud-ready environment variable template
```

---

## Cloud Setup Guide (Supabase + Managed Redis)

Follow these steps to configure your environment without running Docker:

### 1. Create a Supabase Project
1. Navigate to [Supabase](https://supabase.com) and create a new project.
2. In the project dashboard, navigate to **Project Settings** > **Database** > **Connection string**:
   * **Connection Pooling (Transaction mode - port 6543)**: Copy this string for `DATABASE_URL` (add `?pgbouncer=true&connection_limit=10`).
   * **Direct Connection (Session mode - port 5432)**: Copy this string for `DIRECT_URL`.
3. In the left navigation, open **Storage**:
   * Click **New Bucket**.
   * Name the bucket: `captionstudio-media`.
   * Ensure **Public bucket** is turned **OFF** (all user media is strictly private).
4. In **Project Settings** > **API**:
   * Copy the **Project URL** (`https://[PROJECT-REF].supabase.co`).
   * Copy the **`service_role`** key (keep this secret; only used in server/worker environments).

### 2. Configure Managed Redis
1. Create a Redis database on [Upstash](https://upstash.com), [Redis Cloud](https://redis.io), or [Aiven](https://aiven.io).
2. Copy the connection URL (`rediss://...`). Upstash and cloud providers natively use TLS.

### 3. Configure Local Environment
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Populate your `.env` file with the cloud credentials:

```env
# Database (Supabase)
DATABASE_PROVIDER=supabase
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Storage (Supabase)
STORAGE_PROVIDER=supabase
SUPABASE_URL="https://[REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJh...[YOUR_SERVICE_ROLE_SECRET]"
SUPABASE_STORAGE_BUCKET="captionstudio-media"

# Redis (Managed Cloud)
QUEUE_PROVIDER=redis
REDIS_URL="rediss://default:[PASS]@[HOST].upstash.io:6379"

# System binaries (adjust if custom path)
FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe
PYTHON_PATH=python
WHISPER_MODEL=base
```

### 4. Push Database Schema & Seed System Templates
Run Prisma to synchronize your database tables and seed production caption templates:

```bash
# Push schema to Supabase PostgreSQL
pnpm db:push

# Seed subscription plans (Free, Creator, Pro, Business) and 16 production templates
pnpm db:seed
```

> **Visual Database GUI**: You can inspect your Supabase tables at any time using Prisma Studio:
> ```bash
> pnpm db:studio
> ```
> Opens an interactive web manager at `http://localhost:5555`.

---

## Running the Application (Docker Desktop OFF)

With your Supabase and Managed Redis credentials configured, you can start the entire platform with **Docker Desktop completely shut down**:

```bash
# Terminal 1: Run all services concurrently (Web, API, Worker)
pnpm dev

# Or start services individually:
pnpm --filter @captionstudio/web dev     # Next.js frontend (port 3000)
pnpm --filter @captionstudio/api dev     # Express API (port 4000)
pnpm --filter @captionstudio/worker dev  # Background workers
```

- **Web Studio**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:4000](http://localhost:4000)
- **Health Check**: [http://localhost:4000/health](http://localhost:4000/health)
- **Dependency Diagnostics**: [http://localhost:4000/health/dependencies](http://localhost:4000/health/dependencies)

---

## Health Check Specifications

`GET /health` returns standardized JSON with real dependency status:

```json
{
  "api": "ok",
  "database": "ok",
  "redis": "ok",
  "storage": "ok",
  "ffmpeg": "ok",
  "ffprobe": "ok",
  "worker": "ok"
}
```

`GET /health/dependencies` returns deep diagnostics including query latency and driver details.

---

## Optional: Offline Local Development (Docker)

If you need to work completely offline without an internet connection, you can optionally launch local PostgreSQL, Redis, and MinIO via Docker Compose:

```bash
docker compose up -d
```

When using local Docker:
* Set `DATABASE_URL="postgresql://captionstudio:captionstudio_dev_password@localhost:5432/captionstudio_db?schema=public"`
* Set `STORAGE_PROVIDER=local`
* Set `REDIS_URL="redis://localhost:6379"`

---

## Quality Assurance & Automated Testing

Run the automated test suite across security, storage, subtitle parsing, Whisper STT, and billing:

```bash
pnpm test
```

Run TypeScript compilation verification across all 12 workspace packages:

```bash
pnpm typecheck
```

Run production build:

```bash
pnpm build
```

---

## Security Guarantees

1. **Private Media**: All media uploaded to Supabase Storage is stored in private buckets. The browser receives short-lived signed URLs for direct upload and secure temporary download.
2. **Zero Service Role Key Exposure**: `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side Node.js runtimes (`apps/api`, `apps/worker`). It is **never** bundled or exposed via `NEXT_PUBLIC_*`.
3. **Fail-Closed Redis**: Rate limiting fails closed with `503 SERVICE_UNAVAILABLE` in production to prevent brute-force attacks during Redis infrastructure maintenance.
4. **Idempotent Usage Tracking**: Database-enforced `eventKey` on `UsageLedger` prevents duplicate transcription minute deductions on worker retry attempts.
5. **Direct Uploads**: Large video uploads do not route through the Express API server, avoiding Node.js memory pressure and bandwidth bottlenecks.
