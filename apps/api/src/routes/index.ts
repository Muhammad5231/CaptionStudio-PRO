import { Router } from 'express';
import { authRouter } from './auth.routes';
import { projectsRouter } from './projects.routes';
import { templatesRouter } from './templates.routes';
import { jobsRouter } from './jobs.routes';
import { exportsRouter } from './exports.routes';
import { usageRouter } from './usage.routes';
import { billingRouter } from './billing.routes';
import { adminRouter } from './admin.routes';

export const apiV1Router = Router();

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/projects', projectsRouter);
apiV1Router.use('/templates', templatesRouter);
apiV1Router.use('/jobs', jobsRouter);
apiV1Router.use('/exports', exportsRouter);
apiV1Router.use('/usage', usageRouter);
apiV1Router.use('/billing', billingRouter);
apiV1Router.use('/admin', adminRouter);

apiV1Router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

