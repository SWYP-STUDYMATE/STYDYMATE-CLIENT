package com.studymate.server.controller;

import com.studymate.server.entity.ChatRoom;
import com.studymate.server.entity.ChatMessage;
import com.studymate.server.entity.ChatRoomParticipant;
import com.studymate.server.entity.ParticipantRole;
import com.studymate.server.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // === 채팅방 관리 ===

    // 1:1 채팅방 생성/조회
    @PostMapping("/rooms/private")
    public ResponseEntity<ChatRoom> createOrGetPrivateRoom(@RequestBody Map<String, Object> requestData) {
        try {
            Long userId1 = Long.valueOf(requestData.get("userId1").toString());
            Long userId2 = Long.valueOf(requestData.get("userId2").toString());
            
            ChatRoom chatRoom = chatService.createOrGetPrivateRoom(userId1, userId2, requestData);
            return ResponseEntity.ok(chatRoom);
        } catch (RuntimeException e) {
            log.error("Error creating/getting private room: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 그룹 채팅방 생성
    @PostMapping("/rooms/group")
    public ResponseEntity<ChatRoom> createGroupRoom(@RequestBody Map<String, Object> requestData) {
        try {
            Long creatorUserId = Long.valueOf(requestData.get("creatorUserId").toString());
            
            ChatRoom chatRoom = chatService.createGroupRoom(creatorUserId, requestData);
            return ResponseEntity.ok(chatRoom);
        } catch (RuntimeException e) {
            log.error("Error creating group room: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 세션 채팅방 생성
    @PostMapping("/rooms/session")
    public ResponseEntity<ChatRoom> createSessionRoom(@RequestBody Map<String, Object> requestData) {
        try {
            Long sessionId = Long.valueOf(requestData.get("sessionId").toString());
            Long hostUserId = Long.valueOf(requestData.get("hostUserId").toString());
            
            ChatRoom chatRoom = chatService.createSessionRoom(sessionId, hostUserId);
            return ResponseEntity.ok(chatRoom);
        } catch (RuntimeException e) {
            log.error("Error creating session room: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 채팅방 조회 (ID)
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ChatRoom> getRoom(@PathVariable Long roomId) {
        return chatService.findRoomById(roomId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 채팅방 조회 (UUID)
    @GetMapping("/rooms/uuid/{roomUuid}")
    public ResponseEntity<ChatRoom> getRoomByUuid(@PathVariable String roomUuid) {
        return chatService.findRoomByUuid(roomUuid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 사용자의 채팅방 목록
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoom>> getUserChatRooms(@RequestParam Long userId) {
        List<ChatRoom> chatRooms = chatService.getUserChatRooms(userId);
        return ResponseEntity.ok(chatRooms);
    }

    // 채팅방 참가
    @PostMapping("/rooms/{roomId}/join")
    public ResponseEntity<ChatRoomParticipant> joinRoom(
            @PathVariable Long roomId,
            @RequestBody Map<String, Object> joinData) {
        
        try {
            Long userId = Long.valueOf(joinData.get("userId").toString());
            String nickname = (String) joinData.get("nickname");
            
            ChatRoomParticipant participant = chatService.joinRoom(roomId, userId, nickname);
            return ResponseEntity.ok(participant);
        } catch (RuntimeException e) {
            log.error("Error joining room: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 채팅방 떠나기
    @PostMapping("/rooms/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable Long roomId,
            @RequestParam Long userId) {
        
        try {
            chatService.leaveRoom(roomId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error leaving room: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // === 메시지 관리 ===

    // 메시지 전송
    @PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ChatMessage> sendMessage(
            @PathVariable Long roomId,
            @RequestBody Map<String, Object> messageData) {
        
        try {
            Long senderUserId = Long.valueOf(messageData.get("senderUserId").toString());
            
            ChatMessage message = chatService.sendMessage(roomId, senderUserId, messageData);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            log.error("Error sending message: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 메시지 조회 (페이지네이션)
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<Page<ChatMessage>> getMessages(
            @PathVariable Long roomId,
            @RequestParam Long userId,
            Pageable pageable) {
        
        try {
            Page<ChatMessage> messages = chatService.getMessages(roomId, userId, pageable);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            log.error("Error getting messages: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 메시지 수정
    @PatchMapping("/messages/{messageId}")
    public ResponseEntity<ChatMessage> editMessage(
            @PathVariable Long messageId,
            @RequestBody Map<String, Object> editData) {
        
        try {
            Long userId = Long.valueOf(editData.get("userId").toString());
            String newContent = (String) editData.get("content");
            
            ChatMessage updatedMessage = chatService.editMessage(messageId, userId, newContent);
            return ResponseEntity.ok(updatedMessage);
        } catch (RuntimeException e) {
            log.error("Error editing message: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 메시지 삭제
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            @RequestParam Long userId) {
        
        try {
            chatService.deleteMessage(messageId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error deleting message: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 메시지 읽음 표시
    @PostMapping("/rooms/{roomId}/messages/{messageId}/read")
    public ResponseEntity<Void> markMessageAsRead(
            @PathVariable Long roomId,
            @PathVariable Long messageId,
            @RequestParam Long userId) {
        
        try {
            chatService.markMessageAsRead(roomId, userId, messageId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error marking message as read: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 메시지 반응 추가
    @PostMapping("/messages/{messageId}/reactions")
    public ResponseEntity<ChatMessage> addReaction(
            @PathVariable Long messageId,
            @RequestBody Map<String, Object> reactionData) {
        
        try {
            Long userId = Long.valueOf(reactionData.get("userId").toString());
            String emoji = (String) reactionData.get("emoji");
            
            ChatMessage updatedMessage = chatService.addReaction(messageId, userId, emoji);
            return ResponseEntity.ok(updatedMessage);
        } catch (RuntimeException e) {
            log.error("Error adding reaction: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 메시지 반응 제거
    @DeleteMapping("/messages/{messageId}/reactions")
    public ResponseEntity<ChatMessage> removeReaction(
            @PathVariable Long messageId,
            @RequestParam Long userId,
            @RequestParam String emoji) {
        
        try {
            ChatMessage updatedMessage = chatService.removeReaction(messageId, userId, emoji);
            return ResponseEntity.ok(updatedMessage);
        } catch (RuntimeException e) {
            log.error("Error removing reaction: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // === 참가자 관리 ===

    // 채팅방 참가자 목록
    @GetMapping("/rooms/{roomId}/participants")
    public ResponseEntity<List<ChatRoomParticipant>> getRoomParticipants(
            @PathVariable Long roomId,
            @RequestParam Long requestUserId) {
        
        try {
            List<ChatRoomParticipant> participants = chatService.getRoomParticipants(roomId, requestUserId);
            return ResponseEntity.ok(participants);
        } catch (RuntimeException e) {
            log.error("Error getting room participants: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 사용자 초대
    @PostMapping("/rooms/{roomId}/invite")
    public ResponseEntity<ChatRoomParticipant> inviteUser(
            @PathVariable Long roomId,
            @RequestBody Map<String, Object> inviteData) {
        
        try {
            Long inviterUserId = Long.valueOf(inviteData.get("inviterUserId").toString());
            Long inviteeUserId = Long.valueOf(inviteData.get("inviteeUserId").toString());
            
            ChatRoomParticipant invitation = chatService.inviteUser(roomId, inviterUserId, inviteeUserId);
            return ResponseEntity.ok(invitation);
        } catch (RuntimeException e) {
            log.error("Error inviting user: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 초대 수락
    @PostMapping("/rooms/{roomId}/accept-invitation")
    public ResponseEntity<ChatRoomParticipant> acceptInvitation(
            @PathVariable Long roomId,
            @RequestParam Long userId) {
        
        try {
            ChatRoomParticipant participant = chatService.acceptInvitation(roomId, userId);
            return ResponseEntity.ok(participant);
        } catch (RuntimeException e) {
            log.error("Error accepting invitation: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 초대 거절
    @PostMapping("/rooms/{roomId}/decline-invitation")
    public ResponseEntity<Void> declineInvitation(
            @PathVariable Long roomId,
            @RequestParam Long userId) {
        
        try {
            chatService.declineInvitation(roomId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error declining invitation: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 참가자 추방
    @PostMapping("/rooms/{roomId}/kick")
    public ResponseEntity<Void> kickParticipant(
            @PathVariable Long roomId,
            @RequestBody Map<String, Object> kickData) {
        
        try {
            Long moderatorUserId = Long.valueOf(kickData.get("moderatorUserId").toString());
            Long targetUserId = Long.valueOf(kickData.get("targetUserId").toString());
            String reason = (String) kickData.getOrDefault("reason", "");
            
            chatService.kickParticipant(roomId, moderatorUserId, targetUserId, reason);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error kicking participant: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 참가자 역할 변경
    @PatchMapping("/rooms/{roomId}/participants/{targetUserId}/role")
    public ResponseEntity<ChatRoomParticipant> changeParticipantRole(
            @PathVariable Long roomId,
            @PathVariable Long targetUserId,
            @RequestBody Map<String, Object> roleData) {
        
        try {
            Long adminUserId = Long.valueOf(roleData.get("adminUserId").toString());
            ParticipantRole newRole = ParticipantRole.valueOf((String) roleData.get("role"));
            
            ChatRoomParticipant updatedParticipant = chatService.changeParticipantRole(
                roomId, adminUserId, targetUserId, newRole);
            return ResponseEntity.ok(updatedParticipant);
        } catch (RuntimeException e) {
            log.error("Error changing participant role: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // === 검색 및 조회 ===

    // 메시지 검색
    @GetMapping("/rooms/{roomId}/messages/search")
    public ResponseEntity<List<ChatMessage>> searchMessages(
            @PathVariable Long roomId,
            @RequestParam Long userId,
            @RequestParam String query) {
        
        try {
            List<ChatMessage> messages = chatService.searchMessages(roomId, userId, query);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            log.error("Error searching messages: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 읽지 않은 메시지 개수
    @GetMapping("/rooms/{roomId}/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadMessageCount(
            @PathVariable Long roomId,
            @RequestParam Long userId) {
        
        try {
            Map<String, Object> result = chatService.getUnreadMessageCount(roomId, userId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("Error getting unread message count: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // === 채팅방 설정 ===

    // 채팅방 설정 업데이트
    @PatchMapping("/rooms/{roomId}/settings")
    public ResponseEntity<ChatRoom> updateRoomSettings(
            @PathVariable Long roomId,
            @RequestBody Map<String, Object> settingsData) {
        
        try {
            Long userId = Long.valueOf(settingsData.get("userId").toString());
            settingsData.remove("userId"); // userId 제거 후 설정 데이터만 전달
            
            ChatRoom updatedRoom = chatService.updateRoomSettings(roomId, userId, settingsData);
            return ResponseEntity.ok(updatedRoom);
        } catch (RuntimeException e) {
            log.error("Error updating room settings: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // === WebSocket 지원을 위한 REST API ===

    // 채팅방 상태 조회 (WebSocket 연결 전 확인용)
    @GetMapping("/rooms/{roomId}/status")
    public ResponseEntity<Map<String, Object>> getRoomStatus(
            @PathVariable Long roomId,
            @RequestParam Long userId) {
        
        try {
            var room = chatService.findRoomById(roomId)
                    .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + roomId));
            
            var participants = chatService.getRoomParticipants(roomId, userId);
            var unreadInfo = chatService.getUnreadMessageCount(roomId, userId);
            
            Map<String, Object> status = Map.of(
                "room", room,
                "participantCount", participants.size(),
                "unreadCount", unreadInfo.get("unreadCount"),
                "canSendMessage", participants.stream()
                        .anyMatch(p -> p.getUserId().equals(userId) && p.canSendMessage())
            );
            
            return ResponseEntity.ok(status);
        } catch (RuntimeException e) {
            log.error("Error getting room status: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 채팅방 입장 가능 여부 확인
    @GetMapping("/rooms/{roomId}/can-join")
    public ResponseEntity<Map<String, Boolean>> canJoinRoom(@PathVariable Long roomId) {
        return chatService.findRoomById(roomId)
                .map(room -> ResponseEntity.ok(Map.of("canJoin", room.canJoin())))
                .orElse(ResponseEntity.notFound().build());
    }

    // 현재 온라인 참가자 수 조회 (WebSocket에서 관리되는 정보)
    @GetMapping("/rooms/{roomId}/online-count")
    public ResponseEntity<Map<String, Object>> getOnlineCount(@PathVariable Long roomId) {
        // 실제로는 WebSocket 세션 관리자에서 온라인 사용자 수를 가져와야 함
        // 여기서는 기본 구현만 제공
        return ResponseEntity.ok(Map.of(
            "roomId", roomId,
            "onlineCount", 0, // WebSocket 서비스에서 실제 값으로 대체 필요
            "totalParticipants", chatService.findRoomById(roomId)
                    .map(ChatRoom::getCurrentParticipants)
                    .orElse(0)
        ));
    }
}