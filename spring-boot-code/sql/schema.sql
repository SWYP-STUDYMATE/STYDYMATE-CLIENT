-- STUDYMATE Database Schema
-- Language Exchange Learning Platform Database Structure

-- ====================
-- 1. 사용자 관련 테이블
-- ====================

-- 사용자 기본 정보
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    profile_image_url TEXT,
    provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    is_email_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    last_activity_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    INDEX idx_users_email (email),
    INDEX idx_users_status (status),
    INDEX idx_users_provider (provider),
    INDEX idx_users_last_activity (last_activity_at),
    INDEX idx_users_created_at (created_at)
);

-- 사용자 설정
CREATE TABLE user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language_level VARCHAR(20) DEFAULT 'BEGINNER' CHECK (language_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    target_language VARCHAR(10) NOT NULL DEFAULT 'en',
    native_language VARCHAR(10) NOT NULL DEFAULT 'ko',
    interests JSON,
    availability_schedule JSON,
    matching_preferences JSON,
    notification_settings JSON DEFAULT '{"email": true, "push": true, "chat": true}',
    privacy_settings JSON DEFAULT '{"profile_visible": true, "contact_allowed": true}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    UNIQUE KEY unique_user_settings (user_id),
    INDEX idx_user_settings_language_level (language_level),
    INDEX idx_user_settings_target_language (target_language),
    INDEX idx_user_settings_native_language (native_language)
);

-- 사용자 통계
CREATE TABLE user_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_sessions INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    total_matches INTEGER DEFAULT 0,
    successful_matches INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_session_date DATE,
    achievements JSON DEFAULT '[]',
    monthly_stats JSON DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    UNIQUE KEY unique_user_stats (user_id),
    INDEX idx_user_stats_rating (average_rating),
    INDEX idx_user_stats_streak (streak_days),
    INDEX idx_user_stats_sessions (total_sessions)
);

-- ====================
-- 2. OAuth 인증 관련 테이블
-- ====================

-- OAuth 제공자 정보
CREATE TABLE oauth_providers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('GOOGLE', 'NAVER', 'KAKAO', 'FACEBOOK', 'APPLE')),
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    provider_name VARCHAR(100),
    provider_avatar_url TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    scope VARCHAR(500),
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    provider_data JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    UNIQUE KEY unique_provider_user (provider, provider_user_id),
    INDEX idx_oauth_user_id (user_id),
    INDEX idx_oauth_provider (provider),
    INDEX idx_oauth_is_active (is_active),
    INDEX idx_oauth_is_primary (is_primary),
    INDEX idx_oauth_last_login (last_login_at)
);

-- 리프레시 토큰 관리
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP,
    device_info VARCHAR(500),
    ip_address VARCHAR(45),
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    INDEX idx_refresh_tokens_user_id (user_id),
    INDEX idx_refresh_tokens_expires_at (expires_at),
    INDEX idx_refresh_tokens_is_revoked (is_revoked),
    INDEX idx_refresh_tokens_ip (ip_address),
    INDEX idx_refresh_tokens_created_at (created_at)
);

-- ====================
-- 3. 세션 관련 테이블
-- ====================

-- 학습 세션
CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    session_type VARCHAR(20) DEFAULT 'LANGUAGE_EXCHANGE' CHECK (session_type IN ('LANGUAGE_EXCHANGE', 'TUTORING', 'GROUP_STUDY', 'CONVERSATION')),
    target_language VARCHAR(10) NOT NULL,
    skill_level VARCHAR(20) DEFAULT 'BEGINNER' CHECK (skill_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    max_participants INTEGER DEFAULT 2,
    current_participants INTEGER DEFAULT 0,
    scheduled_start_time TIMESTAMP NOT NULL,
    scheduled_end_time TIMESTAMP NOT NULL,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_by BIGINT NOT NULL REFERENCES users(id),
    session_settings JSON DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    INDEX idx_sessions_external_id (external_id),
    INDEX idx_sessions_status (status),
    INDEX idx_sessions_type (session_type),
    INDEX idx_sessions_language (target_language),
    INDEX idx_sessions_level (skill_level),
    INDEX idx_sessions_start_time (scheduled_start_time),
    INDEX idx_sessions_created_by (created_by),
    INDEX idx_sessions_created_at (created_at)
);

-- 세션 참가자
CREATE TABLE session_participants (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'PARTICIPANT' CHECK (role IN ('HOST', 'PARTICIPANT', 'OBSERVER')),
    status VARCHAR(20) DEFAULT 'JOINED' CHECK (status IN ('INVITED', 'JOINED', 'LEFT', 'REMOVED', 'COMPLETED')),
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    duration_minutes INTEGER DEFAULT 0,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    UNIQUE KEY unique_session_participant (session_id, user_id),
    INDEX idx_session_participants_user_id (user_id),
    INDEX idx_session_participants_status (status),
    INDEX idx_session_participants_role (role),
    INDEX idx_session_participants_rating (rating),
    INDEX idx_session_participants_joined_at (joined_at)
);

-- ====================
-- 4. 채팅 관련 테이블
-- ====================

-- 채팅방
CREATE TABLE chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200),
    room_type VARCHAR(20) DEFAULT 'DIRECT' CHECK (room_type IN ('DIRECT', 'GROUP', 'SESSION')),
    description TEXT,
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    room_settings JSON DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    INDEX idx_chat_rooms_external_id (external_id),
    INDEX idx_chat_rooms_type (room_type),
    INDEX idx_chat_rooms_is_active (is_active),
    INDEX idx_chat_rooms_last_message (last_message_at),
    INDEX idx_chat_rooms_created_by (created_by),
    INDEX idx_chat_rooms_created_at (created_at)
);

-- 채팅방 참가자
CREATE TABLE chat_room_participants (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MODERATOR', 'MEMBER')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LEFT', 'BANNED', 'MUTED')),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    last_read_at TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    notification_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    UNIQUE KEY unique_room_participant (room_id, user_id),
    INDEX idx_chat_participants_user_id (user_id),
    INDEX idx_chat_participants_status (status),
    INDEX idx_chat_participants_role (role),
    INDEX idx_chat_participants_joined_at (joined_at),
    INDEX idx_chat_participants_last_read (last_read_at)
);

-- 채팅 메시지
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id),
    message_type VARCHAR(20) DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'IMAGE', 'FILE', 'SYSTEM', 'EMOJI')),
    content TEXT NOT NULL,
    metadata JSON,
    reply_to_message_id BIGINT REFERENCES chat_messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    INDEX idx_chat_messages_room_id (room_id),
    INDEX idx_chat_messages_sender_id (sender_id),
    INDEX idx_chat_messages_type (message_type),
    INDEX idx_chat_messages_created_at (created_at),
    INDEX idx_chat_messages_reply_to (reply_to_message_id),
    INDEX idx_chat_messages_is_deleted (is_deleted)
);

-- ====================
-- 5. 알림 관련 테이블
-- ====================

-- 알림
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('MATCH_REQUEST', 'MATCH_ACCEPTED', 'SESSION_INVITATION', 'SESSION_REMINDER', 'NEW_MESSAGE', 'SYSTEM')),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    action_url VARCHAR(500),
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_expires_at (expires_at),
    INDEX idx_notifications_created_at (created_at)
);

-- ====================
-- 6. 트리거 및 함수
-- ====================

-- 업데이트 타임스탬프 자동 갱신을 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 모든 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_oauth_providers_updated_at BEFORE UPDATE ON oauth_providers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_refresh_tokens_updated_at BEFORE UPDATE ON refresh_tokens FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_session_participants_updated_at BEFORE UPDATE ON session_participants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chat_room_participants_updated_at BEFORE UPDATE ON chat_room_participants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 채팅방 참가자 수 업데이트 트리거
CREATE OR REPLACE FUNCTION update_chat_room_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'ACTIVE' THEN
        UPDATE chat_rooms SET current_participants = current_participants + 1 WHERE id = NEW.room_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'ACTIVE' AND NEW.status = 'ACTIVE' THEN
            UPDATE chat_rooms SET current_participants = current_participants + 1 WHERE id = NEW.room_id;
        ELSIF OLD.status = 'ACTIVE' AND NEW.status != 'ACTIVE' THEN
            UPDATE chat_rooms SET current_participants = current_participants - 1 WHERE id = NEW.room_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACTIVE' THEN
        UPDATE chat_rooms SET current_participants = current_participants - 1 WHERE id = OLD.room_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_room_participant_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON chat_room_participants
    FOR EACH ROW EXECUTE FUNCTION update_chat_room_participant_count();

-- 세션 참가자 수 업데이트 트리거
CREATE OR REPLACE FUNCTION update_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'JOINED' THEN
        UPDATE sessions SET current_participants = current_participants + 1 WHERE id = NEW.session_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'JOINED' AND NEW.status = 'JOINED' THEN
            UPDATE sessions SET current_participants = current_participants + 1 WHERE id = NEW.session_id;
        ELSIF OLD.status = 'JOINED' AND NEW.status != 'JOINED' THEN
            UPDATE sessions SET current_participants = current_participants - 1 WHERE id = NEW.session_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'JOINED' THEN
        UPDATE sessions SET current_participants = current_participants - 1 WHERE id = OLD.session_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_participant_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON session_participants
    FOR EACH ROW EXECUTE FUNCTION update_session_participant_count();

-- 채팅방 마지막 메시지 시간 업데이트 트리거
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE chat_rooms SET last_message_at = NEW.created_at WHERE id = NEW.room_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_room_last_message_trigger
    AFTER INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_room_last_message();

-- ====================
-- 7. 초기 데이터 및 뷰
-- ====================

-- 사용자 통계 뷰
CREATE VIEW v_user_stats_summary AS
SELECT 
    u.id,
    u.email,
    u.display_name,
    us.total_sessions,
    us.total_minutes,
    us.average_rating,
    us.streak_days,
    COUNT(sp.id) as participated_sessions,
    AVG(sp.rating) as given_rating
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
LEFT JOIN session_participants sp ON u.id = sp.user_id AND sp.status = 'COMPLETED'
GROUP BY u.id, u.email, u.display_name, us.total_sessions, us.total_minutes, us.average_rating, us.streak_days;

-- 활성 세션 뷰
CREATE VIEW v_active_sessions AS
SELECT 
    s.*,
    u.display_name as creator_name,
    COUNT(sp.id) as participant_count
FROM sessions s
JOIN users u ON s.created_by = u.id
LEFT JOIN session_participants sp ON s.id = sp.session_id AND sp.status = 'JOINED'
WHERE s.status IN ('SCHEDULED', 'ACTIVE')
GROUP BY s.id, u.display_name;

-- 채팅방 정보 뷰
CREATE VIEW v_chat_room_info AS
SELECT 
    cr.*,
    u.display_name as creator_name,
    COUNT(crp.id) as member_count,
    MAX(cm.created_at) as last_message_time
FROM chat_rooms cr
LEFT JOIN users u ON cr.created_by = u.id
LEFT JOIN chat_room_participants crp ON cr.id = crp.room_id AND crp.status = 'ACTIVE'
LEFT JOIN chat_messages cm ON cr.id = cm.room_id AND cm.is_deleted = FALSE
GROUP BY cr.id, u.display_name;

-- ====================
-- 8. 인덱스 최적화
-- ====================

-- 복합 인덱스 추가 (성능 최적화용)
CREATE INDEX idx_sessions_status_start_time ON sessions(status, scheduled_start_time);
CREATE INDEX idx_chat_messages_room_created ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_session_participants_user_status ON session_participants(user_id, status);
CREATE INDEX idx_oauth_user_provider_active ON oauth_providers(user_id, provider, is_active);

-- 부분 인덱스 (조건부 인덱스로 성능 향상)
CREATE INDEX idx_active_refresh_tokens ON refresh_tokens(user_id, expires_at) WHERE is_revoked = FALSE;
CREATE INDEX idx_unread_notifications ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_active_chat_rooms ON chat_rooms(room_type, created_at DESC) WHERE is_active = TRUE;

COMMENT ON DATABASE studymate IS 'STUDYMATE - Language Exchange Learning Platform Database';