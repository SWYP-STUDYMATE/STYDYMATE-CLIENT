-- 0001_auth_users.sql
-- Cloudflare D1 초기 스키마: 인증 + 사용자 기본 테이블

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS locations (
  location_id INTEGER PRIMARY KEY AUTOINCREMENT,
  country      TEXT NOT NULL,
  city         TEXT,
  time_zone    TEXT,
  created_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS languages (
  language_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  language_name TEXT NOT NULL,
  language_code TEXT NOT NULL UNIQUE,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS users (
  user_id                 TEXT PRIMARY KEY,
  user_identity           TEXT,
  email                   TEXT UNIQUE,
  name                    TEXT,
  english_name            TEXT,
  profile_image           TEXT,
  self_bio                TEXT,
  birthday                TEXT,
  birthyear               TEXT,
  gender                  TEXT,
  user_disable            INTEGER NOT NULL DEFAULT 0,
  is_onboarding_completed INTEGER NOT NULL DEFAULT 0,
  location_id             INTEGER,
  native_lang_id          INTEGER,
  learning_expectation    TEXT,
  partner_gender          TEXT,
  communication_method    TEXT,
  daily_minute            TEXT,
  user_identity_type      TEXT,
  user_created_at         TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  created_at              TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at              TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CONSTRAINT fk_users_location FOREIGN KEY (location_id) REFERENCES locations(location_id),
  CONSTRAINT fk_users_language FOREIGN KEY (native_lang_id) REFERENCES languages(language_id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_identity ON users(user_identity);
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(is_onboarding_completed);

CREATE TABLE IF NOT EXISTS user_status (
  user_id            TEXT PRIMARY KEY,
  status             TEXT NOT NULL DEFAULT 'OFFLINE',
  last_seen_at       TEXT,
  device_info        TEXT,
  is_studying        INTEGER NOT NULL DEFAULT 0,
  current_session_id TEXT,
  created_at         TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at         TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CONSTRAINT fk_status_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id     TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  updated_at  TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (user_id, setting_key),
  CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  token_id     TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  token_hash   TEXT NOT NULL,
  issued_at    TEXT NOT NULL,
  expires_at   TEXT NOT NULL,
  user_agent   TEXT,
  ip_address   TEXT,
  revoked_at   TEXT,
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_exp ON refresh_tokens(expires_at);

