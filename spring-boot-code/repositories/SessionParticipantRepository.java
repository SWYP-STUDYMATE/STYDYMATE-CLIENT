package com.studymate.server.repository;

import com.studymate.server.entity.SessionParticipant;
import com.studymate.server.entity.ParticipantStatus;
import com.studymate.server.entity.ParticipantRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionParticipantRepository extends JpaRepository<SessionParticipant, Long> {

    // 기본 검색
    List<SessionParticipant> findBySessionId(Long sessionId);
    List<SessionParticipant> findByUserId(Long userId);
    Optional<SessionParticipant> findBySessionIdAndUserId(Long sessionId, Long userId);

    // 상태별 참가자 조회
    List<SessionParticipant> findByStatus(ParticipantStatus status);
    List<SessionParticipant> findBySessionIdAndStatus(Long sessionId, ParticipantStatus status);
    List<SessionParticipant> findByUserIdAndStatus(Long userId, ParticipantStatus status);

    // 역할별 참가자 조회
    List<SessionParticipant> findByRole(ParticipantRole role);
    List<SessionParticipant> findBySessionIdAndRole(Long sessionId, ParticipantRole role);

    // 세션별 활성 참가자 수 조회
    @Query("SELECT COUNT(sp) FROM SessionParticipant sp WHERE sp.sessionId = :sessionId AND sp.status = 'JOINED'")
    long countActiveParticipantsBySessionId(@Param("sessionId") Long sessionId);

    // 세션별 확인된 참가자 수 조회
    @Query("SELECT COUNT(sp) FROM SessionParticipant sp WHERE sp.sessionId = :sessionId AND sp.status = 'CONFIRMED'")
    long countConfirmedParticipantsBySessionId(@Param("sessionId") Long sessionId);

    // 사용자의 참가 예정 세션들
    @Query("SELECT sp FROM SessionParticipant sp WHERE sp.userId = :userId AND " +
           "sp.status IN ('CONFIRMED', 'INVITED') ORDER BY sp.createdAt DESC")
    List<SessionParticipant> findUpcomingParticipationsByUserId(@Param("userId") Long userId);

    // 사용자의 완료된 세션 참가 기록들
    @Query("SELECT sp FROM SessionParticipant sp WHERE sp.userId = :userId AND " +
           "sp.status = 'LEFT' AND sp.durationMinutes IS NOT NULL ORDER BY sp.leftAt DESC")
    List<SessionParticipant> findCompletedParticipationsByUserId(@Param("userId") Long userId);

    // 피드백이 있는 참가자들
    @Query("SELECT sp FROM SessionParticipant sp WHERE sp.rating IS NOT NULL AND sp.rating > 0")
    List<SessionParticipant> findParticipantsWithFeedback();

    // 세션별 평균 평점 조회
    @Query("SELECT AVG(sp.rating) FROM SessionParticipant sp WHERE sp.sessionId = :sessionId AND sp.rating IS NOT NULL")
    Double getAverageRatingBySessionId(@Param("sessionId") Long sessionId);

    // 사용자별 평균 받은 평점
    @Query("SELECT AVG(sp.rating) FROM SessionParticipant sp JOIN Session s ON sp.sessionId = s.id " +
           "WHERE s.hostUserId = :userId AND sp.rating IS NOT NULL")
    Double getAverageReceivedRatingByUserId(@Param("userId") Long userId);

    // 미참석자들 조회
    @Query("SELECT sp FROM SessionParticipant sp WHERE sp.noShow = true")
    List<SessionParticipant> findNoShowParticipants();

    // 사용자별 미참석 횟수
    @Query("SELECT COUNT(sp) FROM SessionParticipant sp WHERE sp.userId = :userId AND sp.noShow = true")
    long countNoShowsByUserId(@Param("userId") Long userId);

    // 리마인더 미발송 참가자들
    @Query("SELECT sp FROM SessionParticipant sp JOIN Session s ON sp.sessionId = s.id " +
           "WHERE sp.reminderSent = false AND sp.status = 'CONFIRMED' AND " +
           "s.scheduledStartTime BETWEEN :startTime AND :endTime")
    List<SessionParticipant> findParticipantsNeedingReminder(@Param("startTime") LocalDateTime startTime,
                                                            @Param("endTime") LocalDateTime endTime);

    // 특정 기간 동안의 참가자 활동
    @Query("SELECT sp FROM SessionParticipant sp WHERE sp.userId = :userId AND " +
           "sp.joinedAt BETWEEN :startDate AND :endDate ORDER BY sp.joinedAt DESC")
    List<SessionParticipant> findUserActivityInPeriod(@Param("userId") Long userId,
                                                      @Param("startDate") LocalDateTime startDate,
                                                      @Param("endDate") LocalDateTime endDate);

    // 언어별 참가 통계
    @Query("SELECT sp.languagePracticed, COUNT(sp) FROM SessionParticipant sp " +
           "WHERE sp.languagePracticed IS NOT NULL AND sp.status = 'LEFT' " +
           "GROUP BY sp.languagePracticed")
    List<Object[]> countParticipationsByLanguage();

    // 사용자의 총 학습 시간
    @Query("SELECT SUM(sp.durationMinutes) FROM SessionParticipant sp " +
           "WHERE sp.userId = :userId AND sp.durationMinutes IS NOT NULL")
    Long getTotalLearningMinutesByUserId(@Param("userId") Long userId);

    // 사용자의 월별 학습 시간
    @Query("SELECT SUM(sp.durationMinutes) FROM SessionParticipant sp " +
           "WHERE sp.userId = :userId AND sp.durationMinutes IS NOT NULL AND " +
           "YEAR(sp.joinedAt) = :year AND MONTH(sp.joinedAt) = :month")
    Long getMonthlyLearningMinutesByUserId(@Param("userId") Long userId, 
                                          @Param("year") int year, 
                                          @Param("month") int month);

    // 연결 품질별 통계
    @Query("SELECT sp.connectionQuality, COUNT(sp) FROM SessionParticipant sp " +
           "WHERE sp.connectionQuality IS NOT NULL GROUP BY sp.connectionQuality")
    List<Object[]> countByConnectionQuality();

    // 세션 완료율이 높은 사용자들
    @Query("SELECT sp.userId, COUNT(sp), " +
           "SUM(CASE WHEN sp.status = 'LEFT' AND sp.durationMinutes > 0 THEN 1 ELSE 0 END) as completedCount " +
           "FROM SessionParticipant sp GROUP BY sp.userId " +
           "HAVING COUNT(sp) >= :minSessions " +
           "ORDER BY (completedCount * 1.0 / COUNT(sp)) DESC")
    List<Object[]> findUsersWithHighCompletionRate(@Param("minSessions") long minSessions);

    // 자주 함께 세션하는 사용자 쌍들
    @Query("SELECT sp1.userId, sp2.userId, COUNT(*) as sessionCount " +
           "FROM SessionParticipant sp1 JOIN SessionParticipant sp2 ON sp1.sessionId = sp2.sessionId " +
           "WHERE sp1.userId < sp2.userId AND sp1.status = 'LEFT' AND sp2.status = 'LEFT' " +
           "GROUP BY sp1.userId, sp2.userId " +
           "HAVING COUNT(*) >= :minSessions " +
           "ORDER BY sessionCount DESC")
    List<Object[]> findFrequentSessionPartners(@Param("minSessions") long minSessions);

    // 참가자 존재 여부 확인
    boolean existsBySessionIdAndUserId(Long sessionId, Long userId);

    // 사용자의 최근 세션 참가 기록
    @Query("SELECT sp FROM SessionParticipant sp WHERE sp.userId = :userId " +
           "ORDER BY sp.createdAt DESC")
    List<SessionParticipant> findRecentParticipationsByUserId(@Param("userId") Long userId);

    // 세션의 호스트 여부 확인
    @Query("SELECT sp FROM SessionParticipant sp WHERE sp.sessionId = :sessionId AND sp.role = 'HOST'")
    Optional<SessionParticipant> findHostBySessionId(@Param("sessionId") Long sessionId);

    // 평점별 통계
    @Query("SELECT sp.rating, COUNT(sp) FROM SessionParticipant sp WHERE sp.rating IS NOT NULL GROUP BY sp.rating ORDER BY sp.rating")
    List<Object[]> countByRating();

    // 세션별 참가자 목록 (상세 정보 포함)
    @Query("SELECT sp FROM SessionParticipant sp WHERE sp.sessionId = :sessionId ORDER BY sp.role, sp.createdAt")
    List<SessionParticipant> findDetailedParticipantsBySessionId(@Param("sessionId") Long sessionId);
}