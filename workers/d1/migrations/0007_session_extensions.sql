-- 0007_session_extensions.sql
-- Persist session auxiliary data previously kept in KV

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS session_notifications (
  session_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  reminder_before INTEGER NOT NULL,
  enable_email INTEGER NOT NULL,
  enable_push INTEGER NOT NULL,
  enable_sms INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (session_id, user_id),
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_recordings (
  session_id INTEGER PRIMARY KEY,
  status TEXT NOT NULL,
  record_audio INTEGER NOT NULL,
  record_video INTEGER NOT NULL,
  record_transcript INTEGER NOT NULL,
  download_url TEXT,
  message TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_invites (
  invite_token TEXT PRIMARY KEY,
  session_id INTEGER NOT NULL,
  inviter_user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  used_at TEXT,
  used_by TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_summaries (
  session_id INTEGER PRIMARY KEY,
  notes TEXT,
  duration_minutes INTEGER,
  rating REAL,
  highlights TEXT,
  action_items TEXT,
  feedback TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_transcripts (
  session_id INTEGER NOT NULL,
  language TEXT NOT NULL,
  segments TEXT,
  generated_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (session_id, language),
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_invites_session ON session_invites(session_id);
CREATE INDEX IF NOT EXISTS idx_session_transcripts_session ON session_transcripts(session_id);
