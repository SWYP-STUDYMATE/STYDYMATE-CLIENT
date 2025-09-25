-- 0009_onboarding_schedule_extensions.sql
-- 커뮤니케이션 방식 도메인 확장

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS communication_method (
  communication_method_id INTEGER PRIMARY KEY AUTOINCREMENT,
  method_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_communication_method_active
  ON communication_method(is_active)
  WHERE is_active = 1;

INSERT OR IGNORE INTO communication_method (communication_method_id, method_code, display_name, description, sort_order)
VALUES
  (1, 'TEXT', '텍스트 중심', '채팅을 위주로 학습합니다.', 1),
  (2, 'VOICE', '음성 중심', '음성 통화를 중심으로 연습합니다.', 2),
  (3, 'VIDEO', '영상 통화', '영상 통화로 실시간 대화를 진행합니다.', 3),
  (4, 'HYBRID', '상황에 맞게', '상황에 따라 텍스트와 음성을 혼합합니다.', 4);

UPDATE communication_method
SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now');
