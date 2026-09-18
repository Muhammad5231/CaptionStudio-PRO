# Production Deployment Guide

## Architecture Topology

```
                  ┌──────────────────────┐
                  │ Cloudflare / CDN     │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│ Next.js Web Cluster   │         │ Express API Cluster   │
│ (Vercel / Node.js)    │         │ (Docker / ECS / K8s)  │
└───────────────────────┘         └───────────┬───────────┘
                                              │
                   ┌──────────────────────────┼──────────────────────────┐
                   ▼                          ▼                          ▼
       ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
       │ PostgreSQL (RDS/Neon) │  │ Redis (ElastiCache)   │  │ S3 / Cloudflare R2    │
       └───────────────────────┘  └───────────┬───────────┘  └───────────────────────┘
                                              │
                                              ▼
                                  ┌───────────────────────┐
                                  │ BullMQ GPU Workers    │
                                  │ (Render & Whisper)    │
                                  └───────────────────────┘
```

## Environment Setup
1. Run database migrations:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```
2. Build monorepo packages and applications:
   ```bash
   pnpm build
   ```
3. Start API, Worker, and Web services with environment variables defined in `.env.example`.

