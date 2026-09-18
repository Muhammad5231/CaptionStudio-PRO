# REST API Specification (v1)

All endpoints are versioned under `/api/v1/`.

## Authentication & Users
- `POST /api/v1/auth/signup` — Register new user account.
- `POST /api/v1/auth/login` — Sign in and receive session token.
- `GET /api/v1/auth/me` — Inspect currently authenticated user.

## Projects
- `GET /api/v1/projects` — List projects with status and search filters.
- `POST /api/v1/projects` — Initialize new video/subtitle project.
- `GET /api/v1/projects/:id` — Get project details and active tracks.
- `PATCH /api/v1/projects/:id` — Update project name or active template.
- `DELETE /api/v1/projects/:id` — Delete project and cascade assets.
- `POST /api/v1/projects/:id/transcribe` — Queue AI speech-to-text job.
- `POST /api/v1/projects/:id/export` — Queue video burn rendering job.

## Templates & Billing
- `GET /api/v1/templates` — List available caption templates by category.
- `GET /api/v1/templates/:slug` — Get template detail by slug.
- `GET /api/v1/usage` — Fetch current month quota consumption.
- `GET /api/v1/billing/plans` — List pricing tiers and feature flags.
- `POST /api/v1/billing/checkout-session` — Create Stripe checkout session.

## Admin
- `GET /api/v1/admin/overview` — Super admin platform throughput metrics.
- `GET /api/v1/admin/users` — List and filter platform subscribers.
- `PATCH /api/v1/admin/users/:id/status` — Suspend or restore user account.

