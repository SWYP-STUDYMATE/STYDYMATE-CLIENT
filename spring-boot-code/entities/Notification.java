package com.studymate.server.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId; // 알림 받는 사용자 ID

    @Column(name = "sender_user_id")
    private Long senderUserId; // 알림을 발생시킨 사용자 ID (있는 경우)

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @Column(name = "title", nullable = false)
    private String title; // 알림 제목

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message; // 알림 내용

    @Column(name = "action_url")
    private String actionUrl; // 알림 클릭 시 이동할 URL

    @Column(name = "related_entity_type")
    private String relatedEntityType; // 관련된 엔티티 타입 (Session, ChatRoom, User 등)

    @Column(name = "related_entity_id")
    private Long relatedEntityId; // 관련된 엔티티 ID

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false; // 읽음 여부

    @Column(name = "read_at")
    private LocalDateTime readAt; // 읽은 시간

    @Column(name = "is_pushed", nullable = false)
    private Boolean isPushed = false; // 푸시 알림 전송 여부

    @Column(name = "pushed_at")
    private LocalDateTime pushedAt; // 푸시 전송 시간

    @Column(name = "is_emailed", nullable = false)
    private Boolean isEmailed = false; // 이메일 전송 여부

    @Column(name = "emailed_at")
    private LocalDateTime emailedAt; // 이메일 전송 시간

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private NotificationPriority priority = NotificationPriority.NORMAL;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt; // 만료 시간

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata; // 추가 메타데이터 (JSON 객체)

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt; // 예약 전송 시간 (있는 경우)

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0; // 재시도 횟수 (푸시/이메일 실패 시)

    @Column(name = "max_retries", nullable = false)
    private Integer maxRetries = 3; // 최대 재시도 횟수

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 비즈니스 메서드들

    // 알림 읽음 처리
    public void markAsRead() {
        if (!this.isRead) {
            this.isRead = true;
            this.readAt = LocalDateTime.now();
        }
    }

    // 알림 읽지 않음으로 표시
    public void markAsUnread() {
        this.isRead = false;
        this.readAt = null;
    }

    // 푸시 알림 전송 완료 처리
    public void markAsPushed() {
        this.isPushed = true;
        this.pushedAt = LocalDateTime.now();
    }

    // 이메일 전송 완료 처리
    public void markAsEmailed() {
        this.isEmailed = true;
        this.emailedAt = LocalDateTime.now();
    }

    // 알림 삭제 (소프트 삭제)
    public void delete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    // 재시도 횟수 증가
    public boolean incrementRetryCount() {
        this.retryCount++;
        return this.retryCount <= this.maxRetries;
    }

    // 만료 여부 확인
    public boolean isExpired() {
        return this.expiresAt != null && this.expiresAt.isBefore(LocalDateTime.now());
    }

    // 예약 알림인지 확인
    public boolean isScheduled() {
        return this.scheduledAt != null && this.scheduledAt.isAfter(LocalDateTime.now());
    }

    // 전송 준비 완료 여부 확인
    public boolean isReadyToSend() {
        return !this.isDeleted && 
               (this.scheduledAt == null || !this.scheduledAt.isAfter(LocalDateTime.now())) &&
               !isExpired();
    }

    // 재시도 가능 여부 확인
    public boolean canRetry() {
        return this.retryCount < this.maxRetries;
    }

    // 중요 알림 여부 확인
    public boolean isHighPriority() {
        return this.priority == NotificationPriority.HIGH || this.priority == NotificationPriority.URGENT;
    }

    // 알림 타입별 기본 만료 시간 설정
    public void setDefaultExpiration() {
        if (this.expiresAt == null) {
            switch (this.type) {
                case SYSTEM_MAINTENANCE:
                case SYSTEM_UPDATE:
                    this.expiresAt = LocalDateTime.now().plusDays(1);
                    break;
                case SESSION_REMINDER:
                case SESSION_STARTING_SOON:
                    this.expiresAt = LocalDateTime.now().plusHours(2);
                    break;
                case MATCH_REQUEST:
                case FRIEND_REQUEST:
                    this.expiresAt = LocalDateTime.now().plusDays(7);
                    break;
                case CHAT_MESSAGE:
                    this.expiresAt = LocalDateTime.now().plusDays(3);
                    break;
                default:
                    this.expiresAt = LocalDateTime.now().plusDays(30);
                    break;
            }
        }
    }

    // 알림 내용 포맷팅
    public String getFormattedMessage() {
        if (this.senderUserId != null && this.type.requiresSender()) {
            return String.format("[%s] %s", this.type.getDisplayName(), this.message);
        }
        return this.message;
    }

    // 액션 URL 생성 (기본값)
    public void generateActionUrl() {
        if (this.actionUrl == null && this.relatedEntityType != null && this.relatedEntityId != null) {
            switch (this.relatedEntityType.toLowerCase()) {
                case "session":
                    this.actionUrl = "/sessions/" + this.relatedEntityId;
                    break;
                case "chatroom":
                    this.actionUrl = "/chat/" + this.relatedEntityId;
                    break;
                case "user":
                    this.actionUrl = "/profile/" + this.relatedEntityId;
                    break;
                case "match":
                    this.actionUrl = "/matching/" + this.relatedEntityId;
                    break;
                default:
                    this.actionUrl = "/notifications/" + this.id;
                    break;
            }
        }
    }

    // 알림 우선순위에 따른 색상 코드 반환
    public String getPriorityColor() {
        switch (this.priority) {
            case URGENT:
                return "#FF4444"; // 빨강
            case HIGH:
                return "#FF8800"; // 주황
            case NORMAL:
                return "#00C471"; // 초록 (브랜드 컬러)
            case LOW:
                return "#888888"; // 회색
            default:
                return "#00C471";
        }
    }
}

// 알림 타입 열거형
enum NotificationType {
    // 세션 관련
    SESSION_INVITATION("세션 초대", true),
    SESSION_REMINDER("세션 리마인더", false),
    SESSION_STARTING_SOON("세션 시작 임박", false),
    SESSION_CANCELLED("세션 취소", true),
    SESSION_COMPLETED("세션 완료", false),
    SESSION_RATING_REQUEST("세션 평가 요청", false),

    // 채팅 관련
    CHAT_MESSAGE("채팅 메시지", true),
    CHAT_ROOM_INVITATION("채팅방 초대", true),
    CHAT_MENTION("채팅 멘션", true),

    // 매칭 관련
    MATCH_REQUEST("매칭 요청", true),
    MATCH_ACCEPTED("매칭 수락", true),
    MATCH_DECLINED("매칭 거절", true),
    MATCH_FOUND("매칭 성공", false),

    // 소셜 관련
    FRIEND_REQUEST("친구 요청", true),
    FRIEND_ACCEPTED("친구 수락", true),
    FOLLOW("팔로우", true),
    PROFILE_VIEW("프로필 조회", true),

    // 학습 관련
    STREAK_ACHIEVEMENT("연속 학습 달성", false),
    LEVEL_UP("레벨 업", false),
    BADGE_EARNED("뱃지 획득", false),
    MILESTONE_REACHED("마일스톤 달성", false),

    // 시스템 관련
    SYSTEM_ANNOUNCEMENT("시스템 공지", false),
    SYSTEM_MAINTENANCE("시스템 점검", false),
    SYSTEM_UPDATE("시스템 업데이트", false),
    ACCOUNT_SECURITY("계정 보안", false),

    // 기타
    FEEDBACK_REQUEST("피드백 요청", false),
    SURVEY_INVITATION("설문 참여", false),
    PROMOTION("프로모션", false),
    REMINDER("리마인더", false);

    private final String displayName;
    private final boolean requiresSender;

    NotificationType(String displayName, boolean requiresSender) {
        this.displayName = displayName;
        this.requiresSender = requiresSender;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean requiresSender() {
        return requiresSender;
    }
}

// 알림 우선순위 열거형
enum NotificationPriority {
    URGENT("긴급", 4),
    HIGH("높음", 3),
    NORMAL("보통", 2),
    LOW("낮음", 1);

    private final String displayName;
    private final int level;

    NotificationPriority(String displayName, int level) {
        this.displayName = displayName;
        this.level = level;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getLevel() {
        return level;
    }
}