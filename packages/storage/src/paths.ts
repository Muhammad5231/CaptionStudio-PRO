/**
 * Canonical S3 / Storage Object Key Path Generators
 * Never hardcode raw string paths across application logic
 */
export const StoragePaths = {
  userAvatar(userId: string, extension: string): string {
    return `users/${userId}/avatar.${extension}`;
  },
  projectSourceVideo(projectId: string, filename: string): string {
    return `projects/${projectId}/source/${filename}`;
  },
  projectVideoAsset(workspaceId: string, projectId: string, fileId: string, extension: string): string {
    return `workspaces/${workspaceId}/projects/${projectId}/source/${fileId}.${extension}`;
  },
  projectSubtitleAsset(workspaceId: string, projectId: string, fileId: string, extension: string): string {
    return `workspaces/${workspaceId}/projects/${projectId}/subtitles/${fileId}.${extension}`;
  },
  projectAudio(projectId: string, filename = 'audio_16k.wav'): string {
    return `projects/${projectId}/audio/${filename}`;
  },
  projectCaptionTrack(projectId: string, trackId: string, format: string): string {
    return `projects/${projectId}/captions/${trackId}.${format}`;
  },
  projectThumbnail(projectId: string, filename = 'thumb.webp'): string {
    return `projects/${projectId}/previews/${filename}`;
  },
  projectExport(projectId: string, exportId: string, format = 'mp4'): string {
    return `projects/${projectId}/exports/${exportId}.${format}`;
  },
  brandLogo(workspaceId: string, extension: string): string {
    return `workspaces/${workspaceId}/brand/logo.${extension}`;
  },
};

