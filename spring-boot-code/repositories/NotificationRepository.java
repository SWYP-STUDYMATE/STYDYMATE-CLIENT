package com.studymate.server.repository;

import com.studymate.server.entity.Notification;
import com.studymate.server.entity.NotificationType;
import com.studymate.server.entity.NotificationPriority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // === 기본 조회 ===

    // 사용자별 알림 조회 (페이지네이션)
    Page<Notification> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // 사용자별 읽지 않은 알림
    List<Notification> findByUserIdAndIsReadFalseAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);

    // 사용자별 읽은 알림
    List<Notification> findByUserIdAndIsReadTrueAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);

    // 특정 타입의 알림들
    List<Notification> findByUserIdAndTypeAndIsDeletedFalseOrderByCreatedAtDesc(Long userId, NotificationType type);

    // === 읽지 않은 알림 관련 ===

    // 읽지 않은 알림 개수
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isRead = false AND n.isDeleted = false")
    long countUnreadNotifications(@Param("userId") Long userId);

    // 타입별 읽지 않은 알림 개수
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.type = :type " +
           "AND n.isRead = false AND n.isDeleted = false")
    long countUnreadNotificationsByType(@Param("userId") Long userId, @Param("type") NotificationType type);

    // 우선순위별 읽지 않은 알림들
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.priority = :priority " +
           "AND n.isRead = false AND n.isDeleted = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadNotificationsByPriority(@Param("userId") Long userId, 
                                                         @Param("priority") NotificationPriority priority);

    // 중요 알림들 (HIGH, URGENT 우선순위)
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId " +
           "AND n.priority IN ('HIGH', 'URGENT') AND n.isRead = false AND n.isDeleted = false " +
           "ORDER BY n.priority DESC, n.createdAt DESC")
    List<Notification> findImportantUnreadNotifications(@Param("userId") Long userId);

    // === 발송 관련 ===

    // 푸시 알림 미발송 건들
    @Query("SELECT n FROM Notification n WHERE n.isPushed = false AND n.isDeleted = false " +
           "AND (n.scheduledAt IS NULL OR n.scheduledAt <= :now) " +
           "AND (n.expiresAt IS NULL OR n.expiresAt > :now) " +
           "ORDER BY n.priority DESC, n.createdAt ASC")
    List<Notification> findPendingPushNotifications(@Param("now") LocalDateTime now);

    // 이메일 미발송 건들
    @Query("SELECT n FROM Notification n WHERE n.isEmailed = false AND n.isDeleted = false " +
           "AND (n.scheduledAt IS NULL OR n.scheduledAt <= :now) " +
           "AND (n.expiresAt IS NULL OR n.expiresAt > :now) " +
           "AND n.type IN ('SYSTEM_ANNOUNCEMENT', 'SYSTEM_MAINTENANCE', 'ACCOUNT_SECURITY') " +
           "ORDER BY n.priority DESC, n.createdAt ASC")
    List<Notification> findPendingEmailNotifications(@Param("now") LocalDateTime now);

    // 재시도 대상 알림들
    @Query("SELECT n FROM Notification n WHERE n.isPushed = false AND n.retryCount < n.maxRetries " +
           "AND n.isDeleted = false AND (n.expiresAt IS NULL OR n.expiresAt > :now)")
    List<Notification> findNotificationsForRetry(@Param("now") LocalDateTime now);

    // 예약 알림들 (발송 시간 도래)
    @Query("SELECT n FROM Notification n WHERE n.scheduledAt IS NOT NULL AND n.scheduledAt <= :now " +
           "AND n.isPushed = false AND n.isDeleted = false")
    List<Notification> findScheduledNotificationsDue(@Param("now") LocalDateTime now);

    // === 관련 엔티티 기반 조회 ===

    // 특정 세션 관련 알림들
    @Query("SELECT n FROM Notification n WHERE n.relatedEntityType = 'Session' " +
           "AND n.relatedEntityId = :sessionId AND n.isDeleted = false " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findByRelatedSession(@Param("sessionId") Long sessionId);

    // 특정 채팅방 관련 알림들
    @Query("SELECT n FROM Notification n WHERE n.relatedEntityType = 'ChatRoom' " +
           "AND n.relatedEntityId = :chatRoomId AND n.isDeleted = false " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findByRelatedChatRoom(@Param("chatRoomId") Long chatRoomId);

    // 특정 사용자가 발송한 알림들
    List<Notification> findBySenderUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long senderUserId);

    // === 시간 기반 조회 ===

    // 특정 기간의 알림들
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId " +
           "AND n.createdAt BETWEEN :startDate AND :endDate AND n.isDeleted = false " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findByUserAndDateRange(@Param("userId") Long userId,
                                             @Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);

    // 오늘의 알림들
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId " +
           "AND DATE(n.createdAt) = CURRENT_DATE AND n.isDeleted = false " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findTodayNotifications(@Param("userId") Long userId);

    // 만료된 알림들
    @Query("SELECT n FROM Notification n WHERE n.expiresAt IS NOT NULL AND n.expiresAt < :now")
    List<Notification> findExpiredNotifications(@Param("now") LocalDateTime now);

    // === 정리 및 관리 ===

    // 오래된 읽은 알림들 (자동 삭제용)
    @Query("SELECT n FROM Notification n WHERE n.isRead = true AND n.readAt < :before")
    List<Notification> findOldReadNotifications(@Param("before") LocalDateTime before);

    // 오래된 삭제 표시 알림들 (완전 삭제용)
    @Query("SELECT n FROM Notification n WHERE n.isDeleted = true AND n.deletedAt < :before")
    List<Notification> findOldDeletedNotifications(@Param("before") LocalDateTime before);

    // 전송 실패 알림들 (최대 재시도 횟수 초과)
    @Query("SELECT n FROM Notification n WHERE n.retryCount >= n.maxRetries AND n.isPushed = false")
    List<Notification> findFailedNotifications();

    // === 통계 관련 ===

    // 타입별 알림 수 통계
    @Query("SELECT n.type, COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isDeleted = false " +
           "GROUP BY n.type")
    List<Object[]> countNotificationsByType(@Param("userId") Long userId);

    // 우선순위별 알림 수 통계
    @Query("SELECT n.priority, COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.isDeleted = false " +
           "GROUP BY n.priority")
    List<Object[]> countNotificationsByPriority(@Param("userId") Long userId);

    // 일별 알림 수 통계 (최근 30일)
    @Query("SELECT DATE(n.createdAt), COUNT(n) FROM Notification n WHERE n.userId = :userId " +
           "AND n.createdAt >= :since AND n.isDeleted = false " +
           "GROUP BY DATE(n.createdAt) ORDER BY DATE(n.createdAt)")
    List<Object[]> getDailyNotificationCount(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    // 발송 성공률 통계
    @Query("SELECT COUNT(n), SUM(CASE WHEN n.isPushed = true THEN 1 ELSE 0 END) " +
           "FROM Notification n WHERE n.userId = :userId AND n.isDeleted = false")
    List<Object[]> getNotificationDeliveryStats(@Param("userId") Long userId);

    // === 중복 방지 ===

    // 동일한 알림 존재 여부 확인 (중복 방지용)
    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.userId = :userId AND n.type = :type " +
           "AND n.relatedEntityType = :entityType AND n.relatedEntityId = :entityId " +
           "AND n.isDeleted = false AND n.createdAt > :since")
    boolean existsSimilarNotification(@Param("userId") Long userId, 
                                    @Param("type") NotificationType type,
                                    @Param("entityType") String entityType, 
                                    @Param("entityId") Long entityId,
                                    @Param("since") LocalDateTime since);

    // === 고급 검색 ===

    // 키워드로 알림 검색
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId " +
           "AND (LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.message) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND n.isDeleted = false ORDER BY n.createdAt DESC")
    List<Notification> searchNotifications(@Param("userId") Long userId, @Param("keyword") String keyword);

    // 복합 필터 검색
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.isDeleted = false " +
           "AND (:type IS NULL OR n.type = :type) " +
           "AND (:priority IS NULL OR n.priority = :priority) " +
           "AND (:isRead IS NULL OR n.isRead = :isRead) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findWithFilters(@Param("userId") Long userId,
                                      @Param("type") NotificationType type,
                                      @Param("priority") NotificationPriority priority,
                                      @Param("isRead") Boolean isRead);

    // === 시스템 관리용 ===

    // 전체 시스템 알림 발송 대상 사용자 수
    @Query("SELECT COUNT(DISTINCT n.userId) FROM Notification n WHERE n.type IN :systemTypes")
    long countUniqueUsersForSystemNotifications(@Param("systemTypes") List<NotificationType> systemTypes);

    // 높은 우선순위 알림 미처리 건수
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.priority IN ('HIGH', 'URGENT') " +
           "AND n.isRead = false AND n.isDeleted = false")
    long countUnhandledHighPriorityNotifications();

    // 발송 실패율이 높은 사용자들
    @Query("SELECT n.userId, COUNT(n), SUM(CASE WHEN n.isPushed = false THEN 1 ELSE 0 END) " +
           "FROM Notification n WHERE n.isDeleted = false " +
           "GROUP BY n.userId " +
           "HAVING COUNT(n) > 10 AND (SUM(CASE WHEN n.isPushed = false THEN 1 ELSE 0 END) * 100.0 / COUNT(n)) > 20")
    List<Object[]> findUsersWithHighFailureRate();

    // 최근 활동한 사용자들의 알림 (배치 발송용)
    @Query("SELECT n FROM Notification n WHERE n.isPushed = false AND n.isDeleted = false " +
           "AND n.userId IN (SELECT DISTINCT us.userId FROM UserStats us WHERE us.lastActivityDate >= :recentlyActive) " +
           "ORDER BY n.priority DESC, n.createdAt ASC")
    List<Notification> findNotificationsForActiveUsers(@Param("recentlyActive") LocalDateTime recentlyActive);
}