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
@Table(name = "session_participants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private ParticipantRole role = ParticipantRole.PARTICIPANT;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ParticipantStatus status = ParticipantStatus.INVITED;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(name = "left_at")
    private LocalDateTime leftAt;

    @Column(name = "duration_minutes")
    private Integer durationMinutes; // 참가 시간 (분)

    @Column(name = "is_camera_on", nullable = false)
    private Boolean isCameraOn = true;

    @Column(name = "is_mic_on", nullable = false)
    private Boolean isMicOn = true;

    @Column(name = "is_screen_sharing", nullable = false)
    private Boolean isScreenSharing = false;

    @Column(name = "connection_quality")
    private String connectionQuality; // EXCELLENT, GOOD, FAIR, POOR

    @Column(name = "rating")
    private Integer rating; // 1-5 별점

    @Column(name = "feedback_comment", columnDefinition = "TEXT")
    private String feedbackComment; // 피드백 댓글

    @Column(name = "learning_notes", columnDefinition = "TEXT")
    private String learningNotes; // 학습 노트

    @Column(name = "language_practiced")
    private String languagePracticed; // 연습한 언어

    @Column(name = "goals_achieved", columnDefinition = "JSON")
    private String goalsAchieved; // 달성한 목표들 (JSON 배열)

    @Column(name = "next_session_topics", columnDefinition = "JSON")
    private String nextSessionTopics; // 다음 세션 주제 제안 (JSON 배열)

    @Column(name = "attendance_confirmed", nullable = false)
    private Boolean attendanceConfirmed = false; // 참석 확인

    @Column(name = "reminder_sent", nullable = false)
    private Boolean reminderSent = false; // 리마인더 발송 여부

    @Column(name = "no_show", nullable = false)
    private Boolean noShow = false; // 미참석 여부

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 관계 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", insertable = false, updatable = false)
    private Session session;

    // 비즈니스 메서드들

    // 세션 참가
    public void joinSession() {
        if (this.status != ParticipantStatus.CONFIRMED) {
            throw new RuntimeException("확인된 참가자만 세션에 참가할 수 있습니다.");
        }
        this.status = ParticipantStatus.JOINED;
        this.joinedAt = LocalDateTime.now();
        this.attendanceConfirmed = true;
    }

    // 세션 떠나기
    public void leaveSession() {
        if (this.status != ParticipantStatus.JOINED) {
            throw new RuntimeException("참가 중인 상태에서만 세션을 떠날 수 있습니다.");
        }
        this.status = ParticipantStatus.LEFT;
        this.leftAt = LocalDateTime.now();
        
        if (this.joinedAt != null) {
            this.durationMinutes = (int) java.time.Duration.between(this.joinedAt, this.leftAt).toMinutes();
        }
    }

    // 초대 수락
    public void acceptInvitation() {
        if (this.status != ParticipantStatus.INVITED) {
            throw new RuntimeException("초대된 상태에서만 수락할 수 있습니다.");
        }
        this.status = ParticipantStatus.CONFIRMED;
    }

    // 초대 거절
    public void declineInvitation(String reason) {
        if (this.status != ParticipantStatus.INVITED) {
            throw new RuntimeException("초대된 상태에서만 거절할 수 있습니다.");
        }
        this.status = ParticipantStatus.DECLINED;
        this.feedbackComment = reason;
    }

    // 미참석 처리
    public void markAsNoShow() {
        this.noShow = true;
        this.status = ParticipantStatus.NO_SHOW;
    }

    // 카메라 토글
    public void toggleCamera() {
        this.isCameraOn = !this.isCameraOn;
    }

    // 마이크 토글
    public void toggleMic() {
        this.isMicOn = !this.isMicOn;
    }

    // 화면 공유 토글
    public void toggleScreenShare() {
        this.isScreenSharing = !this.isScreenSharing;
    }

    // 피드백 제출
    public void submitFeedback(Integer rating, String comment) {
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("평점은 1-5 사이여야 합니다.");
        }
        this.rating = rating;
        this.feedbackComment = comment;
    }

    // 연결 품질 업데이트
    public void updateConnectionQuality(String quality) {
        this.connectionQuality = quality;
    }

    // 리마인더 발송 확인
    public void markReminderSent() {
        this.reminderSent = true;
    }

    // 참가 가능 여부 확인
    public boolean canJoin() {
        return this.status == ParticipantStatus.CONFIRMED;
    }

    // 활성 참가자 여부 확인
    public boolean isActiveParticipant() {
        return this.status == ParticipantStatus.JOINED;
    }

    // 세션 완료 여부 확인
    public boolean hasCompletedSession() {
        return this.status == ParticipantStatus.LEFT && this.durationMinutes != null && this.durationMinutes > 0;
    }
}

// 참가자 역할 열거형
enum ParticipantRole {
    HOST("주최자"),
    CO_HOST("공동주최자"),
    PARTICIPANT("참가자"),
    OBSERVER("참관자");

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
    CONFIRMED("참가 확인"),
    DECLINED("거절"),
    JOINED("참가 중"),
    LEFT("나감"),
    NO_SHOW("미참석"),
    REMOVED("제거됨");

    private final String description;

    ParticipantStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}