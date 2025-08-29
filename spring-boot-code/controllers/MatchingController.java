package com.studymate.server.controller;

import com.studymate.server.entity.MatchingRequest;
import com.studymate.server.entity.MatchingStatus;
import com.studymate.server.entity.UserCompatibility;
import com.studymate.server.service.MatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/matching")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    // 매칭 가능한 파트너 조회
    @GetMapping("/partners")
    public ResponseEntity<List<UserCompatibility>> getCompatiblePartners(
            @RequestParam Long userId,
            @RequestParam(required = false) String ageRange,
            @RequestParam(required = false) String timeZone) {
        
        List<UserCompatibility> partners;
        if (ageRange != null || timeZone != null) {
            partners = matchingService.findCompatiblePartnersWithFilters(userId, ageRange, timeZone);
        } else {
            partners = matchingService.findCompatiblePartners(userId);
        }
        
        return ResponseEntity.ok(partners);
    }

    // 매칭 요청 생성
    @PostMapping("/request")
    public ResponseEntity<MatchingRequest> createMatchingRequest(
            @RequestBody Map<String, Object> requestData) {
        
        Long fromUserId = Long.valueOf(requestData.get("fromUserId").toString());
        Long toUserId = Long.valueOf(requestData.get("toUserId").toString());
        String message = (String) requestData.get("message");
        
        try {
            MatchingRequest request = matchingService.createMatchingRequest(fromUserId, toUserId, message);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 매칭 요청 수락
    @PostMapping("/accept/{requestId}")
    public ResponseEntity<MatchingRequest> acceptMatchingRequest(
            @PathVariable Long requestId,
            @RequestParam Long userId) {
        
        try {
            MatchingRequest request = matchingService.acceptMatchingRequest(requestId, userId);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 매칭 요청 거절
    @PostMapping("/reject/{requestId}")
    public ResponseEntity<MatchingRequest> rejectMatchingRequest(
            @PathVariable Long requestId,
            @RequestParam Long userId) {
        
        try {
            MatchingRequest request = matchingService.rejectMatchingRequest(requestId, userId);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 매칭 요청 취소
    @PostMapping("/cancel/{requestId}")
    public ResponseEntity<MatchingRequest> cancelMatchingRequest(
            @PathVariable Long requestId,
            @RequestParam Long userId) {
        
        try {
            MatchingRequest request = matchingService.cancelMatchingRequest(requestId, userId);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 받은 매칭 요청 조회
    @GetMapping("/requests/received")
    public ResponseEntity<List<MatchingRequest>> getReceivedRequests(
            @RequestParam Long userId,
            @RequestParam(required = false) MatchingStatus status) {
        
        List<MatchingRequest> requests = matchingService.getReceivedRequests(userId, status);
        return ResponseEntity.ok(requests);
    }

    // 보낸 매칭 요청 조회
    @GetMapping("/requests/sent")
    public ResponseEntity<List<MatchingRequest>> getSentRequests(
            @RequestParam Long userId,
            @RequestParam(required = false) MatchingStatus status) {
        
        List<MatchingRequest> requests = matchingService.getSentRequests(userId, status);
        return ResponseEntity.ok(requests);
    }

    // 성공한 매칭 목록 조회
    @GetMapping("/matches")
    public ResponseEntity<List<MatchingRequest>> getAcceptedMatches(
            @RequestParam Long userId) {
        
        List<MatchingRequest> matches = matchingService.getAcceptedMatches(userId);
        return ResponseEntity.ok(matches);
    }

    // 매칭 요청 상세 조회
    @GetMapping("/requests/{requestId}")
    public ResponseEntity<MatchingRequest> getMatchingRequest(@PathVariable Long requestId) {
        // 이 메서드는 MatchingService에 추가 메서드가 필요합니다
        return ResponseEntity.ok().build(); // TODO: 구현 필요
    }

    // 사용자의 모든 매칭 활동 조회 (받은 + 보낸)
    @GetMapping("/activity")
    public ResponseEntity<Map<String, Object>> getMatchingActivity(
            @RequestParam Long userId) {
        
        List<MatchingRequest> received = matchingService.getReceivedRequests(userId, null);
        List<MatchingRequest> sent = matchingService.getSentRequests(userId, null);
        List<MatchingRequest> matches = matchingService.getAcceptedMatches(userId);
        
        Map<String, Object> activity = Map.of(
            "received", received,
            "sent", sent,
            "matches", matches
        );
        
        return ResponseEntity.ok(activity);
    }
}