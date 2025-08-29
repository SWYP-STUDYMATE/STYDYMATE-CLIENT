package com.studymate.server.repository;

import com.studymate.server.entity.User;
import com.studymate.server.entity.UserStatus;
import com.studymate.server.entity.OnlineStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 기본 검색
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    // 사용자 존재 여부 확인
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByProviderAndProviderId(String provider, String providerId);

    // 상태별 사용자 조회
    List<User> findByUserStatus(UserStatus userStatus);
    List<User> findByOnlineStatus(OnlineStatus onlineStatus);

    // 활성 사용자 조회
    @Query("SELECT u FROM User u WHERE u.userStatus = 'ACTIVE'")
    List<User> findActiveUsers();

    // 온라인 사용자 조회
    @Query("SELECT u FROM User u WHERE u.onlineStatus IN ('ONLINE', 'AWAY') AND u.userStatus = 'ACTIVE'")
    List<User> findOnlineUsers();

    // 언어별 사용자 검색
    List<User> findByNativeLanguage(String nativeLanguage);

    @Query("SELECT u FROM User u WHERE u.targetLanguages LIKE %:targetLanguage% AND u.userStatus = 'ACTIVE'")
    List<User> findByTargetLanguage(@Param("targetLanguage") String targetLanguage);

    // 지역별 사용자 검색
    List<User> findByResidence(String residence);
    List<User> findByNationality(String nationality);
    List<User> findByTimezone(String timezone);

    // 프로필 완성도 기반 검색
    @Query("SELECT u FROM User u WHERE " +
           "u.englishName IS NOT NULL AND u.englishName != '' AND " +
           "u.profileImageUrl IS NOT NULL AND u.profileImageUrl != '' AND " +
           "u.introduction IS NOT NULL AND u.introduction != '' AND " +
           "u.targetLanguages IS NOT NULL AND u.targetLanguages != '' AND " +
           "u.userStatus = 'ACTIVE'")
    List<User> findUsersWithCompleteProfiles();

    // 최근 활동 사용자 조회
    @Query("SELECT u FROM User u WHERE u.lastActiveAt >= :since AND u.userStatus = 'ACTIVE' ORDER BY u.lastActiveAt DESC")
    List<User> findRecentlyActiveUsers(@Param("since") LocalDateTime since);

    // 신규 가입 사용자 조회
    @Query("SELECT u FROM User u WHERE u.createdAt >= :since ORDER BY u.createdAt DESC")
    List<User> findNewUsers(@Param("since") LocalDateTime since);

    // 검색 쿼리 (이름, 소개글, 관심사 포함)
    @Query("SELECT u FROM User u WHERE " +
           "u.userStatus = 'ACTIVE' AND (" +
           "LOWER(u.englishName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.koreanName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.introduction) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.interests) LIKE LOWER(CONCAT('%', :query, '%'))" +
           ")")
    List<User> searchUsers(@Param("query") String query);

    // 언어 교환 매칭을 위한 사용자 검색
    @Query("SELECT u FROM User u WHERE " +
           "u.userStatus = 'ACTIVE' AND " +
           "u.nativeLanguage = :targetLanguage AND " +
           "u.targetLanguages LIKE %:nativeLanguage% AND " +
           "u.id != :excludeUserId")
    List<User> findLanguageExchangePartners(@Param("excludeUserId") Long excludeUserId,
                                           @Param("nativeLanguage") String nativeLanguage,
                                           @Param("targetLanguage") String targetLanguage);

    // 복합 조건 검색
    @Query("SELECT u FROM User u WHERE " +
           "u.userStatus = 'ACTIVE' AND " +
           "(:nativeLanguage IS NULL OR u.nativeLanguage = :nativeLanguage) AND " +
           "(:targetLanguage IS NULL OR u.targetLanguages LIKE %:targetLanguage%) AND " +
           "(:residence IS NULL OR u.residence = :residence) AND " +
           "(:nationality IS NULL OR u.nationality = :nationality) AND " +
           "(:timezone IS NULL OR u.timezone = :timezone) AND " +
           "(:ageMin IS NULL OR :ageMax IS NULL OR " +
           "(u.birthYear IS NOT NULL AND u.birthYear >= :ageMin AND u.birthYear <= :ageMax))")
    List<User> findUsersWithFilters(@Param("nativeLanguage") String nativeLanguage,
                                   @Param("targetLanguage") String targetLanguage,
                                   @Param("residence") String residence,
                                   @Param("nationality") String nationality,
                                   @Param("timezone") String timezone,
                                   @Param("ageMin") Integer ageMin,
                                   @Param("ageMax") Integer ageMax);

    // 통계 쿼리들
    @Query("SELECT COUNT(u) FROM User u WHERE u.userStatus = 'ACTIVE'")
    long countActiveUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.onlineStatus IN ('ONLINE', 'AWAY')")
    long countOnlineUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    long countNewUsersAfter(@Param("since") LocalDateTime since);

    @Query("SELECT u.nativeLanguage, COUNT(u) FROM User u WHERE u.userStatus = 'ACTIVE' GROUP BY u.nativeLanguage")
    List<Object[]> countUsersByNativeLanguage();

    @Query("SELECT u.residence, COUNT(u) FROM User u WHERE u.userStatus = 'ACTIVE' AND u.residence IS NOT NULL GROUP BY u.residence")
    List<Object[]> countUsersByResidence();

    // 비활성 사용자 정리용
    @Query("SELECT u FROM User u WHERE u.lastActiveAt < :cutoffDate AND u.userStatus = 'ACTIVE'")
    List<User> findInactiveUsers(@Param("cutoffDate") LocalDateTime cutoffDate);

    // 이메일 미인증 사용자
    @Query("SELECT u FROM User u WHERE u.emailVerified = false AND u.createdAt < :cutoffDate")
    List<User> findUnverifiedUsers(@Param("cutoffDate") LocalDateTime cutoffDate);
}