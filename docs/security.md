# Security & Compliance Architecture

## Security Foundations

1. **Password Security & Real Password Reset Flow**:
   - Passwords hashed using native `crypto.scrypt` with 16-byte random salts and constant-time buffer comparison (`crypto.timingSafeEqual`).
   - Password reset tokens generated with 32 bytes of cryptographically secure random bytes (`generateResetToken`).
   - Only SHA-256 digests (`tokenHash`) are stored in `PasswordResetToken`; raw tokens are never persisted.
   - Tokens have a 30-minute expiration TTL and strict single-use enforcement (`usedAt`).
   - Successful password resets atomically invalidate all existing sessions for the user in a database transaction.
   - The `/forgot-password` endpoint returns a generic message regardless of email existence to prevent user enumeration.

2. **Session Security**:
   - 32-byte cryptographically secure hexadecimal tokens stored in the `Session` table.
   - HTTP-only, `SameSite=Lax`, and SSL/TLS-secured `cs_session` cookies.
   - Raw session tokens are never returned in JSON response bodies to prevent client-side script interception or accidental localStorage persistence.

3. **Multi-Tenant Workspace Isolation & RBAC**:
   - Strict workspace tenancy checks (`workspaceMiddleware`) prevent privilege escalation.
   - IDOR prevention (`projectMiddleware`) verifies that projects, assets, and jobs belong to the authenticated user's workspace before any CRUD operation is permitted.
   - Server-Sent Events (`/api/v1/jobs/:id/events`) require workspace membership authorization before streaming updates.

4. **Storage & Media File Security**:
   - Server-side storage path generation: `workspaces/{workspaceId}/projects/{projectId}/{assetType}/{fileId}.{ext}`.
   - Local storage downloads (`GET /api/v1/uploads/storage/:key`) strictly require authentication and workspace tenancy verification.
   - Canonical path resolution blocks all path traversal attempts (`..`) from escaping the uploads root.
   - Media validation validates actual container streams and dimensions via `ffprobe`; fabricated fallback metadata is forbidden.
   - Subtitle file parsing enforces defensive limits: 5MB maximum text size, 10,000 maximum cues, and 2,000 character line length caps.

5. **Distributed Rate Limiting**:
   - Redis-backed rate limiter using atomic increments and expirations (`authRateLimiter`, `uploadRateLimiter`).
   - Protects against brute-force password guessing, credential stuffing, and DoS attacks on upload endpoints.
   - Configurable windows and limits via environment variables (`AUTH_RATE_LIMIT_WINDOW_SECONDS`, `AUTH_RATE_LIMIT_MAX_REQUESTS`).

6. **Audit Logging**:
   - Security-sensitive actions (`USER_LOGIN`, `USER_LOGOUT`, `PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_SUCCESS`, `ADMIN_USER_STATUS_CHANGE`, `PROJECT_CREATE`, `UPLOAD_COMPLETE`) recorded asynchronously in the `AuditLog` table.
   - Sensitive credentials, passwords, reset tokens, and authorization headers are never logged.
