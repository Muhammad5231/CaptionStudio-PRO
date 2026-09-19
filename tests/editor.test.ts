import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { useEditorStore, EditorCaption } from '../apps/web/src/stores/editor-store';
import { CaptionStyleSchema, applyTemplate, PRODUCTION_TEMPLATES } from '../packages/captions/src/index';

describe('Editor State & Command Pattern (Undo/Redo)', () => {
  const initialCaptions: EditorCaption[] = [
    {
      id: 'cue-1',
      startTime: 1.0,
      endTime: 3.0,
      text: 'First caption sentence',
      words: [
        { id: 'w1', text: 'First', startTime: 1.0, endTime: 1.5 },
        { id: 'w2', text: 'caption', startTime: 1.6, endTime: 2.2 },
        { id: 'w3', text: 'sentence', startTime: 2.3, endTime: 3.0 },
      ],
    },
    {
      id: 'cue-2',
      startTime: 3.5,
      endTime: 5.5,
      text: 'Second caption sentence',
      words: [
        { id: 'w4', text: 'Second', startTime: 3.5, endTime: 4.2 },
        { id: 'w5', text: 'caption', startTime: 4.3, endTime: 4.8 },
        { id: 'w6', text: 'sentence', startTime: 4.9, endTime: 5.5 },
      ],
    },
  ];

  beforeEach(() => {
    useEditorStore.getState().initProject({
      projectId: 'test-proj-1',
      projectName: 'Test Project',
      videoUrl: 'http://localhost:4000/storage/test.mp4',
      videoDuration: 10,
      versionNumber: 1,
      captions: initialCaptions,
      style: CaptionStyleSchema.parse({}),
    });
  });

  it('should initialize project state correctly', () => {
    const state = useEditorStore.getState();
    assert.strictEqual(state.projectId, 'test-proj-1');
    assert.strictEqual(state.projectName, 'Test Project');
    assert.strictEqual(state.captions.length, 2);
    assert.strictEqual(state.canUndo, false);
    assert.strictEqual(state.canRedo, false);
    assert.strictEqual(state.autosaveStatus, 'saved');
  });

  it('should update caption text and record undo snapshot', () => {
    const store = useEditorStore.getState();
    store.updateCaptionText('cue-1', 'Updated first text');

    const updated = useEditorStore.getState();
    assert.strictEqual(updated.captions[0].text, 'Updated first text');
    assert.strictEqual(updated.canUndo, true);
    assert.strictEqual(updated.undoStack.length, 1);
    assert.strictEqual(updated.autosaveStatus, 'unsaved');

    // Perform Undo
    updated.undo();
    const afterUndo = useEditorStore.getState();
    assert.strictEqual(afterUndo.captions[0].text, 'First caption sentence');
    assert.strictEqual(afterUndo.canUndo, false);
    assert.strictEqual(afterUndo.canRedo, true);

    // Perform Redo
    afterUndo.redo();
    const afterRedo = useEditorStore.getState();
    assert.strictEqual(afterRedo.captions[0].text, 'Updated first text');
    assert.strictEqual(afterRedo.canUndo, true);
    assert.strictEqual(afterRedo.canRedo, false);
  });

  it('should update caption timing and maintain sort order', () => {
    const store = useEditorStore.getState();
    store.updateCaptionTiming('cue-1', 1.2, 3.2);

    const updated = useEditorStore.getState();
    assert.strictEqual(updated.captions[0].startTime, 1.2);
    assert.strictEqual(updated.captions[0].endTime, 3.2);
    assert.strictEqual(updated.canUndo, true);

    // Reject invalid timing (start >= end)
    store.updateCaptionTiming('cue-1', 4.0, 3.0);
    const unchanged = useEditorStore.getState();
    assert.strictEqual(unchanged.captions[0].startTime, 1.2);
  });

  it('should split caption into two distinct cue blocks with words partitioned', () => {
    const store = useEditorStore.getState();
    // Split cue-1 at 2.0s
    store.splitCaption('cue-1', 2.0);

    const updated = useEditorStore.getState();
    assert.strictEqual(updated.captions.length, 3);

    const partA = updated.captions[0];
    const partB = updated.captions[1];

    assert.strictEqual(partA.startTime, 1.0);
    assert.strictEqual(partA.endTime, 2.0);
    assert.strictEqual(partA.words.length, 2); // 'First' (1.0-1.5), 'caption' (1.6-2.2)

    assert.strictEqual(partB.startTime, 2.0);
    assert.strictEqual(partB.endTime, 3.0);
    assert.strictEqual(partB.words.length, 1); // 'sentence' (2.3-3.0)

    // Undo should restore original single cue
    updated.undo();
    const restored = useEditorStore.getState();
    assert.strictEqual(restored.captions.length, 2);
    assert.strictEqual(restored.captions[0].id, 'cue-1');
  });

  it('should merge caption with next caption', () => {
    const store = useEditorStore.getState();
    store.mergeCaptionWithNext('cue-1');

    const updated = useEditorStore.getState();
    assert.strictEqual(updated.captions.length, 1);

    const merged = updated.captions[0];
    assert.strictEqual(merged.id, 'cue-1');
    assert.strictEqual(merged.startTime, 1.0);
    assert.strictEqual(merged.endTime, 5.5);
    assert.strictEqual(merged.words.length, 6);
    assert.strictEqual(merged.text, 'First caption sentence Second caption sentence');

    // Undo should restore the two distinct cues
    updated.undo();
    const restored = useEditorStore.getState();
    assert.strictEqual(restored.captions.length, 2);
    assert.strictEqual(restored.captions[0].endTime, 3.0);
    assert.strictEqual(restored.captions[1].startTime, 3.5);
  });

  it('should delete caption and adjust selection', () => {
    const store = useEditorStore.getState();
    store.selectCaption('cue-1');
    store.deleteCaption('cue-1');

    const updated = useEditorStore.getState();
    assert.strictEqual(updated.captions.length, 1);
    assert.strictEqual(updated.captions[0].id, 'cue-2');
    assert.strictEqual(updated.selectedCaptionId, null);

    // Undo restores cue-1
    updated.undo();
    const restored = useEditorStore.getState();
    assert.strictEqual(restored.captions.length, 2);
    assert.strictEqual(restored.captions[0].id, 'cue-1');
  });

  it('should limit undo stack to maximum 50 snapshots', () => {
    const store = useEditorStore.getState();
    for (let i = 0; i < 60; i++) {
      store.updateCaptionText('cue-1', `Edit iteration ${i}`);
    }

    const state = useEditorStore.getState();
    assert.ok(state.undoStack.length <= 50, `Undo stack was ${state.undoStack.length}, expected <= 50`);
  });

  it('should apply template styles and preserve user layout customization when using applyTemplate', () => {
    const store = useEditorStore.getState();
    const viralTemplate = PRODUCTION_TEMPLATES.find((t) => t.slug === 'viral-pop');
    assert.ok(viralTemplate, 'viral-pop template must exist');

    const updatedStyle = applyTemplate(viralTemplate.id);
    store.setStyle(updatedStyle);

    const current = useEditorStore.getState();
    assert.strictEqual(current.style.typography.fontFamily, 'Montserrat');
    assert.strictEqual(current.style.wordHighlight.enabled, true);
    assert.strictEqual(current.style.wordHighlight.color, '#FACC15');
    assert.strictEqual(current.canUndo, true);

    // Undo restores initial default style
    current.undo();
    const afterUndo = useEditorStore.getState();
    assert.strictEqual(afterUndo.style.typography.fontFamily, 'Inter');
  });
});
