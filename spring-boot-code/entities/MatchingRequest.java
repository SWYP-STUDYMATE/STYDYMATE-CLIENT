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
@Table(name = "matching_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MatchingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "from_user_id", nullable = false)
    private Long fromUserId;

    @Column(name = "to_user_id", nullable = false)
    private Long toUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MatchingStatus status = MatchingStatus.PENDING;

    @Column(name = "compatibility_score")
    private Integer compatibilityScore;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message; // 매칭 요청 시 메시지

    @Column(name = "matched_at")
    private LocalDateTime matchedAt; // 매칭 성사 시간

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 매칭 수락 처리
    public void acceptMatch() {
        this.status = MatchingStatus.ACCEPTED;
        this.matchedAt = LocalDateTime.now();
    }

    // 매칭 거절 처리
    public void rejectMatch() {
        this.status = MatchingStatus.REJECTED;
    }

    // 매칭 취소 처리
    public void cancelMatch() {
        this.status = MatchingStatus.CANCELLED;
    }

    // 활성 상태 확인
    public boolean isActive() {
        return status == MatchingStatus.PENDING || status == MatchingStatus.ACCEPTED;
    }
}