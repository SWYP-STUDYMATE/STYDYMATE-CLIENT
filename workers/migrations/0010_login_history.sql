-- Migration: 0010_login_history
-- Description: Add login_history table for tracking user login activities
-- Created: 2025-10-16

-- 로그인 히스토리 테이블
CREATE TABLE IF NOT EXISTS login_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  login_time TEXT NOT NULL,        -- ISO 8601 형식
  ip_address TEXT,                 -- 클라이언트 IP 주소
  user_agent TEXT,                 -- User-Agent 헤더
  device TEXT,                     -- 디바이스 정보 (파싱된 정보)
  browser TEXT,                    -- 브라우저 정보
  location TEXT,                   -- 위치 정보 (국가/도시)
  country_code TEXT,               -- 국가 코드 (예: KR, US)
  suspicious INTEGER DEFAULT 0,    -- 의심스러운 활동 플래그 (0: 정상, 1: 의심)
  suspicious_reason TEXT,          -- 의심스러운 이유
  session_id TEXT,                 -- 세션 ID
  success INTEGER DEFAULT 1,       -- 로그인 성공 여부 (0: 실패, 1: 성공)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_time ON login_history(login_time);
CREATE INDEX IF NOT EXISTS idx_login_history_suspicious ON login_history(suspicious);
CREATE INDEX IF NOT EXISTS idx_login_history_user_login_time ON login_history(user_id, login_time DESC);

-- 테스트 데이터 (개발용)
-- 실제 프로덕션에서는 이 부분을 제거하거나 주석 처리
INSERT INTO login_history (user_id, login_time, ip_address, device, browser, location, country_code, suspicious, suspicious_reason)
SELECT
  user_id,
  datetime('now', '-' || (CAST((ABS(RANDOM()) % 720) AS INTEGER)) || ' hours') as login_time,
  '192.168.1.' || (ABS(RANDOM()) % 255) as ip_address,
  CASE (ABS(RANDOM()) % 4)
    WHEN 0 THEN 'Chrome on Windows 10'
    WHEN 1 THEN 'Safari on MacOS'
    WHEN 2 THEN 'Chrome on Android'
    ELSE 'Safari on iPhone'
  END as device,
  CASE (ABS(RANDOM()) % 4)
    WHEN 0 THEN 'Chrome 120.0'
    WHEN 1 THEN 'Safari 17.0'
    WHEN 2 THEN 'Chrome Mobile'
    ELSE 'Safari Mobile'
  END as browser,
  CASE (ABS(RANDOM()) % 5)
    WHEN 0 THEN 'Seoul, South Korea'
    WHEN 1 THEN 'Busan, South Korea'
    WHEN 2 THEN 'Tokyo, Japan'
    WHEN 3 THEN 'New York, USA'
    ELSE 'London, UK'
  END as location,
  CASE (ABS(RANDOM()) % 5)
    WHEN 0 THEN 'KR'
    WHEN 1 THEN 'KR'
    WHEN 2 THEN 'JP'
    WHEN 3 THEN 'US'
    ELSE 'GB'
  END as country_code,
  CASE WHEN (ABS(RANDOM()) % 10) = 0 THEN 1 ELSE 0 END as suspicious,
  CASE WHEN (ABS(RANDOM()) % 10) = 0 THEN 'Unusual location detected' ELSE NULL END as suspicious_reason
FROM users
WHERE user_disable = 0
LIMIT 5;
