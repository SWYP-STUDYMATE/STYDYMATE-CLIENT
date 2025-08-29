package com.studymate.server.service;

import com.studymate.server.entity.User;
import com.studymate.server.entity.UserSettings;
import com.studymate.server.entity.UserStatus;
import com.studymate.server.entity.OnlineStatus;
import com.studymate.server.repository.UserRepository;
import com.studymate.server.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    // 사용자 조회
    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByProvider(String provider, String providerId) {
        return userRepository.findByProviderAndProviderId(provider, providerId);
    }

    // 사용자 생성 (OAuth)
    public User createOAuthUser(String email, String provider, String providerId, Map<String, Object> attributes) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("이미 존재하는 이메일입니다: " + email);
        }

        User user = User.builder()
                .email(email)
                .username(generateUniqueUsername(email))
                .provider(provider)
                .providerId(providerId)
                .userStatus(UserStatus.ACTIVE)
                .onlineStatus(OnlineStatus.OFFLINE)
                .emailVerified(true) // OAuth는 자동 인증
                .termsAgreed(false) // 추후 약관 동의 필요
                .privacyAgreed(false)
                .marketingAgreed(false)
                .nativeLanguage("ko") // 기본값
                .build();

        // 속성에서 추가 정보 추출
        if (attributes.containsKey("name")) {
            user.setKoreanName((String) attributes.get("name"));
        }
        if (attributes.containsKey("englishName")) {
            user.setEnglishName((String) attributes.get("englishName"));
        }
        if (attributes.containsKey("profileImage")) {
            user.setProfileImageUrl((String) attributes.get("profileImage"));
        }

        User savedUser = userRepository.save(user);
        
        // 기본 사용자 설정 생성
        createDefaultUserSettings(savedUser.getId());
        
        log.info("OAuth user created: {} ({})", savedUser.getEmail(), provider);
        return savedUser;
    }

    // 사용자 생성 (일반 회원가입)
    public User createUser(String email, String username, String password, String nativeLanguage) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("이미 존재하는 이메일입니다: " + email);
        }
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("이미 존재하는 사용자명입니다: " + username);
        }

        User user = User.builder()
                .email(email)
                .username(username)
                .passwordHash(passwordEncoder.encode(password))
                .userStatus(UserStatus.PENDING_VERIFICATION)
                .onlineStatus(OnlineStatus.OFFLINE)
                .emailVerified(false)
                .termsAgreed(true)
                .privacyAgreed(true)
                .marketingAgreed(false)
                .nativeLanguage(nativeLanguage)
                .build();

        User savedUser = userRepository.save(user);
        createDefaultUserSettings(savedUser.getId());
        
        log.info("User created: {}", savedUser.getEmail());
        return savedUser;
    }

    // 사용자 프로필 업데이트
    public User updateProfile(Long userId, Map<String, Object> profileData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

        // 필드별 업데이트
        if (profileData.containsKey("englishName")) {
            user.setEnglishName((String) profileData.get("englishName"));
        }
        if (profileData.containsKey("koreanName")) {
            user.setKoreanName((String) profileData.get("koreanName"));
        }
        if (profileData.containsKey("profileImageUrl")) {
            user.setProfileImageUrl((String) profileData.get("profileImageUrl"));
        }
        if (profileData.containsKey("residence")) {
            user.setResidence((String) profileData.get("residence"));
        }
        if (profileData.containsKey("nationality")) {
            user.setNationality((String) profileData.get("nationality"));
        }
        if (profileData.containsKey("introduction")) {
            user.setIntroduction((String) profileData.get("introduction"));
        }
        if (profileData.containsKey("interests")) {
            user.setInterests((String) profileData.get("interests"));
        }
        if (profileData.containsKey("learningGoals")) {
            user.setLearningGoals((String) profileData.get("learningGoals"));
        }
        if (profileData.containsKey("targetLanguages")) {
            user.setTargetLanguages((String) profileData.get("targetLanguages"));
        }
        if (profileData.containsKey("timezone")) {
            user.setTimezone((String) profileData.get("timezone"));
        }
        if (profileData.containsKey("birthYear")) {
            user.setBirthYear((Integer) profileData.get("birthYear"));
        }

        User updated = userRepository.save(user);
        log.info("User profile updated: {}", userId);
        return updated;
    }

    // 온라인 상태 업데이트
    public void updateOnlineStatus(Long userId, OnlineStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

        user.updateOnlineStatus(status);
        userRepository.save(user);
        
        log.debug("User {} online status updated to: {}", userId, status);
    }

    // 사용자 설정 조회
    @Transactional(readOnly = true)
    public UserSettings getUserSettings(Long userId) {
        return userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultUserSettings(userId));
    }

    // 사용자 설정 업데이트
    public UserSettings updateUserSettings(Long userId, Map<String, Object> settingsData) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultUserSettings(userId));

        // 알림 설정
        if (settingsData.containsKey("emailNotifications")) {
            settings.setEmailNotifications((Boolean) settingsData.get("emailNotifications"));
        }
        if (settingsData.containsKey("pushNotifications")) {
            settings.setPushNotifications((Boolean) settingsData.get("pushNotifications"));
        }
        if (settingsData.containsKey("matchingNotifications")) {
            settings.setMatchingNotifications((Boolean) settingsData.get("matchingNotifications"));
        }
        if (settingsData.containsKey("sessionReminders")) {
            settings.setSessionReminders((Boolean) settingsData.get("sessionReminders"));
        }

        // 프라이버시 설정
        if (settingsData.containsKey("profileVisibility")) {
            settings.setProfileVisibility((String) settingsData.get("profileVisibility"));
        }
        if (settingsData.containsKey("showOnlineStatus")) {
            settings.setShowOnlineStatus((Boolean) settingsData.get("showOnlineStatus"));
        }

        // 매칭 설정
        if (settingsData.containsKey("autoMatching")) {
            settings.setAutoMatching((Boolean) settingsData.get("autoMatching"));
        }
        if (settingsData.containsKey("preferredSessionLength")) {
            settings.setPreferredSessionLength((Integer) settingsData.get("preferredSessionLength"));
        }

        // 학습 설정
        if (settingsData.containsKey("dailyGoalMinutes")) {
            settings.setDailyGoalMinutes((Integer) settingsData.get("dailyGoalMinutes"));
        }
        if (settingsData.containsKey("weeklyGoalSessions")) {
            settings.setWeeklyGoalSessions((Integer) settingsData.get("weeklyGoalSessions"));
        }

        UserSettings updated = userSettingsRepository.save(settings);
        log.info("User settings updated for user: {}", userId);
        return updated;
    }

    // 사용자 검색
    @Transactional(readOnly = true)
    public List<User> searchUsers(String query, int page, int size) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return userRepository.searchUsers(query.trim());
    }

    // 언어 교환 파트너 검색
    @Transactional(readOnly = true)
    public List<User> findLanguageExchangePartners(Long userId, String nativeLanguage, String targetLanguage) {
        return userRepository.findLanguageExchangePartners(userId, nativeLanguage, targetLanguage);
    }

    // 사용자 통계
    @Transactional(readOnly = true)
    public Map<String, Object> getUserStats() {
        return Map.of(
            "totalUsers", userRepository.count(),
            "activeUsers", userRepository.countActiveUsers(),
            "onlineUsers", userRepository.countOnlineUsers(),
            "newUsersToday", userRepository.countNewUsersAfter(LocalDateTime.now().withHour(0).withMinute(0)),
            "newUsersThisWeek", userRepository.countNewUsersAfter(LocalDateTime.now().minusWeeks(1))
        );
    }

    // 사용자 계정 비활성화
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

        user.deactivateAccount();
        userRepository.save(user);
        
        log.info("User account deactivated: {}", userId);
    }

    // 약관 동의 업데이트
    public void updateAgreements(Long userId, boolean terms, boolean privacy, boolean marketing) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

        user.setTermsAgreed(terms);
        user.setPrivacyAgreed(privacy);
        user.setMarketingAgreed(marketing);

        // 필수 약관 동의 시 활성 상태로 변경
        if (terms && privacy && user.getUserStatus() == UserStatus.PENDING_VERIFICATION) {
            user.setUserStatus(UserStatus.ACTIVE);
        }

        userRepository.save(user);
        log.info("User agreements updated: {}", userId);
    }

    // 이메일 인증
    public void verifyEmail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));

        user.setEmailVerified(true);
        if (user.getUserStatus() == UserStatus.PENDING_VERIFICATION) {
            user.setUserStatus(UserStatus.ACTIVE);
        }

        userRepository.save(user);
        log.info("Email verified for user: {}", userId);
    }

    // 비공개 메서드들
    private String generateUniqueUsername(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }

    private UserSettings createDefaultUserSettings(Long userId) {
        UserSettings settings = UserSettings.builder()
                .userId(userId)
                .build();

        return userSettingsRepository.save(settings);
    }
}