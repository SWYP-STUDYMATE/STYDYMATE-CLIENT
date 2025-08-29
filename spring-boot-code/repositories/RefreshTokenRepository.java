package com.studymate.server.repository;

import com.studymate.server.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    // 토큰으로 조회
    Optional<RefreshToken> findByToken(String token);

    // 사용자의 유효한 토큰들 조회
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.userId = :userId " +
           "AND rt.isRevoked = false AND rt.expiresAt > :now")
    List<RefreshToken> findValidTokensByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // 사용자의 모든 토큰들 조회
    List<RefreshToken> findByUserId(Long userId);

    // 사용자의 활성 토큰들 조회 (폐기되지 않은 것)
    List<RefreshToken> findByUserIdAndIsRevokedFalse(Long userId);

    // 만료된 토큰들 조회
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.expiresAt < :now")
    List<RefreshToken> findExpiredTokens(@Param("now") LocalDateTime now);

    // 폐기된 토큰들 조회
    List<RefreshToken> findByIsRevokedTrue();

    // 특정 기간보다 오래된 토큰들 조회
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.createdAt < :before")
    List<RefreshToken> findTokensCreatedBefore(@Param("before") LocalDateTime before);

    // 특정 IP 주소의 토큰들 조회
    List<RefreshToken> findByIpAddress(String ipAddress);

    // 특정 디바이스 정보의 토큰들 조회
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.deviceInfo LIKE %:deviceInfo%")
    List<RefreshToken> findByDeviceInfoContaining(@Param("deviceInfo") String deviceInfo);

    // 사용자별 토큰 개수 조회
    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.userId = :userId AND rt.isRevoked = false")
    long countValidTokensByUserId(@Param("userId") Long userId);

    // 최근 사용된 토큰들 조회
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.lastUsedAt IS NOT NULL " +
           "AND rt.lastUsedAt >= :since ORDER BY rt.lastUsedAt DESC")
    List<RefreshToken> findRecentlyUsedTokens(@Param("since") LocalDateTime since);

    // 사용자의 가장 최근 토큰 조회
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.userId = :userId " +
           "ORDER BY rt.createdAt DESC")
    List<RefreshToken> findLatestTokensByUserId(@Param("userId") Long userId);

    // 만료 임박 토큰들 조회 (24시간 내 만료)
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.isRevoked = false " +
           "AND rt.expiresAt BETWEEN :now AND :tomorrow")
    List<RefreshToken> findTokensExpiringWithin24Hours(@Param("now") LocalDateTime now, 
                                                       @Param("tomorrow") LocalDateTime tomorrow);

    // 토큰 존재 여부 확인
    boolean existsByToken(String token);

    // 유효한 토큰 존재 여부 확인
    @Query("SELECT COUNT(rt) > 0 FROM RefreshToken rt WHERE rt.token = :token " +
           "AND rt.isRevoked = false AND rt.expiresAt > :now")
    boolean existsValidToken(@Param("token") String token, @Param("now") LocalDateTime now);

    // 사용자의 토큰 정리 (오래된 순으로 삭제용)
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.userId = :userId " +
           "ORDER BY rt.lastUsedAt ASC NULLS FIRST, rt.createdAt ASC")
    List<RefreshToken> findTokensForCleanupByUserId(@Param("userId") Long userId);

    // 통계: 일별 토큰 생성 수
    @Query("SELECT DATE(rt.createdAt), COUNT(rt) FROM RefreshToken rt " +
           "WHERE rt.createdAt >= :since " +
           "GROUP BY DATE(rt.createdAt) ORDER BY DATE(rt.createdAt)")
    List<Object[]> getDailyTokenCreationStats(@Param("since") LocalDateTime since);

    // 통계: 사용자별 활성 토큰 수
    @Query("SELECT rt.userId, COUNT(rt) FROM RefreshToken rt " +
           "WHERE rt.isRevoked = false AND rt.expiresAt > :now " +
           "GROUP BY rt.userId ORDER BY COUNT(rt) DESC")
    List<Object[]> getUserActiveTokenCounts(@Param("now") LocalDateTime now);

    // 의심스러운 활동 감지: 같은 IP에서 다수 사용자 토큰
    @Query("SELECT rt.ipAddress, COUNT(DISTINCT rt.userId) as userCount FROM RefreshToken rt " +
           "WHERE rt.isRevoked = false AND rt.expiresAt > :now " +
           "AND rt.ipAddress IS NOT NULL " +
           "GROUP BY rt.ipAddress HAVING COUNT(DISTINCT rt.userId) > :threshold " +
           "ORDER BY userCount DESC")
    List<Object[]> findSuspiciousIpAddresses(@Param("now") LocalDateTime now, 
                                           @Param("threshold") int threshold);

    // 한 사용자의 토큰이 너무 많은 경우 감지
    @Query("SELECT rt.userId FROM RefreshToken rt " +
           "WHERE rt.isRevoked = false AND rt.expiresAt > :now " +
           "GROUP BY rt.userId HAVING COUNT(rt) > :maxTokens")
    List<Long> findUsersWithTooManyTokens(@Param("now") LocalDateTime now, 
                                         @Param("maxTokens") int maxTokens);

    // 장기간 미사용 토큰들
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.isRevoked = false " +
           "AND (rt.lastUsedAt IS NULL OR rt.lastUsedAt < :cutoff)")
    List<RefreshToken> findLongTimeUnusedTokens(@Param("cutoff") LocalDateTime cutoff);

    // 특정 사용자의 다른 토큰들 (현재 토큰 제외)
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.userId = :userId " +
           "AND rt.token != :currentToken AND rt.isRevoked = false")
    List<RefreshToken> findOtherValidTokens(@Param("userId") Long userId, 
                                          @Param("currentToken") String currentToken);

    // 토큰 삭제 (물리적 삭제)
    void deleteByToken(String token);

    // 만료된 토큰 일괄 삭제
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);

    // 폐기된 토큰 일괄 삭제 (일정 기간 후)
    @Query("DELETE FROM RefreshToken rt WHERE rt.isRevoked = true " +
           "AND rt.revokedAt < :cutoff")
    int deleteRevokedTokensOlderThan(@Param("cutoff") LocalDateTime cutoff);

    // 사용자의 모든 토큰 폐기 (로그아웃 시)
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true, rt.revokedAt = :now " +
           "WHERE rt.userId = :userId AND rt.isRevoked = false")
    int revokeAllUserTokens(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // 특정 디바이스의 토큰들 폐기
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true, rt.revokedAt = :now " +
           "WHERE rt.userId = :userId AND rt.deviceInfo = :deviceInfo AND rt.isRevoked = false")
    int revokeDeviceTokens(@Param("userId") Long userId, 
                          @Param("deviceInfo") String deviceInfo, 
                          @Param("now") LocalDateTime now);
}