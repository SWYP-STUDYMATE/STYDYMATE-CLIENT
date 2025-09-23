-- 0003_matching.sql
-- Matching domain tables

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS matching_requests (
  request_id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL,
  response_message TEXT,
  responded_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT fk_matching_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_matching_receiver FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_matching_requests_sender ON matching_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_matching_requests_receiver ON matching_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_matching_requests_status ON matching_requests(status);

CREATE TABLE IF NOT EXISTS user_matches (
  match_id TEXT PRIMARY KEY,
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  matched_at TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  deactivated_at TEXT,
  deactivated_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT fk_user_matches_user1 FOREIGN KEY (user1_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_user_matches_user2 FOREIGN KEY (user2_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_user_matches_deactivated FOREIGN KEY (deactivated_by) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT uq_user_pairs UNIQUE(user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_user_matches_user1 ON user_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_user2 ON user_matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_active ON user_matches(is_active);

CREATE TABLE IF NOT EXISTS matching_feedback (
  feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
  reviewer_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  overall_rating INTEGER NOT NULL,
  communication_rating INTEGER,
  language_level_rating INTEGER,
  teaching_ability_rating INTEGER,
  patience_rating INTEGER,
  punctuality_rating INTEGER,
  written_feedback TEXT,
  session_quality_score INTEGER,
  would_match_again INTEGER,
  reported_issues TEXT,
  suggested_improvements TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT fk_feedback_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_feedback_partner FOREIGN KEY (partner_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_feedback_match FOREIGN KEY (match_id) REFERENCES user_matches(match_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_matching_feedback_match ON matching_feedback(match_id);
CREATE INDEX IF NOT EXISTS idx_matching_feedback_partner ON matching_feedback(partner_id);

CREATE TABLE IF NOT EXISTS matching_queue (
  queue_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  session_type TEXT NOT NULL,
  queue_status TEXT NOT NULL,
  priority_score INTEGER,
  target_language TEXT,
  language_level TEXT,
  preferred_session_duration INTEGER,
  joined_at TEXT,
  completed_at TEXT,
  estimated_wait_minutes INTEGER,
  matching_preferences TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CONSTRAINT fk_matching_queue_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_matching_queue_user ON matching_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_matching_queue_status ON matching_queue(queue_status);
