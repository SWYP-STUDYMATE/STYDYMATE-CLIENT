package com.studymate.server.controller;

import com.studymate.server.entity.OAuthProvider;
import com.studymate.server.entity.User;
import com.studymate.server.service.AuthService;
import com.studymate.server.service.JwtTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"https://languagemate.kr", "https://preview.languagemate.kr", "http://localhost:3000"})
public class AuthController {

    private final AuthService authService;
    private final JwtTokenService jwtTokenService;

    // === OAuth 로그인 ===

    @PostMapping("/oauth/google")
    public ResponseEntity<?> googleLogin(
            @RequestBody GoogleLoginRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            String deviceInfo = extractDeviceInfo(httpRequest);
            String ipAddress = extractClientIp(httpRequest);

            Map<String, Object> result = authService.processGoogleLogin(
                request.getCode(), 
                deviceInfo, 
                ipAddress
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
            ));
        } catch (Exception e) {
            log.error("Google login failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/oauth/naver")
    public ResponseEntity<?> naverLogin(
            @RequestBody NaverLoginRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            String deviceInfo = extractDeviceInfo(httpRequest);
            String ipAddress = extractClientIp(httpRequest);

            Map<String, Object> result = authService.processNaverLogin(
                request.getCode(), 
                request.getState(), 
                deviceInfo, 
                ipAddress
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
            ));
        } catch (Exception e) {
            log.error("Naver login failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // === 토큰 관리 ===

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest
    ) {
        try {
            String deviceInfo = extractDeviceInfo(httpRequest);
            String ipAddress = extractClientIp(httpRequest);

            Map<String, Object> result = authService.refreshAccessToken(
                request.getRefreshToken(), 
                deviceInfo, 
                ipAddress
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
            ));
        } catch (Exception e) {
            log.error("Token refresh failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String authorization) {
        try {
            String token = jwtTokenService.extractTokenFromHeader(authorization);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "토큰이 제공되지 않았습니다."));
            }

            Map<String, Object> result = authService.verifyAccessToken(token);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result
            ));
        } catch (Exception e) {
            log.error("Token verification failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authorization) {
        try {
            String token = jwtTokenService.extractTokenFromHeader(authorization);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "토큰이 제공되지 않았습니다."));
            }

            Long userId = jwtTokenService.getUserIdFromToken(token);
            User user = authService.getCurrentUser(userId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", user
            ));
        } catch (Exception e) {
            log.error("Get current user failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/token/summary")
    public ResponseEntity<?> getTokenSummary(@RequestHeader("Authorization") String authorization) {
        try {
            String token = jwtTokenService.extractTokenFromHeader(authorization);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "토큰이 제공되지 않았습니다."));
            }

            Map<String, Object> summary = jwtTokenService.getTokenSummary(token);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", summary
            ));
        } catch (Exception e) {
            log.error("Get token summary failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // === 로그아웃 ===

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest request) {
        try {
            authService.logout(request.getRefreshToken());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "로그아웃되었습니다."
            ));
        } catch (Exception e) {
            log.error("Logout failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/logout/all")
    public ResponseEntity<?> logoutFromAllDevices(@RequestHeader("Authorization") String authorization) {
        try {
            String token = jwtTokenService.extractTokenFromHeader(authorization);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "토큰이 제공되지 않았습니다."));
            }

            Long userId = jwtTokenService.getUserIdFromToken(token);
            authService.logoutFromAllDevices(userId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "모든 기기에서 로그아웃되었습니다."
            ));
        } catch (Exception e) {
            log.error("Logout from all devices failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // === OAuth 계정 관리 ===

    @GetMapping("/oauth/accounts")
    public ResponseEntity<?> getOAuthAccounts(@RequestHeader("Authorization") String authorization) {
        try {
            String token = jwtTokenService.extractTokenFromHeader(authorization);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "토큰이 제공되지 않았습니다."));
            }

            Long userId = jwtTokenService.getUserIdFromToken(token);
            List<OAuthProvider> accounts = authService.getUserOAuthAccounts(userId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", accounts
            ));
        } catch (Exception e) {
            log.error("Get OAuth accounts failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/oauth/{provider}")
    public ResponseEntity<?> unlinkOAuthAccount(
            @PathVariable String provider,
            @RequestHeader("Authorization") String authorization
    ) {
        try {
            String token = jwtTokenService.extractTokenFromHeader(authorization);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "토큰이 제공되지 않았습니다."));
            }

            Long userId = jwtTokenService.getUserIdFromToken(token);
            ProviderType providerType = ProviderType.valueOf(provider.toUpperCase());
            
            authService.unlinkOAuthAccount(userId, providerType);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", provider + " 계정이 연결 해제되었습니다."
            ));
        } catch (Exception e) {
            log.error("Unlink OAuth account failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // === 관리자 기능 ===

    @GetMapping("/admin/suspicious-activity")
    public ResponseEntity<?> getSuspiciousActivity(@RequestHeader("Authorization") String authorization) {
        try {
            String token = jwtTokenService.extractTokenFromHeader(authorization);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "토큰이 제공되지 않았습니다."));
            }

            if (!jwtTokenService.isAdminToken(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "관리자 권한이 필요합니다."));
            }

            List<Object[]> suspiciousActivities = authService.detectSuspiciousActivity();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", suspiciousActivities
            ));
        } catch (Exception e) {
            log.error("Get suspicious activity failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/admin/token")
    public ResponseEntity<?> generateAdminToken(@RequestBody AdminTokenRequest request) {
        try {
            // 관리자 인증 로직 (별도 구현 필요)
            // 예: 관리자 전용 API 키나 별도 인증 방식
            
            String adminToken = jwtTokenService.generateAdminToken(
                request.getUserId(), 
                request.getEmail(), 
                request.getRole()
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of("adminToken", adminToken)
            ));
        } catch (Exception e) {
            log.error("Generate admin token failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/service/token")
    public ResponseEntity<?> generateServiceToken(@RequestBody ServiceTokenRequest request) {
        try {
            // 서비스 간 통신용 토큰 생성 (API 키 기반 인증 필요)
            String serviceToken = jwtTokenService.generateServiceToken(request.getServiceId());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of("serviceToken", serviceToken)
            ));
        } catch (Exception e) {
            log.error("Generate service token failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // === 디버깅 기능 (개발용) ===

    @GetMapping("/debug/token")
    public ResponseEntity<?> debugToken(@RequestHeader("Authorization") String authorization) {
        try {
            String token = jwtTokenService.extractTokenFromHeader(authorization);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "토큰이 제공되지 않았습니다."));
            }

            Map<String, Object> debug = jwtTokenService.debugToken(token);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", debug
            ));
        } catch (Exception e) {
            log.error("Debug token failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // === 유틸리티 메서드 ===

    private String extractDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String deviceType = detectDeviceType(userAgent);
        return String.format("%s|%s", deviceType, userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 200)) : "Unknown");
    }

    private String detectDeviceType(String userAgent) {
        if (userAgent == null) return "Unknown";
        
        userAgent = userAgent.toLowerCase();
        if (userAgent.contains("mobile") || userAgent.contains("android") || userAgent.contains("iphone")) {
            return "Mobile";
        } else if (userAgent.contains("tablet") || userAgent.contains("ipad")) {
            return "Tablet";
        } else {
            return "Desktop";
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String[] headers = {
            "X-Forwarded-For",
            "X-Real-IP", 
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For 헤더의 경우 여러 IP가 콤마로 구분될 수 있음
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }

        return request.getRemoteAddr();
    }

    // === DTO 클래스들 ===

    public static class GoogleLoginRequest {
        private String code;
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }

    public static class NaverLoginRequest {
        private String code;
        private String state;
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
    }

    public static class RefreshTokenRequest {
        private String refreshToken;
        
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }

    public static class LogoutRequest {
        private String refreshToken;
        
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }

    public static class AdminTokenRequest {
        private Long userId;
        private String email;
        private String role;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class ServiceTokenRequest {
        private String serviceId;
        
        public String getServiceId() { return serviceId; }
        public void setServiceId(String serviceId) { this.serviceId = serviceId; }
    }
}