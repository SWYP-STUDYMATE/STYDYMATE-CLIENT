# useMemo 완벽 이해 가이드

## 🤔 useMemo가 나쁜가요?

**아니요! useMemo는 매우 유용한 최적화 도구입니다.**

문제는 **잘못 사용하면 오히려 버그와 성능 저하를 일으킨다**는 것입니다.

---

## 🔬 근본 원인 분석

### 1. JavaScript 참조 타입의 특성

```javascript
// Primitive 타입 (값으로 비교)
const a = 5;
const b = 5;
console.log(a === b);  // true ✅

// Reference 타입 (참조로 비교)
const obj1 = { value: 5 };
const obj2 = { value: 5 };
console.log(obj1 === obj2);  // false ❌ (다른 메모리 주소!)

// 배열도 마찬가지
const arr1 = [1, 2, 3];
const arr2 = [1, 2, 3];
console.log(arr1 === arr2);  // false ❌
```

**이것이 모든 문제의 시작입니다!**

---

### 2. React 렌더링 메커니즘

```javascript
function Parent() {
  const [count, setCount] = useState(0);

  // ⚠️ 매 렌더마다 새 객체 생성!
  const user = {
    name: "John",
    age: 30
  };

  console.log("Parent rendered, user =", user);
  // 렌더링 1: user = { name: "John", age: 30 } (주소: 0x001)
  // 렌더링 2: user = { name: "John", age: 30 } (주소: 0x002) ← 다른 객체!
  // 렌더링 3: user = { name: "John", age: 30 } (주소: 0x003) ← 또 다른 객체!

  return <Child user={user} />;
}
```

**컴포넌트가 리렌더되면 내부의 모든 객체/배열이 재생성됩니다.**

---

### 3. useMemo의 의존성 비교 방식

```javascript
// React 내부 (단순화)
function useMemo(factory, dependencies) {
  const prevDeps = getPreviousDependencies();

  // ⚠️ Object.is()로 참조 비교 (값 비교 아님!)
  if (prevDeps && areDepsEqual(prevDeps, dependencies)) {
    return getCachedValue();  // 캐시된 값 반환
  }

  const newValue = factory();  // 새로 계산
  saveDependencies(dependencies);
  saveValue(newValue);
  return newValue;
}

function areDepsEqual(prevDeps, nextDeps) {
  for (let i = 0; i < prevDeps.length; i++) {
    if (!Object.is(prevDeps[i], nextDeps[i])) {  // ← 참조 비교!
      return false;
    }
  }
  return true;
}
```

**React는 값이 같은지가 아니라 참조가 같은지만 확인합니다!**

---

## 💥 무한 루프 발생 메커니즘

### 시나리오 1: 부모가 매번 새 객체를 전달

```javascript
// 부모 컴포넌트
function Parent() {
  const [count, setCount] = useState(0);

  // Step 1: 매 렌더마다 새 객체 생성
  const data = { value: count };  // 새 참조!

  return <Child data={data} />;
}

// 자식 컴포넌트
function Child({ data }) {
  // Step 2: data가 새 참조 → useMemo 재실행
  const doubled = useMemo(() => {
    console.log("Computing doubled");
    return data.value * 2;
  }, [data]);  // ← data는 매번 다른 참조!

  // Step 3: useMemo 재실행 → 리렌더
  // Step 4: 리렌더 → useEffect 실행
  useEffect(() => {
    // Step 5: 어떤 상태 변경이 일어나면...
    // Step 6: 부모도 리렌더 → Step 1로 돌아감
  }, [doubled]);

  // 무한 루프! 🔄
}
```

**렌더 플로우**:
```
1. Parent 렌더 → 새 data 객체 (0x001)
2. Child 렌더 → useMemo 실행 (data 참조 다름)
3. doubled 값 생성 → useEffect 트리거
4. 상태 변경 → Parent 리렌더
5. 새 data 객체 (0x002) → 2단계로 돌아감
→ 무한 루프! 🔄🔄🔄
```

---

### 시나리오 2: Cascading useMemo

```javascript
function Component({ items }) {
  // Step 1: 첫 번째 useMemo
  const filtered = useMemo(() => {
    console.log("Filtering items");
    return items.filter(x => x.active);
  }, [items]);
  // 결과: filtered = [객체1, 객체2] (참조: 0x100)

  // Step 2: 두 번째 useMemo가 첫 번째 결과에 의존
  const sorted = useMemo(() => {
    console.log("Sorting items");
    return [...filtered].sort((a, b) => a.id - b.id);
  }, [filtered]);  // ← filtered는 useMemo 결과!

  // 문제 발생:
  // 1. items 변경 (새 배열)
  // 2. filtered 재계산 → 새 배열 생성 (참조: 0x101) ← 새 참조!
  // 3. filtered 참조 변경 → sorted 재계산
  // 4. sorted 재계산 → 컴포넌트 리렌더
  // 5. React가 모든 useMemo 재평가
  // 6. filtered가 또 재계산 → 또 새 참조 (0x102)
  // 7. 2단계로 돌아감 → 무한 루프!
}
```

**왜 이런 일이?**
```javascript
// useMemo는 항상 새 배열/객체를 반환합니다
const filtered = useMemo(() => {
  return items.filter(...);  // ← 새 배열 생성!
}, [items]);

// 이는 다음과 같습니다
const temp1 = items.filter(...);  // 배열1 (0x100)
const temp2 = items.filter(...);  // 배열2 (0x101)
console.log(temp1 === temp2);  // false! (내용은 같아도 참조가 다름)
```

---

## 🎓 React 18 vs React 19

### React 18 (느슨한 비교)
```javascript
// React 18은 일부 경우 값 비교를 시도
useMemo(() => calculation(), [obj.prop]);
// → obj.prop이 primitive면 값 비교
// → 일부 케이스에서 무한 루프 회피
```

### React 19 (엄격한 비교)
```javascript
// React 19는 항상 참조 비교 (Object.is)
useMemo(() => calculation(), [obj.prop]);
// → obj.prop이 뭐든 참조만 비교
// → 더 예측 가능하지만 더 엄격함
```

**React 19 철학**: "숨겨진 마법보다 명확한 규칙"

---

## ✅ useMemo가 좋은 경우

### 1. **비용이 높은 계산 + 안정적인 의존성**

```javascript
// ✅ 완벽한 사용 예시
function DataAnalysis({ rawData }) {
  const analysis = useMemo(() => {
    console.log("Heavy computation running...");

    // 수만 개의 데이터 분석
    return rawData.reduce((result, item) => {
      // 복잡한 통계 계산...
      result.sum += item.value;
      result.average = result.sum / result.count;
      // ... 수백 줄의 계산
      return result;
    }, { sum: 0, count: 0, average: 0 });
  }, [rawData]);  // rawData가 실제로 변할 때만 재계산

  return <div>{analysis.average}</div>;
}
```

**언제 좋은가?**
- 계산 비용: 10ms 이상 (눈에 띄게 느림)
- 의존성: 실제로 변경될 때만 (부모가 참조 안정화 보장)
- 효과: 불필요한 재계산 방지 → 60fps 유지

---

### 2. **Primitive 의존성**

```javascript
// ✅ 안전함 (string, number는 값으로 비교)
function Greeting({ name, age }) {
  const message = useMemo(() => {
    return `Hello, ${name}! You are ${age} years old.`;
  }, [name, age]);  // name, age는 primitive → 안전!

  return <h1>{message}</h1>;
}
```

---

### 3. **참조 동등성이 필요한 경우**

```javascript
// ✅ 자식 컴포넌트의 리렌더 방지
function Parent() {
  const [count, setCount] = useState(0);
  const [filter, setFilter] = useState('all');

  // 필터가 변경될 때만 새 객체 생성
  const filterConfig = useMemo(() => ({
    type: filter,
    enabled: true
  }), [filter]);  // count 변경 시 재생성 안 함!

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <ExpensiveChild config={filterConfig} />
      {/* count 변경 시 ExpensiveChild는 리렌더 안 됨! */}
    </div>
  );
}

const ExpensiveChild = React.memo(({ config }) => {
  console.log("ExpensiveChild rendered");
  // 무거운 렌더링...
});
```

---

## ❌ useMemo가 위험한 경우

### 1. **부모가 매번 새 객체를 만드는 경우**

```javascript
// ❌ 무한 루프 위험!
function Parent() {
  return <Child data={{ value: 100 }} />;
  //               ^^^^^^^^^^^^^^^^^ 매번 새 객체!
}

function Child({ data }) {
  const result = useMemo(() => {
    return data.value * 2;
  }, [data]);  // ← data는 매번 다른 참조 → 무한 루프!
}
```

---

### 2. **Cascading useMemo**

```javascript
// ❌ 위험! 연쇄 의존성
const step1 = useMemo(() => transform(data), [data]);
const step2 = useMemo(() => process(step1), [step1]);  // ← 위험!
const step3 = useMemo(() => finalize(step2), [step2]);  // ← 더 위험!
```

---

### 3. **불필요한 useMemo (오버헤드만 증가)**

```javascript
// ❌ 성능 저하!
const sum = useMemo(() => a + b, [a, b]);
// useMemo 호출 비용 > 단순 덧셈 비용

// ✅ 이게 더 빠름
const sum = a + b;
```

**벤치마크**:
```
단순 덧셈: 0.001ms
useMemo 호출: 0.01ms (10배 느림!)
```

---

## 🛠️ 올바른 해결책

### 해결책 1: **부모에서 참조 안정화**

```javascript
// 부모 컴포넌트
function Parent() {
  const [count, setCount] = useState(0);

  // ✅ 값이 같으면 같은 참조 반환
  const data = useMemo(() => ({
    value: count
  }), [count]);  // count 변경 시에만 새 객체

  return <Child data={data} />;
}

// 자식 컴포넌트
function Child({ data }) {
  // ✅ 안전함! data는 count 변경 시에만 바뀜
  const doubled = useMemo(() => {
    return data.value * 2;
  }, [data]);
}
```

---

### 해결책 2: **useMemo 제거 (더 간단!)**

```javascript
// ❌ 복잡함
function Child({ data }) {
  const doubled = useMemo(() => {
    return data.value * 2;
  }, [data]);

  return <div>{doubled}</div>;
}

// ✅ 간단함 (부모가 참조 안정화하면 이것만으로 충분)
function Child({ data }) {
  const doubled = data.value * 2;

  return <div>{doubled}</div>;
}
```

---

### 해결책 3: **stabilizeRef 패턴**

```javascript
// 재사용 가능한 참조 안정화 헬퍼
function useStableRef(value) {
  const ref = useRef();

  return useMemo(() => {
    const isEqual = ref.current &&
      JSON.stringify(ref.current) === JSON.stringify(value);

    if (isEqual) return ref.current;  // 같은 참조 반환!

    ref.current = value;
    return value;
  }, [value]);
}

// 사용
function Parent() {
  const rawData = { value: 100 };
  const stableData = useStableRef(rawData);  // 값이 같으면 같은 참조!

  return <Child data={stableData} />;
}
```

---

## 📊 성능 측정

### useMemo가 필요한 시점

```javascript
// 계산 비용 측정
console.time("calculation");
const result = expensiveCalculation(data);
console.timeEnd("calculation");
// → 10ms 이상이면 useMemo 고려

// useMemo 오버헤드
// → 약 0.01ms ~ 0.1ms

// 결론: 계산이 1ms 이상일 때만 useMemo 가치 있음
```

---

## 🎯 결론

### useMemo는:
- ✅ **도구**: 올바르게 사용하면 최적화
- ❌ **만능 해결책 아님**: 잘못 사용하면 버그
- ⚠️ **Trade-off**: 복잡성 증가 vs 성능 향상

### 사용 원칙:
1. **계산이 비쌀 때만** (10ms 이상)
2. **의존성이 안정적일 때만** (primitive 또는 참조 안정화)
3. **Cascading 절대 금지**
4. **의심스러우면 제거** (대부분 불필요)

### React 19에서:
- 참조 비교가 더 엄격함
- 잘못된 useMemo 패턴이 드러남
- **"필요할 때만, 신중하게"** 사용

---

**핵심**: useMemo는 나쁘지 않습니다. 다만 **JavaScript의 참조 특성**과 **React의 렌더링 메커니즘**을 정확히 이해하고 사용해야 합니다!
