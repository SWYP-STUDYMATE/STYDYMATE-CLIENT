# STUDYMATE Mock 시스템 완벽 가이드

## 📋 개요

STUDYMATE Mock 시스템은 **인증 토큰 없이도 모든 기능을 완벽하게 테스트할 수 있는** 하이퍼 기능적 시뮬레이션 환경입니다. 실제 API 서버 없이도 완전한 사용자 경험을 제공합니다.

### 🎯 주요 목적
- 개발자/테스터가 언제든지 인증 없이 앱 테스트
- 다중 사용자 시나리오 시뮬레이션
- 모든 UI/UX 플로우 검증
- API 서버 의존성 없는 독립적 테스트 환경

## 🚀 빠른 시작

### Live Demo 접속
```
https://languagemate.kr/main?mock=true
```

### 기본 사용법
1. **자동 Mock 모드**: URL에 `?mock=true` 파라미터 추가
2. **환경변수 설정**: `VITE_MOCK_MODE=true`로 설정
3. **Mock 배너 확인**: 상단에 주황색 Mock 모드 배너 표시

## 👥 다중 사용자 시뮬레이션

### 사용 가능한 테스트 사용자

#### 1. Alex Johnson (알렉스)
- **ID**: 1
- **나이**: 25세
- **레벨**: Advanced  
- **학습 시간**: 124시간 (월 32시간)
- **연속 학습**: 12일
- **고정 메이트**: 8명
- **가르치는 언어**: 영어 (Native), 스페인어 (Advanced)
- **학습 언어**: 한국어 (Intermediate), 일본어 (Beginner)
- **관심사**: 여행, 문화, 음악, 영화

#### 2. Sarah Kim (사라)  
- **ID**: 2
- **나이**: 23세
- **레벨**: Intermediate - H
- **학습 시간**: 87시간 (월 18시간)
- **연속 학습**: 6일
- **고정 메이트**: 5명
- **가르치는 언어**: 한국어 (Native), 영어 (Advanced)
- **학습 언어**: 프랑스어 (Intermediate), 중국어 (Beginner)
- **관심사**: 요리, 독서, 드라마, 비즈니스

#### 3. Mike Chen (마이크)
- **ID**: 3  
- **나이**: 28세
- **레벨**: Expert
- **학습 시간**: 203시간 (월 45시간)
- **연속 학습**: 25일
- **고정 메이트**: 12명
- **가르치는 언어**: 중국어 (Native), 영어 (Advanced)
- **학습 언어**: 한국어 (Advanced), 독일어 (Intermediate)
- **관심사**: 기술, 스포츠, 게임, 자기개발

### 사용자 전환 방법
1. **Mock 배너의 드롭다운**: 실시간 사용자 전환
2. **자동 새로고침**: 선택 시 페이지가 자동으로 새로고침되며 새 사용자 데이터 로드
3. **개인화된 데이터**: 각 사용자마다 다른 통계, 매칭 파트너, 채팅방, 세션

## 🧪 테스트 기능 메뉴

Mock 배너의 **"테스트 기능"** 버튼을 클릭하면 5가지 시뮬레이션 액션을 실행할 수 있습니다:

### 1. 🎯 매칭 요청 시뮬레이션
- 랜덤 파트너에게 매칭 요청 전송 시뮬레이션
- 콘솔에서 요청 로그 확인 가능
- 실제 매칭 플로우와 동일한 응답 구조

### 2. 💬 새 메시지 수신
- 새로운 채팅 메시지 수신 시뮬레이션  
- 채팅방 업데이트 및 알림 테스트
- 실시간 메시지 처리 플로우 검증

### 3. 🏆 성취 달성 알림
- 새로운 배지/성취 획득 시뮬레이션
- 포인트 시스템 및 레벨업 테스트
- 성취 시스템 전체 플로우 검증

### 4. 📅 세션 예약 완료
- 새 세션 스케줄링 시뮬레이션
- 캘린더 업데이트 및 알림 테스트  
- 세션 관리 시스템 검증

### 5. ⚡ 실시간 알림 테스트
- 브라우저 푸시 알림 테스트
- 알림 권한 및 표시 검증
- 실시간 통신 시뮬레이션

## 🔧 기술적 구현

### Mock API 시스템 구조

```javascript
// 기본 사용법
import { isMockMode, mockApiCalls } from './api/mockApi.js';

if (isMockMode()) {
  const userData = await mockApiCalls.getUserInfo();
  console.log('🎭 Mock 데이터:', userData);
}
```

### 지원되는 Mock API 함수들

#### 사용자 관리
- `getUserInfo()`: 현재 사용자 정보
- `switchUser(userIndex)`: 사용자 전환
- `updateUserProfile(data)`: 프로필 업데이트
- `uploadProfileImage(file)`: 이미지 업로드

#### 매칭 시스템  
- `getMatchingPartners(filters)`: 매칭 파트너 목록
- `requestMatch(partnerId)`: 매칭 요청
- `acceptMatch(matchId)`: 매칭 수락
- `rejectMatch(matchId)`: 매칭 거절

#### 채팅 시스템
- `getChatRooms()`: 채팅방 목록
- `getChatMessages(roomId)`: 메시지 로드
- `sendChatMessage(roomId, message)`: 메시지 전송
- `createChatRoom(partners, name)`: 새 채팅방 생성

#### 세션 관리
- `getSessions(filter)`: 세션 목록
- `joinSession(sessionId)`: 세션 참가  
- `cancelSession(sessionId)`: 세션 취소
- `scheduleSession(data)`: 세션 예약

#### 성취 시스템
- `getAchievements()`: 성취 목록
- `claimAchievement(id)`: 성취 보상 수령

#### 알림 시스템
- `getNotifications()`: 알림 목록
- `markNotificationAsRead(id)`: 읽음 표시
- `handleNotificationAction(id, action)`: 알림 액션

#### 분석 데이터
- `getAnalytics(period)`: 분석 데이터
- `getDetailedStats()`: 상세 통계

### 실제 API 연동 방법

```javascript
import { createMockableApi, mockApiCalls } from './mockApi.js';

// 실제 API와 Mock API를 자동으로 라우팅
export const getUserInfo = createMockableApi(
  async () => {
    const response = await api.get('/user/info');
    return response.data;
  },
  () => mockApiCalls.getUserInfo()
);
```

## 🎨 UI/UX 특징

### Mock 모드 배너
- **위치**: 페이지 상단 고정
- **색상**: 주황색 그라데이션 (`#ff6b35` → `#f7931e`)
- **구성 요소**:
  - Mock 모드 표시
  - 현재 사용자 드롭다운
  - 테스트 기능 버튼  
  - 실제 API 모드 전환 버튼

### 반응형 디자인
- **데스크톱**: 한 줄 레이아웃
- **모바일**: 플렉스 랩으로 다중 라인
- **Z-index**: 9999 (최상위 표시)

## 📊 데이터 구조

### 동적 데이터 생성
각 사용자마다 개인화된 데이터가 실시간으로 생성됩니다:

```javascript
// 사용자별 개인화된 데이터 예시
const userData = {
  // 기본 정보는 사용자마다 고정
  englishName: user.englishName,
  age: user.age,
  
  // 동적 생성 데이터  
  matchingPartners: partners.filter(p => p.name !== user.englishName),
  chatRooms: [
    { name: `${user.englishName} & Dana Lee`, ... },
    // 사용자 이름이 포함된 개인화된 채팅방
  ],
  achievements: achievements.map(a => ({
    ...a,
    earned: calculateEarnedStatus(user, a)
  })),
  analytics: {
    averageScore: 8.2 + (user.id * 0.3), // 사용자별 다른 점수
    languageProgress: {
      korean: 60 + (user.id * 10), // 개인화된 진도
    }
  }
}
```

## 🔄 Mock 모드 활성화/비활성화

### 자동 활성화 조건
1. `VITE_MOCK_MODE=true` (환경 변수)
2. URL에 `?mock=true` 파라미터 
3. `window.location.search.includes('mock=true')`

### 전환 방법
- **Mock → 실제**: Mock 배너의 "실제 API 모드" 버튼
- **실제 → Mock**: URL에 `?mock=true` 추가

### 데이터 저장
- **사용자 선택**: `localStorage.getItem('mockCurrentUser')`
- **토큰 시뮬레이션**: `localStorage` 에 Mock 토큰 저장
- **페이지 새로고침**: 사용자 상태 유지

## 🐛 문제 해결

### 일반적인 문제들

#### 1. Mock 모드가 활성화되지 않음
**증상**: Mock 배너가 표시되지 않음
**해결책**: 
- URL에 `?mock=true` 파라미터 확인
- 브라우저 캐시 삭제 후 재접속
- 콘솔에서 `localStorage.clear()` 실행

#### 2. 사용자 전환이 작동하지 않음  
**증상**: 드롭다운 선택 후 사용자가 바뀌지 않음
**해결책**:
- 페이지 새로고침 대기 (자동으로 새로고침됨)
- localStorage에서 `mockCurrentUser` 키 확인
- 콘솔에서 전환 로그 확인

#### 3. 테스트 기능 버튼이 작동하지 않음
**증상**: 테스트 기능 메뉴가 나타나지 않음  
**해결책**:
- 팝업 차단 해제
- JavaScript 콘솔에서 에러 확인
- 브라우저 호환성 확인 (Chrome/Firefox 권장)

### 콘솔 로그 확인법
Mock 모드에서는 모든 동작이 콘솔에 로깅됩니다:

```
🎭 [Mock Mode] Calling mock API instead of real API
🎭 [Mock] 사용자 정보 로드: Alex Johnson  
🎭 사용자 전환: Sarah Kim
🎯 [Mock Action] 매칭 요청 시뮬레이션
```

## 📈 성능 및 최적화

### 응답 시간 시뮬레이션
- **기본 지연**: 500ms ~ 1500ms (랜덤)
- **실제와 동일한 경험**: 실제 API처럼 로딩 상태 표시
- **메모리 효율**: 동적 데이터 생성으로 메모리 사용량 최적화

### 브라우저 지원
- **권장**: Chrome 90+, Firefox 90+, Safari 14+
- **필수 기능**: localStorage, ES6 Modules, async/await
- **선택 기능**: Notification API (알림 테스트용)

## 🔐 보안 고려사항

### Mock 모드 제한사항
- **프로덕션 환경**: Mock 모드는 개발/테스트 전용
- **데이터 보안**: 실제 사용자 데이터 없음 (모두 가상 데이터)
- **인증 우회**: Mock 토큰으로 인증 시뮬레이션만 수행

### 배포 환경별 설정
```bash
# 개발 환경
VITE_MOCK_MODE=true

# 프로덕션 환경  
VITE_MOCK_MODE=false
```

## 📞 지원 및 문의

### 개발팀 연락처
- **프로젝트**: STUDYMATE 언어 교환 플랫폼
- **도메인**: https://languagemate.kr
- **Mock 테스트**: https://languagemate.kr/main?mock=true

### 기술 스택
- **Frontend**: React 19.1.0 + Vite 7.0.4
- **배포**: Cloudflare Pages
- **Mock 시스템**: 완전한 API 시뮬레이션 (100+ 함수)
- **상태 관리**: Zustand + localStorage

---

## 📝 업데이트 로그

### v2.0 (2025-08-29) - 하이퍼 기능적 Mock 시스템
- ✅ 3명의 다중 사용자 시뮬레이션 구현
- ✅ 실시간 사용자 전환 기능  
- ✅ 5가지 테스트 액션 메뉴
- ✅ 100+ Mock API 함수 구현
- ✅ 동적 개인화 데이터 생성
- ✅ 완벽한 UI/UX 시뮬레이션
- ✅ "알 수 없는 오류" 문제 완전 해결
- ✅ languagemate.kr 도메인 연결

### v1.0 (2025-08-28) - 기본 Mock 시스템  
- ✅ 기본 Mock 모드 구현
- ✅ 단일 사용자 시뮬레이션
- ✅ Mock 배너 및 토글 기능

---

**🎭 STUDYMATE Mock 시스템으로 언제든지 완벽한 테스트 환경을 경험하세요!**