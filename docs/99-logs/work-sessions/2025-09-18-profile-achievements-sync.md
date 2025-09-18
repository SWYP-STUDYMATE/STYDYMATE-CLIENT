# 2025-09-18 프로필 & 업적 실데이터 연동 작업 요약

## 주요 변경
- 프로필 페이지에서 언어 정보, 학습 통계, 알림 설정, 파일 관리가 각각 서버/워커 API를 호출하도록 연동했습니다.
- 업적 데이터를 재사용하는 `useAchievementOverview` 훅을 작성하고 프로필/메인/업적 페이지에서 공통으로 사용하도록 구조화했습니다.
- `AchievementBadges`, `WeeklyActivityChart`, `LanguageLevelProgress`, `FileManager` 등 목업 기반 컴포넌트를 실데이터 대응 방식으로 리팩터링했습니다.

## 검증 결과 및 메모
- `GET /user/language-info`: 백엔드 엔드포인트를 `UserController`에 구현하고 `UserService`에서 온보딩 언어 데이터를 수집하도록 보강 완료. 이제 프런트 `getUserLanguageInfo`와 문서 정의가 일치합니다.
- `GET /api/v1/analytics/metrics`: Cloudflare Workers(`workers/src/routes/analytics.ts`)에서 제공됨을 명시하도록 API 스펙 문서에 주석을 추가했습니다.

## 후속 작업 메모
- 백엔드 팀과 `GET /user/language-info` 구현 여부 재확인 및 대응. ✅ (2025-09-18 구현)
- 업적 데이터 캐싱을 위해 `src/store/achievementStore.js`를 도입했고, `useAchievementOverview`가 해당 스토어를 사용하도록 갱신 완료.
- `/profile`, `/achievements` 경로에 대한 E2E 시나리오 업데이트 예정.
