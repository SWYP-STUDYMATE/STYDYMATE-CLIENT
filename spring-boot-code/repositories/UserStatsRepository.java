package com.studymate.server.repository;

import com.studymate.server.entity.UserStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserStatsRepository extends JpaRepository<UserStats, Long> {

    // 사용자 ID로 통계 조회
    Optional<UserStats> findByUserId(Long userId);

    // 존재 여부 확인
    boolean existsByUserId(Long userId);

    // === 랭킹 관련 쿼리 ===

    // 총 세션 수 기준 상위 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.totalSessions DESC")
    List<UserStats> findTopByTotalSessions();

    // 완료된 세션 수 기준 상위 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.completedSessions DESC")
    List<UserStats> findTopByCompletedSessions();

    // 총 학습 시간 기준 상위 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.totalLearningMinutes DESC")
    List<UserStats> findTopByLearningTime();

    // 현재 연속일 기준 상위 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.currentStreakDays DESC")
    List<UserStats> findTopByCurrentStreak();

    // 최장 연속일 기준 상위 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.longestStreakDays DESC")
    List<UserStats> findTopByLongestStreak();

    // 레벨 기준 상위 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.level DESC, us.experiencePoints DESC")
    List<UserStats> findTopByLevel();

    // 평점 기준 상위 사용자들 (평점이 있는 사용자만)
    @Query("SELECT us FROM UserStats us WHERE us.averageSessionRating IS NOT NULL " +
           "ORDER BY us.averageSessionRating DESC")
    List<UserStats> findTopByRating();

    // 신뢰도 점수 기준 상위 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.trustScore DESC")
    List<UserStats> findTopByTrustScore();

    // === 통계 분석 쿼리 ===

    // 활성 사용자 수 (지난 7일 내 활동)
    @Query("SELECT COUNT(us) FROM UserStats us WHERE us.lastActivityDate >= :since")
    long countActiveUsers(@Param("since") LocalDateTime since);

    // 언어별 사용자 수
    @Query("SELECT us.primaryLearningLanguage, COUNT(us) FROM UserStats us " +
           "WHERE us.primaryLearningLanguage IS NOT NULL " +
           "GROUP BY us.primaryLearningLanguage ORDER BY COUNT(us) DESC")
    List<Object[]> countUsersByPrimaryLanguage();

    // 레벨별 사용자 분포
    @Query("SELECT us.level, COUNT(us) FROM UserStats us " +
           "GROUP BY us.level ORDER BY us.level")
    List<Object[]> countUsersByLevel();

    // 평균 통계 값들
    @Query("SELECT AVG(us.totalSessions), AVG(us.completedSessions), " +
           "AVG(us.totalLearningMinutes), AVG(us.currentStreakDays) FROM UserStats us")
    List<Object[]> getAverageStats();

    // === 고급 사용자 필터링 ===

    // 고참여도 사용자들 (연속일 7일 이상, 세션 20개 이상)
    @Query("SELECT us FROM UserStats us WHERE us.currentStreakDays >= 7 AND us.totalSessions >= 20")
    List<UserStats> findHighlyEngagedUsers();

    // 신규 사용자들 (생성된 지 30일 이내)
    @Query("SELECT us FROM UserStats us WHERE us.createdAt >= :since")
    List<UserStats> findNewUsers(@Param("since") LocalDateTime since);

    // 비활성 사용자들 (30일 이상 활동 없음)
    @Query("SELECT us FROM UserStats us WHERE us.lastActivityDate < :before OR us.lastActivityDate IS NULL")
    List<UserStats> findInactiveUsers(@Param("before") LocalDateTime before);

    // 위험 사용자들 (신뢰도 점수 3.0 이하)
    @Query("SELECT us FROM UserStats us WHERE us.trustScore <= 3.0")
    List<UserStats> findLowTrustUsers();

    // 우수 사용자들 (신뢰도 8.0 이상, 레벨 10 이상)
    @Query("SELECT us FROM UserStats us WHERE us.trustScore >= 8.0 AND us.level >= 10")
    List<UserStats> findExcellentUsers();

    // === 매칭 관련 통계 ===

    // 매칭 성공률 높은 사용자들
    @Query("SELECT us FROM UserStats us WHERE us.matchSuccessRate >= :minRate " +
           "ORDER BY us.matchSuccessRate DESC")
    List<UserStats> findUsersWithHighMatchSuccessRate(@Param("minRate") Double minRate);

    // 총 매칭 수 기준 상위 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.totalMatches DESC")
    List<UserStats> findTopByTotalMatches();

    // === 소셜 통계 ===

    // 친구가 많은 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.totalFriends DESC")
    List<UserStats> findTopByFriends();

    // 팔로워가 많은 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.totalFollowers DESC")
    List<UserStats> findTopByFollowers();

    // 도움을 많이 준 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.helpResponsesGiven DESC")
    List<UserStats> findTopHelpers();

    // === 시간 기반 통계 ===

    // 특정 기간에 생성된 사용자 통계들
    @Query("SELECT us FROM UserStats us WHERE us.createdAt BETWEEN :startDate AND :endDate")
    List<UserStats> findCreatedBetween(@Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);

    // 오늘 활동한 사용자 수
    @Query("SELECT COUNT(us) FROM UserStats us WHERE DATE(us.lastActivityDate) = CURRENT_DATE")
    long countTodayActiveUsers();

    // 이번 주 활동한 사용자 수
    @Query("SELECT COUNT(us) FROM UserStats us WHERE us.lastActivityDate >= :weekStart")
    long countWeeklyActiveUsers(@Param("weekStart") LocalDateTime weekStart);

    // 이번 달 활동한 사용자 수
    @Query("SELECT COUNT(us) FROM UserStats us WHERE us.lastActivityDate >= :monthStart")
    long countMonthlyActiveUsers(@Param("monthStart") LocalDateTime monthStart);

    // === 경험치 및 레벨 통계 ===

    // 특정 레벨 범위의 사용자들
    @Query("SELECT us FROM UserStats us WHERE us.level BETWEEN :minLevel AND :maxLevel")
    List<UserStats> findUsersByLevelRange(@Param("minLevel") Integer minLevel, 
                                         @Param("maxLevel") Integer maxLevel);

    // 경험치 기준 상위 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.experiencePoints DESC")
    List<UserStats> findTopByExperiencePoints();

    // 레벨업 임박 사용자들 (다음 레벨까지 100점 이하)
    @Query("SELECT us FROM UserStats us WHERE us.pointsToNextLevel <= 100")
    List<UserStats> findUsersCloseToLevelUp();

    // === 세션 품질 통계 ===

    // 세션 완료율이 높은 사용자들 (80% 이상)
    @Query("SELECT us FROM UserStats us WHERE us.totalSessions > 0 AND " +
           "(us.completedSessions * 100.0 / us.totalSessions) >= :minRate")
    List<UserStats> findUsersWithHighSessionCompletionRate(@Param("minRate") Double minRate);

    // 평균 세션 시간이 긴 사용자들
    @Query("SELECT us FROM UserStats us WHERE us.completedSessions > 0 " +
           "ORDER BY (us.totalSessionMinutes * 1.0 / us.completedSessions) DESC")
    List<UserStats> findUsersWithLongAverageSessionTime();

    // 호스팅을 많이 한 사용자들
    @Query("SELECT us FROM UserStats us ORDER BY us.hostedSessions DESC")
    List<UserStats> findTopHosts();

    // === 특별한 성취 사용자들 ===

    // 완벽주의자들 (취소한 세션이 없는 사용자들, 세션 5개 이상)
    @Query("SELECT us FROM UserStats us WHERE us.cancelledSessions = 0 AND us.totalSessions >= 5")
    List<UserStats> findPerfectionists();

    // 소셜 스타들 (팔로워 100명 이상)
    @Query("SELECT us FROM UserStats us WHERE us.totalFollowers >= 100")
    List<UserStats> findSocialStars();

    // 학습 마니아들 (연속 30일 이상)
    @Query("SELECT us FROM UserStats us WHERE us.currentStreakDays >= 30")
    List<UserStats> findLearningManiacs();

    // === 집계 통계 ===

    // 전체 사용자 통계 요약
    @Query("SELECT COUNT(us), SUM(us.totalSessions), SUM(us.completedSessions), " +
           "SUM(us.totalLearningMinutes), AVG(us.level) FROM UserStats us")
    List<Object[]> getOverallStatistics();

    // 언어별 평균 레벨
    @Query("SELECT us.primaryLearningLanguage, AVG(us.level) FROM UserStats us " +
           "WHERE us.primaryLearningLanguage IS NOT NULL " +
           "GROUP BY us.primaryLearningLanguage")
    List<Object[]> getAverageLevelByLanguage();

    // 월별 신규 사용자 수
    @Query("SELECT YEAR(us.createdAt), MONTH(us.createdAt), COUNT(us) FROM UserStats us " +
           "GROUP BY YEAR(us.createdAt), MONTH(us.createdAt) " +
           "ORDER BY YEAR(us.createdAt), MONTH(us.createdAt)")
    List<Object[]> getMonthlyNewUserCount();

    // === 개인 랭킹 조회 ===

    // 특정 사용자의 총 세션 수 랭킹
    @Query("SELECT COUNT(us) + 1 FROM UserStats us WHERE us.totalSessions > " +
           "(SELECT us2.totalSessions FROM UserStats us2 WHERE us2.userId = :userId)")
    Long getUserTotalSessionRank(@Param("userId") Long userId);

    // 특정 사용자의 레벨 랭킹
    @Query("SELECT COUNT(us) + 1 FROM UserStats us WHERE (us.level > " +
           "(SELECT us2.level FROM UserStats us2 WHERE us2.userId = :userId)) OR " +
           "(us.level = (SELECT us2.level FROM UserStats us2 WHERE us2.userId = :userId) AND " +
           "us.experiencePoints > (SELECT us2.experiencePoints FROM UserStats us2 WHERE us2.userId = :userId))")
    Long getUserLevelRank(@Param("userId") Long userId);

    // 특정 사용자의 학습 시간 랭킹
    @Query("SELECT COUNT(us) + 1 FROM UserStats us WHERE us.totalLearningMinutes > " +
           "(SELECT us2.totalLearningMinutes FROM UserStats us2 WHERE us2.userId = :userId)")
    Long getUserLearningTimeRank(@Param("userId") Long userId);
}