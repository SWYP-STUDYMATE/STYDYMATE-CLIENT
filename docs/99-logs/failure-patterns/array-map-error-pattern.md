# Array.map() TypeError 패턴 수정 사례

## 문제 상황

**에러 메시지:**
```
TypeError: locations.map is not a function
    at ObInfoRouter-CLGl2foS.js:106:21
```

**발생 위치:** `src/pages/ObInfo/ObInfo2.jsx`의 33번째 줄 (빌드 후 106번째 줄)

## Root Cause 분석

### 1. 문제 식별
- `locations` 상태 변수가 배열이 아닌 다른 타입의 값일 때 `.map()` 메서드 호출 시도
- API 응답이 예상과 다른 데이터 구조를 반환하거나 에러가 발생했을 때 발생

### 2. 원본 코드의 문제점
```javascript
const [locations, setLocations] = useState([]);

useEffect(() => {
  api.get("/user/locations")
    .then(res => {
      setLocations(res.data); // res.data가 배열이 아닐 수 있음
    })
    .catch(err => {
      showError("거주지 리스트를 불러오지 못했습니다.");
    });
}, []);

const residenceOptions = useMemo(() =>
  locations.map(loc => ({ // locations가 배열이 아니면 에러!
    value: loc.locationId,
    label: `${loc.city}, ${loc.country} (${loc.timezone})`
  })),
  [locations]
);
```

### 3. 문제 발생 시나리오
1. **API 응답 오류**: 서버에서 배열 대신 객체나 null 반환
2. **네트워크 에러**: API 호출 실패 시 catch 블록에서 locations 상태 미처리
3. **데이터 구조 변경**: 서버 API 변경으로 인한 응답 구조 변화

## 해결 방안

### 1. API 응답 검증 추가
```javascript
useEffect(() => {
  api.get("/user/locations")
    .then(res => {
      // API 응답이 배열인지 확인하고 안전하게 설정
      const locationData = Array.isArray(res.data) ? res.data : [];
      setLocations(locationData);
      console.log("API Response:", res.data);
      console.log("Processed locations:", locationData);
    })
    .catch(err => {
      showError("거주지 리스트를 불러오지 못했습니다.");
      console.error("API Error:", err);
      // 에러 발생 시 빈 배열로 설정하여 안전성 보장
      setLocations([]);
    });
}, []);
```

### 2. useMemo에서 이중 검증
```javascript
const residenceOptions = useMemo(() => {
  // locations가 배열인지 다시 한번 확인
  if (!Array.isArray(locations)) {
    console.warn("Locations is not an array:", locations);
    return [];
  }
  
  return locations.map(loc => ({
    value: loc.locationId,
    label: `${loc.city}, ${loc.country} (${loc.timezone})`
  }));
}, [locations]);
```

## 예방 조치

### 1. 일반적인 방어 패턴
```javascript
// 배열 처리 전 항상 검증
const safeArray = Array.isArray(data) ? data : [];
const results = safeArray.map(item => processItem(item));
```

### 2. TypeScript 도입 고려
```typescript
interface Location {
  locationId: string;
  city: string;
  country: string;
  timezone: string;
}

const [locations, setLocations] = useState<Location[]>([]);
```

### 3. API 응답 스키마 검증
```javascript
const validateLocationResponse = (data) => {
  if (!Array.isArray(data)) {
    console.error("Invalid location data format:", data);
    return [];
  }
  
  return data.filter(item => 
    item && item.locationId && item.city && item.country && item.timezone
  );
};
```

## 관련 파일들

### 수정된 파일
- `src/pages/ObInfo/ObInfo2.jsx` - 메인 수정 사항

### 유사한 패턴을 가진 파일들 (검토 필요)
- `src/pages/Login/ObInfoGoogle.jsx` - 이미 Array.isArray() 검증 있음
- 기타 `.map()` 사용하는 모든 컴포넌트들

## 테스트 시나리오

### 1. 정상 케이스
- API가 올바른 배열 반환 시 정상 동작

### 2. 예외 케이스
- API가 null 반환 → 빈 배열로 처리
- API가 객체 반환 → 빈 배열로 처리  
- API 호출 실패 → catch에서 빈 배열 설정

## 교훈

1. **방어적 프로그래밍**: 외부 데이터는 항상 예상과 다를 수 있다
2. **타입 검증**: JavaScript에서는 런타임 타입 검증이 필수
3. **에러 처리**: catch 블록에서도 상태를 안전한 값으로 설정
4. **로깅 강화**: 디버깅을 위한 충분한 로그 추가

## 날짜
- **발생일**: 2025-01-09
- **수정일**: 2025-01-09
- **담당자**: Claude Code Assistant