# Zustand Selector 무한 루프 문제 (React Error #185)

**날짜**: 2025-01-13
**심각도**: 🔴 Critical
**재발 횟수**: 3회+
**최종 해결**: 2025-01-13

## 📋 문제 요약

Zustand store에서 여러 값을 선택할 때 **객체를 반환하는 selector**를 사용하면 **무한 렌더링 루프**가 발생하여 React Error #185 (Maximum update depth exceeded)가 발생합니다.

## 🐛 증상

- Main 페이지 로그인 후 **React Error #185** 발생
- ErrorBoundary가 에러를 catch하고 컴포넌트 언마운트
- 특정 컴포넌트(NotificationBadge)가 **50회 이상 렌더링**
- 페이지가 정상적으로 표시되지 않음

## 🔍 근본 원인

### ❌ 문제가 있는 코드 패턴

```javascript
// NotificationBadge.jsx
import { shallow } from 'zustand/shallow';

const { unreadCount, loading } = useNotificationStore(
  (state) => ({
    unreadCount: state.unreadCount,
    loading: state.loading,
  }),
  shallow
);
```

### 왜 무한 루프가 발생하는가?

1. **매 렌더링마다 새 객체 생성**
   ```javascript
   (state) => ({ unreadCount: ..., loading: ... })
   // → 이 함수는 매번 새로운 객체 {} 를 반환
   ```

2. **shallow 비교가 무의미함**
   - Zustand는 이전 값과 비교: `prevResult !== newResult`
   - 객체 참조는 항상 다름: `{} !== {}`
   - Zustand: "값이 변경되었다!" → 리렌더링 트리거

3. **무한 루프 시작**
   ```
   렌더링 → 새 객체 생성 → 참조 비교 실패 → 리렌더링
   → 새 객체 생성 → 참조 비교 실패 → 리렌더링 → ...
   ```

## ✅ 해결 방법

### 올바른 패턴: 각 값을 개별적으로 선택

```javascript
// ✅ 올바른 방법
const unreadCount = useNotificationStore((state) => state.unreadCount);
const loading = useNotificationStore((state) => state.loading);
const loadUnreadCount = useNotificationStore((state) => state.loadUnreadCount);
```

### 왜 이게 작동하는가?

1. **Primitive 값 반환**: 숫자, boolean, 함수 등
2. **참조 안정적**: 값이 실제로 변경되지 않으면 같은 참조
3. **불필요한 리렌더링 없음**: 값이 변경될 때만 리렌더링

## 📊 성능 비교

| 패턴 | 렌더링 횟수 | 결과 |
|------|------------|------|
| ❌ 객체 selector + shallow | 54회+ | 무한 루프 → 에러 |
| ✅ 개별 selector | 3회 | 정상 동작 |

## 🔧 수정 파일

- **src/components/NotificationBadge.jsx** (Line 16-29)
  - `shallow` import 제거
  - Zustand selector를 개별 호출로 변경
  - 경고 주석 추가

## 📝 학습 포인트

### Zustand 사용 시 절대 규칙

1. **여러 값을 선택할 때는 항상 개별 selector 사용**
   ```javascript
   // ✅ Good
   const name = useStore((s) => s.name);
   const age = useStore((s) => s.age);

   // ❌ Bad
   const { name, age } = useStore((s) => ({ name: s.name, age: s.age }), shallow);
   ```

2. **객체를 반환해야 한다면 `useMemo` 사용**
   ```javascript
   const user = useMemo(
     () => ({ name, age }),
     [name, age]
   );
   ```

3. **`shallow`는 마법이 아니다**
   - 새 객체를 만들면 shallow도 소용없음
   - 객체 내부 값만 비교, 객체 자체 참조는 여전히 다름

## 🚨 재발 방지 체크리스트

- [ ] 모든 Zustand store 사용 시 selector 패턴 검토
- [ ] 코드 리뷰 시 객체 반환 selector 확인
- [ ] ESLint 규칙 추가 고려
- [ ] 신규 개발자 온보딩 시 이 문서 공유

## 🔗 관련 파일

- `src/components/NotificationBadge.jsx`
- `src/store/notificationStore.js`
- `docs/06-frontend/react-best-practices.md`

## 📚 참고 자료

- [Zustand Documentation - Selecting Multiple State Slices](https://docs.pmnd.rs/zustand/guides/prevent-rerenders-with-use-shallow)
- [React Error #185 Documentation](https://reactjs.org/docs/error-decoder.html?invariant=185)
- [Zustand GitHub Issue: Infinite Loop with Object Selector](https://github.com/pmndrs/zustand/discussions/1937)

## 🎯 결론

**Zustand에서 여러 값을 선택할 때는 항상 개별 selector를 사용하라.**
객체를 반환하는 selector는 shallow를 사용해도 무한 루프를 일으킬 수 있다.
