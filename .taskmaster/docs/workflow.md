# STUDYMATE 개발 워크플로우 가이드

## 🔄 Git 브랜치 전략 및 작업 절차

### 1. 브랜치 전략
```
main (production) 
  └── develop (staging)
        └── feature/[task-id]-[description]
```

### 2. 표준 작업 절차 (모든 태스크에 적용)

#### Step 1: Taskmaster로 다음 작업 확인
```bash
# 다음 작업 확인
task-master next

# 작업 상세 정보 확인
task-master show <id>

# 작업 시작 상태로 변경
task-master set-status --id=<id> --status=in-progress
```

#### Step 2: 브랜치 생성 및 전환
```bash
# develop 브랜치에서 새 feature 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/task-<id>-<description>

# 예시
git checkout -b feature/task-3-level-test-ui
```

#### Step 3: 개발 작업 수행
```bash
# 코드 구현
# 필요시 subtask 업데이트
task-master update-subtask --id=<id> --prompt="구현 내용 기록"

# 테스트 실행
npm run test
npm run lint
```

#### Step 4: 커밋 및 푸시
```bash
# 변경사항 확인
git status
git diff

# 스테이징 및 커밋
git add .
git commit -m "feat(task-<id>): <description>

- 구현 내용 1
- 구현 내용 2
- 구현 내용 3

Task: #<id>"

# 원격 저장소에 푸시
git push -u origin feature/task-<id>-<description>
```

#### Step 5: Pull Request 생성
```bash
# GitHub CLI 사용
gh pr create \
  --base develop \
  --title "[Task #<id>] <task-title>" \
  --body "## 📋 Task
Task #<id>: <task-title>

## ✅ 구현 내용
- [ ] 구현 항목 1
- [ ] 구현 항목 2
- [ ] 구현 항목 3

## 🧪 테스트
- [ ] 유닛 테스트 통과
- [ ] E2E 테스트 통과
- [ ] 수동 테스트 완료

## 📸 스크린샷
[필요시 스크린샷 추가]"
```

#### Step 6: 머지 및 정리
```bash
# PR 머지 후
git checkout develop
git pull origin develop

# feature 브랜치 삭제
git branch -d feature/task-<id>-<description>
git push origin --delete feature/task-<id>-<description>

# Taskmaster 작업 완료
task-master set-status --id=<id> --status=done
```

## 📝 커밋 메시지 규칙

### 형식
```
<type>(task-<id>): <subject>

<body>

Task: #<id>
```

### Type
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가
- `chore`: 빌드, 패키지 설정

### 예시
```bash
git commit -m "feat(task-3): 레벨 테스트 UI 구현

- ConnectionChecker 컴포넌트 추가
- AudioRecorder 컴포넌트 구현
- CountdownTimer 기능 추가

Task: #3"
```

## 🚀 배포 프로세스

### 개발 환경 (develop → staging)
```bash
# develop 브랜치가 자동으로 staging 환경에 배포됨
git checkout develop
git merge feature/task-<id>-<description>
git push origin develop

# Cloudflare Pages 자동 배포
# URL: https://preview.languagemate.kr
```

### 프로덕션 (main → production)
```bash
# Release PR 생성
gh pr create \
  --base main \
  --head develop \
  --title "Release v<version>" \
  --body "## 🚀 Release Notes\n\n### Features\n- Task #1: ...\n- Task #2: ...\n\n### Bug Fixes\n- Task #3: ..."

# 머지 후 자동 배포
# URL: https://languagemate.kr
```

## 📊 작업 추적

### 일일 작업 시작
```bash
# 1. 작업 목록 확인
task-master list --status=pending

# 2. 다음 작업 선택
task-master next

# 3. 브랜치 생성 및 작업 시작
git checkout -b feature/task-<id>-<description>
task-master set-status --id=<id> --status=in-progress
```

### 작업 진행 중
```bash
# subtask 진행 상황 기록
task-master update-subtask --id=<id>.1 --prompt="구현 완료: <내용>"

# 작업 메모 추가
task-master update-task --id=<id> --prompt="추가 고려사항: <내용>"
```

### 작업 완료
```bash
# PR 머지 후
task-master set-status --id=<id> --status=done

# 다음 작업 확인
task-master next
```

## 🔧 Workers 백엔드 작업

### Workers 프로젝트 구조
```
workers/
├── src/
│   ├── index.ts          # 메인 엔트리
│   ├── routes/           # API 라우트
│   ├── services/         # 비즈니스 로직
│   ├── durable/          # Durable Objects
│   └── utils/            # 유틸리티
├── wrangler.toml         # Cloudflare 설정
└── package.json          # 프로젝트 설정
```

### Workers 개발 명령어
```bash
cd workers

# 개발 서버 실행
npm run dev

# 테스트
npm test

# 스테이징 배포
npm run deploy:staging

# 프로덕션 배포
npm run deploy:production
```

## 📋 체크리스트

### PR 생성 전 체크리스트
- [ ] 코드 린트 통과 (`npm run lint`)
- [ ] 테스트 통과 (`npm test`)
- [ ] 타입 체크 통과 (`npm run typecheck`)
- [ ] Taskmaster 상태 업데이트
- [ ] 커밋 메시지 규칙 준수
- [ ] PR 템플릿 작성

### 머지 전 체크리스트
- [ ] 코드 리뷰 완료
- [ ] CI/CD 파이프라인 통과
- [ ] 스테이징 환경 테스트 완료
- [ ] 문서 업데이트 (필요시)

## 🛠 문제 해결

### 충돌 해결
```bash
# develop 브랜치 최신화
git checkout develop
git pull origin develop

# feature 브랜치로 돌아가서 rebase
git checkout feature/task-<id>-<description>
git rebase develop

# 충돌 해결 후
git add .
git rebase --continue
git push --force-with-lease
```

### Taskmaster 동기화
```bash
# 작업 파일 재생성
task-master generate

# 의존성 검증
task-master validate-dependencies

# 복잡도 분석
task-master analyze-complexity
```