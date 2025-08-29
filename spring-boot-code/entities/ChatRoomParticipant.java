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
@Table(name = "chat_room_participants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatRoomParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chat_room_id", nullable = false)
    private Long chatRoomId; // 채팅방 ID

    @Column(name = "user_id", nullable = false)
    private Long userId; // 참가자 ID

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private ParticipantRole role = ParticipantRole.MEMBER;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ParticipantStatus status = ParticipantStatus.ACTIVE;

    @Column(name = "nickname")
    private String nickname; // 채팅방 내 별명

    @Column(name = "last_read_message_id")
    private Long lastReadMessageId; // 마지막 읽은 메시지 ID

    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt; // 마지막 읽은 시간

    @Column(name = "notifications_enabled", nullable = false)
    private Boolean notificationsEnabled = true; // 알림 활성화 여부

    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned = false; // 채팅방 상단 고정 여부

    @Column(name = "is_archived", nullable = false)
    private Boolean isArchived = false; // 개인 보관 여부

    @Column(name = "is_muted", nullable = false)
    private Boolean isMuted = false; // 음소거 여부

    @Column(name = "muted_until")
    private LocalDateTime mutedUntil; // 음소거 해제 시간

    @Column(name = "joined_at")
    private LocalDateTime joinedAt; // 참가 시간

    @Column(name = "left_at")
    private LocalDateTime leftAt; // 탈퇴 시간

    @Column(name = "invited_by_user_id")
    private Long invitedByUserId; // 초대한 사용자 ID

    @Column(name = "invitation_accepted_at")
    private LocalDateTime invitationAcceptedAt; // 초대 수락 시간

    @Column(name = "message_count", nullable = false)
    private Long messageCount = 0L; // 보낸 메시지 수

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt; // 마지막 활동 시간

    @Column(name = "preferences", columnDefinition = "JSON")
    private String preferences; // 개인 설정 (JSON 객체)

    @Column(name = "permissions", columnDefinition = "JSON")
    private String permissions; // 권한 설정 (JSON 객체)

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 관계 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", insertable = false, updatable = false)
    private ChatRoom chatRoom;

    // 비즈니스 메서드들

    // 초대 수락
    public void acceptInvitation() {
        if (this.status != ParticipantStatus.INVITED) {
            throw new RuntimeException("초대 상태가 아닙니다.");
        }
        this.status = ParticipantStatus.ACTIVE;
        this.invitationAcceptedAt = LocalDateTime.now();
        this.joinedAt = LocalDateTime.now();
        this.lastActivityAt = LocalDateTime.now();
    }

    // 초대 거절
    public void declineInvitation() {
        if (this.status != ParticipantStatus.INVITED) {
            throw new RuntimeException("초대 상태가 아닙니다.");
        }
        this.status = ParticipantStatus.DECLINED;
    }

    // 채팅방 떠나기
    public void leaveChatRoom() {
        if (this.status == ParticipantStatus.LEFT) {
            throw new RuntimeException("이미 탈퇴한 참가자입니다.");
        }
        this.status = ParticipantStatus.LEFT;
        this.leftAt = LocalDateTime.now();
    }

    // 참가자 추방
    public void kickOut(Long kickedByUserId) {
        if (this.status == ParticipantStatus.LEFT || this.status == ParticipantStatus.KICKED) {
            throw new RuntimeException("이미 탈퇴하거나 추방된 참가자입니다.");
        }
        this.status = ParticipantStatus.KICKED;
        this.leftAt = LocalDateTime.now();
        // 로그 기록 등 추가 처리 가능
    }

    // 역할 변경
    public void changeRole(ParticipantRole newRole) {
        if (this.status != ParticipantStatus.ACTIVE) {
            throw new RuntimeException("활성 참가자만 역할을 변경할 수 있습니다.");
        }
        this.role = newRole;
    }

    // 메시지 읽음 표시
    public void markMessageAsRead(Long messageId) {
        if (messageId != null && (this.lastReadMessageId == null || messageId > this.lastReadMessageId)) {
            this.lastReadMessageId = messageId;
            this.lastReadAt = LocalDateTime.now();
            this.lastActivityAt = LocalDateTime.now();
        }
    }

    // 메시지 전송 시 호출
    public void incrementMessageCount() {
        this.messageCount++;
        this.lastActivityAt = LocalDateTime.now();
    }

    // 알림 토글
    public void toggleNotifications() {
        this.notificationsEnabled = !this.notificationsEnabled;
    }

    // 음소거 설정
    public void mute(Integer hours) {
        this.isMuted = true;
        if (hours != null && hours > 0) {
            this.mutedUntil = LocalDateTime.now().plusHours(hours);
        }
    }

    // 음소거 해제
    public void unmute() {
        this.isMuted = false;
        this.mutedUntil = null;
    }

    // 채팅방 고정
    public void pinChatRoom() {
        this.isPinned = true;
    }

    // 채팅방 고정 해제
    public void unpinChatRoom() {
        this.isPinned = false;
    }

    // 채팅방 보관
    public void archiveChatRoom() {
        this.isArchived = true;
    }

    // 채팅방 보관 해제
    public void unarchiveChatRoom() {
        this.isArchived = false;
    }

    // 활성 참가자 여부 확인
    public boolean isActiveParticipant() {
        return this.status == ParticipantStatus.ACTIVE;
    }

    // 관리자 여부 확인
    public boolean isAdmin() {
        return this.role == ParticipantRole.ADMIN;
    }

    // 모더레이터 여부 확인
    public boolean isModerator() {
        return this.role == ParticipantRole.MODERATOR || this.role == ParticipantRole.ADMIN;
    }

    // 초대 대기 중 여부 확인
    public boolean isPendingInvitation() {
        return this.status == ParticipantStatus.INVITED;
    }

    // 읽지 않은 메시지 확인 가능 여부
    public boolean canCheckUnreadMessages() {
        return this.lastReadMessageId != null && this.lastReadAt != null;
    }

    // 메시지 전송 가능 여부 확인
    public boolean canSendMessage() {
        return this.status == ParticipantStatus.ACTIVE && 
               (!this.isMuted || (this.mutedUntil != null && this.mutedUntil.isBefore(LocalDateTime.now())));
    }

    // 최근 활동 여부 확인 (24시간 내)
    public boolean isRecentlyActive() {
        return this.lastActivityAt != null && 
               this.lastActivityAt.isAfter(LocalDateTime.now().minusDays(1));
    }

    // 장기간 비활성 여부 확인 (30일 이상)
    public boolean isLongTermInactive() {
        return this.lastActivityAt != null && 
               this.lastActivityAt.isBefore(LocalDateTime.now().minusDays(30));
    }
}

// 참가자 역할 열거형
enum ParticipantRole {
    MEMBER("일반 멤버"),
    MODERATOR("모더레이터"),
    ADMIN("관리자"),
    OWNER("소유자");

    private final String description;

    ParticipantRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

// 참가자 상태 열거형
enum ParticipantStatus {
    INVITED("초대됨"),
    ACTIVE("활성"),
    LEFT("탈퇴"),
    KICKED("추방됨"),
    DECLINED("초대 거절"),
    BANNED("차단됨");

    private final String description;

    ParticipantStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}