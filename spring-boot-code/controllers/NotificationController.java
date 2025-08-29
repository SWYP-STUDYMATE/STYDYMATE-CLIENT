package com.studymate.server.controller;

import com.studymate.server.entity.Notification;
import com.studymate.server.entity.NotificationType;
import com.studymate.server.entity.NotificationPriority;
import com.studymate.server.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // === 알림 조회 ===

    // 사용자 알림 목록 조회 (페이지네이션)
    @GetMapping
    public ResponseEntity<Page<Notification>> getUserNotifications(
            @RequestParam Long userId,
            Pageable pageable) {
        
        Page<Notification> notifications = notificationService.getUserNotifications(userId, pageable);
        return ResponseEntity.ok(notifications);
    }

    // 읽지 않은 알림 조회
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestParam Long userId) {
        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    // 중요한 읽지 않은 알림 조회
    @GetMapping("/unread/important")
    public ResponseEntity<List<Notification>> getImportantUnreadNotifications(@RequestParam Long userId) {
        List<Notification> notifications = notificationService.getImportantUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    // 타입별 알림 조회
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Notification>> getNotificationsByType(
            @PathVariable NotificationType type,
            @RequestParam Long userId) {
        
        List<Notification> notifications = notificationService.getNotificationsByType(userId, type);
        return ResponseEntity.ok(notifications);
    }

    // 오늘의 알림 조회
    @GetMapping("/today")
    public ResponseEntity<List<Notification>> getTodayNotifications(@RequestParam Long userId) {
        List<Notification> notifications = notificationService.getTodayNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    // 알림 상세 조회
    @GetMapping("/{notificationId}")
    public ResponseEntity<Notification> getNotification(
            @PathVariable Long notificationId,
            @RequestParam Long userId) {
        
        try {
            // 알림 읽음 처리도 함께 수행
            Notification notification = notificationService.markAsRead(notificationId, userId);
            return ResponseEntity.ok(notification);
        } catch (RuntimeException e) {
            log.error("Error getting notification: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // === 알림 생성 ===

    // 기본 알림 생성
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Map<String, Object> notificationData) {
        try {
            Long userId = Long.valueOf(notificationData.get("userId").toString());
            NotificationType type = NotificationType.valueOf((String) notificationData.get("type"));
            String title = (String) notificationData.get("title");
            String message = (String) notificationData.get("message");
            
            NotificationPriority priority = notificationData.get("priority") != null ?
                    NotificationPriority.valueOf((String) notificationData.get("priority")) :
                    NotificationPriority.NORMAL;
            
            Long senderUserId = notificationData.get("senderUserId") != null ?
                    Long.valueOf(notificationData.get("senderUserId").toString()) : null;
            
            String relatedEntityType = (String) notificationData.get("relatedEntityType");
            Long relatedEntityId = notificationData.get("relatedEntityId") != null ?
                    Long.valueOf(notificationData.get("relatedEntityId").toString()) : null;
            String actionUrl = (String) notificationData.get("actionUrl");
            
            Notification notification = notificationService.createNotification(
                userId, senderUserId, type, title, message, priority,
                relatedEntityType, relatedEntityId, actionUrl
            );
            
            return notification != null ? ResponseEntity.ok(notification) : ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating notification: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 예약 알림 생성
    @PostMapping("/scheduled")
    public ResponseEntity<Notification> createScheduledNotification(@RequestBody Map<String, Object> notificationData) {
        try {
            Long userId = Long.valueOf(notificationData.get("userId").toString());
            NotificationType type = NotificationType.valueOf((String) notificationData.get("type"));
            String title = (String) notificationData.get("title");
            String message = (String) notificationData.get("message");
            LocalDateTime scheduledAt = LocalDateTime.parse((String) notificationData.get("scheduledAt"));
            
            Notification notification = notificationService.createScheduledNotification(
                userId, type, title, message, scheduledAt
            );
            
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error creating scheduled notification: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // === 특정 타입별 알림 생성 ===

    // 세션 초대 알림
    @PostMapping("/session/invitation")
    public ResponseEntity<Notification> createSessionInvitationNotification(@RequestBody Map<String, Object> data) {
        try {
            Long userId = Long.valueOf(data.get("userId").toString());
            Long inviterUserId = Long.valueOf(data.get("inviterUserId").toString());
            Long sessionId = Long.valueOf(data.get("sessionId").toString());
            String sessionTitle = (String) data.get("sessionTitle");
            
            Notification notification = notificationService.createSessionInvitationNotification(
                userId, inviterUserId, sessionId, sessionTitle
            );
            
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error creating session invitation notification: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 세션 리마인더 알림
    @PostMapping("/session/reminder")
    public ResponseEntity<Notification> createSessionReminderNotification(@RequestBody Map<String, Object> data) {
        try {
            Long userId = Long.valueOf(data.get("userId").toString());
            Long sessionId = Long.valueOf(data.get("sessionId").toString());
            String sessionTitle = (String) data.get("sessionTitle");
            LocalDateTime sessionTime = LocalDateTime.parse((String) data.get("sessionTime"));
            
            Notification notification = notificationService.createSessionReminderNotification(
                userId, sessionId, sessionTitle, sessionTime
            );
            
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error creating session reminder notification: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 채팅 메시지 알림
    @PostMapping("/chat/message")
    public ResponseEntity<Notification> createChatMessageNotification(@RequestBody Map<String, Object> data) {
        try {
            Long userId = Long.valueOf(data.get("userId").toString());
            Long senderUserId = Long.valueOf(data.get("senderUserId").toString());
            Long chatRoomId = Long.valueOf(data.get("chatRoomId").toString());
            String senderName = (String) data.get("senderName");
            String messagePreview = (String) data.get("messagePreview");
            
            Notification notification = notificationService.createChatMessageNotification(
                userId, senderUserId, chatRoomId, senderName, messagePreview
            );
            
            return notification != null ? ResponseEntity.ok(notification) : ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating chat message notification: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 매칭 요청 알림
    @PostMapping("/match/request")
    public ResponseEntity<Notification> createMatchRequestNotification(@RequestBody Map<String, Object> data) {
        try {
            Long userId = Long.valueOf(data.get("userId").toString());
            Long requesterUserId = Long.valueOf(data.get("requesterUserId").toString());
            String requesterName = (String) data.get("requesterName");
            
            Notification notification = notificationService.createMatchRequestNotification(
                userId, requesterUserId, requesterName
            );
            
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error creating match request notification: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 친구 요청 알림
    @PostMapping("/friend/request")
    public ResponseEntity<Notification> createFriendRequestNotification(@RequestBody Map<String, Object> data) {
        try {
            Long userId = Long.valueOf(data.get("userId").toString());
            Long requesterUserId = Long.valueOf(data.get("requesterUserId").toString());
            String requesterName = (String) data.get("requesterName");
            
            Notification notification = notificationService.createFriendRequestNotification(
                userId, requesterUserId, requesterName
            );
            
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error creating friend request notification: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 레벨업 알림
    @PostMapping("/levelup")
    public ResponseEntity<Notification> createLevelUpNotification(@RequestBody Map<String, Object> data) {
        try {
            Long userId = Long.valueOf(data.get("userId").toString());
            Integer newLevel = (Integer) data.get("newLevel");
            
            Notification notification = notificationService.createLevelUpNotification(userId, newLevel);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error creating level up notification: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 시스템 공지 알림
    @PostMapping("/system/announcement")
    public ResponseEntity<Notification> createSystemAnnouncementNotification(@RequestBody Map<String, Object> data) {
        try {
            Long userId = Long.valueOf(data.get("userId").toString());
            String title = (String) data.get("title");
            String message = (String) data.get("message");
            
            Notification notification = notificationService.createSystemAnnouncementNotification(userId, title, message);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error creating system announcement notification: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // === 알림 상태 관리 ===

    // 알림 읽음 처리
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam Long userId) {
        
        try {
            Notification notification = notificationService.markAsRead(notificationId, userId);
            return ResponseEntity.ok(notification);
        } catch (RuntimeException e) {
            log.error("Error marking notification as read: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 모든 알림 읽음 처리
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@RequestParam Long userId) {
        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            log.error("Error marking all notifications as read: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 특정 타입 알림들 읽음 처리
    @PatchMapping("/type/{type}/read-all")
    public ResponseEntity<Map<String, String>> markTypeAsRead(
            @PathVariable NotificationType type,
            @RequestParam Long userId) {
        
        try {
            notificationService.markTypeAsRead(userId, type);
            return ResponseEntity.ok(Map.of("message", "Notifications of type " + type + " marked as read"));
        } catch (Exception e) {
            log.error("Error marking type notifications as read: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 알림 삭제
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @PathVariable Long notificationId,
            @RequestParam Long userId) {
        
        try {
            notificationService.deleteNotification(notificationId, userId);
            return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
        } catch (RuntimeException e) {
            log.error("Error deleting notification: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // === 통계 및 개수 ===

    // 읽지 않은 알림 개수
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // 타입별 읽지 않은 알림 개수
    @GetMapping("/unread-count/{type}")
    public ResponseEntity<Map<String, Long>> getUnreadCountByType(
            @PathVariable NotificationType type,
            @RequestParam Long userId) {
        
        long count = notificationService.getUnreadCountByType(userId, type);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // 알림 통계
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getNotificationStatistics(@RequestParam Long userId) {
        Map<String, Object> stats = notificationService.getNotificationStatistics(userId);
        return ResponseEntity.ok(stats);
    }

    // === 검색 ===

    // 알림 검색
    @GetMapping("/search")
    public ResponseEntity<List<Notification>> searchNotifications(
            @RequestParam Long userId,
            @RequestParam String keyword) {
        
        List<Notification> notifications = notificationService.searchNotifications(userId, keyword);
        return ResponseEntity.ok(notifications);
    }

    // 필터링된 알림 조회
    @GetMapping("/filter")
    public ResponseEntity<List<Notification>> findWithFilters(
            @RequestParam Long userId,
            @RequestParam(required = false) NotificationType type,
            @RequestParam(required = false) NotificationPriority priority,
            @RequestParam(required = false) Boolean isRead) {
        
        List<Notification> notifications = notificationService.findWithFilters(userId, type, priority, isRead);
        return ResponseEntity.ok(notifications);
    }

    // === 배치 작업 관련 (관리자용) ===

    // 발송 대기 중인 푸시 알림 조회
    @GetMapping("/admin/pending-push")
    public ResponseEntity<List<Notification>> getPendingPushNotifications() {
        List<Notification> notifications = notificationService.getPendingPushNotifications();
        return ResponseEntity.ok(notifications);
    }

    // 발송 대기 중인 이메일 알림 조회
    @GetMapping("/admin/pending-email")
    public ResponseEntity<List<Notification>> getPendingEmailNotifications() {
        List<Notification> notifications = notificationService.getPendingEmailNotifications();
        return ResponseEntity.ok(notifications);
    }

    // 예약 시간이 도래한 알림들 조회
    @GetMapping("/admin/scheduled-due")
    public ResponseEntity<List<Notification>> getScheduledNotificationsDue() {
        List<Notification> notifications = notificationService.getScheduledNotificationsDue();
        return ResponseEntity.ok(notifications);
    }

    // 푸시 알림 발송 완료 처리
    @PatchMapping("/admin/{notificationId}/pushed")
    public ResponseEntity<Map<String, String>> markAsPushed(@PathVariable Long notificationId) {
        notificationService.markAsPushed(notificationId);
        return ResponseEntity.ok(Map.of("message", "Notification marked as pushed"));
    }

    // 이메일 발송 완료 처리
    @PatchMapping("/admin/{notificationId}/emailed")
    public ResponseEntity<Map<String, String>> markAsEmailed(@PathVariable Long notificationId) {
        notificationService.markAsEmailed(notificationId);
        return ResponseEntity.ok(Map.of("message", "Notification marked as emailed"));
    }

    // 재시도 횟수 증가
    @PatchMapping("/admin/{notificationId}/retry")
    public ResponseEntity<Map<String, Object>> incrementRetryCount(@PathVariable Long notificationId) {
        boolean canRetry = notificationService.incrementRetryCount(notificationId);
        return ResponseEntity.ok(Map.of(
            "message", "Retry count incremented",
            "canRetry", canRetry
        ));
    }

    // === 정리 작업 ===

    // 만료된 알림 정리
    @PostMapping("/admin/cleanup-expired")
    public ResponseEntity<Map<String, Object>> cleanupExpiredNotifications() {
        int count = notificationService.cleanupExpiredNotifications();
        return ResponseEntity.ok(Map.of(
            "message", "Expired notifications cleaned up",
            "count", count
        ));
    }

    // 오래된 읽은 알림 정리
    @PostMapping("/admin/cleanup-old-read")
    public ResponseEntity<Map<String, Object>> cleanupOldReadNotifications() {
        int count = notificationService.cleanupOldReadNotifications();
        return ResponseEntity.ok(Map.of(
            "message", "Old read notifications cleaned up",
            "count", count
        ));
    }

    // 오래된 삭제 표시 알림 완전 삭제
    @PostMapping("/admin/permanent-delete-old")
    public ResponseEntity<Map<String, Object>> permanentlyDeleteOldNotifications() {
        int count = notificationService.permanentlyDeleteOldNotifications();
        return ResponseEntity.ok(Map.of(
            "message", "Old notifications permanently deleted",
            "count", count
        ));
    }

    // === 대시보드용 요약 정보 ===

    // 사용자 알림 요약 (대시보드용)
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getNotificationSummary(@RequestParam Long userId) {
        long unreadCount = notificationService.getUnreadCount(userId);
        List<Notification> importantUnread = notificationService.getImportantUnreadNotifications(userId);
        List<Notification> todayNotifications = notificationService.getTodayNotifications(userId);
        
        return ResponseEntity.ok(Map.of(
            "unreadCount", unreadCount,
            "importantUnreadCount", importantUnread.size(),
            "todayNotificationsCount", todayNotifications.size(),
            "importantUnread", importantUnread.stream().limit(5).toList(),
            "recentNotifications", todayNotifications.stream().limit(10).toList()
        ));
    }
}