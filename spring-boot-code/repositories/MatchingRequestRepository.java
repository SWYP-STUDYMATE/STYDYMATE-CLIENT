package com.studymate.server.repository;

import com.studymate.server.entity.MatchingRequest;
import com.studymate.server.entity.MatchingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MatchingRequestRepository extends JpaRepository<MatchingRequest, Long> {

    // 특정 사용자가 받은 매칭 요청 조회
    List<MatchingRequest> findByToUserIdAndStatus(Long toUserId, MatchingStatus status);

    // 특정 사용자가 보낸 매칭 요청 조회
    List<MatchingRequest> findByFromUserIdAndStatus(Long fromUserId, MatchingStatus status);

    // 두 사용자 간의 활성 매칭 요청 확인
    @Query("SELECT m FROM MatchingRequest m WHERE " +
           "((m.fromUserId = :userId1 AND m.toUserId = :userId2) OR " +
           "(m.fromUserId = :userId2 AND m.toUserId = :userId1)) AND " +
           "m.status IN ('PENDING', 'ACCEPTED')")
    Optional<MatchingRequest> findActiveMatchBetweenUsers(@Param("userId1") Long userId1, 
                                                         @Param("userId2") Long userId2);

    // 사용자의 모든 매칭 요청 조회 (보낸 것 + 받은 것)
    @Query("SELECT m FROM MatchingRequest m WHERE " +
           "(m.fromUserId = :userId OR m.toUserId = :userId) AND " +
           "m.status = :status ORDER BY m.createdAt DESC")
    List<MatchingRequest> findAllByUserIdAndStatus(@Param("userId") Long userId, 
                                                  @Param("status") MatchingStatus status);

    // 특정 기간보다 오래된 PENDING 상태 요청 조회 (만료 처리용)
    @Query("SELECT m FROM MatchingRequest m WHERE " +
           "m.status = 'PENDING' AND m.createdAt < :expiredBefore")
    List<MatchingRequest> findExpiredPendingRequests(@Param("expiredBefore") LocalDateTime expiredBefore);

    // 호환성 점수 기반 정렬된 매칭 요청 조회
    List<MatchingRequest> findByToUserIdAndStatusOrderByCompatibilityScoreDesc(Long toUserId, MatchingStatus status);

    // 사용자가 이미 요청을 보냈는지 확인
    boolean existsByFromUserIdAndToUserIdAndStatus(Long fromUserId, Long toUserId, MatchingStatus status);

    // 성공적으로 매칭된 요청들 조회
    @Query("SELECT m FROM MatchingRequest m WHERE " +
           "(m.fromUserId = :userId OR m.toUserId = :userId) AND " +
           "m.status = 'ACCEPTED' ORDER BY m.matchedAt DESC")
    List<MatchingRequest> findAcceptedMatchesByUserId(@Param("userId") Long userId);
}