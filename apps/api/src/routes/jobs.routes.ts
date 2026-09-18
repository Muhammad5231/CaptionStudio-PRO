import { Router } from 'express';
import { JobStatus, JobType } from '@captionstudio/types';
import { requireAuth } from '../middlewares/auth.middleware';

export const jobsRouter = Router();

jobsRouter.get('/:id', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      type: JobType.TRANSCRIPTION,
      status: JobStatus.COMPLETED,
      progress: 100,
      stage: 'Finished generating word-level timestamps',
      startedAt: new Date(Date.now() - 30000).toISOString(),
      completedAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
});

