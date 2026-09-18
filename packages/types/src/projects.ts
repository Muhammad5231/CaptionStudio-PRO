import { z } from 'zod';
import { CaptionTrack } from './captions';

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  TRANSCRIBING = 'TRANSCRIBING',
  READY = 'READY',
  PROCESSING = 'PROCESSING',
  EXPORTED = 'EXPORTED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

export enum AssetType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  SUBTITLE = 'SUBTITLE',
  THUMBNAIL = 'THUMBNAIL',
  RENDERED_VIDEO = 'RENDERED_VIDEO',
  CUSTOM_FONT = 'CUSTOM_FONT',
}

export interface ProjectAssetDto {
  id: string;
  projectId: string;
  type: AssetType;
  storageKey: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number;
  width?: number;
  height?: number;
  fps?: number;
  createdAt: Date;
}

export interface ProjectDto {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  width?: number | null;
  height?: number | null;
  fps?: number | null;
  activeTemplateId?: string | null;
  primaryAssetId?: string | null;
  tracks?: CaptionTrack[];
  createdAt: Date;
  updatedAt: Date;
}

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(120),
  description: z.string().max(500).optional(),
  templateId: z.string().optional(),
  language: z.string().default('en'),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  activeTemplateId: z.string().nullable().optional(),
});

export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;

