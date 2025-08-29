package com.studymate.server.repository;

import com.studymate.server.entity.OAuthProvider;
import com.studymate.server.entity.ProviderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OAuthProviderRepository extends JpaRepository<OAuthProvider, Long> {

    // 사용자별 OAuth 제공자 조회
    List<OAuthProvider> findByUserId(Long userId);

    // 사용자의 활성 OAuth 제공자들 조회
    List<OAuthProvider> findByUserIdAndIsActiveTrue(Long userId);

    // 특정 제공자로 사용자 조회
    Optional<OAuthProvider> findByUserIdAndProvider(Long userId, ProviderType provider);

    // 제공자 사용자 ID로 조회
    Optional<OAuthProvider> findByProviderAndProviderUserId(ProviderType provider, String providerUserId);

    // 제공자 이메일로 조회
    List<OAuthProvider> findByProviderAndProviderEmail(ProviderType provider, String providerEmail);

    // 사용자의 주 계정 조회
    Optional<OAuthProvider> findByUserIdAndIsPrimaryTrue(Long userId);

    // 제공자별 사용자 수 통계
    @Query("SELECT op.provider, COUNT(DISTINCT op.userId) FROM OAuthProvider op " +
           "WHERE op.isActive = true GROUP BY op.provider")
    List<Object[]> countActiveUsersByProvider();

    // 토큰 만료 임박 계정들 조회
    @Query("SELECT op FROM OAuthProvider op WHERE op.isActive = true " +
           "AND op.tokenExpiresAt IS NOT NULL AND op.tokenExpiresAt < :threshold")
    List<OAuthProvider> findAccountsWithExpiringTokens(@Param("threshold") LocalDateTime threshold);

    // 오랫동안 로그인하지 않은 계정들
    @Query("SELECT op FROM OAuthProvider op WHERE op.isActive = true " +
           "AND (op.lastLoginAt IS NULL OR op.lastLoginAt < :cutoff)")
    List<OAuthProvider> findInactiveAccounts(@Param("cutoff") LocalDateTime cutoff);

    // 중복 계정 확인 (같은 제공자 이메일로 여러 계정)
    @Query("SELECT op.providerEmail, COUNT(DISTINCT op.userId) as userCount FROM OAuthProvider op " +
           "WHERE op.isActive = true AND op.providerEmail IS NOT NULL " +
           "GROUP BY op.providerEmail HAVING COUNT(DISTINCT op.userId) > 1")
    List<Object[]> findDuplicateAccountsByEmail();

    // 특정 제공자의 활성 사용자들
    List<OAuthProvider> findByProviderAndIsActiveTrue(ProviderType provider);

    // 사용자가 특정 제공자 계정을 가지고 있는지 확인
    boolean existsByUserIdAndProvider(Long userId, ProviderType provider);

    // 사용자가 특정 제공자의 활성 계정을 가지고 있는지 확인
    boolean existsByUserIdAndProviderAndIsActiveTrue(Long userId, ProviderType provider);

    // 제공자 사용자 ID 존재 여부 확인
    boolean existsByProviderAndProviderUserId(ProviderType provider, String providerUserId);

    // 최근 로그인 계정들 조회
    @Query("SELECT op FROM OAuthProvider op WHERE op.lastLoginAt >= :since " +
           "ORDER BY op.lastLoginAt DESC")
    List<OAuthProvider> findRecentLogins(@Param("since") LocalDateTime since);

    // 월별 신규 연동 계정 통계
    @Query("SELECT YEAR(op.createdAt), MONTH(op.createdAt), op.provider, COUNT(op) " +
           "FROM OAuthProvider op GROUP BY YEAR(op.createdAt), MONTH(op.createdAt), op.provider " +
           "ORDER BY YEAR(op.createdAt), MONTH(op.createdAt)")
    List<Object[]> getMonthlyNewAccountStats();

    // 제공자별 일일 로그인 통계
    @Query("SELECT DATE(op.lastLoginAt), op.provider, COUNT(DISTINCT op.userId) " +
           "FROM OAuthProvider op WHERE op.lastLoginAt >= :since " +
           "GROUP BY DATE(op.lastLoginAt), op.provider " +
           "ORDER BY DATE(op.lastLoginAt)")
    List<Object[]> getDailyLoginStatsByProvider(@Param("since") LocalDateTime since);

    // 다중 제공자 연동 사용자들 조회
    @Query("SELECT op.userId FROM OAuthProvider op WHERE op.isActive = true " +
           "GROUP BY op.userId HAVING COUNT(op.provider) > 1")
    List<Long> findUsersWithMultipleProviders();

    // 특정 사용자의 다른 제공자 계정들 (현재 제공자 제외)
    @Query("SELECT op FROM OAuthProvider op WHERE op.userId = :userId " +
           "AND op.provider != :currentProvider AND op.isActive = true")
    List<OAuthProvider> findOtherProviderAccounts(@Param("userId") Long userId, 
                                                  @Param("currentProvider") ProviderType currentProvider);

    // 고아 계정들 (연결된 사용자가 없는 OAuth 계정들)
    @Query("SELECT op FROM OAuthProvider op WHERE NOT EXISTS " +
           "(SELECT 1 FROM User u WHERE u.id = op.userId)")
    List<OAuthProvider> findOrphanAccounts();

    // 토큰이 유효한 계정들
    @Query("SELECT op FROM OAuthProvider op WHERE op.isActive = true " +
           "AND op.accessToken IS NOT NULL " +
           "AND (op.tokenExpiresAt IS NULL OR op.tokenExpiresAt > :now)")
    List<OAuthProvider> findAccountsWithValidTokens(@Param("now") LocalDateTime now);

    // 특정 기간 내 생성된 계정들
    @Query("SELECT op FROM OAuthProvider op WHERE op.createdAt BETWEEN :startDate AND :endDate")
    List<OAuthProvider> findAccountsCreatedBetween(@Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);

    // 제공자별 평균 토큰 만료 시간
    @Query("SELECT op.provider, AVG(TIMESTAMPDIFF(HOUR, CURRENT_TIMESTAMP, op.tokenExpiresAt)) " +
           "FROM OAuthProvider op WHERE op.isActive = true AND op.tokenExpiresAt IS NOT NULL " +
           "GROUP BY op.provider")
    List<Object[]> getAverageTokenExpirationByProvider();

    // 사용자의 주 계정 변경 이력 추적을 위한 이전 주 계정들
    @Query("SELECT op FROM OAuthProvider op WHERE op.userId = :userId " +
           "AND op.isPrimary = false AND op.isActive = true " +
           "ORDER BY op.updatedAt DESC")
    List<OAuthProvider> findPreviousPrimaryAccounts(@Param("userId") Long userId);

    // 계정 정리 대상: 비활성 + 오래된 계정들
    @Query("SELECT op FROM OAuthProvider op WHERE op.isActive = false " +
           "AND op.updatedAt < :cutoff")
    List<OAuthProvider> findAccountsForCleanup(@Param("cutoff") LocalDateTime cutoff);

    // 보안 감시: 짧은 시간 내 여러 IP에서 로그인한 계정들
    @Query("SELECT op.userId, COUNT(DISTINCT op.ipAddress) as ipCount " +
           "FROM OAuthProvider op WHERE op.lastLoginAt >= :since " +
           "GROUP BY op.userId HAVING COUNT(DISTINCT op.ipAddress) > :threshold")
    List<Object[]> findSuspiciousLoginPatterns(@Param("since") LocalDateTime since,
                                              @Param("threshold") int threshold);

    // 제공자 변경 통계 (사용자가 주로 사용하는 제공자)
    @Query("SELECT op.provider, COUNT(*) as loginCount FROM OAuthProvider op " +
           "WHERE op.lastLoginAt IS NOT NULL " +
           "GROUP BY op.provider ORDER BY loginCount DESC")
    List<Object[]> getProviderUsageStats();

    // 특정 제공자 계정 일괄 비활성화
    @Query("UPDATE OAuthProvider op SET op.isActive = false " +
           "WHERE op.provider = :provider")
    int deactivateAllAccountsByProvider(@Param("provider") ProviderType provider);

    // 만료된 토큰 일괄 정리
    @Query("UPDATE OAuthProvider op SET op.accessToken = null, op.refreshToken = null " +
           "WHERE op.tokenExpiresAt IS NOT NULL AND op.tokenExpiresAt < :now")
    int clearExpiredTokens(@Param("now") LocalDateTime now);
}