# [PATTERN-2025-09-18-CTX7] Context7 web_search 명령 실행 불가

## 📊 발생 빈도
- 발생 횟수: 3회
- 발생 일시: 2025-09-18
- 영향도: Medium (작업 프로토콜 준수 차질)

## 🔍 문제 상황
- 발생 조건: `context7 web_search` 또는 `npx context7 web_search` 명령 실행 시
- 증상: 명령어 미존재 혹은 CLI가 10초 내 응답 없이 타임아웃 발생
- 에러 메시지: `bash: context7: command not found`, `command timed out after 10005 milliseconds`

## 🔧 해결 방법
1. 즉시 대응: Context7 도구 미설치 상태임을 문서화하고, 대체 검증 절차(수동 라이브러리 확인)로 전환
2. 근본 조치: Context7 CLI 설치 경로 및 사용 방법을 문서화하고, 필요 시 패키지 의존성에 추가

## 🛡️ 예방 방법
- `Context7` 사용 가이드 문서화 및 레포 내 위치 공유
- 프로젝트 세팅 스크립트에 Context7 설치 여부 검증 단계 추가
- 도구 미설치 시 대체 절차(예: 수동 라이브러리 목록 검토) 명시

## 📚 관련 자료
- AGENTS.md (프로토콜 규정)
- 작업 로그: 2025-09-18, `context7` 명령 3회 실패 기록
