# STUDYMATE-CLIENT 문서

## ⚠️ 문서 구조 변경 안내

**마스터 PRD**: `.taskmaster/docs/prd.txt`가 전체 STUDYMATE 프로젝트의 **Single Source of Truth**입니다.

## 📚 문서 개요

STUDYMATE-CLIENT 프로젝트의 **프론트엔드 전용** 문서입니다. 백엔드 관련 문서는 STUDYMATE-SERVER에서 관리합니다.

## 📁 문서 구조

```
docs/
├── 06-frontend/          # 프론트엔드 전용 가이드 (유지)
├── 08-infrastructure/    # Cloudflare Pages 배포만 (유지)
├── 99-logs/              # 클라이언트 작업 로그 (유지)
└── (다른 디렉터리는 STUDYMATE-SERVER로 이관 또는 삭제)

.taskmaster/docs/
└── prd.txt               # 마스터 PRD (전체 프로젝트)
```

## 🚀 빠른 시작

### 필독 문서 (우선순위)
1. **[마스터 PRD](../.taskmaster/docs/prd.txt)** - 전체 프로젝트 이해 (최우선!)
2. **[스타일 가이드](06-frontend/style-guide.md)** - UI 개발 규칙
3. **[컴포넌트 라이브러리](06-frontend/components/README.md)** - React 컴포넌트 가이드
4. **[Cloudflare 배포 가이드](08-infrastructure/deployment-guide.md)** - 클라이언트 배포
5. **[STUDYMATE-SERVER API 문서](../../STUDYMATE-SERVER/docs/04-api/api-reference.md)** - 백엔드 API 연동

### 프론트엔드 개발자 전용 문서
- **[스타일 가이드](06-frontend/style-guide.md)** - 디자인 시스템, 색상 팔레트, Tailwind 설정
- **[컴포넌트 라이브러리](06-frontend/components/README.md)** - React 컴포넌트 사용법
- **[Cloudflare 배포](08-infrastructure/deployment-guide.md)** - Pages 배포 및 Workers 연동

## ⚠️ 클라이언트 개발 시 필수 참조

**프론트엔드 개발자는 다음 서버 관련 문서와 폴더를 반드시 확인해야 합니다:**

### 🏗️ 백엔드 서버 (STUDYMATE-SERVER)
- **[API 명세서](../../STUDYMATE-SERVER/docs/04-api/api-reference.md)** - REST API 및 WebSocket 연동 필수
- **[에러 처리](../../STUDYMATE-SERVER/docs/07-backend/error-handling.md)** - 통일된 에러 코드 및 메시지
- **[서버 소스코드](../../STUDYMATE-SERVER/src/)** - 실제 구현된 API 엔드포인트 확인
  - `domain/*/dto/response/` - API 응답 데이터 구조
  - `domain/*/controller/` - API 엔드포인트 정의

### ⚙️ Node.js Workers (Cloudflare) 
**주의: Worker 폴더는 아직 생성되지 않았으나, 다음 기능 개발 시 필수 확인:**
- **WebRTC 시그널링 서버** - 화상/음성 통화 연동
- **AI 레벨테스트 API** - OpenAI 통합 음성 분석
- **파일 처리 시스템** - Cloudflare R2 Storage 연동

### 🔗 개발 시 필수 체크
- **API 응답 타입**: TypeScript 인터페이스와 서버 DTO 일치 확인
- **WebSocket 이벤트**: 서버에서 발송하는 이벤트 타입 확인  
- **에러 핸들링**: 서버 에러 코드와 클라이언트 처리 로직 동기화
- **상태 관리**: 서버 상태와 Zustand store 동기화

## 📋 클라이언트 전용 문서

### 마스터 문서 (최우선)
- **[전체 프로젝트 PRD](../.taskmaster/docs/prd.txt)** - 전체 STUDYMATE 프로젝트의 마스터 요구사항서

### 06. 프론트엔드 (Frontend) - 유지
- **[style-guide.md](06-frontend/style-guide.md)** - 디자인 시스템, 색상 팔레트, Tailwind 설정
- **[components/README.md](06-frontend/components/README.md)** - React 컴포넌트 라이브러리

### 08. 인프라 (Infrastructure) - 클라이언트 전용
- **[deployment-guide.md](08-infrastructure/deployment-guide.md)** - Cloudflare Pages 배포 가이드

### 99. 작업 로그 & 회고 (Logs) - 클라이언트 작업만
- **[work-sessions/](99-logs/work-sessions/)** - 클라이언트 개발 세션 기록
- **[failure-patterns/](99-logs/failure-patterns/)** - 클라이언트 실패 패턴 분석
- **[retrospectives/](99-logs/retrospectives/)** - 클라이언트 팀 회고

### 참조 문서 (다른 프로젝트)
- **[STUDYMATE-SERVER 문서](../../STUDYMATE-SERVER/docs/)** - 백엔드 API, DB, 시스템 아키텍처
- **[API 명세서](../../STUDYMATE-SERVER/docs/04-api/api-reference.md)** - REST API 및 WebSocket
- **[전체 시스템 아키텍처](../../STUDYMATE-SERVER/docs/03-architecture/system-architecture.md)** - 시스템 전체 구조

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