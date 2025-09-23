-- 0008_notifications_extensions.sql
-- Additional tables and columns to support notification topics and schedules

PRAGMA foreign_keys = ON;

-- Add schedule metadata column if it does not exist
ALTER TABLE notifications ADD COLUMN schedule_metadata TEXT;

-- Subscription table for notification topics
CREATE TABLE IF NOT EXISTS notification_topic_subscription (
  subscription_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CONSTRAINT fk_notification_topic_subscription_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT uq_notification_topic_subscription UNIQUE(user_id, topic)
);

CREATE INDEX IF NOT EXISTS idx_notification_topic_subscription_user ON notification_topic_subscription(user_id);
