package com.studymate.server.controller;

import com.studymate.server.entity.UserStats;
import com.studymate.server.service.UserStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class UserStatsController {

    private final UserStatsService userStatsService;

    // === 개인 통계 조회 ===

    // 사용자 통계 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<UserStats> getUserStats(@PathVariable Long userId) {
        UserStats stats = userStatsService.getUserStats(userId);
        return ResponseEntity.ok(stats);
    }

    // 사용자 통계 요약 조회
    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<Map<String, Object>> getUserStatsSummary(@PathVariable Long userId) {
        Map<String, Object> summary = userStatsService.getUserStatsSummary(userId);
        return ResponseEntity.ok(summary);
    }

    // 사용자 랭킹 조회
    @GetMapping("/user/{userId}/rankings")
    public ResponseEntity<Map<String, Object>> getUserRankings(@PathVariable Long userId) {
        Map<String, Object> rankings = userStatsService.getUserRankings(userId);
        return ResponseEntity.ok(rankings);
    }

    // === 통계 업데이트 ===

    // 세션 완료 통계 업데이트
    @PostMapping("/user/{userId}/session/completed")
    public ResponseEntity<UserStats> updateSessionCompleted(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> sessionData) {
        
        Integer durationMinutes = (Integer) sessionData.get("durationMinutes");
        Double rating = sessionData.get("rating") != null ? 
                       Double.valueOf(sessionData.get("rating").toString()) : null;
        
        UserStats updated = userStatsService.updateSessionCompleted(userId, durationMinutes, rating);
        return ResponseEntity.ok(updated);
    }

    // 세션 호스팅 통계 업데이트
    @PostMapping("/user/{userId}/session/hosted")
    public ResponseEntity<UserStats> updateSessionHosted(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateSessionHosted(userId);
        return ResponseEntity.ok(updated);
    }

    // 세션 취소 통계 업데이트
    @PostMapping("/user/{userId}/session/cancelled")
    public ResponseEntity<UserStats> updateSessionCancelled(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateSessionCancelled(userId);
        return ResponseEntity.ok(updated);
    }

    // 메시지 전송 통계 업데이트
    @PostMapping("/user/{userId}/message/sent")
    public ResponseEntity<UserStats> updateMessageSent(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateMessageSent(userId);
        return ResponseEntity.ok(updated);
    }

    // 채팅방 참가 통계 업데이트
    @PostMapping("/user/{userId}/chatroom/joined")
    public ResponseEntity<UserStats> updateChatRoomJoined(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateChatRoomJoined(userId);
        return ResponseEntity.ok(updated);
    }

    // 채팅방 떠나기 통계 업데이트
    @PostMapping("/user/{userId}/chatroom/left")
    public ResponseEntity<UserStats> updateChatRoomLeft(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateChatRoomLeft(userId);
        return ResponseEntity.ok(updated);
    }

    // 매칭 성공 통계 업데이트
    @PostMapping("/user/{userId}/match/successful")
    public ResponseEntity<UserStats> updateMatchSuccessful(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateMatchSuccessful(userId);
        return ResponseEntity.ok(updated);
    }

    // 매칭 실패 통계 업데이트
    @PostMapping("/user/{userId}/match/failed")
    public ResponseEntity<UserStats> updateMatchFailed(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateMatchFailed(userId);
        return ResponseEntity.ok(updated);
    }

    // 프로필 조회수 증가
    @PostMapping("/user/{userId}/profile/viewed")
    public ResponseEntity<UserStats> incrementProfileViews(@PathVariable Long userId) {
        UserStats updated = userStatsService.incrementProfileViews(userId);
        return ResponseEntity.ok(updated);
    }

    // === 소셜 통계 업데이트 ===

    // 친구 추가 통계 업데이트
    @PostMapping("/user/{userId}/friend/added")
    public ResponseEntity<UserStats> updateFriendAdded(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateFriendAdded(userId);
        return ResponseEntity.ok(updated);
    }

    // 친구 제거 통계 업데이트
    @PostMapping("/user/{userId}/friend/removed")
    public ResponseEntity<UserStats> updateFriendRemoved(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateFriendRemoved(userId);
        return ResponseEntity.ok(updated);
    }

    // 팔로워 추가 통계 업데이트
    @PostMapping("/user/{userId}/follower/added")
    public ResponseEntity<UserStats> updateFollowerAdded(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateFollowerAdded(userId);
        return ResponseEntity.ok(updated);
    }

    // 팔로워 제거 통계 업데이트
    @PostMapping("/user/{userId}/follower/removed")
    public ResponseEntity<UserStats> updateFollowerRemoved(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateFollowerRemoved(userId);
        return ResponseEntity.ok(updated);
    }

    // 팔로잉 추가 통계 업데이트
    @PostMapping("/user/{userId}/following/added")
    public ResponseEntity<UserStats> updateFollowingAdded(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateFollowingAdded(userId);
        return ResponseEntity.ok(updated);
    }

    // 팔로잉 제거 통계 업데이트
    @PostMapping("/user/{userId}/following/removed")
    public ResponseEntity<UserStats> updateFollowingRemoved(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateFollowingRemoved(userId);
        return ResponseEntity.ok(updated);
    }

    // === 도움 요청/응답 통계 ===

    // 도움 요청 통계 업데이트
    @PostMapping("/user/{userId}/help/request-sent")
    public ResponseEntity<UserStats> updateHelpRequestSent(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateHelpRequestSent(userId);
        return ResponseEntity.ok(updated);
    }

    // 도움 응답 통계 업데이트
    @PostMapping("/user/{userId}/help/response-given")
    public ResponseEntity<UserStats> updateHelpResponseGiven(@PathVariable Long userId) {
        UserStats updated = userStatsService.updateHelpResponseGiven(userId);
        return ResponseEntity.ok(updated);
    }

    // === 신뢰도/평판 관리 ===

    // 신뢰도 점수 업데이트
    @PatchMapping("/user/{userId}/trust-score")
    public ResponseEntity<UserStats> updateTrustScore(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> scoreData) {
        
        Double delta = Double.valueOf(scoreData.get("delta").toString());
        UserStats updated = userStatsService.updateTrustScore(userId, delta);
        return ResponseEntity.ok(updated);
    }

    // 평판 점수 업데이트
    @PatchMapping("/user/{userId}/reputation-score")
    public ResponseEntity<UserStats> updateReputationScore(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> scoreData) {
        
        Integer delta = (Integer) scoreData.get("delta");
        UserStats updated = userStatsService.updateReputationScore(userId, delta);
        return ResponseEntity.ok(updated);
    }

    // === 언어 설정 ===

    // 언어 설정 업데이트
    @PatchMapping("/user/{userId}/languages")
    public ResponseEntity<UserStats> updateLanguageSettings(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> languageData) {
        
        String primaryLanguage = (String) languageData.get("primaryLanguage");
        String secondaryLanguage = (String) languageData.get("secondaryLanguage");
        String nativeLanguage = (String) languageData.get("nativeLanguage");
        
        UserStats updated = userStatsService.updateLanguageSettings(
            userId, primaryLanguage, secondaryLanguage, nativeLanguage);
        return ResponseEntity.ok(updated);
    }

    // === 랭킹 조회 ===

    // 총 세션 수 기준 상위 사용자들
    @GetMapping("/rankings/total-sessions")
    public ResponseEntity<List<UserStats>> getTopUsersByTotalSessions(
            @RequestParam(defaultValue = "10") int limit) {
        List<UserStats> topUsers = userStatsService.getTopUsersByTotalSessions(limit);
        return ResponseEntity.ok(topUsers);
    }

    // 총 학습 시간 기준 상위 사용자들
    @GetMapping("/rankings/learning-time")
    public ResponseEntity<List<UserStats>> getTopUsersByLearningTime(
            @RequestParam(defaultValue = "10") int limit) {
        List<UserStats> topUsers = userStatsService.getTopUsersByLearningTime(limit);
        return ResponseEntity.ok(topUsers);
    }

    // 레벨 기준 상위 사용자들
    @GetMapping("/rankings/level")
    public ResponseEntity<List<UserStats>> getTopUsersByLevel(
            @RequestParam(defaultValue = "10") int limit) {
        List<UserStats> topUsers = userStatsService.getTopUsersByLevel(limit);
        return ResponseEntity.ok(topUsers);
    }

    // 연속일 기준 상위 사용자들
    @GetMapping("/rankings/streak")
    public ResponseEntity<List<UserStats>> getTopUsersByStreak(
            @RequestParam(defaultValue = "10") int limit) {
        List<UserStats> topUsers = userStatsService.getTopUsersByStreak(limit);
        return ResponseEntity.ok(topUsers);
    }

    // 평점 기준 상위 사용자들
    @GetMapping("/rankings/rating")
    public ResponseEntity<List<UserStats>> getTopUsersByRating(
            @RequestParam(defaultValue = "10") int limit) {
        List<UserStats> topUsers = userStatsService.getTopUsersByRating(limit);
        return ResponseEntity.ok(topUsers);
    }

    // === 시스템 통계 ===

    // 전체 시스템 통계
    @GetMapping("/system")
    public ResponseEntity<Map<String, Object>> getSystemStatistics() {
        Map<String, Object> stats = userStatsService.getSystemStatistics();
        return ResponseEntity.ok(stats);
    }

    // 언어별 통계
    @GetMapping("/system/languages")
    public ResponseEntity<List<Object[]>> getLanguageStatistics() {
        List<Object[]> stats = userStatsService.getLanguageStatistics();
        return ResponseEntity.ok(stats);
    }

    // 레벨 분포 통계
    @GetMapping("/system/level-distribution")
    public ResponseEntity<List<Object[]>> getLevelDistribution() {
        List<Object[]> distribution = userStatsService.getLevelDistribution();
        return ResponseEntity.ok(distribution);
    }

    // === 사용자 분류 ===

    // 고참여도 사용자들
    @GetMapping("/users/highly-engaged")
    public ResponseEntity<List<UserStats>> getHighlyEngagedUsers() {
        List<UserStats> users = userStatsService.getHighlyEngagedUsers();
        return ResponseEntity.ok(users);
    }

    // 신규 사용자들
    @GetMapping("/users/new")
    public ResponseEntity<List<UserStats>> getNewUsers(
            @RequestParam(defaultValue = "30") int days) {
        List<UserStats> users = userStatsService.getNewUsers(days);
        return ResponseEntity.ok(users);
    }

    // 비활성 사용자들
    @GetMapping("/users/inactive")
    public ResponseEntity<List<UserStats>> getInactiveUsers(
            @RequestParam(defaultValue = "30") int days) {
        List<UserStats> users = userStatsService.getInactiveUsers(days);
        return ResponseEntity.ok(users);
    }

    // 신뢰도 낮은 사용자들
    @GetMapping("/users/low-trust")
    public ResponseEntity<List<UserStats>> getLowTrustUsers() {
        List<UserStats> users = userStatsService.getLowTrustUsers();
        return ResponseEntity.ok(users);
    }

    // 우수 사용자들
    @GetMapping("/users/excellent")
    public ResponseEntity<List<UserStats>> getExcellentUsers() {
        List<UserStats> users = userStatsService.getExcellentUsers();
        return ResponseEntity.ok(users);
    }

    // === 관리자용 엔드포인트 ===

    // 주간 활동 일수 리셋
    @PostMapping("/admin/reset-weekly-active-days")
    public ResponseEntity<Map<String, String>> resetWeeklyActiveDays() {
        userStatsService.resetWeeklyActiveDays();
        return ResponseEntity.ok(Map.of("message", "Weekly active days reset successfully"));
    }

    // 월간 활동 일수 리셋
    @PostMapping("/admin/reset-monthly-active-days")
    public ResponseEntity<Map<String, String>> resetMonthlyActiveDays() {
        userStatsService.resetMonthlyActiveDays();
        return ResponseEntity.ok(Map.of("message", "Monthly active days reset successfully"));
    }

    // 연속일 체크 및 업데이트
    @PostMapping("/admin/update-streaks")
    public ResponseEntity<Map<String, String>> checkAndUpdateStreaks() {
        userStatsService.checkAndUpdateStreaks();
        return ResponseEntity.ok(Map.of("message", "Streaks updated successfully"));
    }

    // === 통계 대시보드용 ===

    // 사용자 성장 지표
    @GetMapping("/user/{userId}/growth")
    public ResponseEntity<Map<String, Object>> getUserGrowthMetrics(@PathVariable Long userId) {
        UserStats stats = userStatsService.getUserStats(userId);
        
        Map<String, Object> growthMetrics = Map.of(
            "level", stats.getLevel(),
            "experiencePoints", stats.getExperiencePoints(),
            "pointsToNextLevel", stats.getPointsToNextLevel(),
            "currentStreak", stats.getCurrentStreakDays(),
            "longestStreak", stats.getLongestStreakDays(),
            "totalLearningHours", stats.getTotalLearningMinutes() / 60.0,
            "sessionCompletionRate", stats.getSessionCompletionRate(),
            "trustScore", stats.getTrustScore(),
            "userLevel", stats.getUserLevel()
        );
        
        return ResponseEntity.ok(growthMetrics);
    }

    // 사용자 활동 요약
    @GetMapping("/user/{userId}/activity")
    public ResponseEntity<Map<String, Object>> getUserActivitySummary(@PathVariable Long userId) {
        UserStats stats = userStatsService.getUserStats(userId);
        
        Map<String, Object> activitySummary = Map.of(
            "totalSessions", stats.getTotalSessions(),
            "completedSessions", stats.getCompletedSessions(),
            "hostedSessions", stats.getHostedSessions(),
            "totalMessagesSent", stats.getTotalMessagesSent(),
            "activeChatRooms", stats.getActiveChatRooms(),
            "totalMatches", stats.getTotalMatches(),
            "successfulMatches", stats.getSuccessfulMatches(),
            "matchSuccessRate", stats.getMatchSuccessRate(),
            "isActiveUser", stats.isActiveUser(),
            "lastActivityDate", stats.getLastActivityDate()
        );
        
        return ResponseEntity.ok(activitySummary);
    }
}