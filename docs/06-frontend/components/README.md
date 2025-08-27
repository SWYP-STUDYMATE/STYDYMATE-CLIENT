# 컴포넌트 라이브러리

## 📋 개요

STUDYMATE-CLIENT의 재사용 가능한 컴포넌트 라이브러리 문서입니다. 모든 컴포넌트는 일관된 디자인 시스템을 따르며, TypeScript로 작성되었습니다.

## 📁 컴포넌트 구조

```
src/components/
├── common/              # 공통 기본 컴포넌트
│   ├── CommonButton.tsx
│   ├── CommonInput.tsx
│   ├── CommonSelect.tsx
│   ├── CommonCheckbox.tsx
│   ├── CommonModal.tsx
│   └── CommonSpinner.tsx
├── forms/               # 폼 관련 컴포넌트
│   ├── LoginForm.tsx
│   ├── ProfileForm.tsx
│   └── OnboardingForm.tsx
├── layout/              # 레이아웃 컴포넌트
│   ├── Header.tsx
│   ├── Navigation.tsx
│   ├── Container.tsx
│   └── PageLayout.tsx
├── ui/                  # UI 전용 컴포넌트
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── ProgressBar.tsx
│   └── Tooltip.tsx
└── feature/             # 기능별 컴포넌트
    ├── chat/
    ├── matching/
    ├── onboarding/
    └── profile/
```

## 🔘 공통 컴포넌트 (Common Components)

### CommonButton

**용도**: 모든 버튼 스타일을 통합한 기본 버튼 컴포넌트

```tsx
interface CommonButtonProps {
  variant: 'primary' | 'success' | 'complete' | 'secondary' | 'disabled';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}
```

**사용 예시**:
```tsx
// 기본 사용법
<CommonButton variant="primary" onClick={handleClick}>
  로그인
</CommonButton>

// 로딩 상태
<CommonButton variant="complete" loading={isLoading}>
  저장 중...
</CommonButton>

// 아이콘 포함
<CommonButton variant="success" icon={<CheckIcon />}>
  완료
</CommonButton>

// 전체 너비
<CommonButton variant="primary" fullWidth>
  다음 단계
</CommonButton>
```

**스타일 variants**:
- `primary`: 검은색 배경, 흰색 텍스트 (주요 액션)
- `success`: 연한 초록 배경, 검은색 텍스트 (긍정적 액션)
- `complete`: 초록색 배경, 흰색 텍스트 (완료 액션)
- `secondary`: 회색 배경, 검은색 텍스트 (보조 액션)
- `disabled`: 비활성 상태

### CommonInput

**용도**: 텍스트 입력 필드의 표준 컴포넌트

```tsx
interface CommonInputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  label?: string;
  required?: boolean;
  maxLength?: number;
}
```

**사용 예시**:
```tsx
// 기본 입력 필드
<CommonInput 
  placeholder="영어 이름을 입력해주세요"
  value={englishName}
  onChange={setEnglishName}
/>

// 라벨 포함
<CommonInput 
  label="이메일 주소"
  type="email"
  value={email}
  onChange={setEmail}
  required
/>

// 에러 상태
<CommonInput 
  placeholder="비밀번호"
  type="password"
  value={password}
  onChange={setPassword}
  error="비밀번호는 8자 이상이어야 합니다"
/>
```

### CommonSelect

**용도**: 드롭다운 선택 컴포넌트

```tsx
interface CommonSelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  multiple?: boolean;
}

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
```

**사용 예시**:
```tsx
// 기본 선택 필드
<CommonSelect
  placeholder="거주지를 선택해주세요"
  options={locationOptions}
  value={selectedLocation}
  onChange={setSelectedLocation}
/>

// 다중 선택
<CommonSelect
  label="관심사"
  options={interestOptions}
  value={selectedInterests}
  onChange={setSelectedInterests}
  multiple
/>
```

### CommonCheckbox

**용도**: 체크박스 입력 컴포넌트

```tsx
interface CommonCheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'square' | 'round';
}
```

**사용 예시**:
```tsx
// 기본 체크박스
<CommonCheckbox
  label="이용약관에 동의합니다"
  checked={agreedToTerms}
  onChange={setAgreedToTerms}
/>

// 원형 체크박스 (라디오 버튼 스타일)
<CommonCheckbox
  variant="round"
  label="남성"
  checked={gender === 'male'}
  onChange={() => setGender('male')}
/>
```

### CommonModal

**용도**: 모달 다이얼로그 컴포넌트

```tsx
interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
}
```

**사용 예시**:
```tsx
<CommonModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="프로필 이미지 업로드"
  size="medium"
  footer={
    <>
      <CommonButton variant="secondary" onClick={handleCancel}>
        취소
      </CommonButton>
      <CommonButton variant="primary" onClick={handleSave}>
        저장
      </CommonButton>
    </>
  }
>
  <ImageUploadForm />
</CommonModal>
```

## 📱 레이아웃 컴포넌트 (Layout Components)

### PageLayout

**용도**: 페이지의 기본 레이아웃 구조

```tsx
interface PageLayoutProps {
  title?: string;
  showHeader?: boolean;
  showNavigation?: boolean;
  backgroundColor?: 'white' | 'gray';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  children: React.ReactNode;
}
```

**사용 예시**:
```tsx
<PageLayout 
  title="프로필 설정"
  showHeader
  showNavigation
  maxWidth="md"
>
  <ProfileForm />
</PageLayout>
```

### Container

**용도**: 컨텐츠 컨테이너 (반응형 최대 너비 제한)

```tsx
interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  centerContent?: boolean;
  children: React.ReactNode;
}
```

**사용 예시**:
```tsx
<Container size="md" padding centerContent>
  <OnboardingSteps />
</Container>
```

## 🎨 UI 컴포넌트 (UI Components)

### Card

**용도**: 컨텐츠 카드 컴포넌트

```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'small' | 'medium' | 'large';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**사용 예시**:
```tsx
<Card variant="elevated" hoverable onClick={handleCardClick}>
  <h3>Sarah Kim</h3>
  <p>English ↔ Korean exchange</p>
</Card>
```

### Badge

**용도**: 상태 표시 뱃지

```tsx
interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}
```

**사용 예시**:
```tsx
<Badge variant="success">온라인</Badge>
<Badge variant="primary">신규</Badge>
<Badge variant="warning">매칭 대기중</Badge>
```

### Avatar

**용도**: 사용자 프로필 아바타

```tsx
interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
  fallbackColor?: string;
}
```

**사용 예시**:
```tsx
<Avatar 
  src="/profiles/user1.jpg"
  name="홍길동"
  size="lg"
  showStatus
  status="online"
/>
```

### ProgressBar

**용도**: 진행률 표시 바

```tsx
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'primary' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
}
```

**사용 예시**:
```tsx
<ProgressBar 
  value={75}
  showLabel
  label="온보딩 진행률"
  variant="primary"
/>
```

## 📝 폼 컴포넌트 (Form Components)

### LoginForm

**용도**: 로그인 폼 (Naver OAuth 버튼 포함)

```tsx
interface LoginFormProps {
  onLoginSuccess?: (user: User) => void;
  onLoginError?: (error: string) => void;
}
```

### ProfileForm

**용도**: 프로필 정보 수정 폼

```tsx
interface ProfileFormProps {
  initialData?: Partial<UserProfile>;
  onSave?: (data: UserProfile) => void;
  onCancel?: () => void;
}
```

### OnboardingForm

**용도**: 온보딩 단계별 폼 컴포넌트

```tsx
interface OnboardingFormProps {
  step: number;
  data?: any;
  onNext?: (data: any) => void;
  onPrevious?: () => void;
  onComplete?: (allData: any) => void;
}
```

## 🚀 기능별 컴포넌트 (Feature Components)

### Chat Components

```
src/components/feature/chat/
├── ChatRoom.tsx          # 채팅방 컨테이너
├── MessageList.tsx       # 메시지 목록
├── MessageItem.tsx       # 개별 메시지
├── MessageInput.tsx      # 메시지 입력
├── ChatRoomList.tsx      # 채팅방 목록
├── TypingIndicator.tsx   # 타이핑 표시
└── ImagePreview.tsx      # 이미지 미리보기
```

### Matching Components

```
src/components/feature/matching/
├── PartnerCard.tsx       # 파트너 카드
├── PartnerList.tsx       # 파트너 목록
├── MatchingFilter.tsx    # 필터링 옵션
├── MatchRequest.tsx      # 매칭 요청
└── MatchStatus.tsx       # 매칭 상태
```

### Onboarding Components

```
src/components/feature/onboarding/
├── StepProgress.tsx      # 단계 진행률
├── LanguageSelect.tsx    # 언어 선택
├── InterestSelect.tsx    # 관심사 선택
├── PartnerPreference.tsx # 파트너 선호도
├── ScheduleSelect.tsx    # 스케줄 설정
└── CompletionSummary.tsx # 완료 요약
```

## 📋 컴포넌트 개발 가이드라인

### 1. 컴포넌트 작성 규칙

```tsx
// 좋은 예시
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant, 
  children, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button
      className={`btn-base btn-${variant} ${disabled ? 'btn-disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
```

### 2. Props 인터페이스 정의
- 모든 props는 TypeScript 인터페이스로 정의
- optional props는 기본값 제공
- children prop은 React.ReactNode 타입 사용
- 이벤트 핸들러는 선택적으로 정의

### 3. 스타일링 규칙
- Tailwind CSS 클래스 우선 사용
- 커스텀 CSS는 CSS Variables 활용
- 상태별 스타일 (hover, focus, disabled) 포함
- 반응형 디자인 고려

### 4. 접근성 고려사항
- 적절한 ARIA 속성 추가
- 키보드 네비게이션 지원
- 색상 대비비 준수
- 스크린 리더 호환성

### 5. 성능 최적화
- React.memo로 불필요한 리렌더링 방지
- useCallback, useMemo 적절히 활용
- 이미지 최적화 (lazy loading)
- 컴포넌트 분할 (code splitting)

## 🧪 컴포넌트 테스트

### 테스트 작성 예시

```tsx
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button variant="primary" onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button variant="primary" disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## 📚 Storybook 문서

각 컴포넌트는 Storybook으로 문서화되어 있습니다.

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled Button',
    disabled: true,
  },
};
```

## 🔄 컴포넌트 업데이트 가이드

### 1. 기존 컴포넌트 수정
- Breaking changes 최소화
- 버전별 마이그레이션 가이드 제공
- deprecation 경고 추가

### 2. 새 컴포넌트 추가
- 디자인 시스템 일관성 유지
- 기존 컴포넌트와의 호환성 확인
- 문서화 및 테스트 코드 작성

### 3. 컴포넌트 삭제
- deprecation 기간 설정
- 대체 컴포넌트 안내
- 마이그레이션 스크립트 제공

## 📝 변경 이력

| 버전 | 날짜 | 변경사항 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2024-01-XX | 초기 컴포넌트 라이브러리 작성 | Frontend Team |

## 🔗 관련 문서

- [스타일 가이드](../style-guide.md)
- [테스트 가이드](../testing-guide.md)
- [Storybook 문서](https://storybook.studymate.com)
- [디자인 시스템](https://figma.com/studymate-design-system)