package com.studymate.server.service;

import com.studymate.server.entity.OnboardingData;
import com.studymate.server.entity.UserCompatibility;
import com.studymate.server.repository.OnboardingDataRepository;
import com.studymate.server.repository.UserCompatibilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OnboardingService {

    private final OnboardingDataRepository onboardingDataRepository;
    private final UserCompatibilityRepository userCompatibilityRepository;

    // 온보딩 데이터 조회 또는 생성
    @Transactional(readOnly = true)
    public OnboardingData getOrCreateOnboardingData(Long userId) {
        return onboardingDataRepository.findByUserId(userId)
                .orElseGet(() -> createInitialOnboardingData(userId));
    }

    // 초기 온보딩 데이터 생성
    private OnboardingData createInitialOnboardingData(Long userId) {
        OnboardingData data = OnboardingData.builder()
                .userId(userId)
                .currentStep(1)
                .isCompleted(false)
                .completionRate(0)
                .build();

        OnboardingData saved = onboardingDataRepository.save(data);
        log.info("Initial onboarding data created for user: {}", userId);
        return saved;
    }

    // 특정 단계 데이터 저장
    public OnboardingData saveStepData(Long userId, Integer step, String stepData) {
        OnboardingData data = getOrCreateOnboardingData(userId);
        
        if (step < 1 || step > 4) {
            throw new RuntimeException("잘못된 온보딩 단계입니다. (1-4)");
        }

        // 현재 단계보다 이후 단계는 저장할 수 없음
        if (step > data.getCurrentStep() + 1) {
            throw new RuntimeException("순서대로 온보딩을 진행해주세요.");
        }

        data.setStepData(stepData);
        
        // 새로운 단계면 진행
        if (step > data.getCurrentStep()) {
            data.setCurrentStep(step);
        }

        OnboardingData saved = onboardingDataRepository.save(data);
        log.info("Step {} data saved for user: {}", step, userId);
        
        return saved;
    }

    // 다음 단계로 진행
    public OnboardingData proceedToNextStep(Long userId) {
        OnboardingData data = getOrCreateOnboardingData(userId);
        
        if (data.getIsCompleted()) {
            throw new RuntimeException("이미 온보딩이 완료되었습니다.");
        }

        data.proceedToNextStep();
        OnboardingData saved = onboardingDataRepository.save(data);
        
        log.info("User {} proceeded to step {}", userId, saved.getCurrentStep());
        return saved;
    }

    // 온보딩 완료 처리
    public OnboardingData completeOnboarding(Long userId, Map<String, Object> finalData) {
        OnboardingData data = getOrCreateOnboardingData(userId);
        
        if (data.getIsCompleted()) {
            throw new RuntimeException("이미 온보딩이 완료되었습니다.");
        }

        if (data.getCurrentStep() < 4) {
            throw new RuntimeException("모든 단계를 완료해야 합니다.");
        }

        data.completeOnboarding();
        OnboardingData completed = onboardingDataRepository.save(data);

        // UserCompatibility 데이터 생성/업데이트
        createOrUpdateUserCompatibility(userId, finalData);
        
        log.info("Onboarding completed for user: {}", userId);
        return completed;
    }

    // 온보딩 완료 상태 확인
    @Transactional(readOnly = true)
    public boolean isOnboardingCompleted(Long userId) {
        return onboardingDataRepository.existsByUserIdAndIsCompletedTrue(userId);
    }

    // 온보딩 상태 조회
    @Transactional(readOnly = true)
    public OnboardingData getOnboardingStatus(Long userId) {
        return onboardingDataRepository.findByUserId(userId)
                .orElse(null);
    }

    // 특정 단계로 설정 (관리자용)
    public OnboardingData setCurrentStep(Long userId, Integer step) {
        OnboardingData data = getOrCreateOnboardingData(userId);
        
        if (step < 1 || step > 4) {
            throw new RuntimeException("잘못된 온보딩 단계입니다. (1-4)");
        }

        data.setCurrentStep(step);
        OnboardingData updated = onboardingDataRepository.save(data);
        
        log.info("User {} step set to {}", userId, step);
        return updated;
    }

    // 온보딩 재시작 (데이터는 유지하되 단계를 1로)
    public OnboardingData restartOnboarding(Long userId) {
        OnboardingData data = getOrCreateOnboardingData(userId);
        
        data.setCurrentStep(1);
        data.setIsCompleted(false);
        data.setCompletedAt(null);
        data.setCompletionRate(25); // 1단계 = 25%

        OnboardingData restarted = onboardingDataRepository.save(data);
        log.info("Onboarding restarted for user: {}", userId);
        
        return restarted;
    }

    // UserCompatibility 생성/업데이트 (온보딩 완료 시)
    private void createOrUpdateUserCompatibility(Long userId, Map<String, Object> onboardingData) {
        Optional<UserCompatibility> existing = userCompatibilityRepository.findByUserId(userId);
        
        UserCompatibility compatibility;
        if (existing.isPresent()) {
            compatibility = existing.get();
        } else {
            compatibility = UserCompatibility.builder()
                    .userId(userId)
                    .isActive(true)
                    .build();
        }

        // 온보딩 데이터에서 호환성 정보 추출 및 설정
        if (onboardingData.containsKey("nativeLanguage")) {
            compatibility.setNativeLanguage((String) onboardingData.get("nativeLanguage"));
        }
        if (onboardingData.containsKey("targetLanguage")) {
            compatibility.setTargetLanguage((String) onboardingData.get("targetLanguage"));
        }
        if (onboardingData.containsKey("languageLevel")) {
            compatibility.setLanguageLevel((String) onboardingData.get("languageLevel"));
        }
        if (onboardingData.containsKey("interests")) {
            compatibility.setInterests((String) onboardingData.get("interests"));
        }
        if (onboardingData.containsKey("timeZone")) {
            compatibility.setTimeZone((String) onboardingData.get("timeZone"));
        }
        if (onboardingData.containsKey("preferredSessionTime")) {
            compatibility.setPreferredSessionTime((String) onboardingData.get("preferredSessionTime"));
        }
        if (onboardingData.containsKey("ageRange")) {
            compatibility.setAgeRange((String) onboardingData.get("ageRange"));
        }
        if (onboardingData.containsKey("matchingPreferences")) {
            compatibility.setMatchingPreferences((String) onboardingData.get("matchingPreferences"));
        }

        userCompatibilityRepository.save(compatibility);
        log.info("User compatibility updated for user: {}", userId);
    }

    // 온보딩 데이터 삭제 (탈퇴 시)
    public void deleteOnboardingData(Long userId) {
        onboardingDataRepository.findByUserId(userId).ifPresent(data -> {
            onboardingDataRepository.delete(data);
            log.info("Onboarding data deleted for user: {}", userId);
        });
    }
}