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
@Table(name = "chat_messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chat_room_id", nullable = false)
    private Long chatRoomId;

    @Column(name = "sender_user_id", nullable = false)
    private Long senderUserId;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content; // 메시지 내용

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    private MessageType messageType = MessageType.TEXT;

    @Column(name = "original_language")
    private String originalLanguage; // 원문 언어

    @Column(name = "translated_content", columnDefinition = "JSON")
    private String translatedContent; // 번역된 내용들 (JSON 객체)

    @Column(name = "reply_to_message_id")
    private Long replyToMessageId; // 답글 대상 메시지 ID

    @Column(name = "file_url")
    private String fileUrl; // 첨부 파일 URL

    @Column(name = "file_name")
    private String fileName; // 첨부 파일 이름

    @Column(name = "file_size")
    private Long fileSize; // 첨부 파일 크기 (bytes)

    @Column(name = "file_type")
    private String fileType; // 첨부 파일 타입 (MIME type)

    @Column(name = "image_url")
    private String imageUrl; // 이미지 URL

    @Column(name = "thumbnail_url")
    private String thumbnailUrl; // 썸네일 URL

    @Column(name = "voice_url")
    private String voiceUrl; // 음성 메시지 URL

    @Column(name = "voice_duration")
    private Integer voiceDuration; // 음성 메시지 길이 (초)

    @Column(name = "is_edited", nullable = false)
    private Boolean isEdited = false; // 수정 여부

    @Column(name = "edited_at")
    private LocalDateTime editedAt; // 수정 시간

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false; // 삭제 여부

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt; // 삭제 시간

    @Column(name = "is_system_message", nullable = false)
    private Boolean isSystemMessage = false; // 시스템 메시지 여부

    @Column(name = "read_by", columnDefinition = "JSON")
    private String readBy; // 읽은 사용자들 (JSON 객체) {"userId": "timestamp"}

    @Column(name = "reactions", columnDefinition = "JSON")
    private String reactions; // 반응들 (JSON 객체) {"emoji": ["userId1", "userId2"]}

    @Column(name = "mentions", columnDefinition = "JSON")
    private String mentions; // 멘션된 사용자들 (JSON 배열)

    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata; // 추가 메타데이터 (JSON 객체)

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

    // 메시지 수정
    public void editMessage(String newContent) {
        if (this.isDeleted) {
            throw new RuntimeException("삭제된 메시지는 수정할 수 없습니다.");
        }
        if (this.isSystemMessage) {
            throw new RuntimeException("시스템 메시지는 수정할 수 없습니다.");
        }
        
        this.content = newContent;
        this.isEdited = true;
        this.editedAt = LocalDateTime.now();
    }

    // 메시지 삭제 (소프트 삭제)
    public void deleteMessage() {
        if (this.isSystemMessage) {
            throw new RuntimeException("시스템 메시지는 삭제할 수 없습니다.");
        }
        
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
        this.content = "[삭제된 메시지입니다]";
    }

    // 메시지 읽음 처리
    public void markAsRead(Long userId) {
        // JSON 파싱/업데이트 로직 필요
        // 실제 구현에서는 JSON 라이브러리 사용
        this.readBy = updateReadByJson(this.readBy, userId, LocalDateTime.now());
    }

    // 반응 추가
    public void addReaction(String emoji, Long userId) {
        // JSON 파싱/업데이트 로직 필요
        this.reactions = addReactionToJson(this.reactions, emoji, userId);
    }

    // 반응 제거
    public void removeReaction(String emoji, Long userId) {
        // JSON 파싱/업데이트 로직 필요
        this.reactions = removeReactionFromJson(this.reactions, emoji, userId);
    }

    // 번역 내용 추가
    public void addTranslation(String targetLanguage, String translatedText) {
        // JSON 파싱/업데이트 로직 필요
        this.translatedContent = addTranslationToJson(this.translatedContent, targetLanguage, translatedText);
    }

    // 텍스트 메시지 여부 확인
    public boolean isTextMessage() {
        return this.messageType == MessageType.TEXT;
    }

    // 이미지 메시지 여부 확인
    public boolean isImageMessage() {
        return this.messageType == MessageType.IMAGE;
    }

    // 파일 메시지 여부 확인
    public boolean isFileMessage() {
        return this.messageType == MessageType.FILE;
    }

    // 음성 메시지 여부 확인
    public boolean isVoiceMessage() {
        return this.messageType == MessageType.VOICE;
    }

    // 답글 여부 확인
    public boolean isReply() {
        return this.replyToMessageId != null;
    }

    // 수정 가능 여부 확인 (5분 내)
    public boolean canEdit() {
        return !this.isDeleted && !this.isSystemMessage && 
               this.createdAt.isAfter(LocalDateTime.now().minusMinutes(5));
    }

    // 삭제 가능 여부 확인
    public boolean canDelete() {
        return !this.isDeleted && !this.isSystemMessage;
    }

    // 표시용 내용 반환 (삭제된 경우 대체 텍스트)
    public String getDisplayContent() {
        if (this.isDeleted) {
            return "[삭제된 메시지입니다]";
        }
        return this.content;
    }

    // JSON 처리 메서드들 (실제 구현에서는 Jackson 등 사용)
    private String updateReadByJson(String readBy, Long userId, LocalDateTime timestamp) {
        // JSON 파싱/업데이트 로직
        return readBy; // 임시
    }

    private String addReactionToJson(String reactions, String emoji, Long userId) {
        // JSON 파싱/업데이트 로직
        return reactions; // 임시
    }

    private String removeReactionFromJson(String reactions, String emoji, Long userId) {
        // JSON 파싱/업데이트 로직
        return reactions; // 임시
    }

    private String addTranslationToJson(String translations, String language, String text) {
        // JSON 파싱/업데이트 로직
        return translations; // 임시
    }
}

// 메시지 타입 열거형
enum MessageType {
    TEXT("텍스트"),
    IMAGE("이미지"),
    FILE("파일"),
    VOICE("음성"),
    STICKER("스티커"),
    LOCATION("위치"),
    SYSTEM("시스템");

    private final String description;

    MessageType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}