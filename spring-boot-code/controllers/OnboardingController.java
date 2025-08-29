package com.studymate.server.controller;

import com.studymate.server.entity.OnboardingData;
import com.studymate.server.service.OnboardingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final OnboardingService onboardingService;

    // 온보딩 상태 조회
    @GetMapping("/status")
    public ResponseEntity<OnboardingData> getOnboardingStatus(@RequestParam Long userId) {
        OnboardingData status = onboardingService.getOnboardingStatus(userId);
        
        if (status == null) {
            // 온보딩 데이터가 없으면 새로 생성
            status = onboardingService.getOrCreateOnboardingData(userId);
        }
        
        return ResponseEntity.ok(status);
    }

    // 특정 단계 데이터 저장
    @PostMapping("/step/{step}")
    public ResponseEntity<OnboardingData> saveStepData(
            @PathVariable Integer step,
            @RequestBody Map<String, Object> requestData) {
        
        Long userId = Long.valueOf(requestData.get("userId").toString());
        String stepData = requestData.get("stepData").toString();
        
        try {
            OnboardingData data = onboardingService.saveStepData(userId, step, stepData);
            return ResponseEntity.ok(data);
        } catch (RuntimeException e) {
            log.error("Error saving step data for user {}, step {}: {}", userId, step, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 다음 단계로 진행
    @PostMapping("/proceed")
    public ResponseEntity<OnboardingData> proceedToNextStep(@RequestParam Long userId) {
        try {
            OnboardingData data = onboardingService.proceedToNextStep(userId);
            return ResponseEntity.ok(data);
        } catch (RuntimeException e) {
            log.error("Error proceeding to next step for user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 온보딩 완료
    @PostMapping("/complete")
    public ResponseEntity<OnboardingData> completeOnboarding(
            @RequestBody Map<String, Object> requestData) {
        
        Long userId = Long.valueOf(requestData.get("userId").toString());
        
        // finalData에서 userId 제거하고 나머지 데이터만 전달
        @SuppressWarnings("unchecked")
        Map<String, Object> finalData = (Map<String, Object>) requestData.get("finalData");
        
        try {
            OnboardingData completed = onboardingService.completeOnboarding(userId, finalData);
            return ResponseEntity.ok(completed);
        } catch (RuntimeException e) {
            log.error("Error completing onboarding for user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 온보딩 완료 여부 확인
    @GetMapping("/completed")
    public ResponseEntity<Map<String, Boolean>> isOnboardingCompleted(@RequestParam Long userId) {
        boolean isCompleted = onboardingService.isOnboardingCompleted(userId);
        Map<String, Boolean> response = Map.of("completed", isCompleted);
        return ResponseEntity.ok(response);
    }

    // 특정 단계로 설정 (관리자용)
    @PostMapping("/set-step")
    public ResponseEntity<OnboardingData> setCurrentStep(
            @RequestParam Long userId,
            @RequestParam Integer step) {
        
        try {
            OnboardingData data = onboardingService.setCurrentStep(userId, step);
            return ResponseEntity.ok(data);
        } catch (RuntimeException e) {
            log.error("Error setting step for user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 온보딩 재시작
    @PostMapping("/restart")
    public ResponseEntity<OnboardingData> restartOnboarding(@RequestParam Long userId) {
        try {
            OnboardingData data = onboardingService.restartOnboarding(userId);
            return ResponseEntity.ok(data);
        } catch (RuntimeException e) {
            log.error("Error restarting onboarding for user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 온보딩 데이터 삭제 (탈퇴 시)
    @DeleteMapping("/data")
    public ResponseEntity<Void> deleteOnboardingData(@RequestParam Long userId) {
        try {
            onboardingService.deleteOnboardingData(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting onboarding data for user {}: {}", userId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // 온보딩 진행률 조회
    @GetMapping("/progress")
    public ResponseEntity<Map<String, Object>> getOnboardingProgress(@RequestParam Long userId) {
        OnboardingData data = onboardingService.getOnboardingStatus(userId);
        
        if (data == null) {
            data = onboardingService.getOrCreateOnboardingData(userId);
        }
        
        Map<String, Object> progress = Map.of(
            "currentStep", data.getCurrentStep(),
            "completionRate", data.getCompletionRate(),
            "isCompleted", data.getIsCompleted(),
            "totalSteps", 4
        );
        
        return ResponseEntity.ok(progress);
    }
}