# Cloudflare DNS 설정 가이드

## 현재 도메인 설정 상태

### ✅ Pages (studymate-client)
- `languagemate.kr` - 이미 연결됨
- `www.languagemate.kr` - 이미 연결됨
- 배포 URL: `studymate-client.pages.dev`

### ✅ Workers (studymate-api-production)
- `api.languagemate.kr` - Route 설정 완료
- Health Check: https://api.languagemate.kr/health (작동 중)

## Cloudflare Dashboard에서 확인 필요한 DNS 레코드

### 1. 메인 도메인 (languagemate.kr)
```
Type: CNAME
Name: @ (or languagemate.kr)
Target: studymate-client.pages.dev
Proxy: ON (오렌지 구름)
```

### 2. WWW 서브도메인
```
Type: CNAME
Name: www
Target: studymate-client.pages.dev
Proxy: ON (오렌지 구름)
```

### 3. API 서브도메인
```
Type: AAAA
Name: api
Target: 100:: (Workers 자동 라우팅)
Proxy: ON (오렌지 구름)
```

또는 Workers Route가 이미 설정되어 있으므로:
- Workers & Pages → studymate-api-production → Triggers 탭에서 확인
- `api.languagemate.kr/*` route가 활성화되어 있는지 확인

## 테스트 명령어

### DNS 전파 확인 (전파에 5-10분 소요)
```bash
# DNS 확인
nslookup languagemate.kr
nslookup www.languagemate.kr
nslookup api.languagemate.kr

# 연결 테스트
curl https://languagemate.kr
curl https://www.languagemate.kr
curl https://api.languagemate.kr/health
```

## 현재 작동 상태

### ✅ 작동 중
- `api.languagemate.kr` - Workers API (Health check 정상)
- Pages 프로젝트에 도메인 연결 완료

### ⏳ DNS 전파 대기
- `languagemate.kr` - DNS 전파 중
- `www.languagemate.kr` - DNS 전파 중

## 문제 해결

### DNS가 작동하지 않을 경우
1. Cloudflare Dashboard → DNS → Records 확인
2. 모든 레코드가 Proxied (오렌지 구름) 상태인지 확인
3. SSL/TLS → Overview에서 "Full" 또는 "Full (strict)" 설정 확인
4. 5-10분 대기 후 재시도

### Pages가 표시되지 않을 경우
1. Pages → studymate-client → Custom domains 확인
2. 도메인이 "Active" 상태인지 확인
3. 최신 배포가 성공했는지 확인

### Workers API가 작동하지 않을 경우
1. Workers & Pages → studymate-api-production → Triggers 확인
2. Route가 활성화되어 있는지 확인
3. `npx wrangler tail --env production`으로 로그 확인