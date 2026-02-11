import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { rewardsRouter } from './routes/rewards';
import { logger } from './utils/logger';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || '*' }));
  app.use(express.json());
  app.use(
    rateLimit({
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
      max: Number(process.env.RATE_LIMIT_MAX) || 100,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'rewards', timestamp: new Date().toISOString() });
  });

  app.use('/rewards', authMiddleware, rewardsRouter);

  app.use(errorHandler);

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3003;
  const app = createApp();
  app.listen(port, () => logger.info(`Rewards service listening on port ${port}`));
}
