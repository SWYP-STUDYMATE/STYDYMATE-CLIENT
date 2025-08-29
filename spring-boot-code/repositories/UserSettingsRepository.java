package com.studymate.server.repository;

import com.studymate.server.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

    // 사용자별 설정 조회
    Optional<UserSettings> findByUserId(Long userId);

    // 알림 설정별 사용자 조회
    List<UserSettings> findByEmailNotificationsTrue();
    List<UserSettings> findByPushNotificationsTrue();
    List<UserSettings> findByMatchingNotificationsTrue();
    List<UserSettings> findBySessionRemindersTrue();
    List<UserSettings> findByMessageNotificationsTrue();

    // 프라이버시 설정별 사용자 조회
    List<UserSettings> findByProfileVisibility(String profileVisibility);
    List<UserSettings> findByShowOnlineStatusTrue();

    // 매칭 설정별 사용자 조회
    List<UserSettings> findByAutoMatchingTrue();

    @Query("SELECT us FROM UserSettings us WHERE us.preferredSessionType = :sessionType")
    List<UserSettings> findByPreferredSessionType(@Param("sessionType") String sessionType);

    @Query("SELECT us FROM UserSettings us WHERE us.preferredSessionLength = :length")
    List<UserSettings> findByPreferredSessionLength(@Param("length") Integer length);

    // 학습 목표별 사용자 조회
    @Query("SELECT us FROM UserSettings us WHERE us.dailyGoalMinutes >= :minMinutes AND us.dailyGoalMinutes <= :maxMinutes")
    List<UserSettings> findByDailyGoalRange(@Param("minMinutes") Integer minMinutes, 
                                           @Param("maxMinutes") Integer maxMinutes);

    @Query("SELECT us FROM UserSettings us WHERE us.weeklyGoalSessions >= :minSessions AND us.weeklyGoalSessions <= :maxSessions")
    List<UserSettings> findByWeeklyGoalRange(@Param("minSessions") Integer minSessions, 
                                            @Param("maxSessions") Integer maxSessions);

    // 언어 설정별 사용자 조회
    List<UserSettings> findByAppLanguage(String appLanguage);

    // 접근성 설정별 사용자 조회
    List<UserSettings> findByDarkModeTrue();
    List<UserSettings> findByHighContrastTrue();
    List<UserSettings> findByReducedMotionTrue();

    @Query("SELECT us FROM UserSettings us WHERE us.fontSize = :fontSize")
    List<UserSettings> findByFontSize(@Param("fontSize") String fontSize);

    // 통계 쿼리들
    @Query("SELECT COUNT(us) FROM UserSettings us WHERE us.emailNotifications = true")
    long countUsersWithEmailNotifications();

    @Query("SELECT COUNT(us) FROM UserSettings us WHERE us.pushNotifications = true")
    long countUsersWithPushNotifications();

    @Query("SELECT COUNT(us) FROM UserSettings us WHERE us.autoMatching = true")
    long countUsersWithAutoMatching();

    @Query("SELECT us.appLanguage, COUNT(us) FROM UserSettings us GROUP BY us.appLanguage")
    List<Object[]> countUsersByAppLanguage();

    @Query("SELECT us.preferredSessionType, COUNT(us) FROM UserSettings us GROUP BY us.preferredSessionType")
    List<Object[]> countUsersByPreferredSessionType();

    @Query("SELECT AVG(us.dailyGoalMinutes) FROM UserSettings us WHERE us.dailyGoalMinutes > 0")
    Double getAverageDailyGoalMinutes();

    @Query("SELECT AVG(us.weeklyGoalSessions) FROM UserSettings us WHERE us.weeklyGoalSessions > 0")
    Double getAverageWeeklyGoalSessions();

    // 설정 존재 여부 확인
    boolean existsByUserId(Long userId);

    // 기본 설정으로 되돌릴 사용자 검색
    @Query("SELECT us FROM UserSettings us WHERE " +
           "us.emailNotifications = true AND " +
           "us.pushNotifications = true AND " +
           "us.profileVisibility = 'PUBLIC' AND " +
           "us.autoMatching = false")
    List<UserSettings> findUsersWithDefaultSettings();
}