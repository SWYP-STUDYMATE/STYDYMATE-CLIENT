# STUDYMATE QA 테스트 계획서

**작성일**: 2026-01-17
**배포 URL**: https://languagemate.kr/
**API URL**: https://api.languagemate.kr
**테스트 범위**: 전체 49개 라우트 + UI/UX 검증

---

## 1. 인프라 상태 확인

### 1.1 서버 상태
| 항목 | URL | 예상 상태 | 실제 상태 | 비고 |
|------|-----|----------|----------|------|
| 프론트엔드 | https://languagemate.kr/ | 200 | TBD | Cloudflare Pages |
| API 서버 | https://api.languagemate.kr/ | 200 | 200 | Cloudflare Workers |
| Health Check | https://api.languagemate.kr/health | 200 | TBD | |
| WebSocket | wss://api.languagemate.kr/ws | Connected | TBD | |

### 1.2 SSL/TLS 인증서
- [ ] HTTPS 정상 작동
- [ ] 유효한 SSL 인증서
- [ ] Mixed Content 경고 없음

---

## 2. PUBLIC 라우트 테스트 (5개)

### 2.1 로그인 페이지 (/)
**파일**: `src/pages/Login/Login.jsx`

#### 기능 테스트
- [ ] 페이지 정상 로드
- [ ] 네이버 로그인 버튼 표시 및 클릭 가능
- [ ] 구글 로그인 버튼 표시 및 클릭 가능
- [ ] 로고/브랜딩 표시
- [ ] 반응형 레이아웃 (모바일/데스크톱)

#### UI/UX 검증
- [ ] 브랜드 컬러 (#00C471) 적용
- [ ] Pretendard 폰트 적용
- [ ] 버튼 높이 56px 준수
- [ ] 호버 효과 동작
- [ ] 로딩 스피너 표시 (클릭 시)

### 2.2 네이버 OAuth 콜백 (/login/oauth2/code/naver)
**파일**: `src/pages/Login/Navercallback.jsx`

#### 기능 테스트
- [ ] 네이버 로그인 후 콜백 처리
- [ ] 토큰 저장 (localStorage)
- [ ] 신규 사용자 → /agreement 리다이렉션
- [ ] 기존 사용자 → /main 리다이렉션
- [ ] 온보딩 미완료 사용자 → /onboarding-info/1 리다이렉션
- [ ] 에러 처리 및 사용자 안내

### 2.3 구글 OAuth 콜백 (/login/oauth2/code/google)
**파일**: `src/pages/Login/GoogleCallback.jsx`

#### 기능 테스트
- [ ] 구글 로그인 후 콜백 처리
- [ ] 토큰 저장 (localStorage)
- [ ] 신규 사용자 → /agreement 리다이렉션
- [ ] 기존 사용자 → /main 리다이렉션
- [ ] 온보딩 미완료 사용자 → /onboarding-info/1 리다이렉션
- [ ] 에러 처리 및 사용자 안내

### 2.4 약관 동의 (/agreement)
**파일**: `src/pages/Login/Agreement.jsx`

#### 기능 테스트
- [ ] 이용약관 표시
- [ ] 개인정보처리방침 표시
- [ ] 전체 동의 체크박스
- [ ] 개별 항목 체크박스
- [ ] 필수 약관 미동의 시 버튼 비활성화
- [ ] 동의 완료 시 다음 단계 이동

#### UI/UX 검증
- [ ] 체크박스 스타일 (#00C471)
- [ ] 약관 내용 스크롤 가능
- [ ] 동의 버튼 상태 변화

### 2.5 회원가입 완료 (/signup-complete)
**파일**: `src/pages/Login/SignupComplete.jsx`

#### 기능 테스트
- [ ] 완료 메시지 표시
- [ ] 다음 단계 안내
- [ ] 메인으로 이동 버튼

---

## 3. AUTH 라우트 테스트 - 온보딩 (5개 플로우, 20+ 단계)

### 3.1 온보딩 정보 입력 (/onboarding-info/:step)
**파일**: `src/pages/ObInfo/`

#### Step 1: 기본 정보
- [ ] 영어 이름 입력
- [ ] 입력 유효성 검사
- [ ] 다음 버튼 활성화 조건

#### Step 2: 거주지 선택
- [ ] 국가 목록 표시
- [ ] 검색 기능
- [ ] 선택 후 다음 단계

#### Step 3: 프로필 이미지
- [ ] 이미지 업로드
- [ ] 이미지 미리보기
- [ ] 이미지 크롭/편집
- [ ] 건너뛰기 옵션

#### Step 4: 자기소개
- [ ] 텍스트 입력 (최대 글자수)
- [ ] 글자수 카운터
- [ ] 완료 버튼

#### Complete: 완료 화면
- [ ] 완료 메시지
- [ ] 다음 온보딩 단계로 이동

### 3.2 언어 설정 (/onboarding-lang/:step)
**파일**: `src/pages/ObLang/`

#### Step 1: 모국어 선택
- [ ] 언어 목록 표시
- [ ] 언어 검색
- [ ] 단일 선택

#### Step 2: 학습 언어 선택
- [ ] 언어 목록 표시
- [ ] 복수 선택 가능 여부 확인
- [ ] 선택된 언어 표시

#### Step 3: 숙련도 설정
- [ ] CEFR 레벨 선택 (A1-C2)
- [ ] 레벨 설명 표시
- [ ] 각 학습 언어별 설정

### 3.3 관심사 선택 (/onboarding-int/:step)
**파일**: `src/pages/ObInt/`

#### Step 1-4: 관심사 카테고리
- [ ] 관심사 카드 표시
- [ ] 복수 선택 가능
- [ ] 선택 개수 제한 확인
- [ ] 선택 상태 시각적 피드백

### 3.4 파트너 선호도 (/onboarding-partner/:step)
**파일**: `src/pages/ObPartner/`

#### Step 1: 선호 파트너 조건
- [ ] 연령대 설정
- [ ] 성별 설정
- [ ] 언어 레벨 설정

#### Step 2: 추가 선호 조건
- [ ] 학습 목적 설정
- [ ] 관심사 기반 매칭 설정

### 3.5 스케줄 설정 (/onboarding-schedule/:step)
**파일**: `src/pages/ObSchadule/`

#### Step 1-4: 가용 시간 설정
- [ ] 요일별 시간대 선택
- [ ] 시간대 표시 (사용자 타임존)
- [ ] 선택된 시간 시각화
- [ ] 최소 선택 개수 확인

---

## 4. PROTECTED 라우트 테스트 - 메인 앱 (11개)

### 4.1 메인 페이지 (/main)
**파일**: `src/pages/Main.jsx`

#### 기능 테스트
- [ ] 사용자 프로필 요약
- [ ] 예정된 세션 표시
- [ ] 추천 파트너 표시
- [ ] 최근 활동 표시
- [ ] 레벨 테스트 CTA

#### UI/UX 검증
- [ ] 헤더 표시 (MainHeader)
- [ ] 하단 네비게이션 (BottomNav)
- [ ] 카드 레이아웃
- [ ] 반응형 디자인

### 4.2 채팅 페이지 (/chat)
**파일**: `src/pages/Chat/ChatPage.jsx`

#### 기능 테스트
- [ ] 채팅방 목록 표시
- [ ] 최근 메시지 미리보기
- [ ] 읽지 않은 메시지 카운트
- [ ] 채팅방 클릭 시 상세 페이지
- [ ] WebSocket 실시간 업데이트

### 4.3 스케줄 페이지 (/schedule)
**파일**: `src/pages/Schedule/Schedule.jsx`

#### 기능 테스트
- [ ] 캘린더 뷰
- [ ] 예정된 세션 표시
- [ ] 날짜별 필터링
- [ ] 세션 상세 정보 표시

### 4.4 세션 목록 (/session, /sessions)
**파일**: `src/pages/Session/SessionList.jsx`

#### 기능 테스트
- [ ] 세션 목록 표시
- [ ] 상태별 필터 (예정/진행중/완료)
- [ ] 세션 상세 정보
- [ ] 세션 시작 버튼

### 4.5 세션 생성 (/sessions/create)
**파일**: `src/pages/Session/SessionCreate.jsx`

#### 기능 테스트
- [ ] 파트너 선택
- [ ] 세션 타입 선택 (음성/영상)
- [ ] 날짜/시간 선택
- [ ] 세션 생성 API 호출

### 4.6 세션 캘린더 (/sessions/calendar)
**파일**: `src/pages/Session/SessionCalendar.jsx`

#### 기능 테스트
- [ ] 월간 캘린더 뷰
- [ ] 세션 이벤트 표시
- [ ] 날짜 클릭 시 상세

### 4.7 프로필 페이지 (/profile)
**파일**: `src/pages/Profile/ProfilePage.jsx`

#### 기능 테스트
- [ ] 사용자 정보 표시
- [ ] 프로필 이미지
- [ ] 언어 정보
- [ ] 학습 통계
- [ ] 업적 요약
- [ ] 프로필 편집

### 4.8 분석 페이지 (/analytics)
**파일**: `src/pages/Analytics/AnalyticsPage.jsx`

#### 기능 테스트
- [ ] 학습 통계 그래프
- [ ] 세션 히스토리
- [ ] 레벨 진행 상황
- [ ] 기간별 필터

### 4.9 매칭 페이지 (/matching)
**파일**: `src/pages/Matching/MatchingMain.jsx`

#### 기능 테스트
- [ ] 추천 파트너 목록
- [ ] 필터 옵션
- [ ] 매칭 요청 보내기
- [ ] 받은/보낸 요청 탭

### 4.10 매칭 요청 관리 (/matching/requests/*)
- [ ] 받은 요청 목록
- [ ] 보낸 요청 목록
- [ ] 요청 수락/거절
- [ ] 요청 취소

### 4.11 매칭 프로필 (/matching/profile/:userId)
**파일**: `src/pages/Matching/MatchingProfile.jsx`

#### 기능 테스트
- [ ] 파트너 상세 정보
- [ ] 언어 및 레벨
- [ ] 관심사
- [ ] 가용 시간
- [ ] 매칭 요청 버튼

---

## 5. PROTECTED 라우트 테스트 - 설정 (9개)

### 5.1 설정 메인 (/settings)
**파일**: `src/pages/Settings/SettingsMain.jsx`

#### 기능 테스트
- [ ] 설정 카테고리 목록
- [ ] 각 항목 클릭 시 해당 페이지 이동

### 5.2 계정 설정 (/settings/account)
**파일**: `src/pages/Settings/AccountSettings.jsx`

#### 기능 테스트
- [ ] 이메일 변경
- [ ] 비밀번호 변경
- [ ] 연동된 소셜 계정

### 5.3 알림 설정 (/settings/notifications)
**파일**: `src/pages/Settings/NotificationSettings.jsx`

#### 기능 테스트
- [ ] 푸시 알림 토글
- [ ] 이메일 알림 토글
- [ ] 알림 종류별 설정

### 5.4 개인정보 설정 (/settings/privacy)
**파일**: `src/pages/Settings/PrivacySettings.jsx`

#### 기능 테스트
- [ ] 프로필 공개 범위
- [ ] 온라인 상태 표시
- [ ] 검색 허용 여부

### 5.5 보안 설정 (/settings/security)
**파일**: `src/pages/Settings/SecuritySettings.jsx`

#### 기능 테스트
- [ ] 2단계 인증
- [ ] 보안 로그
- [ ] 기기 관리

### 5.6 언어 설정 (/settings/language)
**파일**: `src/pages/Settings/LanguageSettings.jsx`

#### 기능 테스트
- [ ] 앱 언어 변경
- [ ] 학습 언어 수정

### 5.7 데이터 설정 (/settings/data)
**파일**: `src/pages/Settings/DataSettings.jsx`

#### 기능 테스트
- [ ] 데이터 다운로드
- [ ] 캐시 삭제
- [ ] 데이터 사용량

### 5.8 로그인 기록 (/settings/login-history)
**파일**: `src/pages/Settings/LoginHistory.jsx`

#### 기능 테스트
- [ ] 로그인 기록 목록
- [ ] 기기 정보
- [ ] 위치 정보
- [ ] 의심 활동 표시

### 5.9 계정 삭제 (/settings/delete-account)
**파일**: `src/pages/Settings/DeleteAccount.jsx`

#### 기능 테스트
- [ ] 경고 메시지
- [ ] 확인 단계
- [ ] 삭제 완료 처리

---

## 6. PROTECTED 라우트 테스트 - 레벨 테스트 (7개)

### 6.1 레벨 테스트 시작 (/level-test)
**파일**: `src/pages/LevelTest/LevelTestStart.jsx`

#### 기능 테스트
- [ ] 테스트 설명
- [ ] 시작 버튼
- [ ] 예상 소요 시간

### 6.2 연결 확인 (/level-test/check, /level-test/connection)
**파일**: `src/pages/LevelTest/LevelTestCheck.jsx`

#### 기능 테스트
- [ ] 마이크 권한 요청
- [ ] 오디오 테스트
- [ ] 연결 상태 확인

### 6.3 녹음 진행 (/level-test/recording, /level-test/question/:id)
**파일**: `src/pages/LevelTest/LevelTestRecording.jsx`

#### 기능 테스트
- [ ] 문제 표시
- [ ] 녹음 시작/중지
- [ ] 녹음 시간 표시
- [ ] 다음 문제로 이동

### 6.4 테스트 완료 (/level-test/complete)
**파일**: `src/pages/LevelTest/LevelTestComplete.jsx`

#### 기능 테스트
- [ ] 완료 메시지
- [ ] 결과 대기 안내

### 6.5 테스트 결과 (/level-test/result)
**파일**: `src/pages/LevelTest/LevelTestResult.jsx`

#### 기능 테스트
- [ ] 레벨 결과 표시
- [ ] 상세 점수
- [ ] 다음 단계 안내

---

## 7. PROTECTED 라우트 테스트 - 세션 (5개)

### 7.1 오디오 연결 확인 (/session/audio-check)
**파일**: `src/pages/Session/AudioConnectionCheck.jsx`

#### 기능 테스트
- [ ] 마이크 권한
- [ ] 스피커 테스트
- [ ] 연결 품질 표시

### 7.2 비디오 연결 확인 (/session/video-check)
**파일**: `src/pages/Session/VideoSessionCheck.jsx`

#### 기능 테스트
- [ ] 카메라 권한
- [ ] 비디오 미리보기
- [ ] 마이크 테스트
- [ ] 연결 품질

### 7.3 비디오 세션룸 (/session/video/:roomId)
**파일**: `src/pages/Session/VideoSessionRoom.jsx`

#### 기능 테스트
- [ ] 본인 비디오 표시
- [ ] 상대방 비디오 표시
- [ ] 마이크 온/오프
- [ ] 카메라 온/오프
- [ ] 화면 공유
- [ ] 채팅 기능
- [ ] 세션 종료

### 7.4 오디오 세션룸 (/session/audio/:roomId)
**파일**: `src/pages/Session/AudioSessionRoom.jsx`

#### 기능 테스트
- [ ] 오디오 연결
- [ ] 마이크 온/오프
- [ ] 볼륨 조절
- [ ] 채팅 기능
- [ ] 세션 종료

### 7.5 비디오 컨트롤 데모 (/session/video-controls-demo)
**파일**: `src/pages/Session/VideoControlsDemo.jsx`

#### 기능 테스트
- [ ] 컨트롤 UI 데모
- [ ] 버튼 동작 테스트

---

## 8. 기타 PROTECTED 라우트 (4개)

### 8.1 알림 목록 (/notifications)
**파일**: `src/pages/Notifications/NotificationList.jsx`

#### 기능 테스트
- [ ] 알림 목록 표시
- [ ] 읽음/안읽음 구분
- [ ] 알림 클릭 시 해당 페이지 이동
- [ ] 전체 읽음 처리

### 8.2 알림 센터 (/notifications/center)
**파일**: `src/pages/Notifications/NotificationCenter.jsx`

#### 기능 테스트
- [ ] 알림 설정
- [ ] 알림 필터

### 8.3 업적 페이지 (/achievements)
**파일**: `src/pages/Achievements/AchievementsPage.jsx`

#### 기능 테스트
- [ ] 업적 목록
- [ ] 완료/미완료 구분
- [ ] 업적 상세 정보
- [ ] 보상 수령

### 8.4 메이트 페이지 (/mates)
**파일**: `src/pages/Mates/MatesPage.jsx`

#### 기능 테스트
- [ ] 매칭된 파트너 목록
- [ ] 파트너 프로필 보기
- [ ] 세션 시작

---

## 9. UI/UX 일관성 검증

### 9.1 디자인 시스템 준수
- [ ] 브랜드 컬러 (#00C471) 일관 적용
- [ ] 텍스트 컬러 (#111111, #929292)
- [ ] 배경색 (#FAFAFA, #FFFFFF)
- [ ] 폰트 (Pretendard)
- [ ] Letter-spacing (-0.025em)

### 9.2 컴포넌트 스타일
- [ ] 버튼 높이 56px
- [ ] 입력 필드 높이 56px
- [ ] Border-radius 6px
- [ ] 페이지 여백 24px

### 9.3 반응형 디자인
- [ ] 모바일 (375px 이하)
- [ ] 태블릿 (768px)
- [ ] 데스크톱 (1024px 이상)

### 9.4 접근성
- [ ] 키보드 네비게이션
- [ ] 포커스 표시
- [ ] 색상 대비
- [ ] alt 텍스트

### 9.5 성능
- [ ] 페이지 로딩 시간 < 3초
- [ ] LCP < 2.5초
- [ ] FID < 100ms
- [ ] CLS < 0.1

---

## 10. 에러 처리 검증

### 10.1 네트워크 에러
- [ ] API 실패 시 사용자 안내
- [ ] 재시도 옵션
- [ ] 오프라인 상태 처리

### 10.2 인증 에러
- [ ] 토큰 만료 시 리프레시
- [ ] 리프레시 실패 시 로그아웃
- [ ] 권한 없음 처리

### 10.3 입력 유효성
- [ ] 필수 필드 검증
- [ ] 형식 검증
- [ ] 에러 메시지 표시

---

## 11. 테스트 결과 요약

### 11.1 전체 통계
| 카테고리 | 총 항목 | 통과 | 실패 | 미테스트 |
|----------|---------|------|------|----------|
| PUBLIC 라우트 | 5 | - | - | - |
| AUTH 라우트 | 5 | - | - | - |
| PROTECTED 라우트 | 39 | - | - | - |
| UI/UX | - | - | - | - |
| 에러 처리 | - | - | - | - |
| **총계** | **49+** | - | - | - |

### 11.2 발견된 이슈
| # | 심각도 | 카테고리 | 설명 | 상태 |
|---|--------|----------|------|------|
| 1 | - | - | - | - |

### 11.3 개선 권고사항
1. TBD

---

## 12. 테스트 환경

### 12.1 브라우저
- Chrome (최신)
- Safari (최신)
- Firefox (최신)

### 12.2 디바이스
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x812)

### 12.3 네트워크
- 고속 (4G/WiFi)
- 저속 (3G 시뮬레이션)

---

*이 문서는 QA 테스트 진행에 따라 업데이트됩니다.*
