import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';

/**
 * Partner context middleware.
 * Derives partner_id from X-Api-Key header against partner_api_keys table.
 * Never trusts client-sent partner_id.
 */
export function partnerContextMiddleware(pool: Pool) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const apiKey = req.headers['x-api-key'] as string | undefined;

    if (apiKey) {
      try {
        const crypto = await import('crypto');
        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
        const result = await pool.query(
          `SELECT p.id AS partner_id FROM partner_api_keys pak
           JOIN partners p ON p.id = pak.partner_id
           WHERE pak.key_hash = $1 AND pak.revoked_at IS NULL
           AND (pak.expires_at IS NULL OR pak.expires_at > NOW())
           AND p.status = 'active' AND p.deleted_at IS NULL`,
          [keyHash],
        );
        if (result.rows.length > 0) {
          req.partnerId = result.rows[0].partner_id;
          // Update last_used_at
          await pool.query(
            'UPDATE partner_api_keys SET last_used_at = NOW() WHERE key_hash = $1',
            [keyHash],
          );
        }
      } catch {
        // Silently continue without partner context
      }
    }

    next();
  };
}
