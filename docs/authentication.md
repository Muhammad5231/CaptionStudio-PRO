# Authentication & Access Control

## Password Security

- Passwords are encrypted using Node.js built-in `crypto.scrypt` with random 16-byte cryptographically secure salts and 64-byte key derivations.
- Timing-safe comparisons (`crypto.timingSafeEqual`) prevent side-channel timing attacks.
- Strict password strength rules enforced on client and server: Minimum 8 characters, at least 1 uppercase character, at least 1 digit.

## Role-Based Access Control (RBAC)

Two layers of access control are maintained:

### 1. Global System Roles (`UserRole`)
- `USER`: Base platform user.
- `CREATOR`: Verified content creator with access to studio features.
- `ADMIN` & `SUPER_ADMIN`: Access to `/admin` management portal, cluster metrics, and user suspension tools.

### 2. Workspace Roles (`WorkspaceRole`)
- `OWNER`: Full administrative, billing, deletion, and member invitation rights.
- `ADMIN`: Project and asset management plus team invitation rights.
- `EDITOR`: Project creation, editing, and video export rendering.
- `VIEWER`: Read-only preview access to projects and exported videos.

