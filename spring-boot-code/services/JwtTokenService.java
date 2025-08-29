package com.studymate.server.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class JwtTokenService {

    @Value("${app.jwt.secret:studymate-super-secret-key-for-jwt-token-generation-2024}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-minutes:60}")
    private int jwtExpirationMinutes;

    @Value("${app.jwt.issuer:StudyMate}")
    private String jwtIssuer;

    private SecretKey getSigningKey() {
        // JWT Secret이 충분히 길지 않은 경우 패딩 추가
        String paddedSecret = jwtSecret;
        while (paddedSecret.getBytes(StandardCharsets.UTF_8).length < 64) {
            paddedSecret += paddedSecret;
        }
        return Keys.hmacShaKeyFor(paddedSecret.substring(0, 64).getBytes(StandardCharsets.UTF_8));
    }

    // Access Token 생성
    public String generateAccessToken(Long userId, String email) {
        return generateAccessToken(userId, email, new HashMap<>());
    }

    // 추가 클레임을 포함한 Access Token 생성
    public String generateAccessToken(Long userId, String email, Map<String, Object> additionalClaims) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiration = now.plusMinutes(jwtExpirationMinutes);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("tokenType", "ACCESS");
        claims.put("iat", Date.from(now.atZone(ZoneId.systemDefault()).toInstant()));
        claims.putAll(additionalClaims);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userId.toString())
                .setIssuer(jwtIssuer)
                .setIssuedAt(Date.from(now.atZone(ZoneId.systemDefault()).toInstant()))
                .setExpiration(Date.from(expiration.atZone(ZoneId.systemDefault()).toInstant()))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // 관리자용 토큰 생성
    public String generateAdminToken(Long userId, String email, String role) {
        Map<String, Object> additionalClaims = Map.of(
            "role", role,
            "isAdmin", true
        );
        return generateAccessToken(userId, email, additionalClaims);
    }

    // 서비스 간 통신용 토큰 생성
    public String generateServiceToken(String serviceId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiration = now.plusHours(1); // 서비스 토큰은 1시간

        Map<String, Object> claims = new HashMap<>();
        claims.put("serviceId", serviceId);
        claims.put("tokenType", "SERVICE");
        claims.put("iat", Date.from(now.atZone(ZoneId.systemDefault()).toInstant()));

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(serviceId)
                .setIssuer(jwtIssuer)
                .setIssuedAt(Date.from(now.atZone(ZoneId.systemDefault()).toInstant()))
                .setExpiration(Date.from(expiration.atZone(ZoneId.systemDefault()).toInstant()))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // 토큰 검증 및 클레임 추출
    public Map<String, Object> validateToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .requireIssuer(jwtIssuer)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            Map<String, Object> result = new HashMap<>();
            result.put("valid", true);
            result.put("userId", claims.get("userId"));
            result.put("email", claims.get("email"));
            result.put("tokenType", claims.get("tokenType", "ACCESS"));
            result.put("subject", claims.getSubject());
            result.put("issuer", claims.getIssuer());
            result.put("issuedAt", claims.getIssuedAt());
            result.put("expiration", claims.getExpiration());
            result.put("role", claims.get("role"));
            result.put("isAdmin", claims.get("isAdmin", false));
            result.put("serviceId", claims.get("serviceId"));

            return result;
        } catch (ExpiredJwtException e) {
            log.warn("JWT token is expired: {}", e.getMessage());
            throw new RuntimeException("토큰이 만료되었습니다.");
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token is unsupported: {}", e.getMessage());
            throw new RuntimeException("지원되지 않는 토큰 형식입니다.");
        } catch (MalformedJwtException e) {
            log.warn("JWT token is malformed: {}", e.getMessage());
            throw new RuntimeException("잘못된 형식의 토큰입니다.");
        } catch (SecurityException | SignatureException e) {
            log.warn("JWT signature validation failed: {}", e.getMessage());
            throw new RuntimeException("토큰 서명 검증에 실패했습니다.");
        } catch (IllegalArgumentException e) {
            log.warn("JWT token compact of handler are invalid: {}", e.getMessage());
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }
    }

    // 토큰에서 사용자 ID 추출
    public Long getUserIdFromToken(String token) {
        Map<String, Object> claims = validateToken(token);
        return Long.valueOf(claims.get("userId").toString());
    }

    // 토큰에서 이메일 추출
    public String getEmailFromToken(String token) {
        Map<String, Object> claims = validateToken(token);
        return (String) claims.get("email");
    }

    // 토큰 만료 시간 확인
    public Date getExpirationDateFromToken(String token) {
        Map<String, Object> claims = validateToken(token);
        return (Date) claims.get("expiration");
    }

    // 토큰 만료 여부 확인
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            return expiration.before(new Date());
        } catch (RuntimeException e) {
            return true; // 토큰 파싱 실패 시 만료된 것으로 처리
        }
    }

    // 토큰 만료까지 남은 시간 (분 단위)
    public long getMinutesUntilExpiration(String token) {
        try {
            Date expiration = getExpirationDateFromToken(token);
            long diffMillis = expiration.getTime() - System.currentTimeMillis();
            return Math.max(0, diffMillis / (1000 * 60));
        } catch (RuntimeException e) {
            return 0;
        }
    }

    // 토큰 갱신 필요 여부 확인 (만료 10분 전)
    public boolean needsRefresh(String token) {
        return getMinutesUntilExpiration(token) <= 10;
    }

    // Authorization 헤더에서 토큰 추출
    public String extractTokenFromHeader(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }

    // 토큰 유효성 검사 (예외 발생 없음)
    public boolean isTokenValid(String token) {
        try {
            validateToken(token);
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }

    // 관리자 권한 확인
    public boolean isAdminToken(String token) {
        try {
            Map<String, Object> claims = validateToken(token);
            return Boolean.TRUE.equals(claims.get("isAdmin"));
        } catch (RuntimeException e) {
            return false;
        }
    }

    // 서비스 토큰 확인
    public boolean isServiceToken(String token) {
        try {
            Map<String, Object> claims = validateToken(token);
            return "SERVICE".equals(claims.get("tokenType"));
        } catch (RuntimeException e) {
            return false;
        }
    }

    // 토큰 블랙리스트 확인 (추후 Redis 등을 활용한 구현 가능)
    public boolean isTokenBlacklisted(String token) {
        // TODO: 블랙리스트 구현 (Redis 등 활용)
        return false;
    }

    // 토큰 정보 요약
    public Map<String, Object> getTokenSummary(String token) {
        try {
            Map<String, Object> claims = validateToken(token);
            Map<String, Object> summary = new HashMap<>();
            
            summary.put("valid", true);
            summary.put("userId", claims.get("userId"));
            summary.put("email", claims.get("email"));
            summary.put("tokenType", claims.get("tokenType"));
            summary.put("isAdmin", claims.get("isAdmin"));
            summary.put("minutesUntilExpiration", getMinutesUntilExpiration(token));
            summary.put("needsRefresh", needsRefresh(token));
            summary.put("isExpired", isTokenExpired(token));
            
            return summary;
        } catch (RuntimeException e) {
            return Map.of(
                "valid", false,
                "error", e.getMessage(),
                "isExpired", true
            );
        }
    }

    // 토큰 디버그 정보 (개발용)
    public Map<String, Object> debugToken(String token) {
        Map<String, Object> debug = new HashMap<>();
        
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            debug.put("header", Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getHeader());
            debug.put("payload", claims);
            debug.put("signature", "valid");
            
        } catch (Exception e) {
            debug.put("error", e.getMessage());
            debug.put("errorType", e.getClass().getSimpleName());
        }
        
        return debug;
    }
}