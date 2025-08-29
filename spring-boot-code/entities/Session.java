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
@Table(name = "sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false, unique = true)
    private String roomId; // WebRTC Room ID

    @Column(name = "host_user_id", nullable = false)
    private Long hostUserId; // 세션 생성자

    @Column(name = "title", nullable = false)
    private String title; // 세션 제목

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // 세션 설명

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    private SessionType sessionType; // VIDEO, AUDIO

    @Enumerated(EnumType.STRING)
    @Column(name = "session_mode", nullable = false)
    private SessionMode sessionMode = SessionMode.ONE_ON_ONE; // ONE_ON_ONE, GROUP

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SessionStatus status = SessionStatus.SCHEDULED;

    @Column(name = "language_focus")
    private String languageFocus; // 학습할 언어

    @Column(name = "difficulty_level")
    private String difficultyLevel; // BEGINNER, INTERMEDIATE, ADVANCED

    @Column(name = "max_participants", nullable = false)
    private Integer maxParticipants = 2; // 최대 참가자 수

    @Column(name = "current_participants", nullable = false)
    private Integer currentParticipants = 0; // 현재 참가자 수

    @Column(name = "scheduled_start_time", nullable = false)
    private LocalDateTime scheduledStartTime; // 예정된 시작 시간

    @Column(name = "scheduled_duration", nullable = false)
    private Integer scheduledDuration; // 예정된 지속 시간 (분)

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime; // 실제 시작 시간

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime; // 실제 종료 시간

    @Column(name = "actual_duration")
    private Integer actualDuration; // 실제 지속 시간 (분)

    @Column(name = "is_recording_enabled", nullable = false)
    private Boolean isRecordingEnabled = false;

    @Column(name = "recording_url")
    private String recordingUrl; // 녹화 파일 URL

    @Column(name = "session_notes", columnDefinition = "TEXT")
    private String sessionNotes; // 세션 노트

    @Column(name = "topics", columnDefinition = "JSON")
    private String topics; // 세션 주제들 (JSON 배열)

    @Column(name = "feedback", columnDefinition = "JSON")
    private String feedback; // 참가자 피드백 (JSON 객체)

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false; // 공개 세션 여부

    @Column(name = "tags", columnDefinition = "JSON")
    private String tags; // 세션 태그 (JSON 배열)

    @Column(name = "timezone")
    private String timezone; // 시간대

    @Column(name = "cancelled_reason")
    private String cancelledReason; // 취소 사유

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt; // 취소 시간

    @Column(name = "cancelled_by_user_id")
    private Long cancelledByUserId; // 취소한 사용자 ID

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 양방향 관계 설정 (필요 시)
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SessionParticipant> participants;

    // 비즈니스 메서드들

    // 세션 시작
    public void startSession() {
        if (this.status != SessionStatus.SCHEDULED) {
            throw new RuntimeException("예정된 세션만 시작할 수 있습니다.");
        }
        this.status = SessionStatus.ACTIVE;
        this.actualStartTime = LocalDateTime.now();
    }

    // 세션 종료
    public void endSession() {
        if (this.status != SessionStatus.ACTIVE) {
            throw new RuntimeException("활성 세션만 종료할 수 있습니다.");
        }
        this.status = SessionStatus.COMPLETED;
        this.actualEndTime = LocalDateTime.now();
        
        if (this.actualStartTime != null) {
            this.actualDuration = (int) java.time.Duration.between(this.actualStartTime, this.actualEndTime).toMinutes();
        }
    }

    // 세션 취소
    public void cancelSession(Long cancelledByUserId, String reason) {
        if (this.status == SessionStatus.COMPLETED) {
            throw new RuntimeException("완료된 세션은 취소할 수 없습니다.");
        }
        this.status = SessionStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
        this.cancelledByUserId = cancelledByUserId;
        this.cancelledReason = reason;
    }

    // 참가자 추가
    public void addParticipant() {
        if (this.currentParticipants >= this.maxParticipants) {
            throw new RuntimeException("최대 참가자 수를 초과했습니다.");
        }
        this.currentParticipants++;
    }

    // 참가자 제거
    public void removeParticipant() {
        if (this.currentParticipants > 0) {
            this.currentParticipants--;
        }
    }

    // 세션 수정 가능 여부 확인
    public boolean canModify() {
        return this.status == SessionStatus.SCHEDULED;
    }

    // 세션 참가 가능 여부 확인
    public boolean canJoin() {
        return this.status == SessionStatus.SCHEDULED && 
               this.currentParticipants < this.maxParticipants &&
               LocalDateTime.now().isBefore(this.scheduledStartTime.plusMinutes(15)); // 시작 15분 후까지 참가 가능
    }

    // 세션 활성 상태 확인
    public boolean isActive() {
        return this.status == SessionStatus.ACTIVE;
    }

    // 세션 완료 여부 확인
    public boolean isCompleted() {
        return this.status == SessionStatus.COMPLETED;
    }

    // 세션 취소 여부 확인
    public boolean isCancelled() {
        return this.status == SessionStatus.CANCELLED;
    }
}

// 세션 타입 열거형
enum SessionType {
    VIDEO("화상"),
    AUDIO("음성");

    private final String description;

    SessionType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

// 세션 모드 열거형
enum SessionMode {
    ONE_ON_ONE("1:1"),
    GROUP("그룹");

    private final String description;

    SessionMode(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

// 세션 상태 열거형
enum SessionStatus {
    SCHEDULED("예정"),
    ACTIVE("진행중"),
    COMPLETED("완료"),
    CANCELLED("취소"),
    NO_SHOW("미참석");

    private final String description;

    SessionStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}