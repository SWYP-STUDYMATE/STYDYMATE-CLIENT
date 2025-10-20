-- Initial Database Schema for STUDYMATE
-- Created: 2025-01-20
-- Version: 1.0.0

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  name TEXT,
  english_name TEXT,
  nickname TEXT,
  profile_image_url TEXT,
  intro TEXT,
  residence TEXT,

  -- OAuth Provider Info
  provider TEXT NOT NULL,  -- 'naver', 'google'
  provider_id TEXT NOT NULL,

  -- Language Info
  native_language TEXT,
  target_language TEXT,
  proficiency_level TEXT,

  -- Status
  status TEXT DEFAULT 'active',  -- 'active', 'inactive', 'suspended'
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMP,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  UNIQUE(provider, provider_id)
);

CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_online ON users(is_online);

-- ============================================================================
-- Authentication Tokens Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS auth_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  refresh_token TEXT UNIQUE NOT NULL,
  token_family_id TEXT NOT NULL,  -- For token rotation
  device_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_refresh_token ON auth_tokens(refresh_token);
CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at);

-- ============================================================================
-- User Sessions Table (WebRTC/Chat)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  partner_user_id TEXT,
  session_type TEXT NOT NULL,  -- 'video', 'audio', 'chat'
  room_id TEXT,

  -- Session Info
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  duration_seconds INTEGER,

  -- Quality Metrics
  connection_quality TEXT,  -- 'good', 'fair', 'poor'
  audio_quality_score REAL,
  video_quality_score REAL,

  -- Recording
  recording_url TEXT,
  recording_duration INTEGER,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_partner ON user_sessions(partner_user_id);
CREATE INDEX idx_user_sessions_room ON user_sessions(room_id);
CREATE INDEX idx_user_sessions_started_at ON user_sessions(started_at);

-- ============================================================================
-- Chat Rooms Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT UNIQUE NOT NULL,
  room_type TEXT NOT NULL,  -- 'direct', 'group'
  room_name TEXT,

  -- Participants (comma-separated user_ids for direct, join table for group)
  participant_ids TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP
);

CREATE INDEX idx_chat_rooms_room_id ON chat_rooms(room_id);
CREATE INDEX idx_chat_rooms_type ON chat_rooms(room_type);
CREATE INDEX idx_chat_rooms_active ON chat_rooms(is_active);

-- ============================================================================
-- Chat Messages Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT UNIQUE NOT NULL,
  room_id TEXT NOT NULL,
  sender_user_id TEXT NOT NULL,

  -- Message Content
  message_type TEXT NOT NULL,  -- 'text', 'image', 'audio', 'file'
  content TEXT,
  translated_content TEXT,

  -- File Info (for non-text messages)
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,

  -- Status
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (room_id) REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- ============================================================================
-- Matching Preferences Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS matching_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,

  -- Preferences
  preferred_gender TEXT,  -- 'any', 'male', 'female'
  preferred_age_min INTEGER,
  preferred_age_max INTEGER,
  preferred_countries TEXT,  -- JSON array
  preferred_interests TEXT,  -- JSON array

  -- Matching Settings
  auto_match_enabled BOOLEAN DEFAULT TRUE,
  max_partners INTEGER DEFAULT 5,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_matching_preferences_user_id ON matching_preferences(user_id);

-- ============================================================================
-- Level Test Results Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS level_test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  result_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,

  -- Test Info
  test_type TEXT NOT NULL,  -- 'initial', 'progress'
  language TEXT NOT NULL,

  -- Scores
  total_score REAL NOT NULL,
  listening_score REAL,
  speaking_score REAL,
  reading_score REAL,
  writing_score REAL,

  -- Levels
  overall_level TEXT NOT NULL,  -- 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
  listening_level TEXT,
  speaking_level TEXT,
  reading_level TEXT,
  writing_level TEXT,

  -- AI Analysis
  strengths TEXT,  -- JSON array
  weaknesses TEXT,  -- JSON array
  recommendations TEXT,  -- JSON array

  -- Details
  question_count INTEGER,
  correct_count INTEGER,
  duration_seconds INTEGER,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_level_test_results_user_id ON level_test_results(user_id);
CREATE INDEX idx_level_test_results_created_at ON level_test_results(created_at);

-- ============================================================================
-- Achievements Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  achievement_id TEXT UNIQUE NOT NULL,

  -- Achievement Info
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,

  -- Criteria
  category TEXT NOT NULL,  -- 'study', 'social', 'progress'
  requirement_type TEXT NOT NULL,  -- 'count', 'duration', 'score'
  requirement_value INTEGER NOT NULL,

  -- Rewards
  points INTEGER DEFAULT 0,
  badge_level TEXT,  -- 'bronze', 'silver', 'gold'

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievements_category ON achievements(category);

-- ============================================================================
-- User Achievements Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,

  -- Progress
  current_value INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE,

  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_completed ON user_achievements(is_completed);

-- ============================================================================
-- Notifications Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notification_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,

  -- Notification Info
  type TEXT NOT NULL,  -- 'match', 'message', 'achievement', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Action
  action_url TEXT,
  action_data TEXT,  -- JSON

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,

  -- Scheduling
  scheduled_for TIMESTAMP,
  delivered_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);

-- ============================================================================
-- Learning Analytics Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,

  -- Daily Metrics
  study_duration_seconds INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,

  -- Skill Improvements
  listening_practice_minutes INTEGER DEFAULT 0,
  speaking_practice_minutes INTEGER DEFAULT 0,
  reading_practice_minutes INTEGER DEFAULT 0,
  writing_practice_minutes INTEGER DEFAULT 0,

  -- Engagement
  login_count INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

  UNIQUE(user_id, date)
);

CREATE INDEX idx_learning_analytics_user_date ON learning_analytics(user_id, date);

-- ============================================================================
-- User Settings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,

  -- Notification Settings
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  match_notifications BOOLEAN DEFAULT TRUE,
  message_notifications BOOLEAN DEFAULT TRUE,
  achievement_notifications BOOLEAN DEFAULT TRUE,

  -- Privacy Settings
  profile_visibility TEXT DEFAULT 'public',  -- 'public', 'friends', 'private'
  show_online_status BOOLEAN DEFAULT TRUE,
  allow_messages_from TEXT DEFAULT 'anyone',  -- 'anyone', 'matches', 'none'

  -- Language Settings
  app_language TEXT DEFAULT 'ko',
  auto_translate BOOLEAN DEFAULT TRUE,
  subtitle_language TEXT,

  -- Theme
  theme TEXT DEFAULT 'light',  -- 'light', 'dark', 'auto'

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- ============================================================================
-- API Rate Limiting Table (for KV fallback)
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier TEXT NOT NULL,  -- IP or User ID
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(identifier, endpoint, window_start)
);

CREATE INDEX idx_api_rate_limits_identifier ON api_rate_limits(identifier, endpoint);
CREATE INDEX idx_api_rate_limits_window ON api_rate_limits(window_start);
