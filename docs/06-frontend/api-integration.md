# API 통합 가이드

## 개요
이 문서는 STUDYMATE-CLIENT에서 STUDYMATE-SERVER API와의 안전한 통합을 위한 가이드입니다.

## 타입 시스템

### API 응답 타입 구조
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

interface PageResponse<T> {
  content: T[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
    empty: boolean;
  };
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
    orders: Array<{
      property: string;
      direction: 'ASC' | 'DESC';
      ignoreCase: boolean;
      nullHandling: 'NATIVE' | 'NULLS_FIRST' | 'NULLS_LAST';
    }>;
  };
}
```

### 주요 응답 타입들
```typescript
// 사용자 관련
interface UserNameResponse {
  englishName: string;
  userName?: string;
}

interface UserProfileResponse {
  id: string;
  englishName: string;
  profileImageUrl?: string;
  selfBio?: string;
  // ... 기타 필드
}

// 온보딩 관련
interface LanguageResponse {
  id: number;
  name: string;
  code: string;
  flag?: string;
}

interface LangLevelTypeResponse {
  id: number;
  name: string;
  description?: string;
  level: number;
}
```

## API 사용 패턴

### 기본 사용법
```typescript
import { getUserName, saveEnglishName } from '../api/user';

// GET 요청
const userData = await getUserName();
console.log(userData.englishName);

// POST 요청
await saveEnglishName('John Doe');
```

### 에러 처리
```typescript
try {
  const result = await api.post('/user/english-name', { englishName });
  if (!result.success) {
    throw new Error(result.message || 'API 요청 실패');
  }
} catch (error) {
  console.error('API 에러:', error);
  // 사용자에게 친화적인 에러 메시지 표시
}
```

## 파일별 기능

### src/api/user.ts
- 사용자 기본 정보 조회/저장
- 프로필 이미지 업로드
- 온보딩 상태 관리
- 설정 정보 관리

### src/api/onboarding.ts  
- 온보딩 단계별 데이터 저장
- 언어/레벨 정보 처리
- 온보딩 진행 상태 관리

### src/types/api.d.ts
- 모든 API 관련 타입 정의
- 서버 응답 구조와 일치
- 요청/응답 타입 분리

## 모범 사례

### 1. 타입 안전성
```typescript
// ✅ 올바른 방법 - 명시적 타입
const response = await api.get<ApiResponse<UserProfileResponse>>('/user/profile');
const userProfile = response.data.data!;

// ❌ 피해야 할 방법 - any 타입
const response: any = await api.get('/user/profile');
```

### 2. 에러 처리
```typescript
// ✅ 구조화된 에러 처리
try {
  await saveUserData(userData);
} catch (error) {
  if (error.response?.status === 401) {
    // 인증 오류 처리
  } else if (error.response?.status === 400) {
    // 요청 오류 처리
  } else {
    // 기타 오류 처리
  }
}
```

### 3. 로딩 상태 관리
```typescript
const [loading, setLoading] = useState(false);

const handleSave = async () => {
  setLoading(true);
  try {
    await saveUserProfile(profileData);
    toast.success('저장 완료');
  } catch (error) {
    toast.error('저장 실패');
  } finally {
    setLoading(false);
  }
};
```

## 마이그레이션 가이드

### JavaScript에서 TypeScript로 전환
1. `.js` 파일을 `.ts`로 변경
2. 함수 시그니처에 타입 추가
3. API 호출에 제네릭 타입 적용
4. 에러 타입 명시

### 기존 코드 업데이트
```javascript
// Before (JavaScript)
const userData = await getUserName();
return userData.englishName;

// After (TypeScript)  
const userData: UserNameResponse = await getUserName();
return userData.englishName; // 타입 안전성 보장
```

## 주의사항

### Dynamic Import 경고
일부 파일에서 dynamic import 경고가 발생할 수 있습니다. 이는 기능적 문제가 아니며 점진적으로 해결 가능합니다.

### 백워드 호환성
기존 JavaScript API 파일들은 백업되어 있으며, 필요시 복구 가능합니다.

### 성능 고려사항
- TypeScript 컴파일은 빌드 시간에만 영향
- 런타임 성능에는 영향 없음
- 타입 체크로 런타임 에러 감소

## 문제 해결

### 타입 오류
```typescript
// Property 'data' does not exist on type 'AxiosResponse'
// 해결: 제네릭 타입 명시
const response = await api.get<ApiResponse<UserData>>('/api/user');
```

### Import 오류  
```typescript
// Cannot find module
// 해결: 상대 경로 확인 또는 타입 정의 추가
import type { ApiResponse } from '../types/api';
```

## 관련 문서
- [API 레퍼런스](/docs/04-api/)
- [컴포넌트 가이드](/docs/06-frontend/components/)
- [에러 처리](/docs/07-backend/error-handling.md)
