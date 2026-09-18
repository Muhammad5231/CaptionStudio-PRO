# Security & Compliance Architecture

## Security Foundations

1. **Input Sanitization**:
   - All inbound payloads are validated through Zod schemas.
   - Subtitle text is stripped of harmful script tags and malicious control characters before rendering.

2. **File Upload Hardening**:
   - MIME types and file signatures are validated.
   - Max file size limits enforced on reverse proxy and application middleware (500MB default).
   - Video processing occurs in sandboxed background containers.

3. **Cryptographic Protection**:
   - Scrypt hashing with high iteration counts for passwords.
   - Signed pre-authenticated S3 URLs with short expiration TTLs (15 minutes).
   - HTTPS-only secure cookies with `HttpOnly` and `SameSite=Lax` flags.

4. **Audit Logging**:
   - Administrative actions, user suspensions, and authentication events are recorded in the `AuditLog` table.

