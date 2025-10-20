# Input Validation 가이드 (Zod)

## 개요

이 프로젝트는 **Zod**를 사용하여 타입 안전한 입력 검증을 제공합니다.

## 주요 기능

### 1. 타입 안전성
- TypeScript와 완벽한 통합
- 런타임 검증 + 컴파일 타임 타입 체크
- 자동 타입 추론

### 2. 선언적 스키마
- 명확하고 읽기 쉬운 검증 규칙
- 재사용 가능한 스키마 정의
- 복잡한 검증 로직 표현 가능

### 3. 상세한 에러 메시지
- 필드별 에러 메시지
- 사용자 친화적 에러 포맷
- 다국어 에러 메시지 지원

## 스키마 정의

### 기본 스키마

```typescript
// src/schemas/user.ts
import { z } from 'zod';

export const userProfileSchema = z.object({
  englishName: z.string().min(1, 'Name is required').max(50),
  email: z.string().email('Invalid email format'),
  age: z.number().int().min(13, 'Must be at least 13 years old'),
  residence: z.string().optional(),
});

// 타입 추출
export type UserProfile = z.infer<typeof userProfileSchema>;
```

### 중첩 객체

```typescript
export const updateProfileSchema = z.object({
  profile: z.object({
    name: z.string().min(1),
    bio: z.string().max(500),
  }),
  preferences: z.object({
    language: z.enum(['ko', 'en', 'ja']),
    theme: z.enum(['light', 'dark']).optional(),
  }),
});
```

### 배열 검증

```typescript
export const interestsSchema = z.object({
  interests: z
    .array(z.string())
    .min(1, 'Select at least one interest')
    .max(10, 'Maximum 10 interests allowed'),
});
```

### 조건부 검증 (refine)

```typescript
export const ageRangeSchema = z
  .object({
    minAge: z.number().int().min(13),
    maxAge: z.number().int().max(100),
  })
  .refine((data) => data.minAge <= data.maxAge, {
    message: 'Min age must be less than or equal to max age',
    path: ['minAge'], // 에러를 표시할 필드
  });
```

## 미들웨어 사용

### Body 검증

```typescript
import { Hono } from 'hono';
import { validateBody, getValidatedBody } from '../middleware/validate';
import { updateProfileSchema, type UpdateProfileInput } from '../schemas/user';

const app = new Hono();

app.post('/profile', validateBody(updateProfileSchema), async (c) => {
  // 타입 안전하게 검증된 데이터 가져오기
  const data = getValidatedBody<UpdateProfileInput>(c);

  // data는 UpdateProfileInput 타입으로 추론됨
  console.log(data.englishName); // ✅ Type-safe

  return c.json({ success: true });
});
```

### Query Parameters 검증

```typescript
import { validateQuery, getValidatedQuery } from '../middleware/validate';
import { z } from 'zod';

const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)),
  search: z.string().optional(),
});

app.get('/users', validateQuery(querySchema), async (c) => {
  const query = getValidatedQuery<z.infer<typeof querySchema>>(c);

  console.log(query.page); // number 타입
  console.log(query.limit); // number 타입

  return c.json({ success: true });
});
```

### Path Parameters 검증

```typescript
import { validateParams, getValidatedParams } from '../middleware/validate';
import { z } from 'zod';

const paramsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  postId: z.string().uuid('Invalid post ID'),
});

app.get('/users/:userId/posts/:postId', validateParams(paramsSchema), async (c) => {
  const params = getValidatedParams<z.infer<typeof paramsSchema>>(c);

  console.log(params.userId); // UUID 형식 보장됨

  return c.json({ success: true });
});
```

### Headers 검증

```typescript
import { validateHeaders, getValidatedHeaders } from '../middleware/validate';
import { z } from 'zod';

const headersSchema = z.object({
  'content-type': z.literal('application/json'),
  authorization: z.string().startsWith('Bearer '),
});

app.post('/secure', validateHeaders(headersSchema), async (c) => {
  const headers = getValidatedHeaders<z.infer<typeof headersSchema>>(c);

  return c.json({ success: true });
});
```

### 복합 검증

```typescript
import { validateAll } from '../middleware/validate';
import { z } from 'zod';

const bodySchema = z.object({ name: z.string() });
const querySchema = z.object({ page: z.string() });
const paramsSchema = z.object({ id: z.string().uuid() });

app.post(
  '/users/:id',
  validateAll({
    body: bodySchema,
    query: querySchema,
    params: paramsSchema,
  }),
  async (c) => {
    const body = getValidatedBody(c);
    const query = getValidatedQuery(c);
    const params = getValidatedParams(c);

    return c.json({ success: true });
  }
);
```

## 스키마 예시

### Auth 스키마

```typescript
// src/schemas/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

### Chat 스키마

```typescript
// src/schemas/chat.ts
import { z } from 'zod';

export const sendMessageSchema = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  messageType: z.enum(['text', 'image', 'audio', 'file']).default('text'),
  fileUrl: z.string().url().optional(),
});

export const createRoomSchema = z.object({
  roomType: z.enum(['direct', 'group']),
  roomName: z.string().min(1).max(100).optional(),
  participantIds: z
    .array(z.string().uuid())
    .min(1)
    .max(50),
});
```

### Matching 스키마

```typescript
// src/schemas/matching.ts
import { z } from 'zod';

export const matchFilterSchema = z.object({
  gender: z.enum(['any', 'male', 'female']).optional(),
  ageMin: z.number().int().min(13).optional(),
  ageMax: z.number().int().max(100).optional(),
  languages: z.array(z.string()).optional(),
  online: z.boolean().optional(),
});

export const createMatchRequestSchema = z.object({
  targetUserId: z.string().uuid(),
  message: z.string().max(200).optional(),
});
```

## 에러 처리

### 에러 응답 형식

검증 실패 시 다음과 같은 형식으로 응답됩니다:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "email": ["Invalid email format"],
      "password": [
        "Password must be at least 8 characters",
        "Password must contain uppercase, lowercase, and number"
      ]
    }
  }
}
```

### 커스텀 에러 메시지

```typescript
const schema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  age: z.number().min(18, '만 18세 이상만 가입 가능합니다'),
});
```

### 에러 핸들러

```typescript
import { AppError } from '../utils/errors';

try {
  const data = schema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    const formattedErrors = formatZodErrors(error);
    throw new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    );
  }
}
```

## 고급 기능

### Transform

데이터 변환:

```typescript
const schema = z.object({
  age: z.string().transform((val) => parseInt(val, 10)),
  email: z.string().toLowerCase().email(),
  createdAt: z.string().transform((val) => new Date(val)),
});
```

### Preprocess

입력 전처리:

```typescript
const schema = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.string().optional()
);
```

### Union Types

여러 타입 허용:

```typescript
const idSchema = z.union([
  z.string().uuid(),
  z.number().int().positive(),
]);
```

### Discriminated Union

타입별 다른 스키마:

```typescript
const messageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    content: z.string(),
  }),
  z.object({
    type: z.literal('image'),
    imageUrl: z.string().url(),
  }),
]);
```

### Partial & Pick

일부 필드만 선택:

```typescript
// 모든 필드 optional
const partialSchema = userSchema.partial();

// 특정 필드만 선택
const pickSchema = userSchema.pick({ name: true, email: true });

// 특정 필드 제외
const omitSchema = userSchema.omit({ password: true });
```

## Best Practices

### 1. 스키마 재사용

```typescript
// ✅ 좋은 예: 기본 스키마 정의 후 확장
const baseUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8),
});

const updateUserSchema = baseUserSchema.partial();
```

### 2. 명확한 에러 메시지

```typescript
// ✅ 좋은 예: 사용자 친화적 메시지
z.string().min(1, '이름을 입력해주세요');

// ❌ 나쁜 예: 기술적 메시지
z.string().min(1);
```

### 3. 타입 추출

```typescript
// ✅ 좋은 예: 타입 재사용
const userSchema = z.object({ name: z.string() });
type User = z.infer<typeof userSchema>;

function saveUser(user: User) {
  // ...
}
```

### 4. 검증 로직 분리

```typescript
// ✅ 좋은 예: 스키마를 별도 파일로 관리
// src/schemas/user.ts
export const userSchema = z.object({ ... });

// src/routes/user.ts
import { userSchema } from '../schemas/user';
```

## 테스트

### 스키마 테스트

```typescript
import { describe, it, expect } from 'vitest';
import { userProfileSchema } from './user';

describe('userProfileSchema', () => {
  it('should validate correct data', () => {
    const result = userProfileSchema.safeParse({
      englishName: 'John Doe',
      email: 'john@example.com',
    });

    expect(result.success).toBe(true);
  });

  it('should fail for invalid email', () => {
    const result = userProfileSchema.safeParse({
      englishName: 'John Doe',
      email: 'invalid-email',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('email');
    }
  });
});
```

## 성능 최적화

### 1. 스키마 캐싱

```typescript
// ✅ 좋은 예: 스키마를 모듈 레벨에서 정의
const userSchema = z.object({ ... });

// ❌ 나쁜 예: 매번 새로 생성
function validate(data: unknown) {
  const schema = z.object({ ... }); // 비효율적
  return schema.parse(data);
}
```

### 2. safeParse 사용

```typescript
// 예외 발생 방지
const result = schema.safeParse(data);

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## 주의사항

1. **성능**: 복잡한 스키마는 검증 시간이 오래 걸릴 수 있음
2. **타입 추론**: 너무 복잡한 스키마는 타입 추론이 느려질 수 있음
3. **에러 메시지**: 다국어 지원 시 메시지 관리 필요
4. **버전 관리**: Zod 버전 업그레이드 시 Breaking Changes 확인

## 추가 리소스

- [Zod 공식 문서](https://zod.dev/)
- [TypeScript와 Zod](https://zod.dev/?id=typescript)
- [Zod Best Practices](https://github.com/colinhacks/zod#best-practices)
