# 컬러 사용 가이드

## ⚠️ 필수 준수 사항
**모든 개발 시 반드시 공식 컬러 팔레트만 사용**
- 임의의 색상 사용 금지
- 디자인 시스템 외 색상 사용 시 PR 반려

## 🎨 컬러 용도별 가이드

### 1. 버튼 (Buttons)
```css
/* Primary 버튼 */
.btn-primary {
  background: #00C471; /* green-500 */
  color: #FFFFFF;
}
.btn-primary:hover {
  background: #00B267; /* green-600 */
}

/* Secondary 버튼 */
.btn-secondary {
  background: #111111; /* black-500 */
  color: #FFFFFF;
}
.btn-secondary:hover {
  background: #414141; /* black-400 */
}

/* Disabled 버튼 */
.btn-disabled {
  background: #E7E7E7; /* black-50 */
  color: #929292; /* black-200 */
}
```

### 2. 텍스트 (Typography)
```css
/* 제목 */
.heading {
  color: #111111; /* black-500 */
}

/* 본문 */
.body-text {
  color: #111111; /* black-500 */
}

/* 보조 텍스트 */
.secondary-text {
  color: #929292; /* black-200 */
}

/* 비활성 텍스트 */
.disabled-text {
  color: #B5B5B5; /* black-100 */
}

/* 링크 */
.link {
  color: #00C471; /* green-500 */
}
```

### 3. 배경 (Backgrounds)
```css
/* 페이지 배경 */
.page-bg {
  background: #FAFAFA;
}

/* 카드/컨테이너 배경 */
.card-bg {
  background: #FFFFFF;
}

/* 연한 초록 배경 (강조) */
.highlight-bg {
  background: #E6F9F1; /* green-50 */
}

/* 비활성 영역 */
.disabled-bg {
  background: #E7E7E7; /* black-50 */
}
```

### 4. 테두리 (Borders)
```css
/* 기본 테두리 */
.border-default {
  border-color: #E7E7E7; /* black-50 */
}

/* 포커스 테두리 */
.border-focus {
  border-color: #111111; /* black-500 */
}

/* 성공 테두리 */
.border-success {
  border-color: #00C471; /* green-500 */
}

/* 에러 테두리 */
.border-error {
  border-color: #EA4335; /* red */
}
```

### 5. 상태 표시 (Status)
```css
/* 온라인/활성 */
.status-online {
  color: #00C471; /* green-500 */
}

/* 오프라인/비활성 */
.status-offline {
  color: #929292; /* black-200 */
}

/* 에러 */
.status-error {
  color: #EA4335; /* red */
}

/* 정보 */
.status-info {
  color: #4285F4; /* blue */
}
```

### 6. 레벨 배지 (Level Badge)
```css
/* Beginner */
.badge-beginner {
  background: #B0EDD3; /* green-100 */
  color: #006C3E; /* green-800 */
}

/* Intermediate */
.badge-intermediate {
  background: #8AE4BE; /* green-200 */
  color: #008B50; /* green-700 */
}

/* Advanced */
.badge-advanced {
  background: #54D7A0; /* green-300 */
  color: #00522F; /* green-900 */
}
```

### 7. 채팅 메시지
```css
/* 내 메시지 */
.message-mine {
  background: #E6F9F1; /* green-50 */
  color: #111111; /* black-500 */
}

/* 상대방 메시지 */
.message-other {
  background: #FFFFFF;
  border: 1px solid #E7E7E7; /* black-50 */
  color: #111111; /* black-500 */
}
```

### 8. 사이드바
```css
/* 사이드바 배경 */
.sidebar {
  background: #00C471; /* green-500 */
}

/* 사이드바 아이템 */
.sidebar-item {
  color: #FFFFFF;
}

/* 사이드바 호버 */
.sidebar-item:hover {
  background: #00B267; /* green-600 */
}

/* 사이드바 활성 */
.sidebar-item.active {
  background: #008B50; /* green-700 */
}
```

## 📊 컨트라스트 비율 가이드

### WCAG 2.1 준수
- **AAA**: 7:1 이상 (작은 텍스트)
- **AA**: 4.5:1 이상 (일반 텍스트)
- **AA Large**: 3:1 이상 (큰 텍스트 18px+)

### 권장 조합
| 배경    | 텍스트  | 비율  | 등급     |
| ------- | ------- | ----- | -------- |
| #FFFFFF | #111111 | 18.88 | AAA      |
| #FFFFFF | #929292 | 3.11  | AA       |
| #00C471 | #FFFFFF | 2.30  | AA Large |
| #E6F9F1 | #111111 | 17.31 | AAA      |
| #E7E7E7 | #111111 | 15.21 | AAA      |

## 🚫 사용 금지 조합
- 연한 색상끼리 조합 (예: green-50 + black-50)
- 비슷한 명도의 색상 조합
- 컨트라스트 비율 3:1 미만 조합

## ✅ 개발 체크리스트
- [ ] 공식 컬러 팔레트만 사용했는가?
- [ ] 컨트라스트 비율을 확인했는가?
- [ ] 호버/포커스 상태 색상을 정의했는가?