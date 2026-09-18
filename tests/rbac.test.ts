import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hasWorkspacePermission, isSystemAdmin, canAccessAdminPanel } from '../packages/auth/src/index';
import { WorkspaceRole, UserRole } from '../packages/types/src/index';

describe('RBAC & Security Authorization', () => {
  it('should verify workspace role permissions correctly', () => {
    assert.strictEqual(hasWorkspacePermission(WorkspaceRole.OWNER, 'billing:manage'), true);
    assert.strictEqual(hasWorkspacePermission(WorkspaceRole.ADMIN, 'project:delete'), true);
    assert.strictEqual(hasWorkspacePermission(WorkspaceRole.EDITOR, 'project:update'), true);

    // Viewers cannot update or delete projects
    assert.strictEqual(hasWorkspacePermission(WorkspaceRole.VIEWER, 'project:update'), false);
    assert.strictEqual(hasWorkspacePermission(WorkspaceRole.VIEWER, 'project:delete'), false);
    assert.strictEqual(hasWorkspacePermission(WorkspaceRole.EDITOR, 'billing:manage'), false);
  });

  it('should enforce system admin panel authorization strictly', () => {
    assert.strictEqual(isSystemAdmin(UserRole.ADMIN), true);
    assert.strictEqual(isSystemAdmin(UserRole.SUPER_ADMIN), true);
    assert.strictEqual(isSystemAdmin(UserRole.CREATOR), false);
    assert.strictEqual(isSystemAdmin(UserRole.USER), false);

    assert.strictEqual(canAccessAdminPanel(UserRole.ADMIN), true);
    assert.strictEqual(canAccessAdminPanel(UserRole.USER), false);
  });
});

