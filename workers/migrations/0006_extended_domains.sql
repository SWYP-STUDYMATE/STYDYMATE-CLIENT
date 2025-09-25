-- 0006_extended_domains.sql
-- Additional domain tables migrated from legacy JPA entities

PRAGMA foreign_keys = ON;

-- =============================================
-- Achievement system
-- =============================================

CREATE TABLE IF NOT EXISTS achievements (
  achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
  achievement_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  tier TEXT NOT NULL,
  target_value INTEGER,
  target_unit TEXT,
  xp_reward INTEGER,
  badge_icon_url TEXT,
  badge_color TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_hidden INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER,
  prerequisite_achievement_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_tier ON achievements(tier);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  achievement_id INTEGER NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  is_reward_claimed INTEGER NOT NULL DEFAULT 0,
  reward_claimed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_user_achievements_achievement FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE,
  CONSTRAINT uq_user_achievements UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);

-- =============================================
-- Chat domain
-- =============================================

CREATE TABLE IF NOT EXISTS chat_room (
  room_id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS chat_room_participant (
  room_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (room_id, user_id),
  CONSTRAINT fk_chat_room_participant_room FOREIGN KEY (room_id) REFERENCES chat_room(room_id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_room_participant_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_room_participant_user ON chat_room_participant(user_id);

CREATE TABLE IF NOT EXISTS chat_message (
  message_id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  message TEXT,
  audio_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CONSTRAINT fk_chat_message_room FOREIGN KEY (room_id) REFERENCES chat_room(room_id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_message_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_message_room ON chat_message(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_user ON chat_message(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_created_at ON chat_message(created_at DESC);

CREATE TABLE IF NOT EXISTS chat_image (
  image_id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CONSTRAINT fk_chat_image_message FOREIGN KEY (message_id) REFERENCES chat_message(message_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_image_message ON chat_image(message_id);

CREATE TABLE IF NOT EXISTS chat_files (
  file_id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER NOT NULL,
  content_type TEXT,
  file_type TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CONSTRAINT fk_chat_files_message FOREIGN KEY (message_id) REFERENCES chat_message(message_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_files_message ON chat_files(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_files_file_type ON chat_files(file_type);

CREATE TABLE IF NOT EXISTS message_read_status (
  read_id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  read_at TEXT NOT NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CONSTRAINT fk_message_read_status_message FOREIGN KEY (message_id) REFERENCES chat_message(message_id) ON DELETE CASCADE,
  CONSTRAINT fk_message_read_status_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT uq_message_read_status UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_read_status_user ON message_read_status(user_id);

-- =============================================
-- Level test domain
-- =============================================

CREATE TABLE IF NOT EXISTS level_tests (
  test_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  test_type TEXT NOT NULL,
  status TEXT NOT NULL,
  language_code TEXT NOT NULL,
  test_level TEXT,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  accuracy_percentage REAL NOT NULL,
  estimated_level TEXT,
  estimated_score INTEGER,
  test_duration_seconds INTEGER,
  started_at TEXT,
  completed_at TEXT,
  is_completed INTEGER NOT NULL DEFAULT 0,
  feedback TEXT,
  strengths TEXT,
  weaknesses TEXT,
  recommendations TEXT,
  audio_file_url TEXT,
  audio_file_path TEXT,
  transcript_text TEXT,
  pronunciation_score INTEGER,
  fluency_score INTEGER,
  grammar_score INTEGER,
  vocabulary_score INTEGER,
  is_voice_test INTEGER NOT NULL DEFAULT 0,
  voice_analysis_result TEXT,
  total_score INTEGER,
  max_score INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CONSTRAINT fk_level_tests_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_level_tests_user ON level_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_level_tests_status ON level_tests(status);
CREATE INDEX IF NOT EXISTS idx_level_tests_type ON level_tests(test_type);

CREATE TABLE IF NOT EXISTS level_test_results (
  result_id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_id INTEGER NOT NULL,
  question_number INTEGER NOT NULL,
  question_type TEXT,
  question_text TEXT,
  question_audio_url TEXT,
  question_image_url TEXT,
  correct_answer TEXT,
  user_answer TEXT,
  user_audio_url TEXT,
  is_correct INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER,
  max_points INTEGER,
  response_time_seconds INTEGER,
  difficulty_level TEXT,
  skill_category TEXT,
  explanation TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CONSTRAINT fk_level_test_results_test FOREIGN KEY (test_id) REFERENCES level_tests(test_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_level_test_results_test ON level_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_level_test_results_question_number ON level_test_results(test_id, question_number);

-- =============================================
-- Onboarding supplemental mappings
-- =============================================

CREATE TABLE IF NOT EXISTS onboarding_personality (
  user_id TEXT NOT NULL,
  partner_personality_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, partner_personality_id),
  CONSTRAINT fk_onboarding_personality_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_onboarding_personality_partner FOREIGN KEY (partner_personality_id) REFERENCES partner_personality(partner_personality_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onboarding_study_goal (
  user_id TEXT NOT NULL,
  motivation_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, motivation_id),
  CONSTRAINT fk_onboarding_study_goal_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_onboarding_study_goal_motivation FOREIGN KEY (motivation_id) REFERENCES motivation(motivation_id) ON DELETE CASCADE
);

-- =============================================
-- Data cleanup triggers for updated_at
-- =============================================
