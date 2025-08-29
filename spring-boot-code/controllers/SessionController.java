package com.studymate.server.controller;

import com.studymate.server.entity.Session;
import com.studymate.server.entity.SessionParticipant;
import com.studymate.server.entity.SessionType;
import com.studymate.server.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    // 세션 생성
    @PostMapping
    public ResponseEntity<Session> createSession(
            @RequestBody Map<String, Object> sessionData) {
        
        try {
            Long hostUserId = Long.valueOf(sessionData.get("hostUserId").toString());
            Session session = sessionService.createSession(hostUserId, sessionData);
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            log.error("Error creating session: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 세션 조회
    @GetMapping("/{sessionId}")
    public ResponseEntity<Session> getSession(@PathVariable Long sessionId) {
        Optional<Session> session = sessionService.findById(sessionId);
        return session.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    // 룸 ID로 세션 조회
    @GetMapping("/room/{roomId}")
    public ResponseEntity<Session> getSessionByRoomId(@PathVariable String roomId) {
        Optional<Session> session = sessionService.findByRoomId(roomId);
        return session.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    // 사용자의 예정된 세션들 조회
    @GetMapping("/upcoming")
    public ResponseEntity<List<Session>> getUpcomingSessions(@RequestParam Long userId) {
        List<Session> sessions = sessionService.getUpcomingSessionsByUser(userId);
        return ResponseEntity.ok(sessions);
    }

    // 사용자의 완료된 세션들 조회
    @GetMapping("/completed")
    public ResponseEntity<List<Session>> getCompletedSessions(@RequestParam Long userId) {
        List<Session> sessions = sessionService.getCompletedSessionsByUser(userId);
        return ResponseEntity.ok(sessions);
    }

    // 공개 세션들 조회
    @GetMapping("/public")
    public ResponseEntity<List<Session>> getPublicSessions() {
        List<Session> sessions = sessionService.getAvailablePublicSessions();
        return ResponseEntity.ok(sessions);
    }

    // 세션 검색
    @GetMapping("/search")
    public ResponseEntity<List<Session>> searchSessions(
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String sessionType,
            @RequestParam(required = false) String difficultyLevel,
            @RequestParam(required = false) Boolean isPublic,
            @RequestParam(required = false) String query) {
        
        List<Session> sessions;
        
        if (query != null && !query.trim().isEmpty()) {
            sessions = sessionService.searchPublicSessions(query);
        } else {
            SessionType type = sessionType != null ? SessionType.valueOf(sessionType) : null;
            sessions = sessionService.searchSessions(language, type, difficultyLevel, isPublic);
        }
        
        return ResponseEntity.ok(sessions);
    }

    // 오늘의 세션들
    @GetMapping("/today")
    public ResponseEntity<List<Session>> getTodaysSessions() {
        List<Session> sessions = sessionService.getTodaysSessions();
        return ResponseEntity.ok(sessions);
    }

    // 세션 수정
    @PatchMapping("/{sessionId}")
    public ResponseEntity<Session> updateSession(
            @PathVariable Long sessionId,
            @RequestParam Long userId,
            @RequestBody Map<String, Object> updateData) {
        
        try {
            Session updatedSession = sessionService.updateSession(sessionId, userId, updateData);
            return ResponseEntity.ok(updatedSession);
        } catch (RuntimeException e) {
            log.error("Error updating session: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 세션 참가
    @PostMapping("/{sessionId}/join")
    public ResponseEntity<SessionParticipant> joinSession(
            @PathVariable Long sessionId,
            @RequestBody Map<String, Object> joinData) {
        
        try {
            Long userId = Long.valueOf(joinData.get("userId").toString());
            String userName = (String) joinData.get("userName");
            
            SessionParticipant participant = sessionService.joinSession(sessionId, userId, userName);
            return ResponseEntity.ok(participant);
        } catch (RuntimeException e) {
            log.error("Error joining session: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 세션 떠나기
    @PostMapping("/{sessionId}/leave")
    public ResponseEntity<Void> leaveSession(
            @PathVariable Long sessionId,
            @RequestParam Long userId) {
        
        try {
            sessionService.leaveSession(sessionId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error leaving session: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 세션 시작
    @PostMapping("/{sessionId}/start")
    public ResponseEntity<Session> startSession(
            @PathVariable Long sessionId,
            @RequestParam Long userId) {
        
        try {
            Session startedSession = sessionService.startSession(sessionId, userId);
            return ResponseEntity.ok(startedSession);
        } catch (RuntimeException e) {
            log.error("Error starting session: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 세션 종료
    @PostMapping("/{sessionId}/end")
    public ResponseEntity<Session> endSession(
            @PathVariable Long sessionId,
            @RequestParam Long userId) {
        
        try {
            Session endedSession = sessionService.endSession(sessionId, userId);
            return ResponseEntity.ok(endedSession);
        } catch (RuntimeException e) {
            log.error("Error ending session: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 세션 취소
    @PostMapping("/{sessionId}/cancel")
    public ResponseEntity<Session> cancelSession(
            @PathVariable Long sessionId,
            @RequestBody Map<String, Object> cancelData) {
        
        try {
            Long userId = Long.valueOf(cancelData.get("userId").toString());
            String reason = (String) cancelData.getOrDefault("reason", "");
            
            Session cancelledSession = sessionService.cancelSession(sessionId, userId, reason);
            return ResponseEntity.ok(cancelledSession);
        } catch (RuntimeException e) {
            log.error("Error cancelling session: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 세션 참가자 목록 조회
    @GetMapping("/{sessionId}/participants")
    public ResponseEntity<List<SessionParticipant>> getSessionParticipants(@PathVariable Long sessionId) {
        List<SessionParticipant> participants = sessionService.getSessionParticipants(sessionId);
        return ResponseEntity.ok(participants);
    }

    // 피드백 제출
    @PostMapping("/{sessionId}/feedback")
    public ResponseEntity<SessionParticipant> submitFeedback(
            @PathVariable Long sessionId,
            @RequestBody Map<String, Object> feedbackData) {
        
        try {
            Long userId = Long.valueOf(feedbackData.get("userId").toString());
            Integer rating = (Integer) feedbackData.get("rating");
            String comment = (String) feedbackData.getOrDefault("comment", "");
            
            SessionParticipant participant = sessionService.submitFeedback(sessionId, userId, rating, comment);
            return ResponseEntity.ok(participant);
        } catch (RuntimeException e) {
            log.error("Error submitting feedback: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 사용자 학습 통계
    @GetMapping("/stats/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserLearningStats(@PathVariable Long userId) {
        Map<String, Object> stats = sessionService.getUserLearningStats(userId);
        return ResponseEntity.ok(stats);
    }

    // 세션 상세 정보 조회 (참가자 포함)
    @GetMapping("/{sessionId}/details")
    public ResponseEntity<Map<String, Object>> getSessionDetails(@PathVariable Long sessionId) {
        Optional<Session> sessionOpt = sessionService.findById(sessionId);
        
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Session session = sessionOpt.get();
        List<SessionParticipant> participants = sessionService.getSessionParticipants(sessionId);

        Map<String, Object> details = Map.of(
            "session", session,
            "participants", participants
        );

        return ResponseEntity.ok(details);
    }

    // 세션 예약 가능 여부 확인
    @GetMapping("/{sessionId}/can-join")
    public ResponseEntity<Map<String, Boolean>> canJoinSession(@PathVariable Long sessionId) {
        Optional<Session> session = sessionService.findById(sessionId);
        
        if (session.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        boolean canJoin = session.get().canJoin();
        return ResponseEntity.ok(Map.of("canJoin", canJoin));
    }

    // 세션 생성 시 사용할 기본 정보
    @GetMapping("/defaults")
    public ResponseEntity<Map<String, Object>> getSessionDefaults() {
        Map<String, Object> defaults = Map.of(
            "sessionTypes", List.of("VIDEO", "AUDIO"),
            "sessionModes", List.of("ONE_ON_ONE", "GROUP"),
            "difficultyLevels", List.of("BEGINNER", "INTERMEDIATE", "ADVANCED"),
            "languages", List.of("en", "ko", "ja", "zh", "fr", "de", "es"),
            "defaultDuration", 30,
            "maxParticipants", Map.of(
                "ONE_ON_ONE", 2,
                "GROUP", 4
            )
        );

        return ResponseEntity.ok(defaults);
    }
}