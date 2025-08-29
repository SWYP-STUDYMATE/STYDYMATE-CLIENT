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
@Table(name = "oauth_providers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OAuthProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private ProviderType provider;

    @Column(name = "provider_user_id", nullable = false)
    private String providerUserId; // OAuth 제공자에서의 사용자 ID

    @Column(name = "provider_email")
    private String providerEmail;

    @Column(name = "provider_name")
    private String providerName;

    @Column(name = "provider_avatar_url")
    private String providerAvatarUrl;

    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken;

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;

    @Column(name = "scope")
    private String scope; // OAuth 권한 범위

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false; // 주 계정 여부

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "provider_data", columnDefinition = "JSON")
    private String providerData; // 추가 제공자 데이터

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 관계 설정 (선택사항)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    // 비즈니스 메서드들

    // 로그인 기록 업데이트
    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }

    // 토큰 만료 여부 확인
    public boolean isTokenExpired() {
        return this.tokenExpiresAt != null && 
               this.tokenExpiresAt.isBefore(LocalDateTime.now());
    }

    // 토큰 업데이트
    public void updateTokens(String newAccessToken, String newRefreshToken, 
                            Long expiresInSeconds) {
        this.accessToken = newAccessToken;
        if (newRefreshToken != null) {
            this.refreshToken = newRefreshToken;
        }
        if (expiresInSeconds != null) {
            this.tokenExpiresAt = LocalDateTime.now().plusSeconds(expiresInSeconds);
        }
    }

    // 계정 비활성화
    public void deactivate() {
        this.isActive = false;
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiresAt = null;
    }

    // 계정 활성화
    public void activate() {
        this.isActive = true;
    }

    // 주 계정으로 설정
    public void setPrimaryAccount() {
        this.isPrimary = true;
    }

    // 주 계정에서 해제
    public void unsetPrimaryAccount() {
        this.isPrimary = false;
    }

    // 프로필 정보 업데이트
    public void updateProfile(String email, String name, String avatarUrl) {
        if (email != null) {
            this.providerEmail = email;
        }
        if (name != null) {
            this.providerName = name;
        }
        if (avatarUrl != null) {
            this.providerAvatarUrl = avatarUrl;
        }
    }

    // 유효한 OAuth 계정인지 확인
    public boolean isValidAccount() {
        return this.isActive && this.providerUserId != null;
    }

    // 토큰 갱신 필요 여부 (만료 1시간 전)
    public boolean needsTokenRefresh() {
        return this.tokenExpiresAt != null && 
               this.tokenExpiresAt.isBefore(LocalDateTime.now().plusHours(1));
    }

    // 계정 연결 해제
    public void unlinkAccount() {
        this.isActive = false;
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiresAt = null;
        this.scope = null;
    }

    // 마지막 로그인으로부터 경과 일수
    public long getDaysSinceLastLogin() {
        if (this.lastLoginAt == null) {
            return Long.MAX_VALUE;
        }
        return java.time.Duration.between(this.lastLoginAt, LocalDateTime.now()).toDays();
    }
}

// OAuth 제공자 타입
enum ProviderType {
    GOOGLE("Google"),
    NAVER("Naver"),
    KAKAO("Kakao"),
    FACEBOOK("Facebook"),
    APPLE("Apple");

    private final String displayName;

    ProviderType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    // 제공자별 기본 스코프 반환
    public String getDefaultScope() {
        switch (this) {
            case GOOGLE:
                return "openid email profile";
            case NAVER:
                return "name email profile_image";
            case KAKAO:
                return "profile_nickname profile_image account_email";
            case FACEBOOK:
                return "email public_profile";
            case APPLE:
                return "name email";
            default:
                return "";
        }
    }

    // 제공자별 API 엔드포인트
    public String getUserInfoEndpoint() {
        switch (this) {
            case GOOGLE:
                return "https://www.googleapis.com/oauth2/v2/userinfo";
            case NAVER:
                return "https://openapi.naver.com/v1/nid/me";
            case KAKAO:
                return "https://kapi.kakao.com/v2/user/me";
            case FACEBOOK:
                return "https://graph.facebook.com/me?fields=id,name,email,picture";
            default:
                return "";
        }
    }
}