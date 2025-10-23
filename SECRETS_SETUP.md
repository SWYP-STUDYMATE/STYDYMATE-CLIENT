# Cloudflare Secrets 설정 가이드

이 문서는 프로덕션 환경에서 안전하게 환경변수를 관리하기 위한 Cloudflare Secrets 설정 방법을 안내합니다.

## 🔐 Secrets 설정이 필요한 이유

`wrangler.toml`에 민감한 정보(OAuth Secret, JWT Secret 등)를 직접 작성하면 보안상 위험합니다.
Cloudflare Secrets를 사용하면 암호화된 형태로 안전하게 관리할 수 있습니다.

---

## 📋 백엔드 Workers Secrets 설정

### 1. 프로덕션 환경 Secrets 등록

```bash
# 1. Naver OAuth Client Secret
wrangler secret put NAVER_CLIENT_SECRET --env production
# 입력 값: Zml5tphcOJ

# 2. Google OAuth Client Secret
wrangler secret put GOOGLE_CLIENT_SECRET --env production
# 입력 값: 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

# 3. JWT Secret (현재 값 또는 새로 생성)
wrangler secret put JWT_SECRET --env production
# 입력 값: c3R1ZHltYXRlc3R1ZHltYXRlc3R1ZHltYXRlc3R1ZHltYXRlc3R1ZHltYXRlc3R1ZHltYXRlc3R1ZHltYXRlc3R1ZHltYXRlc3R1ZHltYXRlc3R1ZHltYXRlc3R1ZHltYXRlc3R1ZHltYXRlc3R1ZHltYXRl

# 4. Internal Secret
wrangler secret put INTERNAL_SECRET --env production
# 입력 값: studymate-internal-secret-2024

# 5. Workers Internal Secret
wrangler secret put WORKERS_INTERNAL_SECRET --env production
# 입력 값: studymate-internal-secret-2024

# 6. Cloudflare Images API Token (있는 경우)
wrangler secret put CF_IMAGES_API_TOKEN --env production
# 입력 값: (Cloudflare Images API 토큰)

# 7. Cloudflare Account Hash (있는 경우)
wrangler secret put CF_ACCOUNT_HASH --env production
# 입력 값: (Cloudflare Account Hash)
```

### 2. 개발 환경 Secrets 등록 (선택사항)

개발 환경에서도 실제 값으로 테스트하려면:

```bash
wrangler secret put NAVER_CLIENT_SECRET
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put JWT_SECRET
wrangler secret put INTERNAL_SECRET
wrangler secret put WORKERS_INTERNAL_SECRET
```

---

## 🔑 JWT Secret 재생성 (권장)

현재 JWT Secret은 단순 base64 인코딩이므로 보안에 취약합니다.
아래 명령어로 강력한 랜덤 시크릿을 생성하세요:

```bash
# Node.js로 256bit 랜덤 시크릿 생성
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

생성된 값을 복사하여 Secrets로 등록:

```bash
wrangler secret put JWT_SECRET --env production
# (생성된 랜덤 값 입력)
```

---

## ✅ Secrets 등록 확인

### Cloudflare Dashboard에서 확인

1. [Cloudflare Dashboard](https://dash.cloudflare.com) 접속
2. **Workers & Pages** 메뉴 클릭
3. `studymate-api-production` 선택
4. **Settings** → **Environment Variables** 탭
5. **Production** 환경에서 등록된 Secrets 확인

### CLI로 확인 (목록만 표시, 값은 표시되지 않음)

```bash
# 프로덕션 환경 Secrets 목록
wrangler secret list --env production

# 개발 환경 Secrets 목록
wrangler secret list
```

---

## 🔄 Secrets 업데이트

기존 Secret 값을 변경하려면 동일한 명령어 사용:

```bash
# 예: JWT Secret 변경
wrangler secret put JWT_SECRET --env production
# (새로운 값 입력)
```

---

## 🗑️ Secrets 삭제

불필요한 Secret 삭제:

```bash
wrangler secret delete SECRET_NAME --env production
```

---

## 📌 주의사항

1. **Secrets는 암호화되어 저장**되므로 CLI나 Dashboard에서 값을 확인할 수 없습니다.
2. **프로덕션 배포 전 반드시 Secrets 등록**이 필요합니다.
3. **개발 환경**에서는 `wrangler.toml`의 `[vars]`에 임시 값을 사용할 수 있습니다.
4. **Git에 절대 커밋하지 마세요**: `.gitignore`에 `.env*` 패턴이 추가되어 있습니다.

---

## 🚀 배포 후 테스트

Secrets 등록 후 배포:

```bash
# Workers 배포
cd workers
wrangler deploy --env production

# 또는 package.json 스크립트 사용
npm run deploy:production
```

배포 후 API 엔드포인트 테스트:

```bash
# Health Check
curl https://api.languagemate.kr/health

# OAuth 로그인 테스트 (브라우저)
https://api.languagemate.kr/api/v1/login/naver?target=https://languagemate.kr
```

---

## 📞 문제 발생 시

1. **Secrets가 적용되지 않는 경우**: 배포 후 잠시 대기 (Cloudflare 캐시 반영)
2. **401 Unauthorized 에러**: JWT_SECRET이 제대로 설정되었는지 확인
3. **OAuth 로그인 실패**: Client ID/Secret이 정확한지 확인

---

**⚠️ 보안 경고**: 이 문서에 실제 Secret 값을 기록하지 마세요!
