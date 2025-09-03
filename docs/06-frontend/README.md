# 프론트엔드 가이드

## 📁 디렉토리 구조

```
src/
├── api/                 # API 통신 레이어
│   ├── index.js        # Axios 인스턴스 및 인터셉터
│   ├── config.js       # API 설정 (URLs)
│   ├── auth.js         # 인증 관련 API
│   ├── user.js         # 사용자 관련 API
│   ├── onboarding.js   # 온보딩 관련 API
│   ├── levelTest.js    # 레벨 테스트 API
│   ├── matching.js     # 매칭 관련 API
│   ├── chat.js         # 채팅 관련 API
│   └── webrtc.js       # WebRTC 관련 API
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   ├── ui/             # UI 컴포넌트
│   └── modals/         # 모달 컴포넌트
├── hooks/              # 커스텀 훅
│   ├── useAuth.js      # 인증 관련 훅
│   ├── useWebSocket.js # WebSocket 훅
│   ├── useAlert.jsx    # 알림 모달 훅
│   └── useWebRTC.js    # WebRTC 훅
├── pages/              # 페이지 컴포넌트
│   ├── auth/           # 인증 페이지
│   ├── ObInfo/         # 온보딩 페이지
│   ├── main/           # 메인 페이지
│   ├── chat/           # 채팅 페이지
│   ├── matching/       # 매칭 페이지
│   └── profile/        # 프로필 페이지
├── services/           # 비즈니스 로직 서비스
│   ├── websocket.js    # WebSocket 서비스
│   ├── webrtc.js       # WebRTC 서비스
│   └── levelTest.js    # 레벨 테스트 서비스
├── store/              # 상태 관리 (Zustand)
│   ├── authStore.js    # 인증 상태
│   ├── profileStore.js # 프로필 상태
│   ├── chatStore.js    # 채팅 상태
│   └── modalStore.js   # 모달 상태
├── styles/             # 스타일 파일
│   ├── globals.css     # 전역 스타일
│   └── tailwind.css    # Tailwind 설정
├── utils/              # 유틸리티 함수
│   ├── constants.js    # 상수 정의
│   ├── validators.js   # 유효성 검사
│   └── formatters.js   # 포맷터 함수
└── assets/             # 정적 자산
    ├── images/         # 이미지 파일
    ├── icons/          # 아이콘 파일
    └── fonts/          # 폰트 파일
```

## 🎨 디자인 시스템

### 색상 팔레트
- [스타일 가이드](./style-guide.md) 참조

### 컴포넌트
- [컴포넌트 가이드](./components/) 참조

## 🔧 개발 가이드

### 1. 컴포넌트 개발

#### 파일 구조
```jsx
// components/common/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function Button({ 
  text, 
  onClick, 
  variant = 'primary',
  disabled = false,
  className = '',
  ...props 
}) {
  const baseClasses = 'h-14 px-6 rounded-md font-bold transition-colors';
  
  const variantClasses = {
    primary: 'bg-black-500 text-white hover:bg-black-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
    secondary: 'bg-black-100 text-black-500 hover:bg-black-200'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {text}
    </button>
  );
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'success', 'secondary']),
  disabled: PropTypes.bool,
  className: PropTypes.string
};
```

### 2. 상태 관리 (Zustand)

#### Store 생성
```javascript
// store/exampleStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useExampleStore = create(
  persist(
    (set, get) => ({
      // State
      data: null,
      loading: false,
      error: null,
      
      // Actions
      setData: (data) => set({ data }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      // Async actions
      fetchData: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/data');
          set({ data: response.data, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
      
      // Computed values
      hasData: () => get().data !== null,
      
      // Reset
      reset: () => set({ data: null, loading: false, error: null })
    }),
    {
      name: 'example-storage', // localStorage key
      partialize: (state) => ({ data: state.data }) // 저장할 필드 선택
    }
  )
);

export default useExampleStore;
```

### 3. API 통신

#### API 함수 작성
```javascript
// api/example.js
import api from './index';

// GET 요청
export const getExampleData = async (params) => {
  try {
    const response = await api.get('/example', { params });
    return response.data;
  } catch (error) {
    console.error('Get example data error:', error);
    throw error;
  }
};

// POST 요청
export const createExample = async (data) => {
  try {
    const response = await api.post('/example', data);
    return response.data;
  } catch (error) {
    console.error('Create example error:', error);
    throw error;
  }
};

// 파일 업로드
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Upload file error:', error);
    throw error;
  }
};
```

### 4. 커스텀 훅

#### 훅 작성 예시
```javascript
// hooks/useExample.js
import { useState, useEffect, useCallback } from 'react';
import { getExampleData } from '../api/example';

export default function useExample(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getExampleData(id);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const refetch = () => {
    fetchData();
  };
  
  return { data, loading, error, refetch };
}
```

### 5. 라우팅

#### 라우트 설정
```jsx
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/agreement" element={<AgreementPage />} />
        
        {/* 보호된 라우트 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/main" element={<MainPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        {/* 온보딩 라우트 */}
        <Route path="/onboarding-info">
          <Route path="1" element={<ObInfo1 />} />
          <Route path="2" element={<ObInfo2 />} />
          <Route path="3" element={<ObInfo3 />} />
          <Route path="4" element={<ObInfo4 />} />
          <Route path="complete" element={<ObComplete />} />
        </Route>
        
        {/* 404 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 📋 체크리스트

### 컴포넌트 개발 체크리스트
- [ ] PropTypes 또는 TypeScript 타입 정의
- [ ] 재사용 가능한 구조로 설계
- [ ] 적절한 기본값 설정
- [ ] 에러 처리 구현
- [ ] 로딩 상태 처리
- [ ] 접근성 고려 (ARIA 속성)
- [ ] 반응형 디자인 적용
- [ ] 스타일 가이드 준수

### 성능 최적화 체크리스트
- [ ] React.memo 사용 검토
- [ ] useMemo/useCallback 적절히 사용
- [ ] 이미지 최적화 (lazy loading, WebP)
- [ ] 코드 스플리팅 적용
- [ ] 불필요한 리렌더링 방지
- [ ] 번들 사이즈 최적화

### 테스트 체크리스트
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] E2E 테스트 시나리오
- [ ] 에러 케이스 테스트
- [ ] 접근성 테스트
- [ ] 브라우저 호환성 테스트

## 🔗 관련 문서
- [스타일 가이드](./style-guide.md)
- [컴포넌트 가이드](./components/)
- [상태 관리 가이드](./state-management.md)
- [API 통신 가이드](../04-api/)