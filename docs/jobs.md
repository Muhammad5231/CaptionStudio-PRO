# Background Queue & Job Architecture

## Asynchronous Processing Workflow

Heavy video operations (audio extraction, neural transcription, subtitle burning) are never executed inside synchronous HTTP request handlers. Instead, the API server dispatches typed jobs to Redis-backed BullMQ queues:

```mermaid
sequenceDiagram
    participant User as Client Web
    participant API as API Server
    participant Redis as Redis / BullMQ
    participant Worker as Background Worker
    participant Storage as Object Storage
    participant DB as PostgreSQL

    User->>API: POST /projects/:id/export
    API->>Redis: Enqueue Job (EXPORT, payload)
    API-->>User: 202 Accepted (Job ID: job-xxx)
    Redis->>Worker: Dispatch Job
    Worker->>Storage: Download Video & ASS Subtitles
    Worker->>Worker: Burn Subtitles with FFmpeg
    Worker->>Storage: Upload Rendered MP4
    Worker->>DB: Record Export & Update Usage Ledger
    Worker->>Redis: Mark Job Completed
    User->>API: GET /jobs/job-xxx
    API-->>User: Status: COMPLETED, progress: 100%
```

## Queues
1. `captionstudio-transcription`: Audio extraction & speech-to-text processing.
2. `captionstudio-thumbnail`: Quick thumbnail extraction from video keyframes.
3. `captionstudio-export`: FFmpeg ASS burning and final MP4 encoding.

