package com.studymate.server.repository;

import com.studymate.server.entity.ChatRoom;
import com.studymate.server.entity.ChatRoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // UUID로 채팅방 조회
    Optional<ChatRoom> findByRoomUuid(String roomUuid);

    // 생성자 ID로 채팅방 조회
    List<ChatRoom> findByCreatedByUserId(Long createdByUserId);

    // 채팅방 타입별 조회
    List<ChatRoom> findByRoomType(ChatRoomType roomType);

    // 활성 채팅방 조회
    List<ChatRoom> findByIsActiveTrueOrderByLastMessageAtDesc();

    // 비활성 채팅방 조회
    List<ChatRoom> findByIsActiveFalse();

    // 보관된 채팅방 조회
    List<ChatRoom> findByIsArchivedTrue();

    // 세션 ID로 채팅방 조회
    Optional<ChatRoom> findBySessionId(Long sessionId);

    // 매칭 요청 ID로 채팅방 조회
    Optional<ChatRoom> findByMatchingRequestId(Long matchingRequestId);

    // 이름으로 채팅방 검색
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.name LIKE %:name% AND cr.isActive = true")
    List<ChatRoom> findByNameContaining(@Param("name") String name);

    // 언어 포커스로 채팅방 검색
    List<ChatRoom> findByLanguageFocusAndIsActiveTrue(String languageFocus);

    // 사용자가 참가한 채팅방들 조회
    @Query("SELECT cr FROM ChatRoom cr JOIN ChatRoomParticipant crp ON cr.id = crp.chatRoomId " +
           "WHERE crp.userId = :userId AND crp.status = 'ACTIVE' AND cr.isActive = true " +
           "ORDER BY crp.isPinned DESC, cr.lastMessageAt DESC")
    List<ChatRoom> findActiveRoomsByUserId(@Param("userId") Long userId);

    // 사용자가 보관한 채팅방들 조회
    @Query("SELECT cr FROM ChatRoom cr JOIN ChatRoomParticipant crp ON cr.id = crp.chatRoomId " +
           "WHERE crp.userId = :userId AND crp.isArchived = true " +
           "ORDER BY crp.updatedAt DESC")
    List<ChatRoom> findArchivedRoomsByUserId(@Param("userId") Long userId);

    // 두 사용자 간의 1:1 채팅방 조회
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.roomType = 'PRIVATE' AND cr.currentParticipants = 2 " +
           "AND EXISTS (SELECT 1 FROM ChatRoomParticipant crp1 WHERE crp1.chatRoomId = cr.id AND crp1.userId = :userId1 AND crp1.status = 'ACTIVE') " +
           "AND EXISTS (SELECT 1 FROM ChatRoomParticipant crp2 WHERE crp2.chatRoomId = cr.id AND crp2.userId = :userId2 AND crp2.status = 'ACTIVE')")
    Optional<ChatRoom> findPrivateRoomBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    // 최근 메시지가 있는 활성 채팅방들
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.isActive = true AND cr.lastMessageAt IS NOT NULL " +
           "AND cr.lastMessageAt >= :since ORDER BY cr.lastMessageAt DESC")
    List<ChatRoom> findRecentlyActiveRooms(@Param("since") LocalDateTime since);

    // 참가자 수가 특정 수 이하인 채팅방들
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.currentParticipants <= :maxParticipants AND cr.isActive = true")
    List<ChatRoom> findRoomsWithFewParticipants(@Param("maxParticipants") Integer maxParticipants);

    // 빈 채팅방들 (참가자가 없는 채팅방)
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.currentParticipants = 0")
    List<ChatRoom> findEmptyRooms();

    // 특정 기간 동안 메시지가 없는 채팅방들
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.lastMessageAt IS NULL OR cr.lastMessageAt < :before")
    List<ChatRoom> findInactiveRoomsSince(@Param("before") LocalDateTime before);

    // 채팅방 통계 - 타입별 개수
    @Query("SELECT cr.roomType, COUNT(cr) FROM ChatRoom cr WHERE cr.isActive = true GROUP BY cr.roomType")
    List<Object[]> countActiveRoomsByType();

    // 채팅방 통계 - 월별 생성 개수
    @Query("SELECT YEAR(cr.createdAt), MONTH(cr.createdAt), COUNT(cr) FROM ChatRoom cr " +
           "GROUP BY YEAR(cr.createdAt), MONTH(cr.createdAt) ORDER BY YEAR(cr.createdAt), MONTH(cr.createdAt)")
    List<Object[]> countRoomsByMonth();

    // 가장 활발한 채팅방들 (메시지 수 기준)
    @Query("SELECT cr, COUNT(cm) as messageCount FROM ChatRoom cr LEFT JOIN ChatMessage cm ON cr.id = cm.chatRoomId " +
           "WHERE cr.isActive = true GROUP BY cr ORDER BY messageCount DESC")
    List<Object[]> findMostActiveRooms();

    // 평균 참가자 수
    @Query("SELECT AVG(cr.currentParticipants) FROM ChatRoom cr WHERE cr.isActive = true")
    Double getAverageParticipantCount();

    // 사용자가 관리하는 채팅방들 조회
    @Query("SELECT cr FROM ChatRoom cr JOIN ChatRoomParticipant crp ON cr.id = crp.chatRoomId " +
           "WHERE crp.userId = :userId AND crp.role IN ('ADMIN', 'OWNER') AND crp.status = 'ACTIVE'")
    List<ChatRoom> findManagedRoomsByUserId(@Param("userId") Long userId);

    // 언어별 채팅방 개수
    @Query("SELECT cr.languageFocus, COUNT(cr) FROM ChatRoom cr " +
           "WHERE cr.languageFocus IS NOT NULL AND cr.isActive = true " +
           "GROUP BY cr.languageFocus ORDER BY COUNT(cr) DESC")
    List<Object[]> countRoomsByLanguage();

    // UUID 존재 여부 확인
    boolean existsByRoomUuid(String roomUuid);

    // 특정 생성자의 활성 채팅방 개수
    @Query("SELECT COUNT(cr) FROM ChatRoom cr WHERE cr.createdByUserId = :userId AND cr.isActive = true")
    long countActiveRoomsByCreator(@Param("userId") Long userId);

    // 읽지 않은 메시지가 있는 채팅방들
    @Query("SELECT cr FROM ChatRoom cr JOIN ChatRoomParticipant crp ON cr.id = crp.chatRoomId " +
           "WHERE crp.userId = :userId AND crp.status = 'ACTIVE' " +
           "AND (crp.lastReadMessageId IS NULL OR crp.lastReadMessageId < cr.lastMessageId) " +
           "ORDER BY cr.lastMessageAt DESC")
    List<ChatRoom> findRoomsWithUnreadMessages(@Param("userId") Long userId);

    // 고정된 채팅방들 조회
    @Query("SELECT cr FROM ChatRoom cr JOIN ChatRoomParticipant crp ON cr.id = crp.chatRoomId " +
           "WHERE crp.userId = :userId AND crp.isPinned = true AND crp.status = 'ACTIVE' " +
           "ORDER BY crp.updatedAt DESC")
    List<ChatRoom> findPinnedRoomsByUserId(@Param("userId") Long userId);

    // 채팅방 검색 (제목, 설명, 태그)
    @Query("SELECT DISTINCT cr FROM ChatRoom cr WHERE cr.isActive = true AND " +
           "(LOWER(cr.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(cr.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(cr.tags) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<ChatRoom> searchRooms(@Param("query") String query);

    // 자동 정리가 필요한 채팅방들 (오랫동안 비활성)
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.isActive = true AND " +
           "(cr.lastMessageAt IS NULL OR cr.lastMessageAt < :cutoffTime) AND " +
           "cr.currentParticipants = 0")
    List<ChatRoom> findRoomsForAutoCleanup(@Param("cutoffTime") LocalDateTime cutoffTime);

    // 공개 그룹 채팅방들 조회 (참가 가능한)
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.roomType = 'GROUP' AND cr.isActive = true " +
           "AND (cr.maxParticipants IS NULL OR cr.currentParticipants < cr.maxParticipants) " +
           "ORDER BY cr.lastMessageAt DESC")
    List<ChatRoom> findJoinablePublicGroupRooms();
}