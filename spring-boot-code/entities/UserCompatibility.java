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
@Table(name = "user_compatibility")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserCompatibility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "native_language", nullable = false)
    private String nativeLanguage; // 모국어

    @Column(name = "target_language", nullable = false) 
    private String targetLanguage; // 학습 목표 언어

    @Column(name = "language_level")
    private String languageLevel; // A1, A2, B1, B2, C1, C2

    @Column(name = "interests", columnDefinition = "JSON")
    private String interests; // 관심사 (JSON 형태)

    @Column(name = "time_zone")
    private String timeZone; // 시간대

    @Column(name = "preferred_session_time")
    private String preferredSessionTime; // 선호 세션 시간

    @Column(name = "age_range") 
    private String ageRange; // 연령대

    @Column(name = "matching_preferences", columnDefinition = "JSON")
    private String matchingPreferences; // 매칭 선호도 설정

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // 매칭 활성 상태

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 매칭 비활성화
    public void deactivateMatching() {
        this.isActive = false;
    }

    // 매칭 활성화
    public void activateMatching() {
        this.isActive = true;
    }
}