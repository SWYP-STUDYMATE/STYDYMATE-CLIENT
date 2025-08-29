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
@Table(name = "user_stats")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    // 세션 관련 통계
    @Column(name = "total_sessions", nullable = false)
    private Long totalSessions = 0L;

    @Column(name = "completed_sessions", nullable = false)
    private Long completedSessions = 0L;

    @Column(name = "hosted_sessions", nullable = false)
    private Long hostedSessions = 0L;

    @Column(name = "cancelled_sessions", nullable = false)
    private Long cancelledSessions = 0L;

    @Column(name = "total_session_minutes", nullable = false)
    private Long totalSessionMinutes = 0L;

    @Column(name = "average_session_rating")
    private Double averageSessionRating;

    @Column(name = "total_ratings_received", nullable = false)
    private Long totalRatingsReceived = 0L;

    // 채팅 관련 통계
    @Column(name = "total_messages_sent", nullable = false)
    private Long totalMessagesSent = 0L;

    @Column(name = "total_chat_rooms", nullable = false)
    private Long totalChatRooms = 0L;

    @Column(name = "active_chat_rooms", nullable = false)
    private Long activeChatRooms = 0L;

    // 언어 학습 통계
    @Column(name = "primary_learning_language")
    private String primaryLearningLanguage;

    @Column(name = "secondary_learning_language")
    private String secondaryLearningLanguage;

    @Column(name = "native_language")
    private String nativeLanguage;

    @Column(name = "total_learning_minutes", nullable = false)
    private Long totalLearningMinutes = 0L;

    @Column(name = "current_streak_days", nullable = false)
    private Integer currentStreakDays = 0;

    @Column(name = "longest_streak_days", nullable = false)
    private Integer longestStreakDays = 0;

    @Column(name = "last_activity_date")
    private LocalDateTime lastActivityDate;

    // 매칭 관련 통계
    @Column(name = "total_matches", nullable = false)
    private Long totalMatches = 0L;

    @Column(name = "successful_matches", nullable = false)
    private Long successfulMatches = 0L;

    @Column(name = "match_success_rate")
    private Double matchSuccessRate;

    // 레벨 및 경험치
    @Column(name = "level", nullable = false)
    private Integer level = 1;

    @Column(name = "experience_points", nullable = false)
    private Long experiencePoints = 0L;

    @Column(name = "points_to_next_level", nullable = false)
    private Long pointsToNextLevel = 100L;

    // 뱃지 및 성취
    @Column(name = "badges_earned", columnDefinition = "JSON")
    private String badgesEarned; // JSON 배열

    @Column(name = "achievements", columnDefinition = "JSON")
    private String achievements; // JSON 객체

    // 활동 지표
    @Column(name = "weekly_active_days", nullable = false)
    private Integer weeklyActiveDays = 0;

    @Column(name = "monthly_active_days", nullable = false)
    private Integer monthlyActiveDays = 0;

    @Column(name = "total_active_days", nullable = false)
    private Integer totalActiveDays = 0;

    // 소셜 통계
    @Column(name = "total_friends", nullable = false)
    private Long totalFriends = 0L;

    @Column(name = "total_followers", nullable = false)
    private Long totalFollowers = 0L;

    @Column(name = "total_following", nullable = false)
    private Long totalFollowing = 0L;

    // 기타 통계
    @Column(name = "profile_views", nullable = false)
    private Long profileViews = 0L;

    @Column(name = "help_requests_sent", nullable = false)
    private Long helpRequestsSent = 0L;

    @Column(name = "help_responses_given", nullable = false)
    private Long helpResponsesGiven = 0L;

    @Column(name = "reputation_score", nullable = false)
    private Integer reputationScore = 0;

    @Column(name = "trust_score")
    private Double trustScore = 5.0; // 기본값 5.0/10.0

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 비즈니스 메서드들

    // 세션 완료 통계 업데이트
    public void addCompletedSession(Integer durationMinutes, Double rating) {
        this.totalSessions++;
        this.completedSessions++;
        if (durationMinutes != null) {
            this.totalSessionMinutes += durationMinutes;
            this.totalLearningMinutes += durationMinutes;
        }
        
        if (rating != null) {
            updateAverageRating(rating);
        }
        
        updateActivity();
        calculateExperience(50); // 세션 완료 시 50점 지급
    }

    // 세션 호스팅 통계 업데이트
    public void addHostedSession() {
        this.hostedSessions++;
        calculateExperience(30); // 세션 호스팅 시 30점 지급
    }

    // 세션 취소 통계 업데이트
    public void addCancelledSession() {
        this.totalSessions++;
        this.cancelledSessions++;
        // 취소 시 경험치 차감
        if (this.experiencePoints >= 10) {
            this.experiencePoints -= 10;
        }
    }

    // 메시지 전송 통계 업데이트
    public void addMessageSent() {
        this.totalMessagesSent++;
        updateActivity();
        calculateExperience(1); // 메시지당 1점 지급
    }

    // 채팅방 참가 통계 업데이트
    public void addChatRoomJoined() {
        this.totalChatRooms++;
        this.activeChatRooms++;
        calculateExperience(10); // 채팅방 참가 시 10점 지급
    }

    // 채팅방 떠나기
    public void leaveChatRoom() {
        if (this.activeChatRooms > 0) {
            this.activeChatRooms--;
        }
    }

    // 매칭 성공 통계 업데이트
    public void addSuccessfulMatch() {
        this.totalMatches++;
        this.successfulMatches++;
        updateMatchSuccessRate();
        calculateExperience(25); // 매칭 성공 시 25점 지급
    }

    // 매칭 실패 통계 업데이트
    public void addFailedMatch() {
        this.totalMatches++;
        updateMatchSuccessRate();
    }

    // 프로필 조회수 증가
    public void incrementProfileViews() {
        this.profileViews++;
    }

    // 도움 요청/응답 통계
    public void addHelpRequestSent() {
        this.helpRequestsSent++;
    }

    public void addHelpResponseGiven() {
        this.helpResponsesGiven++;
        calculateExperience(15); // 도움 응답 시 15점 지급
    }

    // 친구/팔로우 관계 업데이트
    public void addFriend() {
        this.totalFriends++;
    }

    public void removeFriend() {
        if (this.totalFriends > 0) {
            this.totalFriends--;
        }
    }

    public void addFollower() {
        this.totalFollowers++;
    }

    public void removeFollower() {
        if (this.totalFollowers > 0) {
            this.totalFollowers--;
        }
    }

    public void addFollowing() {
        this.totalFollowing++;
    }

    public void removeFollowing() {
        if (this.totalFollowing > 0) {
            this.totalFollowing--;
        }
    }

    // 평균 평점 업데이트
    private void updateAverageRating(Double newRating) {
        if (this.averageSessionRating == null) {
            this.averageSessionRating = newRating;
        } else {
            this.averageSessionRating = ((this.averageSessionRating * this.totalRatingsReceived) + newRating) 
                                      / (this.totalRatingsReceived + 1);
        }
        this.totalRatingsReceived++;
    }

    // 매칭 성공률 업데이트
    private void updateMatchSuccessRate() {
        if (this.totalMatches > 0) {
            this.matchSuccessRate = (double) this.successfulMatches / this.totalMatches * 100;
        }
    }

    // 활동 업데이트 (연속 일수, 활동 일수)
    private void updateActivity() {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        if (this.lastActivityDate == null) {
            // 첫 활동
            this.currentStreakDays = 1;
            this.longestStreakDays = 1;
            this.totalActiveDays = 1;
            this.weeklyActiveDays = 1;
            this.monthlyActiveDays = 1;
        } else {
            LocalDateTime lastActivityDay = this.lastActivityDate.withHour(0).withMinute(0).withSecond(0).withNano(0);
            
            if (lastActivityDay.isBefore(today)) {
                // 새로운 날의 첫 활동
                if (lastActivityDay.isEqual(today.minusDays(1))) {
                    // 연속 활동
                    this.currentStreakDays++;
                } else {
                    // 연속성 끊어짐
                    this.currentStreakDays = 1;
                }
                
                if (this.currentStreakDays > this.longestStreakDays) {
                    this.longestStreakDays = this.currentStreakDays;
                }
                
                this.totalActiveDays++;
                updateWeeklyMonthlyActiveDays();
            }
        }
        
        this.lastActivityDate = LocalDateTime.now();
    }

    // 주간/월간 활동 일수 업데이트
    private void updateWeeklyMonthlyActiveDays() {
        // 실제 구현에서는 더 정확한 계산 로직 필요
        // 현재는 단순하게 증가만 처리
        this.weeklyActiveDays++;
        this.monthlyActiveDays++;
        
        // 일주일/한달이 지나면 리셋하는 로직이 필요 (스케줄러에서 처리)
    }

    // 경험치 계산 및 레벨업
    private void calculateExperience(long points) {
        this.experiencePoints += points;
        
        // 레벨업 확인
        while (this.experiencePoints >= this.pointsToNextLevel) {
            this.experiencePoints -= this.pointsToNextLevel;
            this.level++;
            this.pointsToNextLevel = calculateNextLevelPoints();
            
            // 레벨업 보상 (경험치, 뱃지 등)
            handleLevelUp();
        }
    }

    // 다음 레벨까지 필요한 경험치 계산
    private Long calculateNextLevelPoints() {
        // 레벨이 높아질수록 필요 경험치 증가 (예: 레벨 * 100)
        return (long) (this.level * 100);
    }

    // 레벨업 처리
    private void handleLevelUp() {
        // 뱃지 획득, 특별 보상 등 처리
        // 실제 구현에서는 별도 서비스에서 처리
        log.info("User {} leveled up to {}", this.userId, this.level);
    }

    // 신뢰도 점수 업데이트
    public void updateTrustScore(double delta) {
        this.trustScore += delta;
        
        // 0-10 범위로 제한
        if (this.trustScore < 0) {
            this.trustScore = 0.0;
        } else if (this.trustScore > 10) {
            this.trustScore = 10.0;
        }
    }

    // 평판 점수 업데이트
    public void updateReputationScore(int delta) {
        this.reputationScore += delta;
        
        // 최소값 0으로 제한
        if (this.reputationScore < 0) {
            this.reputationScore = 0;
        }
    }

    // 통계 조회 메서드들
    public double getSessionCompletionRate() {
        if (this.totalSessions == 0) return 0.0;
        return (double) this.completedSessions / this.totalSessions * 100;
    }

    public double getAverageSessionDuration() {
        if (this.completedSessions == 0) return 0.0;
        return (double) this.totalSessionMinutes / this.completedSessions;
    }

    public boolean isActiveUser() {
        if (this.lastActivityDate == null) return false;
        return this.lastActivityDate.isAfter(LocalDateTime.now().minusDays(7));
    }

    public boolean isHighlyEngagedUser() {
        return this.currentStreakDays >= 7 && this.totalSessions >= 20;
    }

    public String getUserLevel() {
        if (this.level <= 5) return "초급자";
        else if (this.level <= 15) return "중급자";
        else if (this.level <= 30) return "고급자";
        else return "전문가";
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserStats.class);
}