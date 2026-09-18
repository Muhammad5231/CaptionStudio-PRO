import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';

export const exportsRouter = Router();

const mockExports = [
  {
    id: 'exp-1',
    projectId: 'proj-2',
    projectName: 'AI Automation Masterclass Ep. 04',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop',
    format: 'mp4',
    resolution: '1080p',
    fps: 60,
    sizeBytes: 124500000,
    durationSeconds: 420.2,
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

exportsRouter.get('/', requireAuth, (_req, res) => {
  res.json({
    success: true,
    data: mockExports,
    timestamp: new Date().toISOString(),
  });
});

