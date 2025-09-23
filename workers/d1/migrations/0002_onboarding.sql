-- 0002_onboarding.sql
-- 온보딩 정적/매핑 테이블

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS learning_expectation (
  learning_expectation_id INTEGER PRIMARY KEY AUTOINCREMENT,
  learning_expectation_name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS learning_style (
  learning_style_id INTEGER PRIMARY KEY AUTOINCREMENT,
  learning_style_name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS motivation (
  motivation_id INTEGER PRIMARY KEY AUTOINCREMENT,
  motivation_name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS topic (
  topic_id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS group_size (
  group_size_id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_size TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS partner_personality (
  partner_personality_id INTEGER PRIMARY KEY AUTOINCREMENT,
  partner_personality TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS schedule (
  schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week TEXT NOT NULL,
  schedule_name TEXT,
  time_slot TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS lang_level_type (
  lang_level_id INTEGER PRIMARY KEY AUTOINCREMENT,
  lang_level_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level_order INTEGER,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- 사용자 온보딩 매핑 테이블들

CREATE TABLE IF NOT EXISTS onboarding_learning_expectation (
  user_id TEXT NOT NULL,
  learning_expectation_id INTEGER NOT NULL,
  priority INTEGER,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, learning_expectation_id),
  CONSTRAINT fk_onboarding_le_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_onboarding_le_expectation FOREIGN KEY (learning_expectation_id) REFERENCES learning_expectation(learning_expectation_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onboarding_learning_style (
  user_id TEXT NOT NULL,
  learning_style_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, learning_style_id),
  CONSTRAINT fk_onboarding_ls_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_onboarding_ls_style FOREIGN KEY (learning_style_id) REFERENCES learning_style(learning_style_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onboarding_motivation (
  user_id TEXT NOT NULL,
  motivation_id INTEGER NOT NULL,
  priority INTEGER,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, motivation_id),
  CONSTRAINT fk_onboarding_m_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_onboarding_m_motivation FOREIGN KEY (motivation_id) REFERENCES motivation(motivation_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onboarding_topic (
  user_id TEXT NOT NULL,
  topic_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, topic_id),
  CONSTRAINT fk_onboarding_topic_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_onboarding_topic_topic FOREIGN KEY (topic_id) REFERENCES topic(topic_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onboarding_group_size (
  user_id TEXT NOT NULL,
  group_size_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, group_size_id),
  CONSTRAINT fk_onboarding_group_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_onboarding_group_size FOREIGN KEY (group_size_id) REFERENCES group_size(group_size_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onboarding_partner (
  user_id TEXT NOT NULL,
  partner_personality_id INTEGER NOT NULL,
  partner_gender TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, partner_personality_id),
  CONSTRAINT fk_onboarding_partner_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_onboarding_partner_personality FOREIGN KEY (partner_personality_id) REFERENCES partner_personality(partner_personality_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onboarding_schedule (
  user_id TEXT NOT NULL,
  schedule_id INTEGER NOT NULL,
  day_of_week TEXT NOT NULL,
  class_time TEXT,
  is_available INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, schedule_id, day_of_week, class_time),
  CONSTRAINT fk_onboarding_schedule_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_onboarding_schedule_schedule FOREIGN KEY (schedule_id) REFERENCES schedule(schedule_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS onboarding_lang_level (
  user_id TEXT NOT NULL,
  language_id INTEGER NOT NULL,
  current_level_id INTEGER,
  target_level_id INTEGER,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, language_id),
  CONSTRAINT fk_onboarding_lang_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_onboarding_lang_language FOREIGN KEY (language_id) REFERENCES languages(language_id) ON DELETE CASCADE,
  CONSTRAINT fk_onboarding_lang_current FOREIGN KEY (current_level_id) REFERENCES lang_level_type(lang_level_id) ON DELETE SET NULL,
  CONSTRAINT fk_onboarding_lang_target FOREIGN KEY (target_level_id) REFERENCES lang_level_type(lang_level_id) ON DELETE SET NULL
);

