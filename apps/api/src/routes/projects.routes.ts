import { Router } from 'express';
import { CreateProjectSchema, UpdateProjectSchema, ProjectStatus } from '@captionstudio/types';
import { requireAuth } from '../middlewares/auth.middleware';

export const projectsRouter = Router();

// Demo data for Phase 1
let mockProjects = [
  {
    id: 'proj-1',
    workspaceId: 'demo-workspace-1',
    name: 'The 3 Keys to Bootstrapping a SaaS to $100K MRR',
    description: 'Vertical 9:16 talking-head reel with Hormozi kinetic green subtitles.',
    status: ProjectStatus.READY,
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop',
    durationSeconds: 58.4,
    width: 1080,
    height: 1920,
    fps: 30,
    activeTemplateId: 'hormozi-emerald',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    workspaceId: 'demo-workspace-1',
    name: 'AI Automation Masterclass Ep. 04 — Agentic Workflows',
    description: 'Long-form YouTube video with chapterized subtitles and keyword highlights.',
    status: ProjectStatus.EXPORTED,
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=340&fit=crop',
    durationSeconds: 420.2,
    width: 1920,
    height: 1080,
    fps: 60,
    activeTemplateId: 'nordic-clean',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    workspaceId: 'demo-workspace-1',
    name: 'Quick Teaser: Product Hunt Launch Day Announcement',
    description: 'Punchy 15s teaser with Beast Kinetic typography.',
    status: ProjectStatus.DRAFT,
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=340&fit=crop',
    durationSeconds: 15.0,
    width: 1080,
    height: 1920,
    fps: 30,
    activeTemplateId: 'beast-yellow',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

projectsRouter.get('/', requireAuth, (req, res) => {
  const { status, search } = req.query;
  let filtered = [...mockProjects];

  if (status && typeof status === 'string') {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
  }

  res.json({
    success: true,
    data: filtered,
    timestamp: new Date().toISOString(),
  });
});

projectsRouter.post('/', requireAuth, (req, res, next) => {
  try {
    const data = CreateProjectSchema.parse(req.body);
    const newProject = {
      id: `proj-${Date.now()}`,
      workspaceId: req.user?.workspaceId || 'demo-workspace-1',
      name: data.name,
      description: data.description || '',
      status: ProjectStatus.DRAFT,
      thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=340&fit=crop',
      durationSeconds: 0,
      width: 1080,
      height: 1920,
      fps: 30,
      activeTemplateId: data.templateId || 'beast-yellow',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProjects.unshift(newProject);

    res.status(201).json({
      success: true,
      data: newProject,
      message: 'Project initialized successfully.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

projectsRouter.get('/:id', requireAuth, (req, res) => {
  const project = mockProjects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'PROJECT_NOT_FOUND',
        message: `Project with ID ${req.params.id} was not found.`,
        statusCode: 404,
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    data: project,
    timestamp: new Date().toISOString(),
  });
});

projectsRouter.patch('/:id', requireAuth, (req, res, next) => {
  try {
    const data = UpdateProjectSchema.parse(req.body);
    const project = mockProjects.find((p) => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found', statusCode: 404 },
        timestamp: new Date().toISOString(),
      });
    }

    Object.assign(project, data, { updatedAt: new Date().toISOString() });

    res.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

projectsRouter.delete('/:id', requireAuth, (req, res) => {
  mockProjects = mockProjects.filter((p) => p.id !== req.params.id);
  res.json({
    success: true,
    data: { id: req.params.id, deleted: true },
    timestamp: new Date().toISOString(),
  });
});

// Transcribe endpoint shell
projectsRouter.post('/:id/transcribe', requireAuth, (req, res) => {
  res.status(202).json({
    success: true,
    data: {
      jobId: `job-transcribe-${Date.now()}`,
      status: 'PENDING',
      message: 'Whisper transcription task queued.',
    },
    timestamp: new Date().toISOString(),
  });
});

// Export endpoint shell
projectsRouter.post('/:id/export', requireAuth, (req, res) => {
  res.status(202).json({
    success: true,
    data: {
      jobId: `job-export-${Date.now()}`,
      status: 'PENDING',
      message: 'Video rendering and subtitle burn task queued.',
    },
    timestamp: new Date().toISOString(),
  });
});

