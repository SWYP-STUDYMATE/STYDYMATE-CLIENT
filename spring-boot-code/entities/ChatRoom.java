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
import java.util.List;

@Entity
@Table(name = "chat_rooms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_uuid", nullable = false, unique = true)
    private String roomUuid; // UUID for external reference

    @Column(name = "name")
    private String name; // 채팅방 이름 (그룹 채팅용)

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false)
    private ChatRoomType roomType = ChatRoomType.PRIVATE;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // 채팅방 설명

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId; // 채팅방 생성자

    @Column(name = "max_participants")
    private Integer maxParticipants = 2; // 최대 참가자 수 (1:1은 2명, 그룹은 제한 없음)

    @Column(name = "current_participants", nullable = false)
    private Integer currentParticipants = 0; // 현재 참가자 수

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // 채팅방 활성 상태

    @Column(name = "is_archived", nullable = false)
    private Boolean isArchived = false; // 보관됨 여부

    @Column(name = "language_focus")
    private String languageFocus; // 주요 학습 언어

    @Column(name = "last_message_id")
    private Long lastMessageId; // 마지막 메시지 ID

    @Column(name = "last_message_content")
    private String lastMessageContent; // 마지막 메시지 내용 (미리보기용)

    @Column(name = "last_message_sender_id")
    private Long lastMessageSenderId; // 마지막 메시지 발송자 ID

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt; // 마지막 메시지 시간

    @Column(name = "unread_count", nullable = false)
    private Integer unreadCount = 0; // 읽지 않은 메시지 수

    @Column(name = "session_id")
    private Long sessionId; // 연결된 세션 ID (세션 기반 채팅인 경우)

    @Column(name = "matching_request_id")
    private Long matchingRequestId; // 연결된 매칭 요청 ID

    @Column(name = "tags", columnDefinition = "JSON")
    private String tags; // 채팅방 태그들 (JSON 배열)

    @Column(name = "settings", columnDefinition = "JSON")
    private String settings; // 채팅방 설정 (JSON 객체)

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 양방향 관계 (필요 시)
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChatMessage> messages;

    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChatRoomParticipant> participants;

    // 비즈니스 메서드들

    // 참가자 추가
    public void addParticipant() {
        if (this.roomType == ChatRoomType.PRIVATE && this.currentParticipants >= 2) {
            throw new RuntimeException("1:1 채팅방은 2명까지만 참가할 수 있습니다.");
        }
        if (this.maxParticipants != null && this.currentParticipants >= this.maxParticipants) {
            throw new RuntimeException("최대 참가자 수를 초과했습니다.");
        }
        this.currentParticipants++;
    }

    // 참가자 제거
    public void removeParticipant() {
        if (this.currentParticipants > 0) {
            this.currentParticipants--;
        }
        
        // 모든 참가자가 나가면 비활성화
        if (this.currentParticipants == 0) {
            this.isActive = false;
        }
    }

    // 마지막 메시지 업데이트
    public void updateLastMessage(Long messageId, String content, Long senderId, LocalDateTime timestamp) {
        this.lastMessageId = messageId;
        this.lastMessageContent = content.length() > 100 ? content.substring(0, 100) + "..." : content;
        this.lastMessageSenderId = senderId;
        this.lastMessageAt = timestamp;
    }

    // 읽지 않은 메시지 수 증가
    public void incrementUnreadCount() {
        this.unreadCount++;
    }

    // 읽지 않은 메시지 수 초기화
    public void resetUnreadCount() {
        this.unreadCount = 0;
    }

    // 채팅방 보관
    public void archive() {
        this.isArchived = true;
        this.isActive = false;
    }

    // 채팅방 보관 해제
    public void unarchive() {
        this.isArchived = false;
        this.isActive = true;
    }

    // 채팅방 비활성화
    public void deactivate() {
        this.isActive = false;
    }

    // 채팅방 활성화
    public void activate() {
        this.isActive = true;
        this.isArchived = false;
    }

    // 1:1 채팅방 여부 확인
    public boolean isPrivateChat() {
        return this.roomType == ChatRoomType.PRIVATE;
    }

    // 그룹 채팅방 여부 확인
    public boolean isGroupChat() {
        return this.roomType == ChatRoomType.GROUP;
    }

    // 세션 채팅방 여부 확인
    public boolean isSessionChat() {
        return this.roomType == ChatRoomType.SESSION;
    }

    // 참가 가능 여부 확인
    public boolean canJoin() {
        return this.isActive && !this.isArchived && 
               (this.maxParticipants == null || this.currentParticipants < this.maxParticipants);
    }

    // 활성 상태 확인
    public boolean isActiveRoom() {
        return this.isActive && !this.isArchived;
    }
}

// 채팅방 타입 열거형
enum ChatRoomType {
    PRIVATE("1:1 채팅"),
    GROUP("그룹 채팅"),
    SESSION("세션 채팅"),
    ANNOUNCEMENT("공지 채팅");

    private final String description;

    ChatRoomType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}