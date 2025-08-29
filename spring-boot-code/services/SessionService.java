package com.studymate.server.service;

import com.studymate.server.entity.*;
import com.studymate.server.repository.SessionRepository;
import com.studymate.server.repository.SessionParticipantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class SessionService {

    private final SessionRepository sessionRepository;
    private final SessionParticipantRepository sessionParticipantRepository;

    // 세션 생성
    public Session createSession(Long hostUserId, Map<String, Object> sessionData) {
        Session session = Session.builder()
                .roomId(generateRoomId())
                .hostUserId(hostUserId)
                .title((String) sessionData.get("title"))
                .description((String) sessionData.get("description"))
                .sessionType(SessionType.valueOf((String) sessionData.get("sessionType")))
                .sessionMode(SessionMode.valueOf((String) sessionData.getOrDefault("sessionMode", "ONE_ON_ONE")))
                .languageFocus((String) sessionData.get("languageFocus"))
                .difficultyLevel((String) sessionData.getOrDefault("difficultyLevel", "BEGINNER"))
                .maxParticipants((Integer) sessionData.getOrDefault("maxParticipants", 2))
                .scheduledStartTime(LocalDateTime.parse((String) sessionData.get("scheduledStartTime")))
                .scheduledDuration((Integer) sessionData.get("scheduledDuration"))
                .isPublic((Boolean) sessionData.getOrDefault("isPublic", false))
                .timezone((String) sessionData.getOrDefault("timezone", "Asia/Seoul"))
                .topics((String) sessionData.get("topics"))
                .tags((String) sessionData.get("tags"))
                .build();

        Session savedSession = sessionRepository.save(session);

        // 호스트를 참가자로 추가
        addParticipant(savedSession.getId(), hostUserId, ParticipantRole.HOST);
        savedSession.addParticipant();
        sessionRepository.save(savedSession);

        log.info("Session created: {} by user {}", savedSession.getId(), hostUserId);
        return savedSession;
    }

    // 세션 조회
    @Transactional(readOnly = true)
    public Optional<Session> findById(Long sessionId) {
        return sessionRepository.findById(sessionId);
    }

    @Transactional(readOnly = true)
    public Optional<Session> findByRoomId(String roomId) {
        return sessionRepository.findByRoomId(roomId);
    }

    // 사용자의 예정된 세션들 조회
    @Transactional(readOnly = true)
    public List<Session> getUpcomingSessionsByUser(Long userId) {
        return sessionRepository.findUpcomingSessionsByUserId(userId, LocalDateTime.now());
    }

    // 사용자의 완료된 세션들 조회
    @Transactional(readOnly = true)
    public List<Session> getCompletedSessionsByUser(Long userId) {
        return sessionRepository.findCompletedSessionsByUserId(userId);
    }

    // 공개 세션들 조회
    @Transactional(readOnly = true)
    public List<Session> getAvailablePublicSessions() {
        return sessionRepository.findAvailablePublicSessions(LocalDateTime.now());
    }

    // 세션 검색
    @Transactional(readOnly = true)
    public List<Session> searchSessions(String language, SessionType sessionType, String difficultyLevel, Boolean isPublic) {
        return sessionRepository.findSessionsWithFilters(LocalDateTime.now(), language, sessionType, difficultyLevel, isPublic);
    }

    // 세션 수정
    public Session updateSession(Long sessionId, Long userId, Map<String, Object> updateData) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다: " + sessionId));

        // 권한 확인 (호스트만 수정 가능)
        if (!session.getHostUserId().equals(userId)) {
            throw new RuntimeException("세션 수정 권한이 없습니다.");
        }

        if (!session.canModify()) {
            throw new RuntimeException("이미 시작되거나 완료된 세션은 수정할 수 없습니다.");
        }

        // 필드 업데이트
        if (updateData.containsKey("title")) {
            session.setTitle((String) updateData.get("title"));
        }
        if (updateData.containsKey("description")) {
            session.setDescription((String) updateData.get("description"));
        }
        if (updateData.containsKey("scheduledStartTime")) {
            session.setScheduledStartTime(LocalDateTime.parse((String) updateData.get("scheduledStartTime")));
        }
        if (updateData.containsKey("scheduledDuration")) {
            session.setScheduledDuration((Integer) updateData.get("scheduledDuration"));
        }
        if (updateData.containsKey("languageFocus")) {
            session.setLanguageFocus((String) updateData.get("languageFocus"));
        }
        if (updateData.containsKey("difficultyLevel")) {
            session.setDifficultyLevel((String) updateData.get("difficultyLevel"));
        }
        if (updateData.containsKey("maxParticipants")) {
            Integer newMaxParticipants = (Integer) updateData.get("maxParticipants");
            if (newMaxParticipants < session.getCurrentParticipants()) {
                throw new RuntimeException("현재 참가자 수보다 적게 설정할 수 없습니다.");
            }
            session.setMaxParticipants(newMaxParticipants);
        }
        if (updateData.containsKey("isPublic")) {
            session.setIsPublic((Boolean) updateData.get("isPublic"));
        }

        Session updated = sessionRepository.save(session);
        log.info("Session updated: {}", sessionId);
        return updated;
    }

    // 세션 참가
    public SessionParticipant joinSession(Long sessionId, Long userId, String userName) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다: " + sessionId));

        if (!session.canJoin()) {
            throw new RuntimeException("참가할 수 없는 세션입니다.");
        }

        // 이미 참가했는지 확인
        if (sessionParticipantRepository.existsBySessionIdAndUserId(sessionId, userId)) {
            throw new RuntimeException("이미 참가한 세션입니다.");
        }

        // 참가자 추가
        SessionParticipant participant = addParticipant(sessionId, userId, ParticipantRole.PARTICIPANT);
        participant.acceptInvitation(); // 자동으로 확인됨

        session.addParticipant();
        sessionRepository.save(session);

        log.info("User {} joined session {}", userId, sessionId);
        return sessionParticipantRepository.save(participant);
    }

    // 세션 떠나기
    public void leaveSession(Long sessionId, Long userId) {
        SessionParticipant participant = sessionParticipantRepository.findBySessionIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new RuntimeException("세션 참가 기록을 찾을 수 없습니다."));

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다: " + sessionId));

        participant.leaveSession();
        sessionParticipantRepository.save(participant);

        session.removeParticipant();
        sessionRepository.save(session);

        log.info("User {} left session {}", userId, sessionId);
    }

    // 세션 시작
    public Session startSession(Long sessionId, Long userId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다: " + sessionId));

        if (!session.getHostUserId().equals(userId)) {
            throw new RuntimeException("세션 시작 권한이 없습니다.");
        }

        session.startSession();
        Session started = sessionRepository.save(session);

        // 참가자들을 JOINED 상태로 변경
        List<SessionParticipant> participants = sessionParticipantRepository.findBySessionIdAndStatus(sessionId, ParticipantStatus.CONFIRMED);
        participants.forEach(participant -> {
            participant.joinSession();
            sessionParticipantRepository.save(participant);
        });

        log.info("Session started: {}", sessionId);
        return started;
    }

    // 세션 종료
    public Session endSession(Long sessionId, Long userId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다: " + sessionId));

        if (!session.getHostUserId().equals(userId)) {
            throw new RuntimeException("세션 종료 권한이 없습니다.");
        }

        session.endSession();
        Session ended = sessionRepository.save(session);

        // 활성 참가자들을 LEFT 상태로 변경
        List<SessionParticipant> activeParticipants = sessionParticipantRepository.findBySessionIdAndStatus(sessionId, ParticipantStatus.JOINED);
        activeParticipants.forEach(participant -> {
            participant.leaveSession();
            sessionParticipantRepository.save(participant);
        });

        log.info("Session ended: {}", sessionId);
        return ended;
    }

    // 세션 취소
    public Session cancelSession(Long sessionId, Long userId, String reason) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("세션을 찾을 수 없습니다: " + sessionId));

        if (!session.getHostUserId().equals(userId)) {
            throw new RuntimeException("세션 취소 권한이 없습니다.");
        }

        session.cancelSession(userId, reason);
        Session cancelled = sessionRepository.save(session);

        log.info("Session cancelled: {} by user {} - reason: {}", sessionId, userId, reason);
        return cancelled;
    }

    // 세션 참가자 목록 조회
    @Transactional(readOnly = true)
    public List<SessionParticipant> getSessionParticipants(Long sessionId) {
        return sessionParticipantRepository.findDetailedParticipantsBySessionId(sessionId);
    }

    // 참가자 피드백 제출
    public SessionParticipant submitFeedback(Long sessionId, Long userId, Integer rating, String comment) {
        SessionParticipant participant = sessionParticipantRepository.findBySessionIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new RuntimeException("세션 참가 기록을 찾을 수 없습니다."));

        participant.submitFeedback(rating, comment);
        SessionParticipant updated = sessionParticipantRepository.save(participant);

        log.info("Feedback submitted for session {} by user {}: rating={}", sessionId, userId, rating);
        return updated;
    }

    // 사용자 학습 통계 조회
    @Transactional(readOnly = true)
    public Map<String, Object> getUserLearningStats(Long userId) {
        Long totalMinutes = sessionParticipantRepository.getTotalLearningMinutesByUserId(userId);
        long completedSessions = sessionRepository.countCompletedSessionsByUserId(userId);
        long hostedSessions = sessionRepository.countByHostUserId(userId);

        return Map.of(
            "totalLearningMinutes", totalMinutes != null ? totalMinutes : 0L,
            "completedSessions", completedSessions,
            "hostedSessions", hostedSessions,
            "averageSessionLength", totalMinutes != null && completedSessions > 0 ? totalMinutes / completedSessions : 0L
        );
    }

    // 오늘 예정된 세션들
    @Transactional(readOnly = true)
    public List<Session> getTodaysSessions() {
        return sessionRepository.findTodaysSessions(LocalDateTime.now());
    }

    // 세션 검색 (텍스트)
    @Transactional(readOnly = true)
    public List<Session> searchPublicSessions(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return sessionRepository.searchPublicSessions(query.trim());
    }

    // 자동 취소 처리 (스케줄러에서 호출)
    public void processAutoCancel() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(1); // 시작 시간 1시간 후
        List<Session> sessionsToCancel = sessionRepository.findSessionsToAutoCancel(cutoffTime);

        for (Session session : sessionsToCancel) {
            session.cancelSession(null, "자동 취소 - 시작 시간 경과");
            sessionRepository.save(session);
        }

        if (!sessionsToCancel.isEmpty()) {
            log.info("Auto-cancelled {} sessions", sessionsToCancel.size());
        }
    }

    // 리마인더 발송 대상 조회
    @Transactional(readOnly = true)
    public List<SessionParticipant> getParticipantsForReminder(int minutesBefore) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderTime = now.plusMinutes(minutesBefore);
        return sessionParticipantRepository.findParticipantsNeedingReminder(
            reminderTime.minusMinutes(5), // 5분 범위
            reminderTime.plusMinutes(5)
        );
    }

    // 비공개 메서드들
    private SessionParticipant addParticipant(Long sessionId, Long userId, ParticipantRole role) {
        SessionParticipant participant = SessionParticipant.builder()
                .sessionId(sessionId)
                .userId(userId)
                .role(role)
                .status(role == ParticipantRole.HOST ? ParticipantStatus.CONFIRMED : ParticipantStatus.INVITED)
                .build();

        return sessionParticipantRepository.save(participant);
    }

    private String generateRoomId() {
        return "room_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}