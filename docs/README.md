# STUDYMATE-CLIENT 문서

## 📚 문서 개요

STUDYMATE-CLIENT 프로젝트의 종합 문서입니다. 프로젝트 이해, 개발, 배포, 유지보수에 필요한 모든 정보를 체계적으로 정리했습니다.

## 📁 문서 구조

```
docs/
├── 01-overview/           # 프로젝트 개요
├── 02-requirements/       # 요구사항 정의
├── 03-architecture/       # 시스템 아키텍처
├── 04-api/               # API 명세
├── 05-database/          # 데이터베이스 설계
├── 06-frontend/          # 프론트엔드 가이드
├── 07-backend/           # 백엔드 가이드
├── 08-infrastructure/    # 인프라 & 배포
├── 09-processes/         # 개발 프로세스
├── 10-decisions/         # 기술적 결정사항
└── 99-logs/              # 작업 로그 & 회고
```

## 🚀 빠른 시작

### 새 팀원을 위한 필독 문서
1. **[프로젝트 개요](01-overview/project-overview.md)** - 프로젝트 전체 이해
2. **[시스템 아키텍처](03-architecture/system-architecture.md)** - 기술 구조 파악
3. **[API 명세서](04-api/api-specification.md)** - API 사용법 숙지
4. **[스타일 가이드](06-frontend/style-guide.md)** - UI 개발 규칙
5. **[배포 가이드](08-infrastructure/deployment-guide.md)** - 배포 프로세스 이해

### 역할별 추천 문서

#### 프론트엔드 개발자
- [스타일 가이드](06-frontend/style-guide.md)
- [컴포넌트 라이브러리](06-frontend/components/README.md)
- [API 연동 가이드](04-api/api-specification.md)
- [성능 최적화 가이드](06-frontend/performance-guide.md)

#### 백엔드 개발자
- [API 명세서](04-api/api-specification.md)
- [데이터베이스 스키마](05-database/database-schema.md)
- [시스템 아키텍처](03-architecture/system-architecture.md)
- [보안 가이드](08-infrastructure/security-guide.md)

#### DevOps/인프라 담당자
- [배포 가이드](08-infrastructure/deployment-guide.md)
- [모니터링 가이드](08-infrastructure/monitoring-guide.md)
- [보안 설정](08-infrastructure/security-guide.md)
- [트러블슈팅](08-infrastructure/troubleshooting.md)

#### 프로젝트 매니저
- [프로젝트 개요](01-overview/project-overview.md)
- [요구사항 정의](02-requirements/functional-requirements.md)
- [개발 프로세스](09-processes/development-workflow.md)
- [품질 관리](09-processes/quality-management.md)

## 📋 문서별 상세 안내

### 01. 프로젝트 개요 (Overview)
- **[project-overview.md](01-overview/project-overview.md)**: 전체 프로젝트 소개, 목표, 기술 스택

### 02. 요구사항 (Requirements)
- **[functional-requirements.md](02-requirements/functional-requirements.md)**: 기능적 요구사항 정의
- **[non-functional-requirements.md](02-requirements/non-functional-requirements.md)**: 비기능적 요구사항 정의
- **[user-stories.md](02-requirements/user-stories.md)**: 사용자 스토리 및 시나리오

### 03. 시스템 아키텍처 (Architecture)
- **[system-architecture.md](03-architecture/system-architecture.md)**: 전체 시스템 구조 및 설계
- **[frontend-architecture.md](03-architecture/frontend-architecture.md)**: 프론트엔드 아키텍처
- **[integration-architecture.md](03-architecture/integration-architecture.md)**: 시스템 간 연동 구조

### 04. API 명세 (API)
- **[api-specification.md](04-api/api-specification.md)**: REST API 및 WebSocket API 명세
- **[authentication.md](04-api/authentication.md)**: 인증 및 권한 관리
- **[error-codes.md](04-api/error-codes.md)**: 에러 코드 정의

### 05. 데이터베이스 (Database)
- **[database-schema.md](05-database/database-schema.md)**: DB 스키마 및 ERD
- **[data-modeling.md](05-database/data-modeling.md)**: 데이터 모델링 가이드

### 06. 프론트엔드 (Frontend)
- **[style-guide.md](06-frontend/style-guide.md)**: 디자인 시스템 및 스타일 가이드
- **[components/README.md](06-frontend/components/README.md)**: 컴포넌트 라이브러리
- **[api-integration.md](06-frontend/api-integration.md)**: API 연동 가이드
- **[testing-guide.md](06-frontend/testing-guide.md)**: 테스트 작성 가이드
- **[performance-guide.md](06-frontend/performance-guide.md)**: 성능 최적화 가이드

### 07. 백엔드 (Backend)
- **[service-architecture.md](07-backend/service-architecture.md)**: 서비스 구조 및 패턴
- **[websocket-guide.md](07-backend/websocket-guide.md)**: WebSocket 구현 가이드
- **[error-handling.md](07-backend/error-handling.md)**: 에러 처리 전략
- **[utils/README.md](07-backend/utils/README.md)**: 유틸리티 함수 모음

### 08. 인프라 (Infrastructure)
- **[deployment-guide.md](08-infrastructure/deployment-guide.md)**: 배포 프로세스 및 가이드
- **[security-guide.md](08-infrastructure/security-guide.md)**: 보안 설정 및 가이드
- **[monitoring-guide.md](08-infrastructure/monitoring-guide.md)**: 모니터링 및 로그 관리
- **[troubleshooting.md](08-infrastructure/troubleshooting.md)**: 문제 해결 가이드

### 09. 개발 프로세스 (Processes)
- **[development-workflow.md](09-processes/development-workflow.md)**: 개발 워크플로우
- **[git-workflow.md](09-processes/git-workflow.md)**: Git 브랜치 전략
- **[code-review.md](09-processes/code-review.md)**: 코드 리뷰 가이드
- **[testing-strategy.md](09-processes/testing-strategy.md)**: 테스트 전략
- **[quality-management.md](09-processes/quality-management.md)**: 품질 관리 프로세스

### 10. 기술적 결정사항 (Decisions)
- **[adr-template.md](10-decisions/adr-template.md)**: ADR 템플릿
- **[adr-001-frontend-framework.md](10-decisions/adr-001-frontend-framework.md)**: React 선택 근거
- **[adr-002-state-management.md](10-decisions/adr-002-state-management.md)**: Zustand 선택 근거
- **[adr-003-css-framework.md](10-decisions/adr-003-css-framework.md)**: Tailwind CSS 선택 근거

### 99. 작업 로그 & 회고 (Logs)
- **[work-sessions/](99-logs/work-sessions/)**: 개발 세션 기록
- **[failure-patterns/](99-logs/failure-patterns/)**: 실패 패턴 분석
- **[retrospectives/](99-logs/retrospectives/)**: 스프린트 회고

## 🔧 문서 활용 방법

### 문서 검색
```bash
# 특정 키워드로 문서 내용 검색
grep -r "키워드" docs/

# 파일명으로 검색
find docs/ -name "*키워드*"
```

### 문서 업데이트
1. **문서 수정 시**: 관련 팀원들과 리뷰 후 업데이트
2. **새 문서 추가 시**: README.md 목차 업데이트 필수
3. **문서 삭제 시**: 삭제 전 의존성 확인 및 팀 공지

### 문서 품질 관리
- **일관성**: 템플릿과 스타일 가이드 준수
- **정확성**: 코드 변경 시 관련 문서도 함께 업데이트
- **완전성**: 새로운 기능 개발 시 문서화 필수
- **접근성**: 새 팀원도 쉽게 이해할 수 있는 수준 유지

## 📱 관련 프로젝트 문서

### STUDYMATE-SERVER (백엔드)
- **위치**: `/Users/minhan/Desktop/public-repo/STUDYMATE-SERVER/CLAUDE.md`
- **내용**: Spring Boot 백엔드 서버 개발 가이드
- **연동**: API 명세서와 연계하여 확인 필요

### 공통 리소스
- **Swagger API 문서**: https://api.languagemate.kr/swagger-ui/index.html
- **Figma 디자인**: (링크 추가 예정)
- **Storybook**: (링크 추가 예정)

## ⚠️ 중요 알림

### 문서 업데이트 규칙
1. **코드 변경 시 문서도 함께 업데이트**
2. **새로운 API 추가 시 API 명세서 업데이트**
3. **UI 컴포넌트 변경 시 컴포넌트 문서 업데이트**
4. **배포 프로세스 변경 시 배포 가이드 업데이트**

### 문서 버전 관리
- 문서는 코드와 함께 Git으로 버전 관리
- 주요 문서 변경 시 변경 이력 기록 필수
- 문서 충돌 시 최신 코드 기준으로 동기화

## 🆘 도움이 필요할 때

### 빠른 도움말
- **개발 이슈**: [GitHub Issues](https://github.com/org/studymate-client/issues)
- **API 문의**: Swagger 문서 또는 백엔드 팀 문의
- **디자인 문의**: Figma 파일 또는 디자이너 문의
- **배포 문의**: 인프라 담당자 문의

### 팀 연락처
- **프론트엔드 담당자**: xxx-xxxx-xxxx
- **백엔드 담당자**: xxx-xxxx-xxxx  
- **DevOps 담당자**: xxx-xxxx-xxxx
- **디자이너**: xxx-xxxx-xxxx

## 📝 문서 기여 가이드

### 문서 작성 가이드라인
1. **명확성**: 누구나 쉽게 이해할 수 있도록 작성
2. **구체성**: 실행 가능한 구체적인 정보 포함
3. **최신성**: 항상 최신 정보 유지
4. **완결성**: 필요한 모든 정보 포함
5. **일관성**: 기존 문서와 일관된 형식 유지

### Pull Request 템플릿
```markdown
## 문서 변경사항
- [ ] 새 문서 추가
- [ ] 기존 문서 수정
- [ ] 문서 삭제
- [ ] 링크 수정

## 변경 사유
- 변경이 필요한 이유 설명

## 확인사항
- [ ] 관련 팀원 리뷰 완료
- [ ] 다른 문서와의 일관성 확인
- [ ] 링크 정상 동작 확인
```

---

📧 **문서 관련 문의**: dev-team@studymate.com  
🔄 **마지막 업데이트**: 2024-01-XX  
📄 **문서 버전**: v1.0