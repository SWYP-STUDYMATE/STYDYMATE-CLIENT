package com.studymate.server.service;

import com.studymate.server.entity.Notification;
import com.studymate.server.entity.NotificationType;
import com.studymate.server.entity.NotificationPriority;
import com.studymate.server.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // === 알림 생성 ===

    // 기본 알림 생성
    public Notification createNotification(Long userId, NotificationType type, String title, String message) {
        return createNotification(userId, null, type, title, message, NotificationPriority.NORMAL, null, null, null);
    }

    // 발송자가 있는 알림 생성
    public Notification createNotification(Long userId, Long senderUserId, NotificationType type, 
                                         String title, String message) {
        return createNotification(userId, senderUserId, type, title, message, NotificationPriority.NORMAL, null, null, null);
    }

    // 우선순위가 있는 알림 생성
    public Notification createNotification(Long userId, NotificationType type, String title, String message, 
                                         NotificationPriority priority) {
        return createNotification(userId, null, type, title, message, priority, null, null, null);
    }

    // 완전한 알림 생성
    public Notification createNotification(Long userId, Long senderUserId, NotificationType type, 
                                         String title, String message, NotificationPriority priority,
                                         String relatedEntityType, Long relatedEntityId, String actionUrl) {
        
        // 중복 알림 방지 체크 (최근 5분 내)
        if (shouldPreventDuplicate(userId, type, relatedEntityType, relatedEntityId)) {
            log.debug("Prevented duplicate notification for user {} type {}", userId, type);
            return null;
        }

        Notification notification = Notification.builder()
                .userId(userId)
                .senderUserId(senderUserId)
                .type(type)
                .title(title)
                .message(message)
                .priority(priority)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .actionUrl(actionUrl)
                .build();

        // 기본 설정 적용
        notification.setDefaultExpiration();
        notification.generateActionUrl();

        Notification saved = notificationRepository.save(notification);
        log.info("Created notification {} for user {} type {}", saved.getId(), userId, type);
        return saved;
    }

    // 예약 알림 생성
    public Notification createScheduledNotification(Long userId, NotificationType type, String title, String message,
                                                   LocalDateTime scheduledAt) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .priority(NotificationPriority.NORMAL)
                .scheduledAt(scheduledAt)
                .build();

        notification.setDefaultExpiration();
        notification.generateActionUrl();

        Notification saved = notificationRepository.save(notification);
        log.info("Created scheduled notification {} for user {} at {}", saved.getId(), userId, scheduledAt);
        return saved;
    }

    // === 특정 타입별 알림 생성 헬퍼 메서드 ===

    // 세션 초대 알림
    public Notification createSessionInvitationNotification(Long userId, Long inviterUserId, Long sessionId, 
                                                           String sessionTitle) {
        String title = "세션 초대";
        String message = String.format("'%s' 세션에 초대되었습니다.", sessionTitle);
        
        return createNotification(userId, inviterUserId, NotificationType.SESSION_INVITATION, 
                                title, message, NotificationPriority.HIGH, "Session", sessionId, null);
    }

    // 세션 리마인더 알림
    public Notification createSessionReminderNotification(Long userId, Long sessionId, String sessionTitle, 
                                                         LocalDateTime sessionTime) {
        String title = "세션 리마인더";
        String message = String.format("'%s' 세션이 %s에 시작됩니다.", sessionTitle, sessionTime);
        
        return createNotification(userId, null, NotificationType.SESSION_REMINDER, 
                                title, message, NotificationPriority.HIGH, "Session", sessionId, null);
    }

    // 채팅 메시지 알림
    public Notification createChatMessageNotification(Long userId, Long senderUserId, Long chatRoomId, 
                                                     String senderName, String messagePreview) {
        String title = "새 메시지";
        String message = String.format("%s: %s", senderName, messagePreview);
        
        return createNotification(userId, senderUserId, NotificationType.CHAT_MESSAGE, 
                                title, message, NotificationPriority.NORMAL, "ChatRoom", chatRoomId, null);
    }

    // 매칭 요청 알림
    public Notification createMatchRequestNotification(Long userId, Long requesterUserId, String requesterName) {
        String title = "매칭 요청";
        String message = String.format("%s님이 매칭을 요청했습니다.", requesterName);
        
        return createNotification(userId, requesterUserId, NotificationType.MATCH_REQUEST, 
                                title, message, NotificationPriority.HIGH, "User", requesterUserId, null);
    }

    // 친구 요청 알림
    public Notification createFriendRequestNotification(Long userId, Long requesterUserId, String requesterName) {
        String title = "친구 요청";
        String message = String.format("%s님이 친구 요청을 보냈습니다.", requesterName);
        
        return createNotification(userId, requesterUserId, NotificationType.FRIEND_REQUEST, 
                                title, message, NotificationPriority.NORMAL, "User", requesterUserId, null);
    }

    // 레벨업 알림
    public Notification createLevelUpNotification(Long userId, Integer newLevel) {
        String title = "레벨 업!";
        String message = String.format("축하합니다! 레벨 %d에 도달했습니다.", newLevel);
        
        return createNotification(userId, null, NotificationType.LEVEL_UP, 
                                title, message, NotificationPriority.HIGH, null, null, null);
    }

    // 시스템 공지 알림
    public Notification createSystemAnnouncementNotification(Long userId, String title, String message) {
        return createNotification(userId, null, NotificationType.SYSTEM_ANNOUNCEMENT, 
                                title, message, NotificationPriority.HIGH, null, null, null);
    }

    // === 알림 조회 ===

    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId, pageable);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseAndIsDeletedFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getImportantUnreadNotifications(Long userId) {
        return notificationRepository.findImportantUnreadNotifications(userId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByType(Long userId, NotificationType type) {
        return notificationRepository.findByUserIdAndTypeAndIsDeletedFalseOrderByCreatedAtDesc(userId, type);
    }

    @Transactional(readOnly = true)
    public List<Notification> getTodayNotifications(Long userId) {
        return notificationRepository.findTodayNotifications(userId);
    }

    // === 알림 상태 관리 ===

    // 알림 읽음 처리
    public Notification markAsRead(Long notificationId, Long userId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            throw new RuntimeException("알림을 찾을 수 없습니다: " + notificationId);
        }

        Notification notification = notificationOpt.get();
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("알림에 접근할 권한이 없습니다.");
        }

        notification.markAsRead();
        Notification updated = notificationRepository.save(notification);
        
        log.debug("Marked notification {} as read for user {}", notificationId, userId);
        return updated;
    }

    // 모든 알림 읽음 처리
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.markAsRead();
        }
        notificationRepository.saveAll(unreadNotifications);
        
        log.info("Marked {} notifications as read for user {}", unreadNotifications.size(), userId);
    }

    // 특정 타입 알림들 읽음 처리
    public void markTypeAsRead(Long userId, NotificationType type) {
        List<Notification> typeNotifications = notificationRepository
                .findByUserIdAndTypeAndIsDeletedFalseOrderByCreatedAtDesc(userId, type);
        
        for (Notification notification : typeNotifications) {
            if (!notification.getIsRead()) {
                notification.markAsRead();
            }
        }
        notificationRepository.saveAll(typeNotifications);
        
        log.info("Marked {} notifications of type {} as read for user {}", typeNotifications.size(), type, userId);
    }

    // 알림 삭제 (소프트 삭제)
    public void deleteNotification(Long notificationId, Long userId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            throw new RuntimeException("알림을 찾을 수 없습니다: " + notificationId);
        }

        Notification notification = notificationOpt.get();
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("알림을 삭제할 권한이 없습니다.");
        }

        notification.delete();
        notificationRepository.save(notification);
        
        log.info("Deleted notification {} for user {}", notificationId, userId);
    }

    // === 통계 및 개수 ===

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadNotifications(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCountByType(Long userId, NotificationType type) {
        return notificationRepository.countUnreadNotificationsByType(userId, type);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getNotificationStatistics(Long userId) {
        List<Object[]> typeStats = notificationRepository.countNotificationsByType(userId);
        List<Object[]> priorityStats = notificationRepository.countNotificationsByPriority(userId);
        List<Object[]> deliveryStats = notificationRepository.getNotificationDeliveryStats(userId);
        long unreadCount = getUnreadCount(userId);
        
        Object[] delivery = deliveryStats.isEmpty() ? new Object[]{0L, 0L} : deliveryStats.get(0);
        
        return Map.of(
            "unreadCount", unreadCount,
            "typeStats", typeStats,
            "priorityStats", priorityStats,
            "totalNotifications", delivery[0],
            "deliveredNotifications", delivery[1],
            "deliveryRate", (Long) delivery[0] > 0 ? ((Long) delivery[1] * 100.0 / (Long) delivery[0]) : 0.0
        );
    }

    // === 검색 ===

    @Transactional(readOnly = true)
    public List<Notification> searchNotifications(Long userId, String keyword) {
        return notificationRepository.searchNotifications(userId, keyword);
    }

    @Transactional(readOnly = true)
    public List<Notification> findWithFilters(Long userId, NotificationType type, 
                                             NotificationPriority priority, Boolean isRead) {
        return notificationRepository.findWithFilters(userId, type, priority, isRead);
    }

    // === 배치 처리 (푸시 알림 발송) ===

    @Transactional(readOnly = true)
    public List<Notification> getPendingPushNotifications() {
        return notificationRepository.findPendingPushNotifications(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<Notification> getPendingEmailNotifications() {
        return notificationRepository.findPendingEmailNotifications(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<Notification> getScheduledNotificationsDue() {
        return notificationRepository.findScheduledNotificationsDue(LocalDateTime.now());
    }

    // 푸시 알림 발송 완료 처리
    public void markAsPushed(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.markAsPushed();
            notificationRepository.save(notification);
            
            log.debug("Marked notification {} as pushed", notificationId);
        }
    }

    // 이메일 발송 완료 처리
    public void markAsEmailed(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.markAsEmailed();
            notificationRepository.save(notification);
            
            log.debug("Marked notification {} as emailed", notificationId);
        }
    }

    // 재시도 처리
    public boolean incrementRetryCount(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            boolean canRetry = notification.incrementRetryCount();
            notificationRepository.save(notification);
            
            log.debug("Incremented retry count for notification {}: {}/{}", 
                     notificationId, notification.getRetryCount(), notification.getMaxRetries());
            return canRetry;
        }
        return false;
    }

    // === 정리 작업 ===

    // 만료된 알림 정리
    public int cleanupExpiredNotifications() {
        List<Notification> expiredNotifications = notificationRepository.findExpiredNotifications(LocalDateTime.now());
        for (Notification notification : expiredNotifications) {
            notification.delete();
        }
        notificationRepository.saveAll(expiredNotifications);
        
        log.info("Cleaned up {} expired notifications", expiredNotifications.size());
        return expiredNotifications.size();
    }

    // 오래된 읽은 알림 정리 (30일 이상)
    public int cleanupOldReadNotifications() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        List<Notification> oldNotifications = notificationRepository.findOldReadNotifications(cutoff);
        for (Notification notification : oldNotifications) {
            notification.delete();
        }
        notificationRepository.saveAll(oldNotifications);
        
        log.info("Cleaned up {} old read notifications", oldNotifications.size());
        return oldNotifications.size();
    }

    // 오래된 삭제 표시 알림 완전 삭제 (7일 이상)
    public int permanentlyDeleteOldNotifications() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<Notification> oldDeletedNotifications = notificationRepository.findOldDeletedNotifications(cutoff);
        notificationRepository.deleteAll(oldDeletedNotifications);
        
        log.info("Permanently deleted {} old notifications", oldDeletedNotifications.size());
        return oldDeletedNotifications.size();
    }

    // === 유틸리티 메서드 ===

    // 중복 알림 방지 체크
    private boolean shouldPreventDuplicate(Long userId, NotificationType type, 
                                          String entityType, Long entityId) {
        if (entityType == null || entityId == null) {
            return false;
        }
        
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        return notificationRepository.existsSimilarNotification(
            userId, type, entityType, entityId, fiveMinutesAgo);
    }

    // 시스템 알림 일괄 발송 (관리자용)
    public void sendSystemNotificationToAllUsers(String title, String message, NotificationPriority priority) {
        // 실제 구현에서는 활성 사용자 목록을 가져와서 배치 처리
        log.info("System notification scheduled: {} - {}", title, message);
        // 배치 작업으로 처리하는 것이 좋음
    }
}