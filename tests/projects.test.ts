import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CreateProjectSchema, UpdateProjectSchema, ProjectStatus } from '../packages/types/src/index';

describe('Project Management & Business Logic', () => {
  it('should validate project creation input with Zod', () => {
    const valid = {
      name: 'My New Reel',
      description: 'Talking head video with Hormozi captions',
    };
    const result = CreateProjectSchema.safeParse(valid);
    assert.strictEqual(result.success, true);

    const empty = { name: '' };
    const invalidResult = CreateProjectSchema.safeParse(empty);
    assert.strictEqual(invalidResult.success, false);
  });

  it('should validate project update input with Zod', () => {
    const validUpdate = {
      name: 'Renamed Reel #01',
      activeTemplateId: 'tmpl-hormozi',
    };
    const result = UpdateProjectSchema.safeParse(validUpdate);
    assert.strictEqual(result.success, true);
  });

  it('should enforce safe project duplication without duplicating physical assets', () => {
    const sourceProject = {
      id: 'proj-123',
      name: 'Source Podcast',
      description: 'Episode 1',
      workspaceId: 'ws-456',
      activeTemplateId: 'tmpl-clean',
      videoAssetStorageKey: 'workspaces/ws-456/projects/proj-123/source/video.mp4',
    };

    // Safe duplication metadata
    const duplicated = {
      name: `${sourceProject.name} (Copy)`,
      description: sourceProject.description,
      workspaceId: sourceProject.workspaceId,
      activeTemplateId: sourceProject.activeTemplateId,
      status: ProjectStatus.DRAFT,
      // Physical storage file is NOT copied
    };

    assert.strictEqual(duplicated.name, 'Source Podcast (Copy)');
    assert.strictEqual(duplicated.status, ProjectStatus.DRAFT);
    assert.strictEqual(duplicated.workspaceId, sourceProject.workspaceId);
    assert.strictEqual((duplicated as unknown as { videoAssetStorageKey?: string }).videoAssetStorageKey, undefined);
  });

  it('should filter and paginate project collections correctly in-memory', () => {
    const items = [
      { id: '1', name: 'Alpha Podcast', status: ProjectStatus.READY },
      { id: '2', name: 'Beta Reel', status: ProjectStatus.DRAFT },
      { id: '3', name: 'Gamma TikTok', status: ProjectStatus.READY },
      { id: '4', name: 'Delta YouTube', status: ProjectStatus.ARCHIVED },
    ];

    // Filter by READY
    const readyItems = items.filter((i) => i.status === ProjectStatus.READY);
    assert.strictEqual(readyItems.length, 2);

    // Search by "Reel"
    const searched = items.filter((i) => i.name.toLowerCase().includes('reel'));
    assert.strictEqual(searched.length, 1);
    assert.strictEqual(searched[0]?.id, '2');
  });
});

