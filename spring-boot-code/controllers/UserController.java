package com.studymate.server.controller;

import com.studymate.server.entity.User;
import com.studymate.server.entity.UserSettings;
import com.studymate.server.entity.OnlineStatus;
import com.studymate.server.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 사용자 프로필 조회
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserProfile(@PathVariable Long userId) {
        Optional<User> user = userService.findById(userId);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    // 현재 사용자 프로필 조회 (토큰 기반)
    @GetMapping("/profile")
    public ResponseEntity<User> getCurrentUserProfile(@RequestParam Long userId) {
        Optional<User> user = userService.findById(userId);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    // 사용자 프로필 업데이트
    @PatchMapping("/{userId}")
    public ResponseEntity<User> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> profileData) {
        
        try {
            User updatedUser = userService.updateProfile(userId, profileData);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            log.error("Error updating user profile: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 프로필 이미지 업데이트
    @PatchMapping("/{userId}/profile-image")
    public ResponseEntity<User> updateProfileImage(
            @PathVariable Long userId,
            @RequestBody Map<String, String> imageData) {
        
        try {
            String imageUrl = imageData.get("profileImageUrl");
            if (imageUrl == null || imageUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Map<String, Object> updateData = Map.of("profileImageUrl", imageUrl);
            User updatedUser = userService.updateProfile(userId, updateData);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            log.error("Error updating profile image: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 온라인 상태 업데이트
    @PatchMapping("/{userId}/online-status")
    public ResponseEntity<Void> updateOnlineStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, String> statusData) {
        
        try {
            OnlineStatus status = OnlineStatus.valueOf(statusData.get("status"));
            userService.updateOnlineStatus(userId, status);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("Invalid online status: {}", statusData.get("status"));
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            log.error("Error updating online status: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 사용자 설정 조회
    @GetMapping("/{userId}/settings")
    public ResponseEntity<UserSettings> getUserSettings(@PathVariable Long userId) {
        UserSettings settings = userService.getUserSettings(userId);
        return ResponseEntity.ok(settings);
    }

    // 사용자 설정 업데이트
    @PatchMapping("/{userId}/settings")
    public ResponseEntity<UserSettings> updateUserSettings(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> settingsData) {
        
        try {
            UserSettings updatedSettings = userService.updateUserSettings(userId, settingsData);
            return ResponseEntity.ok(updatedSettings);
        } catch (RuntimeException e) {
            log.error("Error updating user settings: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 사용자 검색
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.badRequest().build();
        }

        List<User> users = userService.searchUsers(query, page, size);
        return ResponseEntity.ok(users);
    }

    // 언어 교환 파트너 검색
    @GetMapping("/language-partners")
    public ResponseEntity<List<User>> findLanguagePartners(
            @RequestParam Long userId,
            @RequestParam String nativeLanguage,
            @RequestParam String targetLanguage) {
        
        List<User> partners = userService.findLanguageExchangePartners(userId, nativeLanguage, targetLanguage);
        return ResponseEntity.ok(partners);
    }

    // 사용자 이름 중복 확인
    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@RequestParam String username) {
        Optional<User> user = userService.findByUsername(username);
        boolean available = user.isEmpty();
        return ResponseEntity.ok(Map.of("available", available));
    }

    // 이메일 중복 확인
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        Optional<User> user = userService.findByEmail(email);
        boolean available = user.isEmpty();
        return ResponseEntity.ok(Map.of("available", available));
    }

    // 약관 동의 업데이트
    @PostMapping("/{userId}/agreements")
    public ResponseEntity<Void> updateAgreements(
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> agreements) {
        
        try {
            boolean terms = agreements.getOrDefault("terms", false);
            boolean privacy = agreements.getOrDefault("privacy", false);
            boolean marketing = agreements.getOrDefault("marketing", false);

            userService.updateAgreements(userId, terms, privacy, marketing);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error updating agreements: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 이메일 인증
    @PostMapping("/{userId}/verify-email")
    public ResponseEntity<Void> verifyEmail(@PathVariable Long userId) {
        try {
            userService.verifyEmail(userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error verifying email: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 계정 비활성화
    @PostMapping("/{userId}/deactivate")
    public ResponseEntity<Void> deactivateAccount(@PathVariable Long userId) {
        try {
            userService.deactivateUser(userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error deactivating account: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 사용자 통계 (관리자용)
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        Map<String, Object> stats = userService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    // 사용자 기본 정보 조회 (공개 정보만)
    @GetMapping("/{userId}/public")
    public ResponseEntity<Map<String, Object>> getPublicProfile(@PathVariable Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        Map<String, Object> publicProfile = Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "englishName", user.getEnglishName() != null ? user.getEnglishName() : "",
            "profileImageUrl", user.getProfileImageUrl() != null ? user.getProfileImageUrl() : "",
            "residence", user.getResidence() != null ? user.getResidence() : "",
            "nativeLanguage", user.getNativeLanguage(),
            "targetLanguages", user.getTargetLanguages() != null ? user.getTargetLanguages() : "[]",
            "onlineStatus", user.getOnlineStatus(),
            "introduction", user.getIntroduction() != null ? user.getIntroduction() : "",
            "interests", user.getInterests() != null ? user.getInterests() : "[]"
        );

        return ResponseEntity.ok(publicProfile);
    }

    // 사용자 이름 조회 (기존 API 호환성)
    @GetMapping("/name")
    public ResponseEntity<Map<String, String>> getUserName(@RequestParam Long userId) {
        Optional<User> user = userService.findById(userId);
        
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String displayName = user.get().getEnglishName() != null 
            ? user.get().getEnglishName() 
            : user.get().getUsername();

        return ResponseEntity.ok(Map.of("name", displayName));
    }
}