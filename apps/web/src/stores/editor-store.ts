import { create } from 'zustand';
import { CaptionStyleTyped, CaptionStyleSchema } from '@captionstudio/captions';

export interface EditorWord {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

export interface EditorCaption {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  words: EditorWord[];
}

export interface EditorHistorySnapshot {
  captions: EditorCaption[];
  style: CaptionStyleTyped;
  description: string;
}

export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';
export type AutosaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

interface EditorState {
  // Project & Version
  projectId: string | null;
  projectName: string;
  videoUrl: string | null;
  videoDuration: number;
  versionNumber: number;

  // Playback
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;

  // Timeline
  zoom: number; // pixels per second (e.g. 50px/s)
  scrollLeft: number;
  aspectRatio: AspectRatio;
  showSafeAreas: boolean;

  // Captions & Selection
  captions: EditorCaption[];
  selectedCaptionId: string | null;
  selectedWordId: string | null;

  // Style
  style: CaptionStyleTyped;

  // History (Undo / Redo)
  undoStack: EditorHistorySnapshot[];
  redoStack: EditorHistorySnapshot[];

  // Autosave
  autosaveStatus: AutosaveStatus;
  lastSavedAt: Date | null;
  errorMessage: string | null;

  // Actions
  initProject: (data: {
    projectId: string;
    projectName: string;
    videoUrl: string | null;
    videoDuration: number;
    versionNumber: number;
    captions: EditorCaption[];
    style?: CaptionStyleTyped;
  }) => void;

  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;

  setZoom: (zoom: number) => void;
  setScrollLeft: (scrollLeft: number) => void;
  setAspectRatio: (aspectRatio: AspectRatio) => void;
  setShowSafeAreas: (show: boolean) => void;

  selectCaption: (id: string | null) => void;
  selectWord: (id: string | null) => void;

  // Caption Operations (Push to Undo stack)
  updateCaptionText: (id: string, newText: string) => void;
  updateCaptionTiming: (id: string, startTime: number, endTime: number) => void;
  splitCaption: (id: string, splitAtTime?: number) => void;
  mergeCaptionWithNext: (id: string) => void;
  deleteCaption: (id: string) => void;
  addCaptionAtPlayhead: () => void;

  // Style Operations
  setStyle: (style: CaptionStyleTyped) => void;
  updateStyleField: <K extends keyof CaptionStyleTyped>(field: K, value: CaptionStyleTyped[K]) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Autosave status
  setAutosaveStatus: (status: AutosaveStatus, error?: string) => void;
  markSaved: (newVersionNumber: number) => void;
}

const defaultStyle: CaptionStyleTyped = CaptionStyleSchema.parse({});

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  projectName: '',
  videoUrl: null,
  videoDuration: 0,
  versionNumber: 1,

  currentTime: 0,
  isPlaying: false,
  playbackRate: 1,
  volume: 1,
  isMuted: false,

  zoom: 60, // 60px/s default
  scrollLeft: 0,
  aspectRatio: '9:16',
  showSafeAreas: true,

  captions: [],
  selectedCaptionId: null,
  selectedWordId: null,

  style: defaultStyle,

  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  autosaveStatus: 'idle',
  lastSavedAt: null,
  errorMessage: null,

  initProject: (data) => {
    set({
      projectId: data.projectId,
      projectName: data.projectName,
      videoUrl: data.videoUrl,
      videoDuration: data.videoDuration || 0,
      versionNumber: data.versionNumber || 1,
      captions: data.captions,
      style: data.style || defaultStyle,
      undoStack: [],
      redoStack: [],
      canUndo: false,
      canRedo: false,
      autosaveStatus: 'saved',
      lastSavedAt: new Date(),
    });
  },

  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setVolume: (volume) => set({ volume }),
  setIsMuted: (isMuted) => set({ isMuted }),

  setZoom: (zoom) => set({ zoom: Math.max(20, Math.min(200, zoom)) }),
  setScrollLeft: (scrollLeft) => set({ scrollLeft }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setShowSafeAreas: (showSafeAreas) => set({ showSafeAreas }),

  selectCaption: (id) => set({ selectedCaptionId: id, selectedWordId: null }),
  selectWord: (id) => set({ selectedWordId: id }),

  // Push current state to undo stack before executing mutation
  updateCaptionText: (id, newText) => {
    const { captions, style, undoStack } = get();
    const snapshot: EditorHistorySnapshot = {
      captions: JSON.parse(JSON.stringify(captions)),
      style: JSON.parse(JSON.stringify(style)),
      description: 'Edit caption text',
    };

    const updated = captions.map((c) => {
      if (c.id !== id) return c;
      return {
        ...c,
        text: newText,
      };
    });

    set({
      captions: updated,
      undoStack: [snapshot, ...undoStack.slice(0, 49)],
      redoStack: [],
      canUndo: true,
      canRedo: false,
      autosaveStatus: 'unsaved',
    });
  },

  updateCaptionTiming: (id, startTime, endTime) => {
    const { captions, style, undoStack } = get();
    if (startTime >= endTime || startTime < 0) return;

    const snapshot: EditorHistorySnapshot = {
      captions: JSON.parse(JSON.stringify(captions)),
      style: JSON.parse(JSON.stringify(style)),
      description: 'Adjust caption timing',
    };

    const updated = captions
      .map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          startTime: Math.round(startTime * 100) / 100,
          endTime: Math.round(endTime * 100) / 100,
        };
      })
      .sort((a, b) => a.startTime - b.startTime);

    set({
      captions: updated,
      undoStack: [snapshot, ...undoStack.slice(0, 49)],
      redoStack: [],
      canUndo: true,
      canRedo: false,
      autosaveStatus: 'unsaved',
    });
  },

  splitCaption: (id, splitAtTime) => {
    const { captions, currentTime, style, undoStack } = get();
    const target = captions.find((c) => c.id === id);
    if (!target) return;

    const splitTime =
      splitAtTime !== undefined
        ? splitAtTime
        : currentTime > target.startTime && currentTime < target.endTime
        ? currentTime
        : (target.startTime + target.endTime) / 2;

    if (splitTime <= target.startTime + 0.2 || splitTime >= target.endTime - 0.2) {
      return; // Cannot split too close to edges
    }

    const snapshot: EditorHistorySnapshot = {
      captions: JSON.parse(JSON.stringify(captions)),
      style: JSON.parse(JSON.stringify(style)),
      description: 'Split caption cue',
    };

    // Split words
    const wordsFirst = target.words.filter((w) => w.startTime < splitTime);
    const wordsSecond = target.words.filter((w) => w.startTime >= splitTime);

    const textFirst = wordsFirst.length > 0 ? wordsFirst.map((w) => w.text).join(' ') : target.text.slice(0, Math.floor(target.text.length / 2)).trim();
    const textSecond = wordsSecond.length > 0 ? wordsSecond.map((w) => w.text).join(' ') : target.text.slice(Math.floor(target.text.length / 2)).trim();

    const cue1: EditorCaption = {
      id: `${target.id}_a`,
      startTime: target.startTime,
      endTime: splitTime,
      text: textFirst,
      words: wordsFirst,
    };

    const cue2: EditorCaption = {
      id: `${target.id}_b`,
      startTime: splitTime,
      endTime: target.endTime,
      text: textSecond,
      words: wordsSecond,
    };

    const updated: EditorCaption[] = [];
    for (const c of captions) {
      if (c.id === id) {
        updated.push(cue1, cue2);
      } else {
        updated.push(c);
      }
    }

    set({
      captions: updated,
      selectedCaptionId: cue2.id,
      undoStack: [snapshot, ...undoStack.slice(0, 49)],
      redoStack: [],
      canUndo: true,
      canRedo: false,
      autosaveStatus: 'unsaved',
    });
  },

  mergeCaptionWithNext: (id) => {
    const { captions, style, undoStack } = get();
    const idx = captions.findIndex((c) => c.id === id);
    if (idx === -1 || idx >= captions.length - 1) return;

    const current = captions[idx];
    const next = captions[idx + 1];

    const snapshot: EditorHistorySnapshot = {
      captions: JSON.parse(JSON.stringify(captions)),
      style: JSON.parse(JSON.stringify(style)),
      description: 'Merge captions',
    };

    const merged: EditorCaption = {
      id: current.id,
      startTime: current.startTime,
      endTime: next.endTime,
      text: `${current.text.trim()} ${next.text.trim()}`,
      words: [...current.words, ...next.words].sort((a, b) => a.startTime - b.startTime),
    };

    const updated = captions.filter((_, i) => i !== idx && i !== idx + 1);
    updated.splice(idx, 0, merged);

    set({
      captions: updated,
      selectedCaptionId: merged.id,
      undoStack: [snapshot, ...undoStack.slice(0, 49)],
      redoStack: [],
      canUndo: true,
      canRedo: false,
      autosaveStatus: 'unsaved',
    });
  },

  deleteCaption: (id) => {
    const { captions, style, undoStack } = get();
    const snapshot: EditorHistorySnapshot = {
      captions: JSON.parse(JSON.stringify(captions)),
      style: JSON.parse(JSON.stringify(style)),
      description: 'Delete caption cue',
    };

    set({
      captions: captions.filter((c) => c.id !== id),
      selectedCaptionId: null,
      undoStack: [snapshot, ...undoStack.slice(0, 49)],
      redoStack: [],
      canUndo: true,
      canRedo: false,
      autosaveStatus: 'unsaved',
    });
  },

  addCaptionAtPlayhead: () => {
    const { captions, currentTime, videoDuration, style, undoStack } = get();
    const snapshot: EditorHistorySnapshot = {
      captions: JSON.parse(JSON.stringify(captions)),
      style: JSON.parse(JSON.stringify(style)),
      description: 'Add new caption cue',
    };

    const startTime = Math.round(currentTime * 10) / 10;
    const endTime = Math.min(videoDuration || startTime + 2, startTime + 2);

    const newCue: EditorCaption = {
      id: `cue_${Date.now()}`,
      startTime,
      endTime,
      text: 'New Caption',
      words: [{ id: `w_${Date.now()}`, text: 'New', startTime, endTime: startTime + 1 }],
    };

    const updated = [...captions, newCue].sort((a, b) => a.startTime - b.startTime);

    set({
      captions: updated,
      selectedCaptionId: newCue.id,
      undoStack: [snapshot, ...undoStack.slice(0, 49)],
      redoStack: [],
      canUndo: true,
      canRedo: false,
      autosaveStatus: 'unsaved',
    });
  },

  setStyle: (newStyle) => {
    const { captions, style, undoStack } = get();
    const snapshot: EditorHistorySnapshot = {
      captions: JSON.parse(JSON.stringify(captions)),
      style: JSON.parse(JSON.stringify(style)),
      description: 'Change caption style',
    };

    set({
      style: newStyle,
      undoStack: [snapshot, ...undoStack.slice(0, 49)],
      redoStack: [],
      canUndo: true,
      canRedo: false,
      autosaveStatus: 'unsaved',
    });
  },

  updateStyleField: (field, value) => {
    const { style } = get();
    const updated = {
      ...style,
      [field]: value,
    };
    set({
      style: updated,
      autosaveStatus: 'unsaved',
    });
  },

  undo: () => {
    const { undoStack, redoStack, captions, style } = get();
    if (undoStack.length === 0) return;

    const [previous, ...remainingUndo] = undoStack;
    const currentSnapshot: EditorHistorySnapshot = {
      captions: JSON.parse(JSON.stringify(captions)),
      style: JSON.parse(JSON.stringify(style)),
      description: 'Undo step',
    };

    set({
      captions: previous.captions,
      style: previous.style,
      undoStack: remainingUndo,
      redoStack: [currentSnapshot, ...redoStack],
      canUndo: remainingUndo.length > 0,
      canRedo: true,
      autosaveStatus: 'unsaved',
    });
  },

  redo: () => {
    const { undoStack, redoStack, captions, style } = get();
    if (redoStack.length === 0) return;

    const [next, ...remainingRedo] = redoStack;
    const currentSnapshot: EditorHistorySnapshot = {
      captions: JSON.parse(JSON.stringify(captions)),
      style: JSON.parse(JSON.stringify(style)),
      description: 'Redo step',
    };

    set({
      captions: next.captions,
      style: next.style,
      undoStack: [currentSnapshot, ...undoStack],
      redoStack: remainingRedo,
      canUndo: true,
      canRedo: remainingRedo.length > 0,
      autosaveStatus: 'unsaved',
    });
  },

  setAutosaveStatus: (autosaveStatus, errorMessage) => {
    set({ autosaveStatus, errorMessage: errorMessage || null });
  },

  markSaved: (newVersionNumber) => {
    set({
      versionNumber: newVersionNumber,
      autosaveStatus: 'saved',
      lastSavedAt: new Date(),
      errorMessage: null,
    });
  },
}));

