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
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token", nullable = false, unique = true, columnDefinition = "TEXT")
    private String token;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_revoked", nullable = false)
    private Boolean isRevoked = false;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "device_info")
    private String deviceInfo; // 사용자 에이전트 정보

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 비즈니스 메서드들

    // 토큰 만료 여부 확인
    public boolean isExpired() {
        return this.expiresAt.isBefore(LocalDateTime.now());
    }

    // 토큰 유효성 확인 (만료되지 않고 폐기되지 않음)
    public boolean isValid() {
        return !isExpired() && !this.isRevoked;
    }

    // 토큰 폐기
    public void revoke() {
        this.isRevoked = true;
        this.revokedAt = LocalDateTime.now();
    }

    // 토큰 사용 기록
    public void markAsUsed() {
        this.lastUsedAt = LocalDateTime.now();
    }

    // 토큰 만료 시간 연장
    public void extendExpiration(int hours) {
        this.expiresAt = LocalDateTime.now().plusHours(hours);
    }

    // 새 토큰 생성 (정적 팩토리 메서드)
    public static RefreshToken createFor(Long userId, int expirationHours, String deviceInfo, String ipAddress) {
        return RefreshToken.builder()
                .token(generateToken())
                .userId(userId)
                .expiresAt(LocalDateTime.now().plusHours(expirationHours))
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .isRevoked(false)
                .build();
    }

    // 토큰 문자열 생성
    private static String generateToken() {
        return UUID.randomUUID().toString().replace("-", "") + 
               UUID.randomUUID().toString().replace("-", "");
    }

    // 만료까지 남은 시간 (분 단위)
    public long getMinutesUntilExpiration() {
        if (isExpired()) {
            return 0;
        }
        return java.time.Duration.between(LocalDateTime.now(), this.expiresAt).toMinutes();
    }

    // 토큰 사용 빈도 확인 (마지막 사용 시간 기준)
    public boolean isRecentlyUsed() {
        return this.lastUsedAt != null && 
               this.lastUsedAt.isAfter(LocalDateTime.now().minusHours(1));
    }

    // 디바이스 정보 업데이트
    public void updateDeviceInfo(String newDeviceInfo, String newIpAddress) {
        this.deviceInfo = newDeviceInfo;
        this.ipAddress = newIpAddress;
        this.lastUsedAt = LocalDateTime.now();
    }
}