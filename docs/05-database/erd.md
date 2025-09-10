# STUDYMATE 데이터베이스 ERD (Entity Relationship Diagram)

## 📋 개요

STUDYMATE 플랫폼의 데이터베이스 구조와 엔터티 간의 관계를 정의합니다. 이 ERD는 STUDYMATE-SERVER의 PostgreSQL 데이터베이스를 기반으로 합니다.

## 🏗️ 데이터베이스 아키텍처

### 기술 스택
- **주 데이터베이스**: PostgreSQL 15+
- **캐시 레이어**: Redis 7+  
- **연결 풀**: HikariCP
- **ORM**: Spring Data JPA + Hibernate
- **마이그레이션**: Flyway

### 데이터베이스 구성
```
STUDYMATE-SERVER Database
├── 사용자 관리 (User Management)
├── 인증 및 세션 (Authentication & Sessions)
├── 온보딩 시스템 (Onboarding System)
├── 언어 및 레벨 (Languages & Levels)
├── 매칭 시스템 (Matching System)
├── 채팅 시스템 (Chat System)
├── 세션 관리 (Session Management)
├── 레벨 테스트 (Level Test)
├── 알림 시스템 (Notification System)
└── 분석 및 통계 (Analytics)
```

## 👤 사용자 관리 도메인

### users (사용자)
```sql
CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    email              VARCHAR(255) UNIQUE NOT NULL,
    english_name       VARCHAR(100) NOT NULL,
    korean_name        VARCHAR(100),
    birth_date         DATE NOT NULL,
    gender             VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    residence          VARCHAR(255),
    profile_image_url  TEXT,
    intro              TEXT,
    is_active          BOOLEAN DEFAULT true,
    oauth_provider     VARCHAR(50) CHECK (oauth_provider IN ('GOOGLE', 'NAVER')),
    oauth_id           VARCHAR(255),
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_oauth_user UNIQUE (oauth_provider, oauth_id)
);
```

### user_languages (사용자 언어 설정)
```sql
CREATE TABLE user_languages (
    id                 BIGSERIAL PRIMARY KEY,
    user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language_code     VARCHAR(10) NOT NULL, -- 'ko', 'en', 'zh', 'ja', 'es', 'fr'
    language_type     VARCHAR(20) NOT NULL CHECK (language_type IN ('NATIVE', 'TEACHING', 'LEARNING')),
    proficiency_level VARCHAR(10) CHECK (proficiency_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    is_primary        BOOLEAN DEFAULT false,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_language UNIQUE (user_id, language_code, language_type)
);
```

### user_interests (사용자 관심사)
```sql
CREATE TABLE user_interests (
    id            BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest_tag VARCHAR(100) NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_interest UNIQUE (user_id, interest_tag)
);
```

## 🔐 인증 및 세션

### refresh_tokens (리프레시 토큰)
```sql
CREATE TABLE refresh_tokens (
    id           BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) UNIQUE NOT NULL,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used     BOOLEAN DEFAULT false,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_refresh_token (token),
    INDEX idx_user_active_tokens (user_id, expires_at, is_used)
);
```

### user_sessions (사용자 세션)
```sql
CREATE TABLE user_sessions (
    id                BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token    VARCHAR(255) UNIQUE NOT NULL,
    ip_address       INET,
    user_agent       TEXT,
    expires_at       TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active        BOOLEAN DEFAULT true,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_session_token (session_token),
    INDEX idx_user_active_sessions (user_id, is_active, expires_at)
);
```

## 🎯 온보딩 시스템

### onboarding_progress (온보딩 진행 상황)
```sql
CREATE TABLE onboarding_progress (
    id             BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_step  INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 6),
    is_completed  BOOLEAN DEFAULT false,
    completed_at  TIMESTAMP WITH TIME ZONE,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_onboarding UNIQUE (user_id)
);
```

### onboarding_step_data (온보딩 단계별 데이터)
```sql
CREATE TABLE onboarding_step_data (
    id         BIGSERIAL PRIMARY KEY,
    user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step_num  INTEGER NOT NULL CHECK (step_num BETWEEN 1 AND 6),
    data_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_step UNIQUE (user_id, step_num)
);
```

## 💑 매칭 시스템

### matching_requests (매칭 요청)
```sql
CREATE TABLE matching_requests (
    id           BIGSERIAL PRIMARY KEY,
    requester_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message      TEXT,
    status       VARCHAR(20) DEFAULT 'PENDING' 
                 CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT different_users CHECK (requester_id != target_id),
    INDEX idx_target_pending (target_id, status, expires_at),
    INDEX idx_requester_status (requester_id, status)
);
```

### user_partnerships (사용자 파트너십)
```sql
CREATE TABLE user_partnerships (
    id                BIGSERIAL PRIMARY KEY,
    user_id_1        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partnership_type VARCHAR(20) DEFAULT 'CASUAL' 
                     CHECK (partnership_type IN ('CASUAL', 'REGULAR')),
    compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
    total_sessions   INTEGER DEFAULT 0,
    last_session_at  TIMESTAMP WITH TIME ZONE,
    is_active        BOOLEAN DEFAULT true,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT different_partners CHECK (user_id_1 != user_id_2),
    CONSTRAINT unique_partnership UNIQUE (user_id_1, user_id_2),
    INDEX idx_user_active_partnerships (user_id_1, is_active),
    INDEX idx_partnership_activity (user_id_2, is_active, last_session_at)
);
```

### matching_preferences (매칭 선호도)
```sql
CREATE TABLE matching_preferences (
    id                    BIGSERIAL PRIMARY KEY,
    user_id              BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_age_min    INTEGER CHECK (preferred_age_min >= 13),
    preferred_age_max    INTEGER CHECK (preferred_age_max <= 100),
    preferred_gender     VARCHAR(20) CHECK (preferred_gender IN ('MALE', 'FEMALE', 'ANY')),
    preferred_countries  TEXT[], -- Array of country codes
    min_compatibility    INTEGER DEFAULT 70 CHECK (min_compatibility BETWEEN 0 AND 100),
    max_distance_km      INTEGER, -- For location-based matching
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_preferences UNIQUE (user_id),
    CONSTRAINT valid_age_range CHECK (preferred_age_min <= preferred_age_max)
);
```

## 💬 채팅 시스템

### chat_rooms (채팅방)
```sql
CREATE TABLE chat_rooms (
    id                  BIGSERIAL PRIMARY KEY,
    room_type          VARCHAR(20) DEFAULT 'DIRECT' 
                       CHECK (room_type IN ('DIRECT', 'GROUP')),
    name               VARCHAR(255),
    description        TEXT,
    created_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    is_active          BOOLEAN DEFAULT true,
    last_message_at    TIMESTAMP WITH TIME ZONE,
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_room_activity (is_active, last_message_at),
    INDEX idx_created_by (created_by_user_id)
);
```

### chat_participants (채팅 참가자)
```sql
CREATE TABLE chat_participants (
    id                     BIGSERIAL PRIMARY KEY,
    room_id               BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id               BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role                  VARCHAR(20) DEFAULT 'MEMBER' 
                          CHECK (role IN ('ADMIN', 'MEMBER')),
    joined_at             TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_message_id  BIGINT,
    is_active             BOOLEAN DEFAULT true,
    
    CONSTRAINT unique_room_participant UNIQUE (room_id, user_id),
    INDEX idx_user_rooms (user_id, is_active),
    INDEX idx_room_participants (room_id, is_active)
);
```

### chat_messages (채팅 메시지)
```sql
CREATE TABLE chat_messages (
    id              BIGSERIAL PRIMARY KEY,
    room_id        BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_type   VARCHAR(20) DEFAULT 'TEXT' 
                   CHECK (message_type IN ('TEXT', 'IMAGE', 'VOICE', 'FILE', 'SYSTEM')),
    content        TEXT,
    file_url       TEXT,
    file_metadata  JSONB, -- Size, type, etc.
    reply_to_id    BIGINT REFERENCES chat_messages(id),
    is_edited      BOOLEAN DEFAULT false,
    edited_at      TIMESTAMP WITH TIME ZONE,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_room_messages (room_id, created_at),
    INDEX idx_sender_messages (sender_id, created_at),
    INDEX idx_reply_chain (reply_to_id)
);
```

## 📞 세션 관리

### learning_sessions (학습 세션)
```sql
CREATE TABLE learning_sessions (
    id                    BIGSERIAL PRIMARY KEY,
    session_type         VARCHAR(20) NOT NULL 
                         CHECK (session_type IN ('AUDIO_1V1', 'VIDEO_1V1', 'GROUP_VIDEO')),
    title                VARCHAR(255),
    description          TEXT,
    scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end_time   TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time    TIMESTAMP WITH TIME ZONE,
    actual_end_time      TIMESTAMP WITH TIME ZONE,
    status               VARCHAR(20) DEFAULT 'SCHEDULED' 
                         CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    room_id              VARCHAR(255), -- WebRTC room ID
    primary_language     VARCHAR(10), -- Language code for first half
    secondary_language   VARCHAR(10), -- Language code for second half
    max_participants     INTEGER DEFAULT 2 CHECK (max_participants BETWEEN 2 AND 4),
    created_by_user_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_session_schedule (scheduled_start_time, scheduled_end_time),
    INDEX idx_session_status (status, scheduled_start_time),
    INDEX idx_room_lookup (room_id)
);
```

### session_participants (세션 참가자)
```sql
CREATE TABLE session_participants (
    id               BIGSERIAL PRIMARY KEY,
    session_id      BIGINT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(20) DEFAULT 'PARTICIPANT' 
                    CHECK (role IN ('HOST', 'PARTICIPANT')),
    joined_at       TIMESTAMP WITH TIME ZONE,
    left_at         TIMESTAMP WITH TIME ZONE,
    participation_time INTEGER DEFAULT 0, -- In seconds
    rating_given    INTEGER CHECK (rating_given BETWEEN 1 AND 5),
    feedback        TEXT,
    is_confirmed    BOOLEAN DEFAULT false,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_session_participant UNIQUE (session_id, user_id),
    INDEX idx_user_sessions (user_id, created_at),
    INDEX idx_session_roster (session_id, role)
);
```

### session_recordings (세션 녹화)
```sql
CREATE TABLE session_recordings (
    id           BIGSERIAL PRIMARY KEY,
    session_id  BIGINT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    file_url    TEXT NOT NULL,
    file_size   BIGINT, -- In bytes
    duration    INTEGER, -- In seconds
    format      VARCHAR(20), -- 'MP4', 'WEBM', etc.
    quality     VARCHAR(20), -- 'HD', 'SD', etc.
    is_available BOOLEAN DEFAULT true,
    expires_at   TIMESTAMP WITH TIME ZONE, -- Auto-deletion date
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_session_recordings (session_id),
    INDEX idx_recording_expiry (expires_at, is_available)
);
```

## 🎯 레벨 테스트 시스템

### level_tests (레벨 테스트)
```sql
CREATE TABLE level_tests (
    id                  BIGSERIAL PRIMARY KEY,
    user_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language_code      VARCHAR(10) NOT NULL,
    test_type          VARCHAR(20) DEFAULT 'FULL' 
                       CHECK (test_type IN ('FULL', 'QUICK', 'RETAKE')),
    status             VARCHAR(20) DEFAULT 'IN_PROGRESS' 
                       CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED')),
    overall_level      VARCHAR(10) CHECK (overall_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    overall_score      INTEGER CHECK (overall_score BETWEEN 0 AND 100),
    pronunciation_score INTEGER CHECK (pronunciation_score BETWEEN 0 AND 100),
    grammar_score      INTEGER CHECK (grammar_score BETWEEN 0 AND 100),
    fluency_score      INTEGER CHECK (fluency_score BETWEEN 0 AND 100),
    vocabulary_score   INTEGER CHECK (vocabulary_score BETWEEN 0 AND 100),
    comprehension_score INTEGER CHECK (comprehension_score BETWEEN 0 AND 100),
    interaction_score  INTEGER CHECK (interaction_score BETWEEN 0 AND 100),
    feedback_text      TEXT,
    ai_analysis        JSONB, -- Detailed AI analysis data
    started_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at       TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_user_tests (user_id, language_code, completed_at),
    INDEX idx_level_distribution (language_code, overall_level)
);
```

### level_test_responses (레벨 테스트 응답)
```sql
CREATE TABLE level_test_responses (
    id               BIGSERIAL PRIMARY KEY,
    test_id         BIGINT NOT NULL REFERENCES level_tests(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL CHECK (question_number BETWEEN 1 AND 4),
    question_text   TEXT NOT NULL,
    audio_url       TEXT, -- URL to recorded response
    transcription   TEXT, -- AI transcription of the audio
    duration_seconds INTEGER,
    ai_scores       JSONB, -- Detailed scoring from AI
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_test_question UNIQUE (test_id, question_number),
    INDEX idx_test_responses (test_id, question_number)
);
```

## 🔔 알림 시스템

### notifications (알림)
```sql
CREATE TABLE notifications (
    id            BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type         VARCHAR(50) NOT NULL,
    title        VARCHAR(255) NOT NULL,
    message      TEXT NOT NULL,
    data_json    JSONB, -- Additional data for the notification
    is_read      BOOLEAN DEFAULT false,
    read_at      TIMESTAMP WITH TIME ZONE,
    priority     VARCHAR(20) DEFAULT 'NORMAL' 
                 CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    expires_at   TIMESTAMP WITH TIME ZONE,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_notifications (user_id, is_read, created_at),
    INDEX idx_notification_type (type, created_at),
    INDEX idx_notification_expiry (expires_at)
);
```

### push_subscriptions (푸시 구독)
```sql
CREATE TABLE push_subscriptions (
    id           BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint    TEXT UNIQUE NOT NULL,
    p256dh_key  TEXT NOT NULL,
    auth_key    TEXT NOT NULL,
    user_agent  TEXT,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_subscriptions (user_id, is_active)
);
```

## 📊 분석 및 통계

### user_activity_logs (사용자 활동 로그)
```sql
CREATE TABLE user_activity_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
    activity   VARCHAR(100) NOT NULL,
    details    JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_activity (user_id, created_at),
    INDEX idx_activity_type (activity, created_at)
);
```

### learning_analytics (학습 분석)
```sql
CREATE TABLE learning_analytics (
    id                     BIGSERIAL PRIMARY KEY,
    user_id               BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language_code         VARCHAR(10) NOT NULL,
    date                  DATE NOT NULL,
    total_session_time    INTEGER DEFAULT 0, -- In seconds
    session_count         INTEGER DEFAULT 0,
    messages_sent         INTEGER DEFAULT 0,
    level_improvements    INTEGER DEFAULT 0,
    badges_earned         INTEGER DEFAULT 0,
    average_session_rating DECIMAL(3,2),
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_date_lang UNIQUE (user_id, language_code, date),
    INDEX idx_user_analytics (user_id, language_code, date),
    INDEX idx_date_analytics (date, language_code)
);
```

### system_metrics (시스템 메트릭)
```sql
CREATE TABLE system_metrics (
    id             BIGSERIAL PRIMARY KEY,
    metric_name   VARCHAR(100) NOT NULL,
    metric_value  DECIMAL(15,4) NOT NULL,
    metric_unit   VARCHAR(20),
    tags          JSONB, -- Additional metadata
    recorded_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_metric_time (metric_name, recorded_at),
    INDEX idx_metric_tags (tags) USING gin
);
```

## 🔗 주요 관계 (Relationships)

### One-to-Many 관계
```mermaid
erDiagram
    users ||--o{ user_languages : has
    users ||--o{ user_interests : has
    users ||--o{ refresh_tokens : owns
    users ||--o{ onboarding_step_data : completes
    users ||--o{ matching_requests : sends
    users ||--o{ chat_messages : sends
    users ||--o{ level_tests : takes
    users ||--o{ notifications : receives
    
    chat_rooms ||--o{ chat_messages : contains
    chat_rooms ||--o{ chat_participants : includes
    
    learning_sessions ||--o{ session_participants : includes
    learning_sessions ||--o{ session_recordings : generates
    
    level_tests ||--o{ level_test_responses : contains
```

### Many-to-Many 관계
```mermaid
erDiagram
    users ||--o{ user_partnerships : forms
    users ||--o{ chat_participants : participates
    users ||--o{ session_participants : joins
```

## 📊 인덱스 최적화 전략

### 성능 최적화 인덱스
```sql
-- 채팅 성능 최적화
CREATE INDEX CONCURRENTLY idx_chat_messages_room_time 
ON chat_messages(room_id, created_at DESC);

-- 매칭 성능 최적화
CREATE INDEX CONCURRENTLY idx_matching_active_requests 
ON matching_requests(target_id, status, expires_at) 
WHERE status = 'PENDING';

-- 세션 스케줄링 최적화
CREATE INDEX CONCURRENTLY idx_sessions_upcoming 
ON learning_sessions(scheduled_start_time) 
WHERE status IN ('SCHEDULED', 'IN_PROGRESS');

-- 알림 성능 최적화
CREATE INDEX CONCURRENTLY idx_notifications_unread 
ON notifications(user_id, created_at DESC) 
WHERE is_read = false;

-- 분석 쿼리 최적화
CREATE INDEX CONCURRENTLY idx_analytics_user_period 
ON learning_analytics(user_id, language_code, date DESC);
```

### 파티셔닝 전략
```sql
-- 대용량 테이블 파티셔닝 (월별)
CREATE TABLE chat_messages_y2025m01 PARTITION OF chat_messages
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE user_activity_logs_y2025m01 PARTITION OF user_activity_logs
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

## 🔧 데이터베이스 제약 조건

### 체크 제약 조건
```sql
-- 나이 유효성 검사
ALTER TABLE users ADD CONSTRAINT valid_birth_date 
CHECK (birth_date > '1900-01-01' AND birth_date < CURRENT_DATE - INTERVAL '13 years');

-- 세션 시간 유효성 검사
ALTER TABLE learning_sessions ADD CONSTRAINT valid_session_duration
CHECK (scheduled_end_time > scheduled_start_time);

-- 점수 범위 검사
ALTER TABLE level_tests ADD CONSTRAINT valid_scores
CHECK (overall_score IS NULL OR 
       (pronunciation_score + grammar_score + fluency_score + 
        vocabulary_score + comprehension_score + interaction_score) / 6 = overall_score);
```

### 외래 키 제약 조건
```sql
-- 연쇄 삭제 설정
ALTER TABLE chat_participants 
ADD CONSTRAINT fk_chat_participants_last_read 
FOREIGN KEY (last_read_message_id) REFERENCES chat_messages(id) ON DELETE SET NULL;

-- 참조 무결성 보장
ALTER TABLE matching_requests 
ADD CONSTRAINT fk_matching_different_users 
CHECK (requester_id != target_id);
```

## 📈 확장성 고려사항

### 수직 확장 (Scale Up)
- **연결 풀 최적화**: HikariCP 설정 최적화
- **쿼리 최적화**: EXPLAIN ANALYZE 활용한 성능 튜닝
- **인덱스 최적화**: 주기적인 인덱스 재구성

### 수평 확장 (Scale Out)
- **읽기 복제본**: 읽기 전용 쿼리 분산
- **샤딩 준비**: user_id 기반 데이터 분산 준비
- **캐싱 전략**: Redis를 활용한 빈번한 조회 데이터 캐싱

### 아카이빙 전략
```sql
-- 오래된 데이터 아카이빙
CREATE TABLE chat_messages_archive (LIKE chat_messages);
CREATE TABLE user_activity_logs_archive (LIKE user_activity_logs);

-- 정기적 아카이빙 프로시저
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS void AS $$
BEGIN
    -- 6개월 이상 된 채팅 메시지 아카이빙
    INSERT INTO chat_messages_archive 
    SELECT * FROM chat_messages 
    WHERE created_at < CURRENT_DATE - INTERVAL '6 months';
    
    DELETE FROM chat_messages 
    WHERE created_at < CURRENT_DATE - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;
```

---

*이 ERD는 STUDYMATE 시스템의 데이터 구조를 정의하며, 서비스 확장에 따라 지속적으로 업데이트됩니다. 모든 변경사항은 마이그레이션 스크립트를 통해 버전 관리됩니다.*