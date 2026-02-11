import { Router } from 'express';
import { Pool } from 'pg';
import { registerController } from './controllers/register.js';
import { loginController } from './controllers/login.js';
import { refreshController } from './controllers/refresh.js';
import { logoutController } from './controllers/logout.js';
import { socialAuthController } from './controllers/social-auth.js';
import { forgotPasswordController } from './controllers/forgot-password.js';
import { resetPasswordController } from './controllers/reset-password.js';
import { meController } from './controllers/me.js';
import { authMiddleware } from './middleware/auth.js';
import { createRateLimiter } from './middleware/rate-limit.js';
import { partnerContextMiddleware } from './middleware/partner-context.js';

export function createRoutes(pool: Pool): Router {
  const router = Router();

  // Apply partner context to all routes
  router.use(partnerContextMiddleware(pool));

  // Public routes with rate limiting
  router.post('/register', createRateLimiter(3, 60000), registerController(pool));
  router.post('/login', createRateLimiter(5, 60000), loginController(pool));
  router.post('/refresh', createRateLimiter(10, 60000), refreshController(pool));
  router.post('/social-auth', createRateLimiter(5, 60000), socialAuthController(pool));
  router.post('/forgot-password', createRateLimiter(3, 60000), forgotPasswordController(pool));
  router.post('/reset-password', createRateLimiter(5, 60000), resetPasswordController(pool));

  // Protected routes
  router.post('/logout', authMiddleware(), logoutController(pool));
  router.get('/me', authMiddleware(), meController(pool));

  return router;
}
