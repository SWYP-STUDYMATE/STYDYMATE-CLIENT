-- 0005_notifications.sql
-- Notification domain tables

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  action_url TEXT,
  action_data TEXT,
  image_url TEXT,
  icon_url TEXT,
  status TEXT NOT NULL DEFAULT 'UNREAD',
  priority INTEGER NOT NULL DEFAULT 1,
  category TEXT,
  scheduled_at TEXT,
  sent_at TEXT,
  read_at TEXT,
  expires_at TEXT,
  is_persistent INTEGER NOT NULL DEFAULT 1,
  sender_user_id TEXT,
  template_id TEXT,
  template_variables TEXT,
  delivery_channels TEXT,
  push_sent INTEGER NOT NULL DEFAULT 0,
  email_sent INTEGER NOT NULL DEFAULT 0,
  sms_sent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS notification_preferences (
  preference_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  push_enabled INTEGER NOT NULL DEFAULT 1,
  email_enabled INTEGER NOT NULL DEFAULT 1,
  sms_enabled INTEGER NOT NULL DEFAULT 0,
  session_notifications INTEGER NOT NULL DEFAULT 1,
  session_reminders INTEGER NOT NULL DEFAULT 1,
  matching_notifications INTEGER NOT NULL DEFAULT 1,
  chat_notifications INTEGER NOT NULL DEFAULT 1,
  level_test_notifications INTEGER NOT NULL DEFAULT 1,
  system_notifications INTEGER NOT NULL DEFAULT 1,
  marketing_notifications INTEGER NOT NULL DEFAULT 0,
  quiet_hours_enabled INTEGER NOT NULL DEFAULT 0,
  quiet_hours_start TEXT,
  quiet_hours_end TEXT,
  timezone TEXT,
  notification_language TEXT DEFAULT 'ko',
  digest_enabled INTEGER NOT NULL DEFAULT 0,
  digest_frequency TEXT DEFAULT 'DAILY',
  digest_time TEXT DEFAULT '09:00',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT fk_notification_preferences_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_push_tokens (
  token_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  device_type TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT fk_notification_push_tokens_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT uq_notification_push_tokens UNIQUE(token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON notification_push_tokens(user_id);
