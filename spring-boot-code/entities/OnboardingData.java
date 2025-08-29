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
@Table(name = "onboarding_data")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OnboardingData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "current_step", nullable = false)
    private Integer currentStep = 1; // 현재 온보딩 단계 (1-4)

    @Column(name = "step_data", columnDefinition = "JSON")
    private String stepData; // 단계별 데이터 (JSON 형태)

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false; // 온보딩 완료 여부

    @Column(name = "completed_at")
    private LocalDateTime completedAt; // 온보딩 완료 시간

    @Column(name = "completion_rate")
    private Integer completionRate = 0; // 완성도 (0-100%)

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 다음 단계로 진행
    public void proceedToNextStep() {
        if (this.currentStep < 4) {
            this.currentStep++;
            updateCompletionRate();
        }
    }

    // 온보딩 완료 처리
    public void completeOnboarding() {
        this.isCompleted = true;
        this.completedAt = LocalDateTime.now();
        this.currentStep = 4;
        this.completionRate = 100;
    }

    // 완성도 업데이트
    private void updateCompletionRate() {
        this.completionRate = (this.currentStep * 25);
    }

    // 특정 단계로 설정
    public void setCurrentStep(Integer step) {
        if (step >= 1 && step <= 4) {
            this.currentStep = step;
            updateCompletionRate();
        }
    }
}