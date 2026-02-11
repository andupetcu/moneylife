import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createRoutes } from './routes.js';
import { Pool } from 'pg';

export function createApp(pool?: Pool): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') ?? '*' }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'auth', timestamp: new Date().toISOString() });
  });

  const dbPool = pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
  app.use('/', createRoutes(dbPool));

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error('Unhandled error:', err.message);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
    },
  );

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const port = parseInt(process.env.PORT ?? '3001', 10);
  const app = createApp();
  app.listen(port, () => {
    console.warn(`Auth service listening on port ${port}`);
  });
}
