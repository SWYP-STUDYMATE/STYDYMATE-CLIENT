# 네이버 로그인 장애 분석 절차

본 문서는 네이버 OAuth 로그인 절차가 실패할 때 원인을 체계적으로 파악하기 위한 진단 플로우를 정리합니다. 모든 단계는 실행 후 결과(성공/실패, 캡처, 로그)를 이 문서 혹은 별도 조사 노트에 기록하면서 진행하세요.

## 0. 사전 준비
- 로컬 환경 변수 확인: `.env.local`에서 `VITE_API_URL`, `VITE_NAVER_REDIRECT_URI`, `VITE_WS_URL` 값을 점검합니다.
- 백엔드 API 서버(예: 레거시 자바 서버, Gateway)와 네이버 개발자 콘솔에서 등록한 Redirect URI가 `http://localhost:3000/login/oauth2/code/naver`와 정확히 일치하는지 미리 확인합니다.
- 필요한 도구: Chrome DevTools, 터미널, `curl` 또는 `httpie`, 네트워크 패킷 캡처는 선택.

```bash
cat .env.local
```

기대한 출력:
```
VITE_API_URL=http://localhost:8080
VITE_NAVER_REDIRECT_URI=http://localhost:3000/login/oauth2/code/naver
...
```

## 1. 프런트엔드 빌드 및 런타임 점검
1. 의존성 설치 상태 확인.
    ```bash
    npm install
    ```
2. 개발 서버 실행(별도 창에서 실행 상태 유지).
    ```bash
    npm run dev
    ```
3. 브라우저에서 `http://localhost:3000/login` 접속 후, 터미널과 브라우저 콘솔의 로그를 동시에 관찰합니다.
   - `src/pages/Login/Login.jsx`에서 `startLogin('naver')` 호출 시 `window.location.href`가 어떤 URL로 설정되는지 console.log로 이미 기록되므로 확인.
   - 예상 URL: `http://localhost:8080/api/v1/login/naver?target=http%3A%2F%2Flocalhost%3A3000`.
4. 브라우저 DevTools → Network 탭에서 `login/naver` 요청이 302 Redirect를 반환하는지 확인하고, 응답 헤더의 `Location` 값이 네이버 `nid.naver.com/oauth2.0/authorize`로 향하는지 기록합니다.

## 2. OAuth 리다이렉트 & 콜백 검증
1. 네이버 로그인 창에서 정상 인증을 시도합니다.
2. 인증 완료 후 브라우저가 `/login/oauth2/code/naver`로 리다이렉트되는지 확인합니다.
   - Vite 프록시 설정(`vite.config.js`)에 따라 `/login/oauth2/code/naver` 요청은 API 서버로 프록시됩니다.
   - DevTools Network 탭에서 해당 요청을 선택해 상태 코드, 응답 헤더, 응답 본문을 기록합니다.
3. `src/pages/Login/Navercallback.jsx`에서 다음 파라미터들이 어떻게 들어오는지 콘솔 로그를 확인합니다:
   - `accessToken`, `refreshToken`, `code`, `state`, `error`, `error_description`.
   - 토큰이 쿼리 파라미터로 직접 전달되면 JWT 형식 검증(`isValidJWT`)이 통과하는지 콘솔에서 확인.
4. 콜백 단계에서 API 호출 흐름 추적:
   - `code`/`state`만 존재할 때: `/auth/callback/naver?code=...&state=...` 호출 결과의 응답 본문(JSON)을 확인합니다.
   - 응답이 `accessToken`, `refreshToken`, `isNewUser`, `name`을 포함하는지 기록.

## 3. 저장소(LocalStorage/SessionStorage) 검증
1. DevTools Application 탭에서 `localStorage` 항목을 열고 `accessToken`, `refreshToken`, `userName`, `isNewUser` 값이 저장되는지 확인합니다.
2. JWT 유효성 검증 실패로 토큰이 삭제되는 경우, `Navercallback.jsx`와 `src/api/index.js`의 로그에 "Invalid JWT format" 메시지가 출력되는지 확인합니다.
3. 문제가 재현되면 해당 콘솔 로그와 Network 응답을 캡처하여 문서화합니다.

## 4. 백엔드 헬스체크 및 인증 엔드포인트 테스트
1. API 서버가 동작 중인지 확인.
    ```bash
    curl -i $VITE_API_URL/api/v1/health
    ```
2. 로그인 시작 엔드포인트가 올바른 네이버 인증 URL을 반환하는지 확인.
    ```bash
    curl -i "$VITE_API_URL/api/v1/login/naver?target=http://localhost:3000"
    ```
   - 응답에서 `Location` 혹은 JSON으로 전달되는 인증 URL을 기록합니다.
3. 콜백 엔드포인트에 `code`, `state`를 임의로 넣어 테스트할 경우, 서버 측 로직이 네이버 토큰 API 호출을 시도하므로 실제 유효한 값이 필요합니다. 테스트 시 Mock 서버나 공식 테스트 계정을 사용합니다.

## 5. 네이버 개발자 콘솔 설정 확인
1. 애플리케이션 등록 정보에서 다음을 확인합니다:
   - Client ID / Client Secret이 백엔드 설정과 일치하는지.
   - Callback URL이 `http://localhost:3000/login/oauth2/code/naver` 또는 프로덕션 도메인으로 정확히 등록되어 있는지.
   - 네이버 로그인 사용 설정이 활성화되어 있는지.
2. 변경 사항이 있을 경우 백엔드 서버 재시작 및 환경 변수 반영 여부 확인.

## 6. 브라우저/캐시 이슈 배제
1. 시크릿 모드에서 동일 증상 재현 여부 확인.
2. `localStorage`, `sessionStorage`, 쿠키 삭제 후 재시도.
3. 서비스 워커 캐시가 남아 있을 수 있으므로 개발자 도구 Application → Service Workers에서 Unregister 실행.

## 7. 자동화 테스트 참고
- `src/tests/unit/Login.test.jsx`에서 기대하는 리다이렉트 URL (`https://api.languagemate.kr/api/v1/login/naver`)을 확인하여 로컬/프로덕션 URL 비교에 활용.
- E2E 테스트(`e2e/login-improved.spec.ts`)는 Playwright route mocking으로 네이버 인증 흐름을 시뮬레이션하므로, 실제 로그인 문제와 비교할 때 어떤 부분이 Mock과 다르게 동작하는지 파악합니다.

```bash
npm run test:e2e -- login-improved.spec.ts
```

> 테스트는 Mock 데이터 기반으로 통과하더라도 실서버 환경값이 다른 경우 실패할 수 있으므로, 테스트 결과와 실제 문제를 함께 기록합니다.

## 8. 진단 결과 정리 템플릿
각 단계별 조사 결과를 아래 템플릿에 맞게 기록하세요.

```
### YYYY-MM-DD HH:MM 단계명
- 실행 명령: <명령어>
- 관찰 결과:
  - 네트워크 상태 코드/응답 요약
  - 콘솔 로그 핵심 메시지
  - 토큰 저장 여부 및 값 형식 (JWT 여부 등)
- 가설:
- 다음 액션:
```

## 9. 자주 발생하는 이슈 체크리스트
- [ ] `target` 쿼리 파라미터가 백엔드 화이트리스트에 등록되어 있지 않아 400/403 발생
- [ ] 백엔드에서 받는 `code`/`state`가 유효하지 않아 네이버 토큰 교환 실패
- [ ] 백엔드가 프론트로 토큰을 `Set-Cookie` 대신 쿼리 파라미터로 반환하면서 URL 인코딩 문제 발생
- [ ] JWT 서명키 혹은 만료 설정 불일치로 `isValidJWT` 검증 실패
- [ ] Vite 프록시와 실제 API 서버 도메인 불일치로 CORS 차단
- [ ] 네이버 콘솔 Redirect URI 오탈자 또는 HTTP ↔ HTTPS 불일치

위 절차를 순서대로 수행하면 네이버 로그인 실패의 원인을 단계적으로 좁혀갈 수 있습니다. 각 단계의 로그와 결론은 Task Master 또는 별도의 조사 문서에 첨부해 팀과 공유하세요.
