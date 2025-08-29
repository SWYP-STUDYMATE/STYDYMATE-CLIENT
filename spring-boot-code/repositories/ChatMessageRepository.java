package com.studymate.server.repository;

import com.studymate.server.entity.ChatMessage;
import com.studymate.server.entity.MessageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 채팅방별 메시지 조회 (페이지네이션)
    Page<ChatMessage> findByChatRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(Long chatRoomId, Pageable pageable);

    // 채팅방별 메시지 조회 (삭제된 것 포함)
    Page<ChatMessage> findByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId, Pageable pageable);

    // 채팅방의 최신 메시지
    Optional<ChatMessage> findTopByChatRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(Long chatRoomId);

    // 발송자별 메시지 조회
    List<ChatMessage> findBySenderUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long senderUserId);

    // 메시지 타입별 조회
    List<ChatMessage> findByChatRoomIdAndMessageTypeAndIsDeletedFalseOrderByCreatedAtDesc(Long chatRoomId, MessageType messageType);

    // 특정 시간 이후의 메시지들
    List<ChatMessage> findByChatRoomIdAndCreatedAtAfterAndIsDeletedFalseOrderByCreatedAt(Long chatRoomId, LocalDateTime after);

    // 특정 시간 범위의 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.createdAt BETWEEN :startTime AND :endTime " +
           "AND cm.isDeleted = false ORDER BY cm.createdAt ASC")
    List<ChatMessage> findMessagesBetweenTimes(@Param("chatRoomId") Long chatRoomId,
                                               @Param("startTime") LocalDateTime startTime,
                                               @Param("endTime") LocalDateTime endTime);

    // 답글 메시지들 조회
    List<ChatMessage> findByReplyToMessageIdAndIsDeletedFalseOrderByCreatedAt(Long replyToMessageId);

    // 시스템 메시지들 조회
    List<ChatMessage> findByChatRoomIdAndIsSystemMessageTrueOrderByCreatedAt(Long chatRoomId);

    // 수정된 메시지들 조회
    List<ChatMessage> findByChatRoomIdAndIsEditedTrueAndIsDeletedFalseOrderByEditedAtDesc(Long chatRoomId);

    // 파일이 첨부된 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.fileUrl IS NOT NULL AND cm.isDeleted = false " +
           "ORDER BY cm.createdAt DESC")
    List<ChatMessage> findMessagesWithFiles(@Param("chatRoomId") Long chatRoomId);

    // 이미지 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.imageUrl IS NOT NULL AND cm.isDeleted = false " +
           "ORDER BY cm.createdAt DESC")
    List<ChatMessage> findImageMessages(@Param("chatRoomId") Long chatRoomId);

    // 음성 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.voiceUrl IS NOT NULL AND cm.isDeleted = false " +
           "ORDER BY cm.createdAt DESC")
    List<ChatMessage> findVoiceMessages(@Param("chatRoomId") Long chatRoomId);

    // 메시지 검색 (내용 검색)
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND LOWER(cm.content) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "AND cm.isDeleted = false ORDER BY cm.createdAt DESC")
    List<ChatMessage> searchMessagesInRoom(@Param("chatRoomId") Long chatRoomId, @Param("query") String query);

    // 전체 채팅방에서 메시지 검색
    @Query("SELECT cm FROM ChatMessage cm WHERE " +
           "LOWER(cm.content) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "AND cm.isDeleted = false ORDER BY cm.createdAt DESC")
    List<ChatMessage> searchAllMessages(@Param("query") String query);

    // 사용자가 보낸 메시지 검색
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.senderUserId = :userId " +
           "AND LOWER(cm.content) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "AND cm.isDeleted = false ORDER BY cm.createdAt DESC")
    List<ChatMessage> searchUserMessages(@Param("userId") Long userId, @Param("query") String query);

    // 특정 사용자가 읽지 않은 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.id > :lastReadMessageId AND cm.senderUserId != :userId " +
           "AND cm.isDeleted = false ORDER BY cm.createdAt ASC")
    List<ChatMessage> findUnreadMessages(@Param("chatRoomId") Long chatRoomId,
                                         @Param("lastReadMessageId") Long lastReadMessageId,
                                         @Param("userId") Long userId);

    // 채팅방별 메시지 개수
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId AND cm.isDeleted = false")
    long countByChatRoomId(@Param("chatRoomId") Long chatRoomId);

    // 사용자별 메시지 개수
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.senderUserId = :userId AND cm.isDeleted = false")
    long countBySenderUserId(@Param("userId") Long userId);

    // 오늘 전송된 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND DATE(cm.createdAt) = CURRENT_DATE AND cm.isDeleted = false " +
           "ORDER BY cm.createdAt ASC")
    List<ChatMessage> findTodayMessages(@Param("chatRoomId") Long chatRoomId);

    // 가장 많은 반응을 받은 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.reactions IS NOT NULL AND cm.isDeleted = false " +
           "ORDER BY LENGTH(cm.reactions) DESC")
    List<ChatMessage> findMostReactedMessages(@Param("chatRoomId") Long chatRoomId);

    // 번역된 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.translatedContent IS NOT NULL AND cm.isDeleted = false " +
           "ORDER BY cm.createdAt DESC")
    List<ChatMessage> findTranslatedMessages(@Param("chatRoomId") Long chatRoomId);

    // 특정 언어로 작성된 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.originalLanguage = :language AND cm.isDeleted = false " +
           "ORDER BY cm.createdAt DESC")
    List<ChatMessage> findMessagesByLanguage(@Param("chatRoomId") Long chatRoomId, @Param("language") String language);

    // 멘션이 포함된 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.mentions IS NOT NULL AND cm.isDeleted = false " +
           "ORDER BY cm.createdAt DESC")
    List<ChatMessage> findMessagesWithMentions(@Param("chatRoomId") Long chatRoomId);

    // 특정 사용자가 멘션된 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.mentions LIKE CONCAT('%\"', :userId, '\"%') " +
           "AND cm.isDeleted = false ORDER BY cm.createdAt DESC")
    List<ChatMessage> findMessagesMentioningUser(@Param("chatRoomId") Long chatRoomId, @Param("userId") String userId);

    // 메시지 통계 - 시간대별 메시지 수
    @Query("SELECT HOUR(cm.createdAt), COUNT(cm) FROM ChatMessage cm " +
           "WHERE cm.chatRoomId = :chatRoomId AND cm.isDeleted = false " +
           "GROUP BY HOUR(cm.createdAt) ORDER BY HOUR(cm.createdAt)")
    List<Object[]> getMessageCountByHour(@Param("chatRoomId") Long chatRoomId);

    // 메시지 통계 - 일별 메시지 수
    @Query("SELECT DATE(cm.createdAt), COUNT(cm) FROM ChatMessage cm " +
           "WHERE cm.chatRoomId = :chatRoomId AND cm.isDeleted = false " +
           "GROUP BY DATE(cm.createdAt) ORDER BY DATE(cm.createdAt)")
    List<Object[]> getMessageCountByDate(@Param("chatRoomId") Long chatRoomId);

    // 메시지 통계 - 사용자별 메시지 수
    @Query("SELECT cm.senderUserId, COUNT(cm) FROM ChatMessage cm " +
           "WHERE cm.chatRoomId = :chatRoomId AND cm.isDeleted = false " +
           "GROUP BY cm.senderUserId ORDER BY COUNT(cm) DESC")
    List<Object[]> getMessageCountByUser(@Param("chatRoomId") Long chatRoomId);

    // 가장 긴 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.isDeleted = false ORDER BY LENGTH(cm.content) DESC")
    List<ChatMessage> findLongestMessages(@Param("chatRoomId") Long chatRoomId, Pageable pageable);

    // 최근 수정된 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.isEdited = true AND cm.isDeleted = false " +
           "ORDER BY cm.editedAt DESC")
    List<ChatMessage> findRecentlyEditedMessages(@Param("chatRoomId") Long chatRoomId);

    // 삭제 예정 메시지들 (자동 삭제 처리용)
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.isDeleted = true " +
           "AND cm.deletedAt < :before")
    List<ChatMessage> findMessagesForPermanentDeletion(@Param("before") LocalDateTime before);

    // 특정 메시지 이후의 메시지들 (실시간 업데이트용)
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoomId = :chatRoomId " +
           "AND cm.id > :messageId AND cm.isDeleted = false " +
           "ORDER BY cm.createdAt ASC")
    List<ChatMessage> findMessagesAfter(@Param("chatRoomId") Long chatRoomId, @Param("messageId") Long messageId);

    // 대용량 파일이 첨부된 메시지들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.fileSize > :minSize " +
           "AND cm.isDeleted = false ORDER BY cm.fileSize DESC")
    List<ChatMessage> findMessagesWithLargeFiles(@Param("minSize") Long minSize);

    // 채팅방의 첫 번째 메시지
    Optional<ChatMessage> findTopByChatRoomIdAndIsDeletedFalseOrderByCreatedAt(Long chatRoomId);

    // 특정 메시지의 모든 답글들
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.replyToMessageId = :messageId " +
           "AND cm.isDeleted = false ORDER BY cm.createdAt ASC")
    List<ChatMessage> findAllReplies(@Param("messageId") Long messageId);

    // 메시지 ID 존재 여부 확인
    boolean existsByIdAndIsDeletedFalse(Long messageId);

    // 사용자가 채팅방에서 보낸 마지막 메시지
    Optional<ChatMessage> findTopByChatRoomIdAndSenderUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long chatRoomId, Long senderUserId);
}