import { Pool } from 'pg';

export interface DeviceInfo {
  deviceId?: string;
  platform?: string;
  appVersion?: string;
}

export async function trackDevice(pool: Pool, userId: string, info: DeviceInfo): Promise<void> {
  if (!info.deviceId) return;

  await pool.query(
    `INSERT INTO devices (user_id, device_uuid, platform, app_version, last_active_at, is_active_session)
     VALUES ($1, $2, $3, $4, NOW(), true)
     ON CONFLICT (user_id, device_uuid)
     DO UPDATE SET last_active_at = NOW(), app_version = COALESCE($4, devices.app_version), is_active_session = true`,
    [userId, info.deviceId, info.platform ?? 'web', info.appVersion],
  );
}
