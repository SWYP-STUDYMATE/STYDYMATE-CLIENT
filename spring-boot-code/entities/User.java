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
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "english_name")
    private String englishName;

    @Column(name = "korean_name")
    private String koreanName;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "residence")
    private String residence; // 거주지

    @Column(name = "nationality")
    private String nationality; // 국적

    @Column(name = "native_language", nullable = false)
    private String nativeLanguage; // 모국어

    @Column(name = "target_languages", columnDefinition = "JSON")
    private String targetLanguages; // 학습 목표 언어들 (JSON 배열)

    @Column(name = "introduction", columnDefinition = "TEXT")
    private String introduction; // 자기소개

    @Column(name = "interests", columnDefinition = "JSON")
    private String interests; // 관심사 (JSON 배열)

    @Column(name = "learning_goals", columnDefinition = "JSON")
    private String learningGoals; // 학습 목표 (JSON 배열)

    @Column(name = "timezone")
    private String timezone; // 시간대

    @Column(name = "birth_year")
    private Integer birthYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_status", nullable = false)
    private UserStatus userStatus = UserStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "online_status", nullable = false)
    private OnlineStatus onlineStatus = OnlineStatus.OFFLINE;

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @Column(name = "provider")
    private String provider; // OAuth 제공자 (naver, google, etc.)

    @Column(name = "provider_id")
    private String providerId; // OAuth 제공자에서의 사용자 ID

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    @Column(name = "terms_agreed", nullable = false)
    private Boolean termsAgreed = false;

    @Column(name = "privacy_agreed", nullable = false)
    private Boolean privacyAgreed = false;

    @Column(name = "marketing_agreed", nullable = false)
    private Boolean marketingAgreed = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 온라인 상태 업데이트
    public void updateOnlineStatus(OnlineStatus status) {
        this.onlineStatus = status;
        if (status != OnlineStatus.OFFLINE) {
            this.lastActiveAt = LocalDateTime.now();
        }
    }

    // 활성 상태 확인
    public boolean isActive() {
        return this.userStatus == UserStatus.ACTIVE;
    }

    // 온라인 상태 확인
    public boolean isOnline() {
        return this.onlineStatus == OnlineStatus.ONLINE;
    }

    // 프로필 완성도 체크
    public boolean isProfileComplete() {
        return englishName != null && !englishName.trim().isEmpty() &&
               profileImageUrl != null && !profileImageUrl.trim().isEmpty() &&
               introduction != null && !introduction.trim().isEmpty() &&
               targetLanguages != null && !targetLanguages.trim().isEmpty();
    }

    // 사용자 계정 비활성화
    public void deactivateAccount() {
        this.userStatus = UserStatus.DEACTIVATED;
        this.onlineStatus = OnlineStatus.OFFLINE;
    }

    // 사용자 계정 재활성화
    public void reactivateAccount() {
        this.userStatus = UserStatus.ACTIVE;
    }
}

// 성별 열거형
enum Gender {
    MALE("남성"),
    FEMALE("여성"),
    OTHER("기타"),
    PREFER_NOT_TO_SAY("응답 안함");

    private final String description;

    Gender(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

// 사용자 상태 열거형
enum UserStatus {
    ACTIVE("활성"),
    INACTIVE("비활성"),
    SUSPENDED("정지"),
    DEACTIVATED("탈퇴"),
    PENDING_VERIFICATION("인증 대기");

    private final String description;

    UserStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

// 온라인 상태 열거형
enum OnlineStatus {
    ONLINE("온라인"),
    AWAY("자리비움"),
    BUSY("바쁨"),
    OFFLINE("오프라인");

    private final String description;

    OnlineStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}