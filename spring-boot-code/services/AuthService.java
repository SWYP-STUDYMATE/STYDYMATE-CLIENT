package com.studymate.server.service;

import com.studymate.server.entity.User;
import com.studymate.server.entity.RefreshToken;
import com.studymate.server.entity.OAuthProvider;
import com.studymate.server.entity.ProviderType;
import com.studymate.server.repository.UserRepository;
import com.studymate.server.repository.RefreshTokenRepository;
import com.studymate.server.repository.OAuthProviderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OAuthProviderRepository oauthProviderRepository;
    private final JwtTokenService jwtTokenService;

    @Value("${app.jwt.refresh-expiration-hours:24}")
    private int refreshTokenExpirationHours;

    @Value("${app.security.max-tokens-per-user:5}")
    private int maxTokensPerUser;

    // === OAuth 로그인 처리 ===

    // Google OAuth 로그인
    public Map<String, Object> processGoogleLogin(String code, String deviceInfo, String ipAddress) {
        // 1. Google API를 통해 사용자 정보 조회
        Map<String, Object> googleUserInfo = fetchGoogleUserInfo(code);
        
        String googleUserId = (String) googleUserInfo.get("id");
        String email = (String) googleUserInfo.get("email");
        String name = (String) googleUserInfo.get("name");
        String picture = (String) googleUserInfo.get("picture");
        String accessToken = (String) googleUserInfo.get("accessToken");
        String refreshToken = (String) googleUserInfo.get("refreshToken");
        Long expiresIn = (Long) googleUserInfo.get("expiresIn");

        return processOAuthLogin(ProviderType.GOOGLE, googleUserId, email, name, picture,
                               accessToken, refreshToken, expiresIn, deviceInfo, ipAddress);
    }

    // Naver OAuth 로그인
    public Map<String, Object> processNaverLogin(String code, String state, String deviceInfo, String ipAddress) {
        // 1. Naver API를 통해 사용자 정보 조회
        Map<String, Object> naverUserInfo = fetchNaverUserInfo(code, state);
        
        Map<String, Object> response = (Map<String, Object>) naverUserInfo.get("response");
        String naverId = (String) response.get("id");
        String email = (String) response.get("email");
        String name = (String) response.get("name");
        String profileImage = (String) response.get("profile_image");
        String accessToken = (String) naverUserInfo.get("accessToken");
        String refreshToken = (String) naverUserInfo.get("refreshToken");
        Long expiresIn = (Long) naverUserInfo.get("expiresIn");

        return processOAuthLogin(ProviderType.NAVER, naverId, email, name, profileImage,
                               accessToken, refreshToken, expiresIn, deviceInfo, ipAddress);
    }

    // 공통 OAuth 로그인 처리
    private Map<String, Object> processOAuthLogin(ProviderType provider, String providerUserId,
                                                  String email, String name, String avatarUrl,
                                                  String accessToken, String refreshToken,
                                                  Long expiresIn, String deviceInfo, String ipAddress) {
        
        // 1. 기존 OAuth 계정 확인
        Optional<OAuthProvider> existingOAuth = oauthProviderRepository
                .findByProviderAndProviderUserId(provider, providerUserId);

        User user;
        OAuthProvider oauthProvider;

        if (existingOAuth.isPresent()) {
            // 기존 계정 로그인
            oauthProvider = existingOAuth.get();
            user = userRepository.findById(oauthProvider.getUserId())
                    .orElseThrow(() -> new RuntimeException("연결된 사용자를 찾을 수 없습니다."));

            // OAuth 정보 업데이트
            updateOAuthProvider(oauthProvider, email, name, avatarUrl, accessToken, refreshToken, expiresIn);
        } else {
            // 새 계정 생성 or 기존 사용자 계정 연결
            Optional<User> existingUser = userRepository.findByEmail(email);
            
            if (existingUser.isPresent()) {
                // 기존 사용자에게 OAuth 계정 연결
                user = existingUser.get();
                oauthProvider = createOAuthProvider(user.getId(), provider, providerUserId,
                                                  email, name, avatarUrl, accessToken, refreshToken, expiresIn);
            } else {
                // 완전히 새로운 사용자 생성
                user = createNewUser(email, name, avatarUrl, provider);
                oauthProvider = createOAuthProvider(user.getId(), provider, providerUserId,
                                                  email, name, avatarUrl, accessToken, refreshToken, expiresIn);
                
                // 첫 번째 OAuth 계정을 주 계정으로 설정
                oauthProvider.setPrimaryAccount();
                oauthProviderRepository.save(oauthProvider);
            }
        }

        // 로그인 기록 업데이트
        user.updateLastLogin(ipAddress);
        oauthProvider.updateLastLogin();
        userRepository.save(user);
        oauthProviderRepository.save(oauthProvider);

        // JWT 토큰 생성
        String jwtAccessToken = jwtTokenService.generateAccessToken(user.getId(), user.getEmail());
        RefreshToken appRefreshToken = createRefreshToken(user.getId(), deviceInfo, ipAddress);

        // 응답 데이터 구성
        return Map.of(
            "accessToken", jwtAccessToken,
            "refreshToken", appRefreshToken.getToken(),
            "user", user,
            "isNewUser", existingOAuth.isEmpty() && !userRepository.existsByEmail(email),
            "needsOnboarding", !user.isOnboardingCompleted()
        );
    }

    // === 토큰 관리 ===

    // Access Token 재발급
    public Map<String, Object> refreshAccessToken(String refreshTokenString, String deviceInfo, String ipAddress) {
        // 1. Refresh Token 유효성 검증
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 Refresh Token입니다."));

        if (!refreshToken.isValid()) {
            throw new RuntimeException("만료되거나 폐기된 Refresh Token입니다.");
        }

        // 2. 사용자 조회
        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 3. 새로운 Access Token 생성
        String newAccessToken = jwtTokenService.generateAccessToken(user.getId(), user.getEmail());

        // 4. Refresh Token 사용 기록 및 갱신 (필요시)
        refreshToken.markAsUsed();
        refreshToken.updateDeviceInfo(deviceInfo, ipAddress);
        
        // 5. Refresh Token 만료 임박 시 새로 발급 (24시간 이내)
        String newRefreshToken = null;
        if (refreshToken.getMinutesUntilExpiration() < 24 * 60) {
            RefreshToken newToken = createRefreshToken(user.getId(), deviceInfo, ipAddress);
            refreshToken.revoke(); // 기존 토큰 폐기
            newRefreshToken = newToken.getToken();
        }

        refreshTokenRepository.save(refreshToken);

        // 6. 사용자 정보 업데이트
        user.updateLastActivity();
        userRepository.save(user);

        // 응답 구성
        Map<String, Object> response = Map.of(
            "accessToken", newAccessToken,
            "user", user
        );

        if (newRefreshToken != null) {
            response.put("refreshToken", newRefreshToken);
        }

        log.info("Access token refreshed for user {}", user.getId());
        return response;
    }

    // === 로그아웃 ===

    // 단일 기기 로그아웃
    public void logout(String refreshTokenString) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new RuntimeException("토큰을 찾을 수 없습니다."));

        refreshToken.revoke();
        refreshTokenRepository.save(refreshToken);

        log.info("User {} logged out from single device", refreshToken.getUserId());
    }

    // 모든 기기에서 로그아웃
    public void logoutFromAllDevices(Long userId) {
        int revokedCount = refreshTokenRepository.revokeAllUserTokens(userId, LocalDateTime.now());
        log.info("User {} logged out from all devices. {} tokens revoked", userId, revokedCount);
    }

    // === 토큰 검증 ===

    // Access Token 검증
    public Map<String, Object> verifyAccessToken(String accessToken) {
        Map<String, Object> claims = jwtTokenService.validateToken(accessToken);
        Long userId = Long.valueOf(claims.get("userId").toString());
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return Map.of(
            "valid", true,
            "user", user,
            "claims", claims
        );
    }

    // 사용자 정보 조회 (토큰 기반)
    public User getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        user.updateLastActivity();
        return userRepository.save(user);
    }

    // === OAuth 계정 관리 ===

    // 사용자의 연결된 OAuth 계정들 조회
    @Transactional(readOnly = true)
    public List<OAuthProvider> getUserOAuthAccounts(Long userId) {
        return oauthProviderRepository.findByUserIdAndIsActiveTrue(userId);
    }

    // OAuth 계정 연결 해제
    public void unlinkOAuthAccount(Long userId, ProviderType provider) {
        OAuthProvider oauthProvider = oauthProviderRepository.findByUserIdAndProvider(userId, provider)
                .orElseThrow(() -> new RuntimeException("연결된 OAuth 계정을 찾을 수 없습니다."));

        // 주 계정인 경우 다른 계정을 주 계정으로 변경
        if (oauthProvider.getIsPrimary()) {
            List<OAuthProvider> otherAccounts = oauthProviderRepository.findOtherProviderAccounts(userId, provider);
            if (!otherAccounts.isEmpty()) {
                otherAccounts.get(0).setPrimaryAccount();
                oauthProviderRepository.save(otherAccounts.get(0));
            }
        }

        oauthProvider.unlinkAccount();
        oauthProviderRepository.save(oauthProvider);

        log.info("OAuth account {} unlinked for user {}", provider, userId);
    }

    // === 보안 기능 ===

    // 사용자 토큰 정리 (최대 개수 초과 시)
    public void cleanupUserTokens(Long userId) {
        long tokenCount = refreshTokenRepository.countValidTokensByUserId(userId);
        
        if (tokenCount > maxTokensPerUser) {
            List<RefreshToken> tokensToCleanup = refreshTokenRepository.findTokensForCleanupByUserId(userId);
            int tokensToRevoke = (int) (tokenCount - maxTokensPerUser);
            
            for (int i = 0; i < tokensToRevoke && i < tokensToCleanup.size(); i++) {
                tokensToCleanup.get(i).revoke();
            }
            
            refreshTokenRepository.saveAll(tokensToCleanup.subList(0, Math.min(tokensToRevoke, tokensToCleanup.size())));
            log.info("Cleaned up {} tokens for user {}", tokensToRevoke, userId);
        }
    }

    // 의심스러운 활동 감지
    @Transactional(readOnly = true)
    public List<Object[]> detectSuspiciousActivity() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return refreshTokenRepository.findSuspiciousIpAddresses(since, 5);
    }

    // === 유틸리티 메서드 ===

    private User createNewUser(String email, String name, String avatarUrl, ProviderType provider) {
        User user = User.builder()
                .email(email)
                .displayName(name)
                .profileImageUrl(avatarUrl)
                .provider(provider.name())
                .isEmailVerified(true) // OAuth 인증으로 이메일 검증됨
                .status(UserStatus.ACTIVE)
                .build();

        return userRepository.save(user);
    }

    private OAuthProvider createOAuthProvider(Long userId, ProviderType provider, String providerUserId,
                                            String email, String name, String avatarUrl,
                                            String accessToken, String refreshToken, Long expiresIn) {
        OAuthProvider oauthProvider = OAuthProvider.builder()
                .userId(userId)
                .provider(provider)
                .providerUserId(providerUserId)
                .providerEmail(email)
                .providerName(name)
                .providerAvatarUrl(avatarUrl)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenExpiresAt(expiresIn != null ? LocalDateTime.now().plusSeconds(expiresIn) : null)
                .scope(provider.getDefaultScope())
                .isActive(true)
                .build();

        return oauthProviderRepository.save(oauthProvider);
    }

    private void updateOAuthProvider(OAuthProvider oauthProvider, String email, String name, String avatarUrl,
                                   String accessToken, String refreshToken, Long expiresIn) {
        oauthProvider.updateProfile(email, name, avatarUrl);
        oauthProvider.updateTokens(accessToken, refreshToken, expiresIn);
        oauthProvider.activate();
    }

    private RefreshToken createRefreshToken(Long userId, String deviceInfo, String ipAddress) {
        // 기존 토큰 정리
        cleanupUserTokens(userId);

        RefreshToken refreshToken = RefreshToken.createFor(userId, refreshTokenExpirationHours, deviceInfo, ipAddress);
        return refreshTokenRepository.save(refreshToken);
    }

    // OAuth 제공자별 사용자 정보 조회 (실제 구현에서는 외부 API 호출)
    private Map<String, Object> fetchGoogleUserInfo(String code) {
        // TODO: 실제 Google OAuth API 호출 구현
        throw new RuntimeException("Google OAuth API 호출 미구현");
    }

    private Map<String, Object> fetchNaverUserInfo(String code, String state) {
        // TODO: 실제 Naver OAuth API 호출 구현
        throw new RuntimeException("Naver OAuth API 호출 미구현");
    }
}