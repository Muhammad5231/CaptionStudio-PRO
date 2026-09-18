export const QUEUE_NAMES = {
  TRANSCRIPTION: 'captionstudio-transcription',
  MEDIA_ANALYSIS: 'captionstudio-media-analysis',
  THUMBNAIL: 'captionstudio-thumbnail',
  RENDER: 'captionstudio-render',
  EXPORT: 'captionstudio-export',
} as const;

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 3000,
  },
  removeOnComplete: {
    age: 3600 * 24, // keep completed jobs for 24h
    count: 1000,
  },
  removeOnFail: {
    age: 3600 * 24 * 7, // keep failed jobs for 7 days
  },
};

