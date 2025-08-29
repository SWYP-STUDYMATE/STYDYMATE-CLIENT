package com.studymate.server.repository;

import com.studymate.server.entity.Session;
import com.studymate.server.entity.SessionStatus;
import com.studymate.server.entity.SessionType;
import com.studymate.server.entity.SessionMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    // 기본 검색
    Optional<Session> findByRoomId(String roomId);
    List<Session> findByHostUserId(Long hostUserId);
    List<Session> findByStatus(SessionStatus status);

    // 날짜별 세션 조회
    @Query("SELECT s FROM Session s WHERE DATE(s.scheduledStartTime) = DATE(:date) ORDER BY s.scheduledStartTime")
    List<Session> findByScheduledDate(@Param("date") LocalDateTime date);

    @Query("SELECT s FROM Session s WHERE s.scheduledStartTime BETWEEN :startDate AND :endDate ORDER BY s.scheduledStartTime")
    List<Session> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // 사용자별 세션 조회 (참가자로서)
    @Query("SELECT s FROM Session s JOIN SessionParticipant sp ON s.id = sp.sessionId " +
           "WHERE sp.userId = :userId ORDER BY s.scheduledStartTime DESC")
    List<Session> findByParticipantUserId(@Param("userId") Long userId);

    // 사용자의 예정된 세션들
    @Query("SELECT s FROM Session s JOIN SessionParticipant sp ON s.id = sp.sessionId " +
           "WHERE sp.userId = :userId AND s.status = 'SCHEDULED' AND s.scheduledStartTime > :now " +
           "ORDER BY s.scheduledStartTime ASC")
    List<Session> findUpcomingSessionsByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // 사용자의 완료된 세션들
    @Query("SELECT s FROM Session s JOIN SessionParticipant sp ON s.id = sp.sessionId " +
           "WHERE sp.userId = :userId AND s.status = 'COMPLETED' " +
           "ORDER BY s.actualEndTime DESC")
    List<Session> findCompletedSessionsByUserId(@Param("userId") Long userId);

    // 활성 세션들
    @Query("SELECT s FROM Session s WHERE s.status = 'ACTIVE' ORDER BY s.actualStartTime")
    List<Session> findActiveSessions();

    // 오늘 예정된 세션들
    @Query("SELECT s FROM Session s WHERE s.status = 'SCHEDULED' AND DATE(s.scheduledStartTime) = DATE(:today) " +
           "ORDER BY s.scheduledStartTime")
    List<Session> findTodaysSessions(@Param("today") LocalDateTime today);

    // 언어별 세션 검색
    List<Session> findByLanguageFocus(String languageFocus);

    @Query("SELECT s FROM Session s WHERE s.languageFocus = :language AND s.status = 'SCHEDULED' AND s.isPublic = true " +
           "ORDER BY s.scheduledStartTime")
    List<Session> findPublicSessionsByLanguage(@Param("language") String language);

    // 난이도별 세션 검색
    List<Session> findByDifficultyLevel(String difficultyLevel);

    // 세션 타입별 검색
    List<Session> findBySessionType(SessionType sessionType);
    List<Session> findBySessionMode(SessionMode sessionMode);

    // 공개 세션 검색
    @Query("SELECT s FROM Session s WHERE s.isPublic = true AND s.status = 'SCHEDULED' AND " +
           "s.currentParticipants < s.maxParticipants AND s.scheduledStartTime > :now " +
           "ORDER BY s.scheduledStartTime")
    List<Session> findAvailablePublicSessions(@Param("now") LocalDateTime now);

    // 복합 조건 검색
    @Query("SELECT s FROM Session s WHERE " +
           "s.status = 'SCHEDULED' AND " +
           "s.currentParticipants < s.maxParticipants AND " +
           "s.scheduledStartTime > :now AND " +
           "(:language IS NULL OR s.languageFocus = :language) AND " +
           "(:sessionType IS NULL OR s.sessionType = :sessionType) AND " +
           "(:difficultyLevel IS NULL OR s.difficultyLevel = :difficultyLevel) AND " +
           "(:isPublic IS NULL OR s.isPublic = :isPublic) " +
           "ORDER BY s.scheduledStartTime")
    List<Session> findSessionsWithFilters(@Param("now") LocalDateTime now,
                                         @Param("language") String language,
                                         @Param("sessionType") SessionType sessionType,
                                         @Param("difficultyLevel") String difficultyLevel,
                                         @Param("isPublic") Boolean isPublic);

    // 제목이나 설명에서 검색
    @Query("SELECT s FROM Session s WHERE " +
           "(LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "s.status = 'SCHEDULED' AND s.isPublic = true " +
           "ORDER BY s.scheduledStartTime")
    List<Session> searchPublicSessions(@Param("query") String query);

    // 시간대별 세션 검색
    List<Session> findByTimezone(String timezone);

    // 곧 시작될 세션들 (리마인더용)
    @Query("SELECT s FROM Session s WHERE s.status = 'SCHEDULED' AND " +
           "s.scheduledStartTime BETWEEN :startTime AND :endTime")
    List<Session> findSessionsStartingSoon(@Param("startTime") LocalDateTime startTime, 
                                          @Param("endTime") LocalDateTime endTime);

    // 자동 취소 대상 세션들 (시작 시간이 지났지만 시작되지 않은 세션들)
    @Query("SELECT s FROM Session s WHERE s.status = 'SCHEDULED' AND s.scheduledStartTime < :cutoffTime")
    List<Session> findSessionsToAutoCancel(@Param("cutoffTime") LocalDateTime cutoffTime);

    // 녹화 파일이 있는 세션들
    @Query("SELECT s FROM Session s WHERE s.recordingUrl IS NOT NULL AND s.recordingUrl != ''")
    List<Session> findSessionsWithRecordings();

    // 통계 쿼리들
    @Query("SELECT COUNT(s) FROM Session s WHERE s.status = :status")
    long countByStatus(@Param("status") SessionStatus status);

    @Query("SELECT COUNT(s) FROM Session s WHERE s.hostUserId = :userId")
    long countByHostUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(s) FROM Session s WHERE DATE(s.scheduledStartTime) = DATE(:date)")
    long countByDate(@Param("date") LocalDateTime date);

    @Query("SELECT s.languageFocus, COUNT(s) FROM Session s WHERE s.status = 'COMPLETED' GROUP BY s.languageFocus")
    List<Object[]> countCompletedSessionsByLanguage();

    @Query("SELECT s.sessionType, COUNT(s) FROM Session s WHERE s.status = 'COMPLETED' GROUP BY s.sessionType")
    List<Object[]> countCompletedSessionsByType();

    @Query("SELECT AVG(s.actualDuration) FROM Session s WHERE s.status = 'COMPLETED' AND s.actualDuration IS NOT NULL")
    Double getAverageSessionDuration();

    // 사용자별 통계
    @Query("SELECT COUNT(s) FROM Session s JOIN SessionParticipant sp ON s.id = sp.sessionId " +
           "WHERE sp.userId = :userId AND s.status = 'COMPLETED'")
    long countCompletedSessionsByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(sp.durationMinutes) FROM SessionParticipant sp " +
           "WHERE sp.userId = :userId AND sp.durationMinutes IS NOT NULL")
    Long getTotalLearningMinutesByUserId(@Param("userId") Long userId);

    // 인기 있는 세션들 (참가자 수 기준)
    @Query("SELECT s FROM Session s WHERE s.status = 'COMPLETED' ORDER BY s.currentParticipants DESC")
    List<Session> findPopularSessions();

    // 최근 활동이 있는 세션들
    @Query("SELECT s FROM Session s WHERE s.updatedAt >= :since ORDER BY s.updatedAt DESC")
    List<Session> findRecentlyUpdatedSessions(@Param("since") LocalDateTime since);

    // 특정 시간대의 세션 검색
    @Query("SELECT s FROM Session s WHERE HOUR(s.scheduledStartTime) BETWEEN :startHour AND :endHour " +
           "AND s.status = 'SCHEDULED' ORDER BY s.scheduledStartTime")
    List<Session> findSessionsByTimeRange(@Param("startHour") int startHour, @Param("endHour") int endHour);
}