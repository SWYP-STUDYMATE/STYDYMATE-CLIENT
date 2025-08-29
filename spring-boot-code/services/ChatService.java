package com.studymate.server.service;

import com.studymate.server.entity.*;
import com.studymate.server.repository.ChatRoomRepository;
import com.studymate.server.repository.ChatMessageRepository;
import com.studymate.server.repository.ChatRoomParticipantRepository;
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
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomParticipantRepository participantRepository;

    // === 채팅방 관리 ===

    // 1:1 채팅방 생성 또는 조회
    public ChatRoom createOrGetPrivateRoom(Long userId1, Long userId2, Map<String, Object> roomData) {
        // 기존 1:1 채팅방 확인
        Optional<ChatRoom> existingRoom = chatRoomRepository.findPrivateRoomBetweenUsers(userId1, userId2);
        if (existingRoom.isPresent()) {
            ChatRoom room = existingRoom.get();
            if (!room.isActiveRoom()) {
                room.activate();
                chatRoomRepository.save(room);
            }
            return room;
        }

        // 새 1:1 채팅방 생성
        ChatRoom chatRoom = ChatRoom.builder()
                .roomUuid(generateRoomUuid())
                .roomType(ChatRoomType.PRIVATE)
                .createdByUserId(userId1)
                .maxParticipants(2)
                .languageFocus((String) roomData.get("languageFocus"))
                .build();

        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);

        // 참가자 추가
        addParticipantToRoom(savedRoom.getId(), userId1, ParticipantRole.MEMBER);
        addParticipantToRoom(savedRoom.getId(), userId2, ParticipantRole.MEMBER);

        savedRoom.addParticipant(); // user1
        savedRoom.addParticipant(); // user2
        chatRoomRepository.save(savedRoom);

        log.info("Private chat room created between users {} and {}", userId1, userId2);
        return savedRoom;
    }

    // 그룹 채팅방 생성
    public ChatRoom createGroupRoom(Long creatorUserId, Map<String, Object> roomData) {
        ChatRoom chatRoom = ChatRoom.builder()
                .roomUuid(generateRoomUuid())
                .name((String) roomData.get("name"))
                .description((String) roomData.get("description"))
                .roomType(ChatRoomType.GROUP)
                .createdByUserId(creatorUserId)
                .maxParticipants((Integer) roomData.getOrDefault("maxParticipants", 10))
                .languageFocus((String) roomData.get("languageFocus"))
                .tags((String) roomData.get("tags"))
                .settings((String) roomData.get("settings"))
                .build();

        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);

        // 생성자를 소유자로 추가
        addParticipantToRoom(savedRoom.getId(), creatorUserId, ParticipantRole.OWNER);
        savedRoom.addParticipant();
        chatRoomRepository.save(savedRoom);

        log.info("Group chat room created by user {} with name: {}", creatorUserId, chatRoom.getName());
        return savedRoom;
    }

    // 세션 채팅방 생성
    public ChatRoom createSessionRoom(Long sessionId, Long hostUserId) {
        ChatRoom chatRoom = ChatRoom.builder()
                .roomUuid(generateRoomUuid())
                .name("Session Chat")
                .roomType(ChatRoomType.SESSION)
                .createdByUserId(hostUserId)
                .sessionId(sessionId)
                .maxParticipants(10)
                .build();

        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);

        // 호스트를 관리자로 추가
        addParticipantToRoom(savedRoom.getId(), hostUserId, ParticipantRole.ADMIN);
        savedRoom.addParticipant();
        chatRoomRepository.save(savedRoom);

        log.info("Session chat room created for session {} by user {}", sessionId, hostUserId);
        return savedRoom;
    }

    // 채팅방 조회
    @Transactional(readOnly = true)
    public Optional<ChatRoom> findRoomById(Long roomId) {
        return chatRoomRepository.findById(roomId);
    }

    @Transactional(readOnly = true)
    public Optional<ChatRoom> findRoomByUuid(String roomUuid) {
        return chatRoomRepository.findByRoomUuid(roomUuid);
    }

    // 사용자의 채팅방 목록 조회
    @Transactional(readOnly = true)
    public List<ChatRoom> getUserChatRooms(Long userId) {
        return chatRoomRepository.findActiveRoomsByUserId(userId);
    }

    // 채팅방 참가
    public ChatRoomParticipant joinRoom(Long roomId, Long userId, String nickname) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + roomId));

        if (!room.canJoin()) {
            throw new RuntimeException("참가할 수 없는 채팅방입니다.");
        }

        // 이미 참가했는지 확인
        if (participantRepository.existsActiveParticipant(roomId, userId)) {
            throw new RuntimeException("이미 참가한 채팅방입니다.");
        }

        // 참가자 추가
        ChatRoomParticipant participant = addParticipantToRoom(roomId, userId, ParticipantRole.MEMBER);
        if (nickname != null && !nickname.trim().isEmpty()) {
            participant.setNickname(nickname);
        }
        participant.acceptInvitation();

        room.addParticipant();
        chatRoomRepository.save(room);

        log.info("User {} joined chat room {}", userId, roomId);
        return participantRepository.save(participant);
    }

    // 채팅방 떠나기
    public void leaveRoom(Long roomId, Long userId) {
        ChatRoomParticipant participant = participantRepository.findByChatRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new RuntimeException("참가자 정보를 찾을 수 없습니다."));

        participant.leaveChatRoom();
        participantRepository.save(participant);

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + roomId));

        room.removeParticipant();
        chatRoomRepository.save(room);

        log.info("User {} left chat room {}", userId, roomId);
    }

    // === 메시지 관리 ===

    // 메시지 전송
    public ChatMessage sendMessage(Long roomId, Long senderUserId, Map<String, Object> messageData) {
        // 참가자 권한 확인
        ChatRoomParticipant participant = participantRepository.findByChatRoomIdAndUserId(roomId, senderUserId)
                .orElseThrow(() -> new RuntimeException("채팅방 참가자가 아닙니다."));

        if (!participant.canSendMessage()) {
            throw new RuntimeException("메시지를 전송할 수 있는 권한이 없습니다.");
        }

        // 메시지 생성
        ChatMessage message = ChatMessage.builder()
                .chatRoomId(roomId)
                .senderUserId(senderUserId)
                .content((String) messageData.get("content"))
                .messageType(MessageType.valueOf((String) messageData.getOrDefault("messageType", "TEXT")))
                .originalLanguage((String) messageData.get("originalLanguage"))
                .replyToMessageId((Long) messageData.get("replyToMessageId"))
                .fileUrl((String) messageData.get("fileUrl"))
                .fileName((String) messageData.get("fileName"))
                .fileSize((Long) messageData.get("fileSize"))
                .fileType((String) messageData.get("fileType"))
                .imageUrl((String) messageData.get("imageUrl"))
                .thumbnailUrl((String) messageData.get("thumbnailUrl"))
                .voiceUrl((String) messageData.get("voiceUrl"))
                .voiceDuration((Integer) messageData.get("voiceDuration"))
                .mentions((String) messageData.get("mentions"))
                .metadata((String) messageData.get("metadata"))
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // 채팅방 정보 업데이트
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + roomId));

        room.updateLastMessage(savedMessage.getId(), savedMessage.getContent(), 
                             senderUserId, savedMessage.getCreatedAt());
        chatRoomRepository.save(room);

        // 참가자 메시지 카운트 증가
        participant.incrementMessageCount();
        participantRepository.save(participant);

        log.info("Message sent in room {} by user {}", roomId, senderUserId);
        return savedMessage;
    }

    // 메시지 조회 (페이지네이션)
    @Transactional(readOnly = true)
    public Page<ChatMessage> getMessages(Long roomId, Long userId, Pageable pageable) {
        // 사용자가 채팅방 참가자인지 확인
        if (!participantRepository.existsByChatRoomIdAndUserId(roomId, userId)) {
            throw new RuntimeException("채팅방에 접근할 권한이 없습니다.");
        }

        return chatMessageRepository.findByChatRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(roomId, pageable);
    }

    // 메시지 수정
    public ChatMessage editMessage(Long messageId, Long userId, String newContent) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("메시지를 찾을 수 없습니다: " + messageId));

        if (!message.getSenderUserId().equals(userId)) {
            throw new RuntimeException("메시지 수정 권한이 없습니다.");
        }

        if (!message.canEdit()) {
            throw new RuntimeException("수정할 수 없는 메시지입니다.");
        }

        message.editMessage(newContent);
        ChatMessage updated = chatMessageRepository.save(message);

        log.info("Message {} edited by user {}", messageId, userId);
        return updated;
    }

    // 메시지 삭제
    public void deleteMessage(Long messageId, Long userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("메시지를 찾을 수 없습니다: " + messageId));

        if (!message.getSenderUserId().equals(userId)) {
            // 관리자 권한 확인
            ChatRoomParticipant participant = participantRepository.findByChatRoomIdAndUserId(
                    message.getChatRoomId(), userId)
                    .orElseThrow(() -> new RuntimeException("메시지 삭제 권한이 없습니다."));

            if (!participant.isModerator()) {
                throw new RuntimeException("메시지 삭제 권한이 없습니다.");
            }
        }

        if (!message.canDelete()) {
            throw new RuntimeException("삭제할 수 없는 메시지입니다.");
        }

        message.deleteMessage();
        chatMessageRepository.save(message);

        log.info("Message {} deleted by user {}", messageId, userId);
    }

    // 메시지 읽음 표시
    public void markMessageAsRead(Long roomId, Long userId, Long messageId) {
        ChatRoomParticipant participant = participantRepository.findByChatRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new RuntimeException("참가자 정보를 찾을 수 없습니다."));

        participant.markMessageAsRead(messageId);
        participantRepository.save(participant);

        log.debug("Message {} marked as read by user {} in room {}", messageId, userId, roomId);
    }

    // 메시지 반응 추가
    public ChatMessage addReaction(Long messageId, Long userId, String emoji) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("메시지를 찾을 수 없습니다: " + messageId));

        // 참가자 권한 확인
        if (!participantRepository.existsActiveParticipant(message.getChatRoomId(), userId)) {
            throw new RuntimeException("반응을 추가할 권한이 없습니다.");
        }

        message.addReaction(emoji, userId);
        ChatMessage updated = chatMessageRepository.save(message);

        log.debug("Reaction {} added to message {} by user {}", emoji, messageId, userId);
        return updated;
    }

    // 메시지 반응 제거
    public ChatMessage removeReaction(Long messageId, Long userId, String emoji) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("메시지를 찾을 수 없습니다: " + messageId));

        message.removeReaction(emoji, userId);
        ChatMessage updated = chatMessageRepository.save(message);

        log.debug("Reaction {} removed from message {} by user {}", emoji, messageId, userId);
        return updated;
    }

    // === 채팅방 참가자 관리 ===

    // 채팅방 참가자 목록 조회
    @Transactional(readOnly = true)
    public List<ChatRoomParticipant> getRoomParticipants(Long roomId, Long requestUserId) {
        // 요청자가 참가자인지 확인
        if (!participantRepository.existsByChatRoomIdAndUserId(roomId, requestUserId)) {
            throw new RuntimeException("참가자 목록을 조회할 권한이 없습니다.");
        }

        return participantRepository.findActiveParticipantsByChatRoomId(roomId);
    }

    // 사용자 초대
    public ChatRoomParticipant inviteUser(Long roomId, Long inviterUserId, Long inviteeUserId) {
        // 초대자 권한 확인
        ChatRoomParticipant inviter = participantRepository.findByChatRoomIdAndUserId(roomId, inviterUserId)
                .orElseThrow(() -> new RuntimeException("채팅방 참가자가 아닙니다."));

        if (!inviter.isModerator() && !inviter.getRole().equals(ParticipantRole.MEMBER)) {
            // 일반 채팅방에서는 모든 멤버가 초대 가능하도록 설정할 수도 있음
        }

        // 이미 참가했는지 확인
        if (participantRepository.existsByChatRoomIdAndUserId(roomId, inviteeUserId)) {
            throw new RuntimeException("이미 참가한 사용자입니다.");
        }

        // 채팅방 참가 가능 여부 확인
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + roomId));

        if (!room.canJoin()) {
            throw new RuntimeException("더 이상 참가자를 초대할 수 없습니다.");
        }

        // 초대 정보 생성
        ChatRoomParticipant invitee = ChatRoomParticipant.builder()
                .chatRoomId(roomId)
                .userId(inviteeUserId)
                .role(ParticipantRole.MEMBER)
                .status(ParticipantStatus.INVITED)
                .invitedByUserId(inviterUserId)
                .build();

        ChatRoomParticipant saved = participantRepository.save(invitee);

        log.info("User {} invited to room {} by user {}", inviteeUserId, roomId, inviterUserId);
        return saved;
    }

    // 초대 수락
    public ChatRoomParticipant acceptInvitation(Long roomId, Long userId) {
        ChatRoomParticipant participant = participantRepository.findByChatRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new RuntimeException("초대 정보를 찾을 수 없습니다."));

        if (!participant.isPendingInvitation()) {
            throw new RuntimeException("처리할 초대가 없습니다.");
        }

        participant.acceptInvitation();
        ChatRoomParticipant accepted = participantRepository.save(participant);

        // 채팅방 참가자 수 증가
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + roomId));

        room.addParticipant();
        chatRoomRepository.save(room);

        log.info("User {} accepted invitation to room {}", userId, roomId);
        return accepted;
    }

    // 초대 거절
    public void declineInvitation(Long roomId, Long userId) {
        ChatRoomParticipant participant = participantRepository.findByChatRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new RuntimeException("초대 정보를 찾을 수 없습니다."));

        if (!participant.isPendingInvitation()) {
            throw new RuntimeException("처리할 초대가 없습니다.");
        }

        participant.declineInvitation();
        participantRepository.save(participant);

        log.info("User {} declined invitation to room {}", userId, roomId);
    }

    // === 검색 및 조회 ===

    // 메시지 검색
    @Transactional(readOnly = true)
    public List<ChatMessage> searchMessages(Long roomId, Long userId, String query) {
        // 참가자 권한 확인
        if (!participantRepository.existsByChatRoomIdAndUserId(roomId, userId)) {
            throw new RuntimeException("메시지 검색 권한이 없습니다.");
        }

        return chatMessageRepository.searchMessagesInRoom(roomId, query);
    }

    // 읽지 않은 메시지 개수 조회
    @Transactional(readOnly = true)
    public Map<String, Object> getUnreadMessageCount(Long roomId, Long userId) {
        ChatRoomParticipant participant = participantRepository.findByChatRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new RuntimeException("참가자 정보를 찾을 수 없습니다."));

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + roomId));

        long unreadCount = 0;
        if (participant.getLastReadMessageId() != null && room.getLastMessageId() != null) {
            if (participant.getLastReadMessageId() < room.getLastMessageId()) {
                List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessages(
                    roomId, participant.getLastReadMessageId(), userId);
                unreadCount = unreadMessages.size();
            }
        } else if (room.getLastMessageId() != null) {
            // 한 번도 읽지 않은 경우
            unreadCount = chatMessageRepository.countByChatRoomId(roomId);
        }

        return Map.of(
            "roomId", roomId,
            "unreadCount", unreadCount,
            "lastMessageId", room.getLastMessageId(),
            "lastReadMessageId", participant.getLastReadMessageId()
        );
    }

    // === 유틸리티 메서드 ===

    private ChatRoomParticipant addParticipantToRoom(Long roomId, Long userId, ParticipantRole role) {
        ChatRoomParticipant participant = ChatRoomParticipant.builder()
                .chatRoomId(roomId)
                .userId(userId)
                .role(role)
                .status(ParticipantStatus.ACTIVE)
                .joinedAt(LocalDateTime.now())
                .lastActivityAt(LocalDateTime.now())
                .build();

        return participantRepository.save(participant);
    }

    private String generateRoomUuid() {
        String uuid;
        do {
            uuid = "room_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        } while (chatRoomRepository.existsByRoomUuid(uuid));
        return uuid;
    }

    // === 관리 기능 ===

    // 참가자 추방
    public void kickParticipant(Long roomId, Long moderatorUserId, Long targetUserId, String reason) {
        // 모더레이터 권한 확인
        ChatRoomParticipant moderator = participantRepository.findByChatRoomIdAndUserId(roomId, moderatorUserId)
                .orElseThrow(() -> new RuntimeException("모더레이터 권한이 없습니다."));

        if (!moderator.isModerator()) {
            throw new RuntimeException("참가자를 추방할 권한이 없습니다.");
        }

        // 대상 참가자 조회
        ChatRoomParticipant target = participantRepository.findByChatRoomIdAndUserId(roomId, targetUserId)
                .orElseThrow(() -> new RuntimeException("참가자를 찾을 수 없습니다."));

        target.kickOut(moderatorUserId);
        participantRepository.save(target);

        // 채팅방 참가자 수 감소
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + roomId));

        room.removeParticipant();
        chatRoomRepository.save(room);

        log.info("User {} was kicked from room {} by moderator {} - reason: {}", 
                targetUserId, roomId, moderatorUserId, reason);
    }

    // 참가자 역할 변경
    public ChatRoomParticipant changeParticipantRole(Long roomId, Long adminUserId, Long targetUserId, 
                                                     ParticipantRole newRole) {
        // 관리자 권한 확인
        ChatRoomParticipant admin = participantRepository.findByChatRoomIdAndUserId(roomId, adminUserId)
                .orElseThrow(() -> new RuntimeException("관리자 권한이 없습니다."));

        if (!admin.isAdmin()) {
            throw new RuntimeException("역할을 변경할 권한이 없습니다.");
        }

        // 대상 참가자 조회
        ChatRoomParticipant target = participantRepository.findByChatRoomIdAndUserId(roomId, targetUserId)
                .orElseThrow(() -> new RuntimeException("참가자를 찾을 수 없습니다."));

        target.changeRole(newRole);
        ChatRoomParticipant updated = participantRepository.save(target);

        log.info("User {} role changed to {} in room {} by admin {}", 
                targetUserId, newRole, roomId, adminUserId);
        return updated;
    }

    // 채팅방 설정 업데이트
    public ChatRoom updateRoomSettings(Long roomId, Long userId, Map<String, Object> settings) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + roomId));

        // 권한 확인
        ChatRoomParticipant participant = participantRepository.findByChatRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new RuntimeException("권한이 없습니다."));

        if (!participant.isModerator() && !room.getCreatedByUserId().equals(userId)) {
            throw new RuntimeException("채팅방 설정을 변경할 권한이 없습니다.");
        }

        // 설정 업데이트
        if (settings.containsKey("name")) {
            room.setName((String) settings.get("name"));
        }
        if (settings.containsKey("description")) {
            room.setDescription((String) settings.get("description"));
        }
        if (settings.containsKey("languageFocus")) {
            room.setLanguageFocus((String) settings.get("languageFocus"));
        }

        ChatRoom updated = chatRoomRepository.save(room);
        log.info("Room {} settings updated by user {}", roomId, userId);
        return updated;
    }
}