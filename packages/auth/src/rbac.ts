import { UserRole, WorkspaceRole } from '@captionstudio/types';

export type Permission =
  | 'project:read'
  | 'project:create'
  | 'project:update'
  | 'project:delete'
  | 'export:create'
  | 'brand:manage'
  | 'team:invite'
  | 'team:manage'
  | 'billing:manage'
  | 'admin:access'
  | 'admin:users'
  | 'admin:jobs'
  | 'admin:templates';

const WORKSPACE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  [WorkspaceRole.OWNER]: [
    'project:read',
    'project:create',
    'project:update',
    'project:delete',
    'export:create',
    'brand:manage',
    'team:invite',
    'team:manage',
    'billing:manage',
  ],
  [WorkspaceRole.ADMIN]: [
    'project:read',
    'project:create',
    'project:update',
    'project:delete',
    'export:create',
    'brand:manage',
    'team:invite',
  ],
  [WorkspaceRole.EDITOR]: [
    'project:read',
    'project:create',
    'project:update',
    'export:create',
  ],
  [WorkspaceRole.VIEWER]: [
    'project:read',
  ],
};

const SYSTEM_ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export function hasWorkspacePermission(role: WorkspaceRole, permission: Permission): boolean {
  const permissions = WORKSPACE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function isSystemAdmin(userRole: UserRole): boolean {
  return SYSTEM_ADMIN_ROLES.includes(userRole);
}

export function canAccessAdminPanel(userRole: UserRole): boolean {
  return isSystemAdmin(userRole);
}

