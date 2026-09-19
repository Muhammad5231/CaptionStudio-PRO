/**
 * Render Scene Graph & Video Rendering Contract
 * Renderer-independent representation that Phase 6 FFmpeg rendering cluster consumes.
 */

export interface RenderSceneWord {
  id: string;
  text: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface RenderSceneCaption {
  id: string;
  start: number;
  end: number;
  text: string;
  words: RenderSceneWord[];
  styleId?: string;
  styleConfig?: Record<string, unknown>;
  animationConfig?: Record<string, unknown>;
  position?: {
    x: number;
    y: number;
    anchor: 'top' | 'center' | 'bottom';
  };
}

export interface RenderSceneGraph {
  canvas: {
    width: number;
    height: number;
    fps: number;
    duration: number;
    aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5';
  };
  mediaSource: {
    storageKey: string;
    url?: string;
    duration: number;
  };
  captionTracks: RenderSceneCaption[];
  metadata?: {
    projectId: string;
    versionNumber: number;
    activeTemplateId?: string;
    exportedAt?: string;
  };
}

