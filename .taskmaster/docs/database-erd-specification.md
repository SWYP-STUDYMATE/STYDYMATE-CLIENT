# 데이터베이스 ERD 명세서

## 📌 문서 정보
- **작성일**: 2025년 8월 8일  
- **버전**: 1.0.0
- **목적**: STUDYMATE 플랫폼의 전체 데이터베이스 구조 정의

## 1. 기존 테이블 (유지)

### 1.1 사용자 관련
#### USERS
- 사용자 기본 정보 관리
- 소셜 로그인, 프로필, 온보딩 정보 저장

#### Location
- 사용자 위치 정보 (국가, 도시, 시간대)

#### Language
- 지원 언어 목록 (한국어, 영어, 일본어 등)

#### notification
- 사용자 알림 정보

### 1.2 온보딩 관련
#### Onboard_Lang_level
- 사용자의 언어별 레벨 정보

#### Lang_level_type
- 언어 레벨 타입 (A1, A2, B1, B2, C1, C2)

#### Motivation
- 학습 동기 유형

#### Onboard_Motivation
- 사용자별 학습 동기

#### Topic
- 관심 주제 목록

#### Onboard_Topic
- 사용자별 관심 주제

#### partner_personnality
- 파트너 성향 유형

#### Onboard_partner
- 사용자의 선호 파트너 성향

#### Learning_Style
- 학습 스타일 유형

#### Onboard_Learning_Style
- 사용자별 학습 스타일

#### Group_size
- 선호 그룹 크기

#### Onboard_Group_SIZE
- 사용자별 선호 그룹 크기

#### Onboard_Schedule
- 사용자의 가능한 학습 일정

### 1.3 채팅 관련
#### chat_room
- 채팅방 정보

#### chat_participant
- 채팅방 참가자

#### chat_message
- 채팅 메시지

#### message_read_status
- 메시지 읽음 상태

## 2. 신규 테이블 (추가 필요)

### 2.1 레벨 테스트 관련

#### level_test
```sql
CREATE TABLE `level_test` (
    `test_id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `user_id` UUID NOT NULL,
    `test_type` ENUM('full', 'speaking', 'quick') NOT NULL,
    `status` ENUM('in_progress', 'completed', 'cancelled') NOT NULL,
    `started_at` DATETIME NOT NULL,
    `completed_at` DATETIME NULL,
    `overall_level` VARCHAR(10) NULL, -- 최종 레벨 (B1, B2 등)
    `cefr_level` VARCHAR(10) NULL,
    FOREIGN KEY (`user_id`) REFERENCES `USERS`(`user_id`)
);
```

#### level_test_question
```sql
CREATE TABLE `level_test_question` (
    `question_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `test_id` VARCHAR(255) NOT NULL,
    `question_number` INT NOT NULL,
    `question_type` ENUM('multiple_choice', 'speaking', 'listening', 'writing') NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `question_text` TEXT NOT NULL,
    `options` JSON NULL, -- 객관식 선택지
    `time_limit` INT NULL, -- 초 단위
    `user_answer` TEXT NULL,
    `audio_file_url` VARCHAR(500) NULL, -- 음성 답변 파일
    `time_spent` INT NULL,
    `is_correct` BOOLEAN NULL,
    FOREIGN KEY (`test_id`) REFERENCES `level_test`(`test_id`)
);
```

#### level_test_result
```sql
CREATE TABLE `level_test_result` (
    `result_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `test_id` VARCHAR(255) NOT NULL,
    `skill_type` ENUM('speaking', 'listening', 'reading', 'writing', 'grammar', 'vocabulary') NOT NULL,
    `score` INT NOT NULL, -- 0-100
    `level` VARCHAR(10) NOT NULL,
    `strengths` JSON NULL, -- 강점 목록
    `improvements` JSON NULL, -- 개선점 목록
    FOREIGN KEY (`test_id`) REFERENCES `level_test`(`test_id`)
);
```

#### level_test_feedback
```sql
CREATE TABLE `level_test_feedback` (
    `feedback_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `test_id` VARCHAR(255) NOT NULL,
    `recommendations` JSON NOT NULL, -- AI 추천사항
    `suggested_partners` JSON NULL, -- 추천 파트너 ID 목록
    `learning_path` JSON NULL, -- 추천 학습 경로
    FOREIGN KEY (`test_id`) REFERENCES `level_test`(`test_id`)
);
```

### 2.2 매칭 시스템 관련

#### matching_request
```sql
CREATE TABLE `matching_request` (
    `request_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `requester_id` UUID NOT NULL,
    `target_user_id` UUID NOT NULL,
    `message` TEXT NULL,
    `status` ENUM('pending', 'accepted', 'rejected', 'expired', 'cancelled') NOT NULL,
    `compatibility_score` INT NULL, -- 0-100
    `created_at` DATETIME NOT NULL,
    `responded_at` DATETIME NULL,
    `expires_at` DATETIME NOT NULL,
    FOREIGN KEY (`requester_id`) REFERENCES `USERS`(`user_id`),
    FOREIGN KEY (`target_user_id`) REFERENCES `USERS`(`user_id`)
);
```

#### user_compatibility
```sql
CREATE TABLE `user_compatibility` (
    `compatibility_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user1_id` UUID NOT NULL,
    `user2_id` UUID NOT NULL,
    `overall_score` INT NOT NULL, -- 0-100
    `language_match_score` INT NOT NULL,
    `schedule_match_score` INT NOT NULL,
    `interest_match_score` INT NOT NULL,
    `learning_style_match_score` INT NOT NULL,
    `calculated_at` DATETIME NOT NULL,
    FOREIGN KEY (`user1_id`) REFERENCES `USERS`(`user_id`),
    FOREIGN KEY (`user2_id`) REFERENCES `USERS`(`user_id`),
    UNIQUE KEY `unique_user_pair` (`user1_id`, `user2_id`)
);
```

#### user_block
```sql
CREATE TABLE `user_block` (
    `block_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `blocker_id` UUID NOT NULL,
    `blocked_id` UUID NOT NULL,
    `reason` VARCHAR(255) NULL,
    `blocked_at` DATETIME NOT NULL,
    FOREIGN KEY (`blocker_id`) REFERENCES `USERS`(`user_id`),
    FOREIGN KEY (`blocked_id`) REFERENCES `USERS`(`user_id`),
    UNIQUE KEY `unique_block` (`blocker_id`, `blocked_id`)
);
```

### 2.3 세션 관리 관련

#### learning_session
```sql
CREATE TABLE `learning_session` (
    `session_id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `host_id` UUID NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `session_type` ENUM('video', 'audio', 'text') NOT NULL,
    `status` ENUM('scheduled', 'ongoing', 'completed', 'cancelled') NOT NULL,
    `scheduled_at` DATETIME NOT NULL,
    `started_at` DATETIME NULL,
    `ended_at` DATETIME NULL,
    `duration_minutes` INT NOT NULL,
    `max_participants` INT NOT NULL DEFAULT 2,
    `languages` JSON NOT NULL, -- 사용 언어 목록
    `language_rotation` JSON NULL, -- 언어별 시간 배분
    `level_range` JSON NULL, -- 참가 가능 레벨 범위
    `room_id` VARCHAR(255) NULL, -- WebRTC 룸 ID
    `created_at` DATETIME NOT NULL,
    FOREIGN KEY (`host_id`) REFERENCES `USERS`(`user_id`)
);
```

#### session_participant
```sql
CREATE TABLE `session_participant` (
    `participant_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `session_id` VARCHAR(255) NOT NULL,
    `user_id` UUID NOT NULL,
    `status` ENUM('invited', 'confirmed', 'joined', 'left', 'no_show') NOT NULL,
    `joined_at` DATETIME NULL,
    `left_at` DATETIME NULL,
    `peer_id` VARCHAR(255) NULL, -- WebRTC peer ID
    `audio_enabled` BOOLEAN DEFAULT TRUE,
    `video_enabled` BOOLEAN DEFAULT FALSE,
    `speaking_time_seconds` INT DEFAULT 0,
    FOREIGN KEY (`session_id`) REFERENCES `learning_session`(`session_id`),
    FOREIGN KEY (`user_id`) REFERENCES `USERS`(`user_id`),
    UNIQUE KEY `unique_participant` (`session_id`, `user_id`)
);
```

#### session_recording
```sql
CREATE TABLE `session_recording` (
    `recording_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `session_id` VARCHAR(255) NOT NULL,
    `recording_url` VARCHAR(500) NOT NULL,
    `transcript` JSON NULL, -- 대화 내용 텍스트
    `duration_seconds` INT NOT NULL,
    `file_size_mb` DECIMAL(10,2) NOT NULL,
    `created_at` DATETIME NOT NULL,
    FOREIGN KEY (`session_id`) REFERENCES `learning_session`(`session_id`)
);
```

#### session_feedback
```sql
CREATE TABLE `session_feedback` (
    `feedback_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `session_id` VARCHAR(255) NOT NULL,
    `user_id` UUID NOT NULL,
    `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    `grammar_score` INT NULL,
    `vocabulary_score` INT NULL,
    `fluency_score` INT NULL,
    `pronunciation_score` INT NULL,
    `ai_analysis` JSON NULL, -- AI 분석 결과
    `mistakes` JSON NULL, -- 실수 목록
    `suggestions` JSON NULL, -- 개선 제안
    `comment` TEXT NULL,
    `created_at` DATETIME NOT NULL,
    FOREIGN KEY (`session_id`) REFERENCES `learning_session`(`session_id`),
    FOREIGN KEY (`user_id`) REFERENCES `USERS`(`user_id`),
    UNIQUE KEY `unique_feedback` (`session_id`, `user_id`)
);
```

### 2.4 학습 통계 관련

#### user_statistics
```sql
CREATE TABLE `user_statistics` (
    `stat_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` UUID NOT NULL,
    `stat_date` DATE NOT NULL,
    `total_study_minutes` INT DEFAULT 0,
    `speaking_minutes` INT DEFAULT 0,
    `messages_sent` INT DEFAULT 0,
    `sessions_completed` INT DEFAULT 0,
    `words_learned` INT DEFAULT 0,
    `streak_days` INT DEFAULT 0,
    `updated_at` DATETIME NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `USERS`(`user_id`),
    UNIQUE KEY `unique_user_date` (`user_id`, `stat_date`)
);
```

#### achievement
```sql
CREATE TABLE `achievement` (
    `achievement_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `icon_url` VARCHAR(500) NULL,
    `category` VARCHAR(50) NOT NULL,
    `points` INT NOT NULL,
    `requirement` JSON NOT NULL -- 달성 조건
);
```

#### user_achievement
```sql
CREATE TABLE `user_achievement` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` UUID NOT NULL,
    `achievement_id` INT NOT NULL,
    `earned_at` DATETIME NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `USERS`(`user_id`),
    FOREIGN KEY (`achievement_id`) REFERENCES `achievement`(`achievement_id`),
    UNIQUE KEY `unique_user_achievement` (`user_id`, `achievement_id`)
);
```

### 2.5 AI 대화 분석 관련

#### conversation_analysis
```sql
CREATE TABLE `conversation_analysis` (
    `analysis_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `session_id` VARCHAR(255) NULL,
    `chat_room_id` UUID NULL,
    `user_id` UUID NOT NULL,
    `analysis_type` ENUM('session', 'chat', 'practice') NOT NULL,
    `transcript` JSON NOT NULL, -- 대화 내용
    `grammar_score` INT NOT NULL,
    `vocabulary_level` VARCHAR(10) NOT NULL,
    `fluency_score` INT NOT NULL,
    `mistakes` JSON NULL,
    `corrections` JSON NULL,
    `suggestions` JSON NULL,
    `analyzed_at` DATETIME NOT NULL,
    FOREIGN KEY (`session_id`) REFERENCES `learning_session`(`session_id`),
    FOREIGN KEY (`chat_room_id`) REFERENCES `chat_room`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `USERS`(`user_id`)
);
```

#### topic_suggestion
```sql
CREATE TABLE `topic_suggestion` (
    `suggestion_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `session_id` VARCHAR(255) NULL,
    `chat_room_id` UUID NULL,
    `title` VARCHAR(255) NOT NULL,
    `level` VARCHAR(20) NOT NULL,
    `questions` JSON NOT NULL, -- 대화 질문 목록
    `vocabulary` JSON NOT NULL, -- 관련 어휘
    `participants` JSON NOT NULL, -- 참여자 ID 목록
    `created_at` DATETIME NOT NULL,
    `used_at` DATETIME NULL,
    FOREIGN KEY (`session_id`) REFERENCES `learning_session`(`session_id`),
    FOREIGN KEY (`chat_room_id`) REFERENCES `chat_room`(`id`)
);
```

## 3. 인덱스 전략

### 성능 최적화를 위한 인덱스
```sql
-- 자주 조회되는 컬럼들
CREATE INDEX idx_level_test_user ON level_test(user_id, status);
CREATE INDEX idx_matching_request_status ON matching_request(status, created_at);
CREATE INDEX idx_session_scheduled ON learning_session(scheduled_at, status);
CREATE INDEX idx_user_stats_date ON user_statistics(user_id, stat_date DESC);
CREATE INDEX idx_conversation_analysis_user ON conversation_analysis(user_id, analyzed_at DESC);

-- 복합 인덱스
CREATE INDEX idx_session_participant_status ON session_participant(session_id, status);
CREATE INDEX idx_compatibility_users ON user_compatibility(user1_id, user2_id, overall_score DESC);
```

## 4. 제약 조건 및 트리거

### 데이터 무결성 보장
```sql
-- 매칭 요청 중복 방지
ALTER TABLE matching_request 
ADD CONSTRAINT unique_active_request 
UNIQUE KEY (requester_id, target_user_id, status)
WHERE status IN ('pending');

-- 세션 참가자 수 제한 트리거
DELIMITER //
CREATE TRIGGER check_max_participants
BEFORE INSERT ON session_participant
FOR EACH ROW
BEGIN
    DECLARE participant_count INT;
    DECLARE max_allowed INT;
    
    SELECT COUNT(*), ls.max_participants INTO participant_count, max_allowed
    FROM session_participant sp
    JOIN learning_session ls ON sp.session_id = ls.session_id
    WHERE sp.session_id = NEW.session_id
    AND sp.status IN ('confirmed', 'joined');
    
    IF participant_count >= max_allowed THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Session is full';
    END IF;
END//
DELIMITER ;
```

## 5. 데이터 마이그레이션 계획

### 단계별 마이그레이션
1. **Phase 1**: 레벨 테스트 관련 테이블 생성
2. **Phase 2**: 매칭 시스템 테이블 생성
3. **Phase 3**: 세션 관리 테이블 생성
4. **Phase 4**: 통계 및 분석 테이블 생성
5. **Phase 5**: 인덱스 및 제약조건 적용

## 6. 관계 다이어그램 요약

### 주요 관계
1. **USERS** ← 모든 사용자 관련 테이블의 중심
2. **learning_session** ← session_participant, session_recording, session_feedback
3. **level_test** ← level_test_question, level_test_result, level_test_feedback
4. **chat_room** ← chat_message, chat_participant, conversation_analysis
5. **matching_request** ↔ user_compatibility ↔ user_block

## 7. 추가 고려사항

### 향후 확장 가능성
- **결제 시스템**: payment, subscription 테이블
- **콘텐츠 관리**: learning_material, lesson 테이블
- **커뮤니티**: forum, post, comment 테이블
- **게이미피케이션**: badge, level, reward 테이블