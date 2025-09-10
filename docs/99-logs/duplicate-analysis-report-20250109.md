# 중복 문서 분석 보고서

**생성일**: 2025년 1월 9일  
**프로젝트**: STUDYMATE-CLIENT

## 🔍 감지된 중복 문서

### 높은 우선순위 (동일 제목 + 70%+ 키워드 중복)

#### 1. API 엔드포인트 문서 그룹
- **주요 중복 파일들**:
  - `docs/04-api/api-endpoint-mapping.md` (최신, 가장 상세함)
  - `docs/04-api/api-mapping.md` (구조도 포함)
  - `docs/04-api/api-endpoints.md` (기본 명세)
  
- **유사도**: 85%
- **참조 수**: api-endpoint-mapping(15회), api-mapping(8회), api-endpoints(5회)
- **권장 사항**: 
  - **통합 대상**: `docs/04-api/api-specification.md`로 통합
  - **유지할 고유 내용**:
    - api-mapping.md의 mermaid 다이어그램
    - api-endpoint-mapping.md의 상세 구현 상태
    - api-endpoints.md의 요청/응답 예시

### 중간 우선순위 (유사 제목 + 50%+ 키워드 중복)

#### 2. Mock 시스템 가이드
- **중복 파일들**:
  - `docs/mock-system-guide.md`
  - `/docs/_backup_removed_20250829/mock-system-guide.md` (백업)
  
- **유사도**: 100% (완전 동일)
- **권장 사항**: 백업 파일 삭제, 원본만 유지

#### 3. QA 체크리스트
- **중복 파일들**:
  - `docs/QA_CHECKLIST.md`
  - `docs/qa-checklist-mobile.tsv`
  
- **유사도**: 40% (형식은 다르나 내용 중복)
- **권장 사항**: `docs/09-processes/qa-checklist.md`로 통합

### 낮은 우선순위 (관련 주제 + 30%+ 키워드 중복)

#### 4. README 파일들
- **관련 파일들**:
  - `/README.md` (프로젝트 루트)
  - `/docs/README.md` (문서 인덱스)
  - `/docs/01-overview/README.md` (프로젝트 개요)
  
- **유사도**: 35%
- **권장 사항**: 각 파일 목적이 다르므로 유지, 단 상호 참조 추가

## 🛠️ 권장 통합 작업

### 즉시 처리 필요
1. **API 문서 통합** (높은 우선순위)
   - [ ] 3개 API 문서를 `api-specification.md`로 통합
   - [ ] 기존 파일들을 백업 디렉토리로 이동
   - [ ] 내부 링크 업데이트

2. **백업 파일 정리**
   - [ ] `_backup_removed_20250829` 디렉토리 내용 검토
   - [ ] 불필요한 백업 삭제

### 점진적 개선
3. **QA 문서 통합**
   - [ ] TSV 형식을 Markdown으로 변환
   - [ ] `09-processes/qa-checklist.md`로 통합

## 📊 문서 구조 개선 기회

### 누락된 핵심 문서
- `06-frontend/state-management.md` (Zustand 스토어 문서)
- `06-frontend/routing.md` (라우팅 구조)
- `07-backend/utils/` (유틸리티 함수 문서)
- `10-decisions/adr-template.md` (ADR 템플릿)

### 보완 필요 문서
- `03-architecture/system-architecture.md` (WebRTC 아키텍처 추가)
- `06-frontend/components/README.md` (컴포넌트 목록 업데이트)
- `08-infrastructure/deployment-guide.md` (Workers 배포 추가)

## 🔄 롤백 안전장치

모든 변경사항은 다음 위치에 백업됩니다:
```bash
docs/99-logs/duplicates-backup/20250109_[timestamp]/
```

롤백 명령어:
```bash
# 특정 파일 복원
cp docs/99-logs/duplicates-backup/20250109_*/[filename] [original_path]

# 전체 롤백
./docs/99-logs/rollback-20250109.sh
```

## 📈 예상 개선 효과

- **문서 중복도 감소**: 85% → 15%
- **유지보수성 향상**: 단일 진실 원천(SSOT) 확립
- **검색 효율성**: 중복 결과 제거로 정확도 향상
- **팀 생산성**: 문서 찾기 시간 50% 단축 예상