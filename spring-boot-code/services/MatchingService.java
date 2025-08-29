package com.studymate.server.service;

import com.studymate.server.entity.MatchingRequest;
import com.studymate.server.entity.MatchingStatus;
import com.studymate.server.entity.UserCompatibility;
import com.studymate.server.repository.MatchingRequestRepository;
import com.studymate.server.repository.UserCompatibilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MatchingService {

    private final MatchingRequestRepository matchingRequestRepository;
    private final UserCompatibilityRepository userCompatibilityRepository;

    // 매칭 가능한 파트너 조회
    @Transactional(readOnly = true)
    public List<UserCompatibility> findCompatiblePartners(Long userId) {
        Optional<UserCompatibility> userCompat = userCompatibilityRepository.findByUserId(userId);
        
        if (userCompat.isEmpty()) {
            log.warn("User compatibility data not found for user: {}", userId);
            return List.of();
        }

        UserCompatibility uc = userCompat.get();
        return userCompatibilityRepository.findCompatiblePartners(
                userId, uc.getNativeLanguage(), uc.getTargetLanguage());
    }

    // 필터 조건으로 호환 파트너 검색
    @Transactional(readOnly = true)
    public List<UserCompatibility> findCompatiblePartnersWithFilters(Long userId, String ageRange, String timeZone) {
        Optional<UserCompatibility> userCompat = userCompatibilityRepository.findByUserId(userId);
        
        if (userCompat.isEmpty()) {
            return List.of();
        }

        UserCompatibility uc = userCompat.get();
        return userCompatibilityRepository.findCompatiblePartnersWithFilters(
                userId, uc.getNativeLanguage(), uc.getTargetLanguage(), ageRange, timeZone);
    }

    // 매칭 요청 생성
    public MatchingRequest createMatchingRequest(Long fromUserId, Long toUserId, String message) {
        // 이미 활성 매칭이 있는지 확인
        Optional<MatchingRequest> existingMatch = matchingRequestRepository
                .findActiveMatchBetweenUsers(fromUserId, toUserId);
        
        if (existingMatch.isPresent()) {
            throw new RuntimeException("이미 활성 상태인 매칭 요청이 있습니다.");
        }

        // 이미 요청을 보냈는지 확인
        boolean alreadySent = matchingRequestRepository
                .existsByFromUserIdAndToUserIdAndStatus(fromUserId, toUserId, MatchingStatus.PENDING);
        
        if (alreadySent) {
            throw new RuntimeException("이미 매칭 요청을 보냈습니다.");
        }

        // 호환성 점수 계산
        Integer compatibilityScore = calculateCompatibilityScore(fromUserId, toUserId);

        MatchingRequest request = MatchingRequest.builder()
                .fromUserId(fromUserId)
                .toUserId(toUserId)
                .message(message)
                .compatibilityScore(compatibilityScore)
                .status(MatchingStatus.PENDING)
                .build();

        MatchingRequest saved = matchingRequestRepository.save(request);
        log.info("Matching request created: {} -> {}", fromUserId, toUserId);
        
        return saved;
    }

    // 매칭 요청 수락
    public MatchingRequest acceptMatchingRequest(Long requestId, Long userId) {
        MatchingRequest request = matchingRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("매칭 요청을 찾을 수 없습니다."));

        if (!request.getToUserId().equals(userId)) {
            throw new RuntimeException("매칭 요청을 수락할 권한이 없습니다.");
        }

        if (request.getStatus() != MatchingStatus.PENDING) {
            throw new RuntimeException("이미 처리된 매칭 요청입니다.");
        }

        request.acceptMatch();
        MatchingRequest accepted = matchingRequestRepository.save(request);
        
        log.info("Matching request accepted: {} (request ID: {})", userId, requestId);
        return accepted;
    }

    // 매칭 요청 거절
    public MatchingRequest rejectMatchingRequest(Long requestId, Long userId) {
        MatchingRequest request = matchingRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("매칭 요청을 찾을 수 없습니다."));

        if (!request.getToUserId().equals(userId)) {
            throw new RuntimeException("매칭 요청을 거절할 권한이 없습니다.");
        }

        if (request.getStatus() != MatchingStatus.PENDING) {
            throw new RuntimeException("이미 처리된 매칭 요청입니다.");
        }

        request.rejectMatch();
        MatchingRequest rejected = matchingRequestRepository.save(request);
        
        log.info("Matching request rejected: {} (request ID: {})", userId, requestId);
        return rejected;
    }

    // 받은 매칭 요청 조회
    @Transactional(readOnly = true)
    public List<MatchingRequest> getReceivedRequests(Long userId, MatchingStatus status) {
        if (status != null) {
            return matchingRequestRepository.findByToUserIdAndStatus(userId, status);
        }
        return matchingRequestRepository.findAllByUserIdAndStatus(userId, MatchingStatus.PENDING);
    }

    // 보낸 매칭 요청 조회
    @Transactional(readOnly = true)
    public List<MatchingRequest> getSentRequests(Long userId, MatchingStatus status) {
        if (status != null) {
            return matchingRequestRepository.findByFromUserIdAndStatus(userId, status);
        }
        return matchingRequestRepository.findByFromUserIdAndStatus(userId, MatchingStatus.PENDING);
    }

    // 성공한 매칭 목록 조회
    @Transactional(readOnly = true)
    public List<MatchingRequest> getAcceptedMatches(Long userId) {
        return matchingRequestRepository.findAcceptedMatchesByUserId(userId);
    }

    // 만료된 요청 처리 (스케줄러에서 호출)
    public void expireOldRequests() {
        LocalDateTime expiredBefore = LocalDateTime.now().minusDays(7); // 7일 후 만료
        List<MatchingRequest> expiredRequests = matchingRequestRepository
                .findExpiredPendingRequests(expiredBefore);
        
        for (MatchingRequest request : expiredRequests) {
            request.setStatus(MatchingStatus.EXPIRED);
        }
        
        matchingRequestRepository.saveAll(expiredRequests);
        log.info("Expired {} old matching requests", expiredRequests.size());
    }

    // 매칭 요청 취소
    public MatchingRequest cancelMatchingRequest(Long requestId, Long userId) {
        MatchingRequest request = matchingRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("매칭 요청을 찾을 수 없습니다."));

        if (!request.getFromUserId().equals(userId)) {
            throw new RuntimeException("매칭 요청을 취소할 권한이 없습니다.");
        }

        if (request.getStatus() != MatchingStatus.PENDING) {
            throw new RuntimeException("대기 중인 매칭 요청만 취소할 수 있습니다.");
        }

        request.cancelMatch();
        MatchingRequest cancelled = matchingRequestRepository.save(request);
        
        log.info("Matching request cancelled: {} (request ID: {})", userId, requestId);
        return cancelled;
    }

    // 호환성 점수 계산 (간단한 구현)
    private Integer calculateCompatibilityScore(Long fromUserId, Long toUserId) {
        Optional<UserCompatibility> fromCompat = userCompatibilityRepository.findByUserId(fromUserId);
        Optional<UserCompatibility> toCompat = userCompatibilityRepository.findByUserId(toUserId);

        if (fromCompat.isEmpty() || toCompat.isEmpty()) {
            return 50; // 기본 점수
        }

        UserCompatibility from = fromCompat.get();
        UserCompatibility to = toCompat.get();
        
        int score = 50; // 기본 점수
        
        // 언어 매칭 (가장 중요)
        if (from.getTargetLanguage().equals(to.getNativeLanguage()) && 
            from.getNativeLanguage().equals(to.getTargetLanguage())) {
            score += 30;
        }
        
        // 시간대 매칭
        if (from.getTimeZone().equals(to.getTimeZone())) {
            score += 10;
        }
        
        // 연령대 매칭
        if (from.getAgeRange().equals(to.getAgeRange())) {
            score += 5;
        }
        
        // 선호 시간 매칭
        if (from.getPreferredSessionTime().equals(to.getPreferredSessionTime())) {
            score += 5;
        }
        
        return Math.min(score, 100); // 최대 100점
    }
}