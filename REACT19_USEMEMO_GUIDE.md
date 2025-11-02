# React 19 useMemo 사용 가이드라인

## ⚠️ 문제 요약

React 19에서는 **useMemo의 의존성 배열에 대한 참조 동등성 검사가 엄격해졌습니다**.
기존 React 18에서 문제없던 코드가 React 19에서 **무한 렌더링 루프**를 일으킬 수 있습니다.

### 발생한 에러들
- **React Error #310**: "Too many re-renders" (무한 렌더링)
- **React Error #185**: "Objects are not valid as a React child" (객체 렌더링 오류)

---

## 🚫 금지된 패턴들

### 1. Cascading useMemo (연쇄 의존성)

```javascript
// ❌ 절대 금지!
const dataA = useMemo(() => transform(props.data), [props.data]);
const dataB = useMemo(() => process(dataA), [dataA]);  // ← 무한 루프!
```

**이유**: `dataA`가 매 렌더마다 새 참조를 생성 → `dataB` 재계산 → 무한 루프

**해결책**:
```javascript
// ✅ 직접 계산으로 변경
const dataA = transform(props.data);
const dataB = process(dataA);
```

---

### 2. 객체/배열 속성을 의존성으로 사용

```javascript
// ❌ 금지!
const greeting = useMemo(() => {
  return `Hello ${user.profile?.name}`;
}, [user.profile?.name]);  // ← user.profile이 매번 새 객체면 무한 루프
```

**해결책**:
```javascript
// ✅ 부모에서 stabilizeRef로 참조 안정화
const stabilizedUser = stabilizeRef('user', user);

// ✅ 또는 직접 계산
const greeting = `Hello ${user.profile?.name}`;
```

---

### 3. 배열 메서드 체이닝을 useMemo로 감싸기

```javascript
// ❌ 금지!
const filtered = useMemo(() => {
  return items.filter(x => x.active).sort((a, b) => a.id - b.id);
}, [items]);  // ← items가 새 배열이면 무한 루프
```

**해결책**:
```javascript
// ✅ 부모가 참조 안정성 보장하면 직접 계산
const filtered = items.filter(x => x.active).sort((a, b) => a.id - b.id);
```

---

## ✅ 권장 패턴

### 1. stabilizeRef 패턴 (부모 컴포넌트)

```javascript
// 부모 컴포넌트에서 한 번만 구현
const stateCache = useRef({});

const stabilizeRef = useCallback((key, newValue) => {
  if (!newValue) return null;

  const cached = stateCache.current[key];
  if (!cached) {
    stateCache.current[key] = newValue;
    return newValue;
  }

  const isSame = JSON.stringify(cached) === JSON.stringify(newValue);
  if (isSame) return cached;  // 같으면 캐시된 참조 반환

  stateCache.current[key] = newValue;
  return newValue;
}, []);

// 사용
setState({
  data: stabilizeRef('data', responseData)
});
```

---

### 2. 직접 계산 (자식 컴포넌트)

```javascript
// useMemo 대신 직접 계산
export function MyComponent({ items }) {
  // ✅ 부모가 stabilizeRef로 안정화했으므로 성능 문제 없음
  const filtered = items.filter(x => x.active);
  const sorted = [...filtered].sort((a, b) => a.id - b.id);

  return <div>{sorted.map(...)}</div>;
}
```

---

### 3. IIFE로 즉시 실행 (복잡한 계산)

```javascript
// useMemo 대신 IIFE 사용
const maxValue = (() => {
  if (data.length === 0) return 1;
  const values = data.map(d => d.value);
  return Math.max(...values);
})();
```

---

## 📋 useMemo 사용 체크리스트

useMemo를 사용하기 전에 반드시 확인:

- [ ] 의존성 배열에 객체나 배열이 없는가?
- [ ] 다른 useMemo의 결과를 의존하지 않는가?
- [ ] 부모 컴포넌트가 prop의 참조 안정성을 보장하는가?
- [ ] 직접 계산으로 대체 가능한가?

**4가지 중 하나라도 '아니오'면 useMemo 사용 금지!**

---

## 🔍 수정 이력

### 2025-01-01: React 19 useMemo 대대적 수정

**수정된 파일들**:
1. `src/pages/Main.jsx` - stabilizeRef 패턴 도입, 모든 useMemo 제거
2. `src/components/AchievementBadges.jsx` - 2개 cascading useMemo 제거
3. `src/components/StudyStats.jsx` - transformedData useMemo 제거
4. `src/components/AILearningSummaryCard.jsx` - useMemo 제거
5. `src/pages/Profile/ProfilePage.jsx` - recentAchievements useMemo 제거
6. `src/pages/Mates/MatesPage.jsx` - 3개 cascading useMemo 제거
7. `src/pages/Achievements/AchievementsPage.jsx` - filteredAchievements useMemo 제거
8. `src/components/profile/WeeklyActivityChart.jsx` - 2개 cascading useMemo 제거

**남아있는 useMemo 사용 파일** (현재 문제없음, 추후 리팩토링 대상):
- `src/components/Calendar.jsx` (7개)
- `src/components/RadarChart.jsx` (2개)
- `src/App.jsx` (1개)
- `src/pages/Schedule/Schedule.jsx` (1개)
- `src/pages/ObInfo/ObInfo2.jsx` (1개)
- `src/components/SubtitleOverlay.jsx`
- `src/components/ProfileSearch.jsx`
- `src/hooks/useToast.jsx`
- `src/pages/LevelTest/LevelTestRecording.jsx`

---

## 🚨 긴급 대응 가이드

### 무한 렌더링 에러 발생 시

1. **개발자 도구 콘솔 확인**
   - `[ComponentName] render: 1, 2, 3, 4, 5...` 패턴 확인
   - React Error #310 또는 #185 확인

2. **해당 컴포넌트에서 useMemo 검색**
   ```bash
   grep -n "useMemo" src/path/to/Component.jsx
   ```

3. **Cascading 패턴 확인**
   - useMemo A의 결과를 useMemo B가 의존하는지 확인
   - 의존성 배열에 객체/배열 속성이 있는지 확인

4. **즉시 수정**
   - useMemo 제거 → 직접 계산으로 변경
   - 부모 컴포넌트에 stabilizeRef 추가 (필요시)

5. **빌드 및 테스트**
   ```bash
   npm run build
   npm run dev
   ```

---

## 📚 추가 자료

- [React 19 공식 문서](https://react.dev/blog/2024/12/05/react-19)
- [useMemo 최적화 가이드](https://react.dev/reference/react/useMemo)
- 프로젝트 내부 참고: `src/pages/Main.jsx` (stabilizeRef 패턴)

---

**작성일**: 2025-01-01
**최종 수정**: 2025-01-01
**담당자**: 프론트엔드 개발팀
