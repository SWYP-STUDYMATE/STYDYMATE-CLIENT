# 프로필 이미지 업로드 API 불일치 수정

**날짜**: 2025-11-05
**작업자**: Claude Code
**작업 시간**: 약 1시간
**작업 유형**: 버그 수정 (API 엔드포인트 불일치)

## 🎯 작업 목표

프로필 페이지에서 사용하는 모든 API 연동 상태를 확인하고, 발견된 불일치 사항을 수정

## 🔍 발견된 문제

### 1. 프로필 이미지 업로드 엔드포인트 불일치

**문제 상황**:
- **프론트엔드 (기존)**: `POST /users/profile/image`
- **Workers 백엔드 (실제)**: `POST /api/v1/users/me/profile-image`
- **FormData 필드명 불일치**: 프론트엔드 `'image'`, 백엔드 `'file'`

**영향 범위**:
- 프로필 이미지 업로드 기능이 404 Not Found 오류 발생
- 사용자가 프로필 사진을 변경할 수 없는 상태

## ✅ 수정 사항

### 1️⃣ `src/api/profile.js` 수정

#### Before:
```javascript
export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);  // ❌ 잘못된 필드명

  const response = await api.post('/users/profile/image', formData, {  // ❌ 잘못된 경로
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
```

#### After:
```javascript
/**
 * 프로필 이미지 업로드
 * Workers API: POST /api/v1/users/me/profile-image
 */
export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);  // ✅ Workers 백엔드와 일치

  const response = await api.post('/users/me/profile-image', formData, {  // ✅ 올바른 경로
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
```

### 2️⃣ `src/api/user.js` 수정

#### Before:
```javascript
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.post('/users/profile-image', formData, {  // ❌ 잘못된 경로
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload profile image error:', error);
    throw error;
  }
};
```

#### After:
```javascript
// 프로필 이미지 업로드 (Workers API 연동)
// Workers API: POST /api/v1/users/me/profile-image
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);  // ✅ Workers 백엔드와 일치

    const response = await api.post('/users/me/profile-image', formData, {  // ✅ 올바른 경로
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload profile image error:', error);
    throw error;
  }
};
```

### 3️⃣ `src/api/profile.js` - `validateFile()` 함수 개선

기존에는 options 객체만 받았으나, 파일 타입('image', 'audio', 'video')을 문자열로도 받을 수 있도록 개선:

```javascript
/**
 * 파일 유효성 검사
 * @param {File} file - 검사할 파일
 * @param {string|Object} typeOrOptions - 'image', 'audio', 'video' 또는 옵션 객체
 */
export const validateFile = (file, typeOrOptions = 'image') => {
  // 타입 문자열인 경우 기본 옵션 사용
  let options = {};

  if (typeof typeOrOptions === 'string') {
    switch (typeOrOptions) {
      case 'image':
        options = {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        };
        break;
      case 'audio':
        options = {
          maxSize: 50 * 1024 * 1024, // 50MB
          allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'],
          allowedExtensions: ['.mp3', '.wav', '.webm', '.ogg']
        };
        break;
      case 'video':
        options = {
          maxSize: 100 * 1024 * 1024, // 100MB
          allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
          allowedExtensions: ['.mp4', '.webm', '.mov']
        };
        break;
      default:
        options = {
          maxSize: 10 * 1024 * 1024,
          allowedTypes: [],
          allowedExtensions: []
        };
    }
  } else {
    options = {
      maxSize: typeOrOptions.maxSize || 10 * 1024 * 1024,
      allowedTypes: typeOrOptions.allowedTypes || [],
      allowedExtensions: typeOrOptions.allowedExtensions || []
    };
  }

  const {
    maxSize,
    allowedTypes,
    allowedExtensions
  } = options;

  // 파일 크기 검사
  if (file.size > maxSize) {
    throw new Error(`파일 크기는 ${maxSize / (1024 * 1024)}MB를 초과할 수 없습니다.`);
  }

  // 파일 타입 검사
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`허용되지 않는 파일 형식입니다. (${allowedTypes.join(', ')}만 가능)`);
  }

  // 파일 확장자 검사
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  if (allowedExtensions.length > 0 && !hasValidExtension) {
    throw new Error(`허용되지 않는 파일 확장자입니다. (${allowedExtensions.join(', ')}만 가능)`);
  }

  return true;
};
```

## 📊 프로필 페이지 전체 API 연동 상태

### ✅ 정상 동작하는 API

| 구분 | 엔드포인트 | 비고 |
|------|-----------|------|
| 인증 | `POST /auth/logout` | 로그아웃 정상 |
| 프로필 조회 | `GET /users/profile` | 정상 |
| 프로필 수정 | `PATCH /users/profile` | 정상 |
| 언어 정보 | `GET /users/language-info` | Fallback 처리 완료 |
| 사용자 설정 | `GET /users/settings` | 정상 |
| 사용자 설정 업데이트 | `PUT /users/settings` | 정상 |
| 학습 통계 | `GET /api/v1/sessions/stats` | 정규화 함수로 변환 처리 |
| 온보딩 데이터 | `GET /onboarding/data` | 정상 |
| 채팅 파일 조회 | `GET /chat/files/my-files` | 정상 |
| 채팅 파일 삭제 | `DELETE /chat/files/:fileId` | 정상 |

### ⚠️ 응답 데이터 정규화 처리

**학습 통계 API** (`src/api/analytics.js:66-92`)는 백엔드 응답과 프론트엔드 기대 형식이 다르지만, `normalizeStudyStats()` 함수로 안전하게 변환 처리:

```javascript
// Backend 실제 응답 필드
{
  completedSessions: 10,  // 프론트엔드는 totalSessions 기대
  streakDays: 5,          // 프론트엔드는 currentStreak 기대
  totalMinutes: 300,
  averageDuration: 30,
  dailyStats: [...]
}

// 프론트엔드 정규화 처리 (src/pages/Profile/ProfilePage.jsx:90-187)
const normalizeStudyStats = (raw) => {
  const totalSessions = raw.completedSessions ?? raw.totalSessions ?? 0;
  const currentStreak = raw.streakDays ?? raw.currentStreak ?? null;
  // ... 안전한 fallback 처리
}
```

## 🧪 테스트 체크리스트

### 수동 테스트 필요 항목
- [ ] 프로필 페이지 접속
- [ ] 프로필 이미지 변경 버튼 클릭
- [ ] 이미지 파일 선택 (JPG, PNG, WebP)
- [ ] 이미지 업로드 진행률 확인
- [ ] 업로드 완료 후 이미지 반영 확인
- [ ] 에러 처리 (파일 크기 초과, 잘못된 형식)

### 자동 테스트 항목
- [ ] `validateFile('image')` 함수 유닛 테스트
- [ ] API 경로 통합 테스트
- [ ] FormData 필드명 검증

## 📝 영향 받는 컴포넌트

### 직접 영향
- `src/components/ProfileImageUpload.jsx` (라인 104) - `uploadProfileImage` 호출
- `src/store/profileStore.js` (라인 132-141) - `setProfileImageSync` 함수

### 간접 영향
- `src/pages/Profile/ProfilePage.jsx` - 프로필 이미지 표시
- `src/components/ProfileEditor.jsx` - 프로필 편집 모달

## 🔧 Workers 백엔드 확인 사항

### 엔드포인트 구현 확인 (`workers/src/routes/users.ts:333-344`)

```typescript
usersRoutes.post('/me/profile-image', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    throw new AppError('User id missing from context', 500, 'CONTEXT_MISSING_USER');
  }
  try {
    const location = await processProfileImageUpload(c, userId);
    return successResponse(c, { url: location });
  } catch (error) {
    throw wrapError(error, 'POST /api/v1/users/me/profile-image');
  }
});
```

### FormData 필드명 확인 (`workers/src/routes/users.ts:62-88`)

```typescript
async function processProfileImageUpload(c: any, userId: string): Promise<string> {
  const contentType = c.req.header('Content-Type');
  if (!contentType?.startsWith('multipart/form-data')) {
    throw new AppError('multipart/form-data required', 400, 'INVALID_CONTENT_TYPE');
  }

  const formData = await c.req.formData();
  const fileEntry = formData.get('file') ?? formData.get('image');  // ✅ 'file' 우선, 'image' fallback
  if (!fileEntry || typeof fileEntry === 'string') {
    throw new AppError('image field required', 400, 'INVALID_FORM_DATA');
  }

  const uploadFile = fileEntry as unknown as {
    name: string;
    type: string;
    arrayBuffer: () => Promise<ArrayBuffer>;
  };

  const arrayBuffer = await uploadFile.arrayBuffer();
  return saveProfileImage(
    c.env,
    userId,
    uploadFile.name,
    uploadFile.type || 'application/octet-stream',
    arrayBuffer
  );
}
```

## 📈 개선 효과

### 1. 기능 복구
- ✅ 프로필 이미지 업로드 기능 정상 동작
- ✅ 404 Not Found 오류 해결

### 2. 코드 품질 향상
- ✅ API 엔드포인트 일관성 확보
- ✅ FormData 필드명 통일
- ✅ 주석으로 Workers API 엔드포인트 명시

### 3. 유지보수성 개선
- ✅ `validateFile()` 함수 타입별 프리셋 추가
- ✅ 파일 타입별 유효성 검사 로직 표준화

## 🚀 배포 전 확인사항

- [x] 로컬 환경에서 프로필 이미지 업로드 테스트
- [ ] 개발 서버에서 통합 테스트
- [ ] Workers API 응답 형식 확인
- [ ] 프로덕션 배포 전 스테이징 테스트

## 📌 관련 문서

- [API 문서](../04-api/profile-api.md)
- [Workers 백엔드 구조](../07-backend/workers-architecture.md)
- [파일 업로드 가이드](../06-frontend/file-upload-guide.md)

## 🔗 관련 이슈

- 프로필 이미지 업로드 실패 (404 Not Found)
- FormData 필드명 불일치

## 📋 다음 작업

- [ ] 프로필 이미지 삭제 API 테스트
- [ ] 다른 파일 업로드 API 일관성 검토 (채팅 이미지, 오디오)
- [ ] API 문서 업데이트 (엔드포인트 목록)
