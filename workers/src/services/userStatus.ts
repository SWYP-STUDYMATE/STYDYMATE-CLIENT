import type { Env } from '../index';

export type PresenceStatus = 'ONLINE' | 'OFFLINE' | 'AWAY' | 'STUDYING';

export interface PresenceUpdateOptions {
  sessionId?: string;
  deviceInfo?: string;
  metadata?: Record<string, unknown>;
}

function isoNow(): string {
  return new Date().toISOString();
}

export async function updateUserStatus(
  env: Env,
  userId: string,
  status: PresenceStatus,
  options: PresenceUpdateOptions = {}
): Promise<void> {
  const payload = {
    userId,
    status,
    sessionId: options.sessionId ?? null,
    deviceInfo: options.deviceInfo ?? null,
    metadata: options.metadata ?? null,
    updatedAt: isoNow()
  };

  const result: any = await env.DB.prepare(
    `UPDATE user_status
       SET status = ?,
           current_session_id = ?,
           device_info = ?,
           last_seen_at = ?,
           updated_at = ?
     WHERE user_id = ?`
  )
    .bind(status, options.sessionId ?? null, options.deviceInfo ?? null, payload.updatedAt, payload.updatedAt, userId)
    .run();

  if (result.changes === 0) {
    await env.DB.prepare(
      `INSERT INTO user_status (
          user_id,
          status,
          last_seen_at,
          device_info,
          current_session_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        userId,
        status,
        payload.updatedAt,
        options.deviceInfo ?? null,
        options.sessionId ?? null,
        payload.updatedAt,
        payload.updatedAt
      )
      .run();
  }
}

export async function touchUserStatus(env: Env, userId: string): Promise<void> {
  const now = isoNow();
  const result: any = await env.DB.prepare(
    `UPDATE user_status
       SET last_seen_at = ?,
           updated_at = ?
     WHERE user_id = ?`
  )
    .bind(now, now, userId)
    .run();

  if (result.changes === 0) {
    await env.DB.prepare(
      `INSERT INTO user_status (
          user_id,
          status,
          last_seen_at,
          device_info,
          current_session_id,
          created_at,
          updated_at
        ) VALUES (?, 'OFFLINE', ?, NULL, NULL, ?, ?)`
    )
      .bind(userId, now, now, now)
      .run();
  }
}

export async function setInactiveUsersOffline(env: Env, cutoffMinutes: number): Promise<number> {
  const now = isoNow();
  const cutoffDate = new Date(Date.now() - cutoffMinutes * 60 * 1000).toISOString();
  const result: any = await env.DB.prepare(
    `UPDATE user_status
        SET status = 'OFFLINE',
            current_session_id = NULL,
            updated_at = ?,
            device_info = device_info
      WHERE status != 'OFFLINE'
        AND last_seen_at IS NOT NULL
        AND last_seen_at < ?`
  )
    .bind(now, cutoffDate)
    .run();
  return result.changes ?? 0;
}
