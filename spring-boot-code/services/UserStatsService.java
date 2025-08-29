package com.studymate.server.service;

import com.studymate.server.entity.UserStats;
import com.studymate.server.repository.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserStatsService {

    private final UserStatsRepository userStatsRepository;

    // === 기본 통계 관리 ===

    // 사용자 통계 조회 (없으면 생성)
    public UserStats getUserStats(Long userId) {
        return userStatsRepository.findByUserId(userId)
                .orElseGet(() -> createInitialStats(userId));
    }

    // 초기 통계 생성
    private UserStats createInitialStats(Long userId) {
        UserStats stats = UserStats.builder()
                .userId(userId)
                .level(1)
                .experiencePoints(0L)
                .pointsToNextLevel(100L)
                .currentStreakDays(0)
                .longestStreakDays(0)
                .trustScore(5.0)
                .reputationScore(0)
                .totalSessions(0L)
                .completedSessions(0L)
                .hostedSessions(0L)
                .cancelledSessions(0L)
                .totalSessionMinutes(0L)
                .totalMessagesSent(0L)
                .totalChatRooms(0L)
                .activeChatRooms(0L)
                .totalLearningMinutes(0L)
                .totalMatches(0L)
                .successfulMatches(0L)
                .totalActiveDays(0)
                .weeklyActiveDays(0)
                .monthlyActiveDays(0)
                .totalFriends(0L)
                .totalFollowers(0L)
                .totalFollowing(0L)
                .profileViews(0L)
                .helpRequestsSent(0L)
                .helpResponsesGiven(0L)
                .build();

        UserStats saved = userStatsRepository.save(stats);
        log.info("Created initial stats for user {}", userId);
        return saved;
    }

    // === 세션 관련 통계 업데이트 ===

    // 세션 완료 통계 업데이트
    public UserStats updateSessionCompleted(Long userId, Integer durationMinutes, Double rating) {
        UserStats stats = getUserStats(userId);
        stats.addCompletedSession(durationMinutes, rating);
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated session completed stats for user {}: duration={}, rating={}", 
                 userId, durationMinutes, rating);
        return updated;
    }

    // 세션 호스팅 통계 업데이트
    public UserStats updateSessionHosted(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.addHostedSession();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated session hosted stats for user {}", userId);
        return updated;
    }

    // 세션 취소 통계 업데이트
    public UserStats updateSessionCancelled(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.addCancelledSession();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated session cancelled stats for user {}", userId);
        return updated;
    }

    // === 채팅 관련 통계 업데이트 ===

    // 메시지 전송 통계 업데이트
    public UserStats updateMessageSent(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.addMessageSent();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated message sent stats for user {}", userId);
        return updated;
    }

    // 채팅방 참가 통계 업데이트
    public UserStats updateChatRoomJoined(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.addChatRoomJoined();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated chat room joined stats for user {}", userId);
        return updated;
    }

    // 채팅방 떠나기 통계 업데이트
    public UserStats updateChatRoomLeft(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.leaveChatRoom();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated chat room left stats for user {}", userId);
        return updated;
    }

    // === 매칭 관련 통계 업데이트 ===

    // 매칭 성공 통계 업데이트
    public UserStats updateMatchSuccessful(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.addSuccessfulMatch();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated successful match stats for user {}", userId);
        return updated;
    }

    // 매칭 실패 통계 업데이트
    public UserStats updateMatchFailed(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.addFailedMatch();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated failed match stats for user {}", userId);
        return updated;
    }

    // === 소셜 관련 통계 업데이트 ===

    // 프로필 조회수 증가
    public UserStats incrementProfileViews(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.incrementProfileViews();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Incremented profile views for user {}", userId);
        return updated;
    }

    // 친구 관계 업데이트
    public UserStats updateFriendAdded(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.addFriend();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated friend added stats for user {}", userId);
        return updated;
    }

    public UserStats updateFriendRemoved(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.removeFriend();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated friend removed stats for user {}", userId);
        return updated;
    }

    // 팔로우 관계 업데이트
    public UserStats updateFollowerAdded(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.addFollower();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated follower added stats for user {}", userId);
        return updated;
    }

    public UserStats updateFollowerRemoved(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.removeFollower();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated follower removed stats for user {}", userId);
        return updated;
    }

    public UserStats updateFollowingAdded(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.addFollowing();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated following added stats for user {}", userId);
        return updated;
    }

    public UserStats updateFollowingRemoved(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.removeFollowing();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated following removed stats for user {}", userId);
        return updated;
    }

    // === 도움 요청/응답 통계 ===

    public UserStats updateHelpRequestSent(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.addHelpRequestSent();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated help request sent stats for user {}", userId);
        return updated;
    }

    public UserStats updateHelpResponseGiven(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.addHelpResponseGiven();
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated help response given stats for user {}", userId);
        return updated;
    }

    // === 신뢰도/평판 관리 ===

    // 신뢰도 점수 업데이트
    public UserStats updateTrustScore(Long userId, double delta) {
        UserStats stats = getUserStats(userId);
        stats.updateTrustScore(delta);
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated trust score for user {}: delta={}, new score={}", 
                 userId, delta, updated.getTrustScore());
        return updated;
    }

    // 평판 점수 업데이트
    public UserStats updateReputationScore(Long userId, int delta) {
        UserStats stats = getUserStats(userId);
        stats.updateReputationScore(delta);
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated reputation score for user {}: delta={}, new score={}", 
                 userId, delta, updated.getReputationScore());
        return updated;
    }

    // === 언어 설정 업데이트 ===

    public UserStats updateLanguageSettings(Long userId, String primaryLanguage, 
                                          String secondaryLanguage, String nativeLanguage) {
        UserStats stats = getUserStats(userId);
        stats.setPrimaryLearningLanguage(primaryLanguage);
        stats.setSecondaryLearningLanguage(secondaryLanguage);
        stats.setNativeLanguage(nativeLanguage);
        
        UserStats updated = userStatsRepository.save(stats);
        log.debug("Updated language settings for user {}: primary={}, secondary={}, native={}", 
                 userId, primaryLanguage, secondaryLanguage, nativeLanguage);
        return updated;
    }

    // === 랭킹 조회 ===

    @Transactional(readOnly = true)
    public List<UserStats> getTopUsersByTotalSessions(int limit) {
        return userStatsRepository.findTopByTotalSessions()
                .stream()
                .limit(limit)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserStats> getTopUsersByLearningTime(int limit) {
        return userStatsRepository.findTopByLearningTime()
                .stream()
                .limit(limit)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserStats> getTopUsersByLevel(int limit) {
        return userStatsRepository.findTopByLevel()
                .stream()
                .limit(limit)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserStats> getTopUsersByStreak(int limit) {
        return userStatsRepository.findTopByCurrentStreak()
                .stream()
                .limit(limit)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserStats> getTopUsersByRating(int limit) {
        return userStatsRepository.findTopByRating()
                .stream()
                .limit(limit)
                .toList();
    }

    // === 사용자 랭킹 조회 ===

    @Transactional(readOnly = true)
    public Map<String, Object> getUserRankings(Long userId) {
        Long totalSessionRank = userStatsRepository.getUserTotalSessionRank(userId);
        Long levelRank = userStatsRepository.getUserLevelRank(userId);
        Long learningTimeRank = userStatsRepository.getUserLearningTimeRank(userId);
        
        return Map.of(
            "totalSessionRank", totalSessionRank != null ? totalSessionRank : 0L,
            "levelRank", levelRank != null ? levelRank : 0L,
            "learningTimeRank", learningTimeRank != null ? learningTimeRank : 0L
        );
    }

    // === 통계 분석 ===

    @Transactional(readOnly = true)
    public Map<String, Object> getSystemStatistics() {
        List<Object[]> overallStats = userStatsRepository.getOverallStatistics();
        long totalActiveUsers = userStatsRepository.countActiveUsers(LocalDateTime.now().minusDays(7));
        long todayActiveUsers = userStatsRepository.countTodayActiveUsers();
        long weeklyActiveUsers = userStatsRepository.countWeeklyActiveUsers(LocalDateTime.now().minusDays(7));
        long monthlyActiveUsers = userStatsRepository.countMonthlyActiveUsers(LocalDateTime.now().minusDays(30));
        
        Object[] stats = overallStats.isEmpty() ? new Object[]{0L, 0L, 0L, 0L, 0.0} : overallStats.get(0);
        
        return Map.of(
            "totalUsers", stats[0],
            "totalSessions", stats[1],
            "totalCompletedSessions", stats[2],
            "totalLearningMinutes", stats[3],
            "averageLevel", stats[4],
            "activeUsers", totalActiveUsers,
            "todayActiveUsers", todayActiveUsers,
            "weeklyActiveUsers", weeklyActiveUsers,
            "monthlyActiveUsers", monthlyActiveUsers
        );
    }

    @Transactional(readOnly = true)
    public List<Object[]> getLanguageStatistics() {
        return userStatsRepository.countUsersByPrimaryLanguage();
    }

    @Transactional(readOnly = true)
    public List<Object[]> getLevelDistribution() {
        return userStatsRepository.countUsersByLevel();
    }

    // === 사용자 분류 ===

    @Transactional(readOnly = true)
    public List<UserStats> getHighlyEngagedUsers() {
        return userStatsRepository.findHighlyEngagedUsers();
    }

    @Transactional(readOnly = true)
    public List<UserStats> getNewUsers(int days) {
        return userStatsRepository.findNewUsers(LocalDateTime.now().minusDays(days));
    }

    @Transactional(readOnly = true)
    public List<UserStats> getInactiveUsers(int days) {
        return userStatsRepository.findInactiveUsers(LocalDateTime.now().minusDays(days));
    }

    @Transactional(readOnly = true)
    public List<UserStats> getLowTrustUsers() {
        return userStatsRepository.findLowTrustUsers();
    }

    @Transactional(readOnly = true)
    public List<UserStats> getExcellentUsers() {
        return userStatsRepository.findExcellentUsers();
    }

    // === 개인 통계 요약 ===

    @Transactional(readOnly = true)
    public Map<String, Object> getUserStatsSummary(Long userId) {
        UserStats stats = getUserStats(userId);
        Map<String, Object> rankings = getUserRankings(userId);
        
        return Map.of(
            "stats", stats,
            "rankings", rankings,
            "sessionCompletionRate", stats.getSessionCompletionRate(),
            "averageSessionDuration", stats.getAverageSessionDuration(),
            "isActiveUser", stats.isActiveUser(),
            "isHighlyEngagedUser", stats.isHighlyEngagedUser(),
            "userLevel", stats.getUserLevel()
        );
    }

    // === 배치 업데이트 (스케줄러용) ===

    // 주간/월간 활동 일수 리셋
    public void resetWeeklyActiveDays() {
        List<UserStats> allStats = userStatsRepository.findAll();
        for (UserStats stats : allStats) {
            stats.setWeeklyActiveDays(0);
        }
        userStatsRepository.saveAll(allStats);
        log.info("Reset weekly active days for all users");
    }

    public void resetMonthlyActiveDays() {
        List<UserStats> allStats = userStatsRepository.findAll();
        for (UserStats stats : allStats) {
            stats.setMonthlyActiveDays(0);
        }
        userStatsRepository.saveAll(allStats);
        log.info("Reset monthly active days for all users");
    }

    // 연속일 체크 및 업데이트 (일별 배치)
    public void checkAndUpdateStreaks() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1).withHour(0).withMinute(0).withSecond(0);
        List<UserStats> allStats = userStatsRepository.findAll();
        
        for (UserStats stats : allStats) {
            if (stats.getLastActivityDate() != null) {
                LocalDateTime lastActivityDay = stats.getLastActivityDate()
                        .withHour(0).withMinute(0).withSecond(0).withNano(0);
                
                // 어제 활동하지 않은 사용자들의 연속일 리셋
                if (lastActivityDay.isBefore(yesterday)) {
                    stats.setCurrentStreakDays(0);
                }
            }
        }
        
        userStatsRepository.saveAll(allStats);
        log.info("Updated streaks for all users");
    }
}