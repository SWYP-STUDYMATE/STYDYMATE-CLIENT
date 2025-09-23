-- 0004_sessions.sql
-- Session & Group Session tables

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sessions (
  session_id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_user_id TEXT NOT NULL,
  guest_user_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL,
  language_code TEXT,
  skill_focus TEXT,
  level_requirement TEXT,
  scheduled_at TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  meeting_url TEXT,
  meeting_password TEXT,
  is_recurring INTEGER NOT NULL DEFAULT 0,
  recurrence_pattern TEXT,
  recurrence_end_date TEXT,
  is_public INTEGER NOT NULL DEFAULT 1,
  tags TEXT,
  preparation_notes TEXT,
  started_at TEXT,
  ended_at TEXT,
  cancelled_at TEXT,
  cancellation_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT fk_sessions_host FOREIGN KEY (host_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_sessions_guest FOREIGN KEY (guest_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_host ON sessions(host_user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at);

CREATE TABLE IF NOT EXISTS session_bookings (
  booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  booking_message TEXT,
  cancelled_at TEXT,
  cancellation_reason TEXT,
  attended INTEGER NOT NULL DEFAULT 0,
  feedback_rating INTEGER,
  feedback_comment TEXT,
  reminder_sent INTEGER NOT NULL DEFAULT 0,
  reminder_sent_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT fk_session_bookings_session FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
  CONSTRAINT fk_session_bookings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_bookings_session ON session_bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_user ON session_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_status ON session_bookings(status);

CREATE TABLE IF NOT EXISTS group_sessions (
  session_id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  host_user_id TEXT NOT NULL,
  topic_category TEXT,
  target_language TEXT,
  language_level TEXT,
  max_participants INTEGER,
  current_participants INTEGER,
  scheduled_at TEXT,
  session_duration INTEGER,
  status TEXT,
  room_id TEXT,
  session_tags TEXT,
  is_public INTEGER,
  join_code TEXT,
  started_at TEXT,
  ended_at TEXT,
  rating_average REAL,
  rating_count INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT fk_group_sessions_host FOREIGN KEY (host_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_session_participants (
  participant_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT,
  joined_at TEXT,
  left_at TEXT,
  participation_duration INTEGER,
  rating INTEGER,
  feedback TEXT,
  connection_quality TEXT,
  is_muted INTEGER,
  is_video_enabled INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT fk_group_participants_session FOREIGN KEY (session_id) REFERENCES group_sessions(session_id) ON DELETE CASCADE,
  CONSTRAINT fk_group_participants_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_group_participants_session ON group_session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_group_participants_user ON group_session_participants(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_group_participants_session_user ON group_session_participants(session_id, user_id);
