package com.studymate.server.repository;

import com.studymate.server.entity.ChatRoomParticipant;
import com.studymate.server.entity.ParticipantRole;
import com.studymate.server.entity.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomParticipantRepository extends JpaRepository<ChatRoomParticipant, Long> {

    // 기본 검색
    List<ChatRoomParticipant> findByChatRoomId(Long chatRoomId);
    List<ChatRoomParticipant> findByUserId(Long userId);
    Optional<ChatRoomParticipant> findByChatRoomIdAndUserId(Long chatRoomId, Long userId);

    // 상태별 참가자 조회
    List<ChatRoomParticipant> findByStatus(ParticipantStatus status);
    List<ChatRoomParticipant> findByChatRoomIdAndStatus(Long chatRoomId, ParticipantStatus status);
    List<ChatRoomParticipant> findByUserIdAndStatus(Long userId, ParticipantStatus status);

    // 역할별 참가자 조회
    List<ChatRoomParticipant> findByRole(ParticipantRole role);
    List<ChatRoomParticipant> findByChatRoomIdAndRole(Long chatRoomId, ParticipantRole role);

    // 활성 참가자 조회
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.chatRoomId = :chatRoomId " +
           "AND crp.status = 'ACTIVE' ORDER BY crp.role, crp.joinedAt")
    List<ChatRoomParticipant> findActiveParticipantsByChatRoomId(@Param("chatRoomId") Long chatRoomId);

    // 사용자의 활성 채팅방 참가 정보들
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.userId = :userId " +
           "AND crp.status = 'ACTIVE' ORDER BY crp.isPinned DESC, crp.lastActivityAt DESC")
    List<ChatRoomParticipant> findActiveParticipationsByUserId(@Param("userId") Long userId);

    // 채팅방의 관리자들 조회
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.chatRoomId = :chatRoomId " +
           "AND crp.role IN ('ADMIN', 'OWNER') AND crp.status = 'ACTIVE'")
    List<ChatRoomParticipant> findAdminsByChatRoomId(@Param("chatRoomId") Long chatRoomId);

    // 채팅방의 소유자 조회
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.chatRoomId = :chatRoomId " +
           "AND crp.role = 'OWNER' AND crp.status = 'ACTIVE'")
    Optional<ChatRoomParticipant> findOwnerByChatRoomId(@Param("chatRoomId") Long chatRoomId);

    // 초대 대기 중인 참가자들
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.chatRoomId = :chatRoomId " +
           "AND crp.status = 'INVITED' ORDER BY crp.createdAt")
    List<ChatRoomParticipant> findPendingInvitationsByChatRoomId(@Param("chatRoomId") Long chatRoomId);

    // 사용자의 초대 대기 목록
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.userId = :userId " +
           "AND crp.status = 'INVITED' ORDER BY crp.createdAt DESC")
    List<ChatRoomParticipant> findPendingInvitationsByUserId(@Param("userId") Long userId);

    // 채팅방별 활성 참가자 수 조회
    @Query("SELECT COUNT(crp) FROM ChatRoomParticipant crp WHERE crp.chatRoomId = :chatRoomId " +
           "AND crp.status = 'ACTIVE'")
    long countActiveParticipantsByChatRoomId(@Param("chatRoomId") Long chatRoomId);

    // 사용자의 활성 채팅방 수 조회
    @Query("SELECT COUNT(crp) FROM ChatRoomParticipant crp WHERE crp.userId = :userId " +
           "AND crp.status = 'ACTIVE'")
    long countActiveParticipationsByUserId(@Param("userId") Long userId);

    // 읽지 않은 메시지가 있는 참가자 정보들
    @Query("SELECT crp FROM ChatRoomParticipant crp JOIN ChatRoom cr ON crp.chatRoomId = cr.id " +
           "WHERE crp.userId = :userId AND crp.status = 'ACTIVE' " +
           "AND (crp.lastReadMessageId IS NULL OR crp.lastReadMessageId < cr.lastMessageId)")
    List<ChatRoomParticipant> findParticipationsWithUnreadMessages(@Param("userId") Long userId);

    // 고정된 채팅방 참가 정보들
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.userId = :userId " +
           "AND crp.isPinned = true AND crp.status = 'ACTIVE' " +
           "ORDER BY crp.updatedAt DESC")
    List<ChatRoomParticipant> findPinnedParticipationsByUserId(@Param("userId") Long userId);

    // 보관된 채팅방 참가 정보들
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.userId = :userId " +
           "AND crp.isArchived = true ORDER BY crp.updatedAt DESC")
    List<ChatRoomParticipant> findArchivedParticipationsByUserId(@Param("userId") Long userId);

    // 음소거된 채팅방 참가 정보들
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.userId = :userId " +
           "AND crp.isMuted = true AND crp.status = 'ACTIVE' " +
           "AND (crp.mutedUntil IS NULL OR crp.mutedUntil > CURRENT_TIMESTAMP)")
    List<ChatRoomParticipant> findMutedParticipationsByUserId(@Param("userId") Long userId);

    // 최근 활동한 참가자들
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.chatRoomId = :chatRoomId " +
           "AND crp.status = 'ACTIVE' AND crp.lastActivityAt IS NOT NULL " +
           "ORDER BY crp.lastActivityAt DESC")
    List<ChatRoomParticipant> findRecentlyActiveParticipants(@Param("chatRoomId") Long chatRoomId);

    // 장기간 비활성 참가자들
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.status = 'ACTIVE' " +
           "AND (crp.lastActivityAt IS NULL OR crp.lastActivityAt < :before)")
    List<ChatRoomParticipant> findLongTermInactiveParticipants(@Param("before") LocalDateTime before);

    // 특정 사용자를 초대한 참가자 조회
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.invitedByUserId = :inviterUserId")
    List<ChatRoomParticipant> findParticipantsInvitedByUser(@Param("inviterUserId") Long inviterUserId);

    // 가장 많이 메시지를 보낸 참가자들 (채팅방별)
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.chatRoomId = :chatRoomId " +
           "AND crp.status = 'ACTIVE' ORDER BY crp.messageCount DESC")
    List<ChatRoomParticipant> findMostActiveMessageSenders(@Param("chatRoomId") Long chatRoomId);

    // 알림이 활성화된 참가자들
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.chatRoomId = :chatRoomId " +
           "AND crp.status = 'ACTIVE' AND crp.notificationsEnabled = true")
    List<ChatRoomParticipant> findParticipantsWithNotificationsEnabled(@Param("chatRoomId") Long chatRoomId);

    // 특정 기간에 참가한 사용자들
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.chatRoomId = :chatRoomId " +
           "AND crp.joinedAt BETWEEN :startDate AND :endDate " +
           "ORDER BY crp.joinedAt DESC")
    List<ChatRoomParticipant> findParticipantsJoinedInPeriod(@Param("chatRoomId") Long chatRoomId,
                                                             @Param("startDate") LocalDateTime startDate,
                                                             @Param("endDate") LocalDateTime endDate);

    // 참가자 존재 여부 확인
    boolean existsByChatRoomIdAndUserId(Long chatRoomId, Long userId);

    // 활성 참가자 존재 여부 확인
    @Query("SELECT CASE WHEN COUNT(crp) > 0 THEN true ELSE false END FROM ChatRoomParticipant crp " +
           "WHERE crp.chatRoomId = :chatRoomId AND crp.userId = :userId AND crp.status = 'ACTIVE'")
    boolean existsActiveParticipant(@Param("chatRoomId") Long chatRoomId, @Param("userId") Long userId);

    // 사용자가 관리자인 채팅방들
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.userId = :userId " +
           "AND crp.role IN ('ADMIN', 'OWNER') AND crp.status = 'ACTIVE'")
    List<ChatRoomParticipant> findAdminParticipationsByUserId(@Param("userId") Long userId);

    // 참가자 통계 - 역할별 개수
    @Query("SELECT crp.role, COUNT(crp) FROM ChatRoomParticipant crp " +
           "WHERE crp.chatRoomId = :chatRoomId AND crp.status = 'ACTIVE' " +
           "GROUP BY crp.role")
    List<Object[]> countParticipantsByRole(@Param("chatRoomId") Long chatRoomId);

    // 참가자 통계 - 상태별 개수
    @Query("SELECT crp.status, COUNT(crp) FROM ChatRoomParticipant crp " +
           "WHERE crp.chatRoomId = :chatRoomId GROUP BY crp.status")
    List<Object[]> countParticipantsByStatus(@Param("chatRoomId") Long chatRoomId);

    // 사용자별 메시지 전송 통계
    @Query("SELECT crp.userId, crp.messageCount FROM ChatRoomParticipant crp " +
           "WHERE crp.chatRoomId = :chatRoomId AND crp.status = 'ACTIVE' " +
           "ORDER BY crp.messageCount DESC")
    List<Object[]> getMessageStatsByUser(@Param("chatRoomId") Long chatRoomId);

    // 월별 참가자 증가 통계
    @Query("SELECT YEAR(crp.joinedAt), MONTH(crp.joinedAt), COUNT(crp) " +
           "FROM ChatRoomParticipant crp WHERE crp.status = 'ACTIVE' " +
           "GROUP BY YEAR(crp.joinedAt), MONTH(crp.joinedAt) " +
           "ORDER BY YEAR(crp.joinedAt), MONTH(crp.joinedAt)")
    List<Object[]> getMonthlyParticipantGrowth();

    // 평균 참가 기간 계산
    @Query("SELECT AVG(DATEDIFF(COALESCE(crp.leftAt, CURRENT_TIMESTAMP), crp.joinedAt)) " +
           "FROM ChatRoomParticipant crp WHERE crp.chatRoomId = :chatRoomId")
    Double getAverageParticipationDuration(@Param("chatRoomId") Long chatRoomId);

    // 초대를 많이 한 사용자들
    @Query("SELECT crp.invitedByUserId, COUNT(crp) as inviteCount FROM ChatRoomParticipant crp " +
           "WHERE crp.invitedByUserId IS NOT NULL " +
           "GROUP BY crp.invitedByUserId ORDER BY inviteCount DESC")
    List<Object[]> findTopInviters();

    // 자동 정리가 필요한 참가자들 (오랫동안 비활성)
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.status = 'ACTIVE' " +
           "AND crp.lastActivityAt < :cutoffTime")
    List<ChatRoomParticipant> findParticipantsForAutoCleanup(@Param("cutoffTime") LocalDateTime cutoffTime);

    // 채팅방에서 탈퇴한 사용자들
    @Query("SELECT crp FROM ChatRoomParticipant crp WHERE crp.chatRoomId = :chatRoomId " +
           "AND crp.status IN ('LEFT', 'KICKED') ORDER BY crp.leftAt DESC")
    List<ChatRoomParticipant> findLeftParticipantsByChatRoomId(@Param("chatRoomId") Long chatRoomId);

    // 사용자의 평균 채팅방 참가 시간
    @Query("SELECT AVG(DATEDIFF(COALESCE(crp.leftAt, CURRENT_TIMESTAMP), crp.joinedAt)) " +
           "FROM ChatRoomParticipant crp WHERE crp.userId = :userId")
    Double getAverageUserParticipationTime(@Param("userId") Long userId);
}