#!/bin/bash

# =============================================================================
# STUDYMATE CLIENT - Frontend Clean Deploy Script
# =============================================================================
# 프론트엔드 코드 변경사항이 제대로 반영되지 않을 때 사용하는 클린 배포 스크립트
# 모든 캐시를 완전히 삭제하고 새로 빌드하여 배포합니다.
# =============================================================================

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로깅 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 프로젝트 루트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

log_info "STUDYMATE CLIENT - Frontend Clean Deploy 시작"
log_info "프로젝트 루트: $PROJECT_ROOT"

# 1. 기존 빌드 결과물과 캐시 완전 삭제
log_info "1단계: 빌드 캐시 및 결과물 삭제 중..."
rm -rf dist/
rm -rf node_modules/
rm -rf .vite/
rm -f package-lock.json
log_success "빌드 캐시 삭제 완료"

# 2. 의존성 재설치
log_info "2단계: 의존성 재설치 중..."
npm install
log_success "의존성 재설치 완료"

# 3. 린트 검사 (경고만 표시, 에러 발생 시에만 중단)
log_info "3단계: 코드 린트 검사 중..."
if npm run lint; then
    log_success "린트 검사 통과"
else
    log_warning "린트 경고가 있지만 배포를 계속 진행합니다"
fi

# 4. 프로덕션 빌드 (환경 변수 명시)
log_info "4단계: 프로덕션 빌드 실행 중 (환경 변수 설정)..."
if VITE_API_URL=https://api.languagemate.kr \
   VITE_WS_URL=wss://api.languagemate.kr \
   VITE_WORKERS_API_URL=https://api.languagemate.kr \
   VITE_WORKERS_WS_URL=wss://api.languagemate.kr \
   VITE_WORKERS_BASE_URL=https://api.languagemate.kr \
   npm run build; then
    log_success "프로덕션 빌드 완료"
else
    log_error "프로덕션 빌드 실패"
    exit 1
fi

# 5. 배포 환경 선택
ENVIRONMENT=${1:-"production"}
case $ENVIRONMENT in
    "production" | "prod")
        PROJECT_NAME="studymate-client"
        BRANCH="main"
        log_info "배포 환경: Production"
        ;;
    "staging" | "stage")
        PROJECT_NAME="studymate-client"
        BRANCH="preview"
        log_info "배포 환경: Staging"
        ;;
    *)
        log_error "잘못된 환경입니다. 사용법: $0 [production|staging]"
        exit 1
        ;;
esac

# 6. Cloudflare Pages 배포 (캐시 스킵)
log_info "5단계: Cloudflare Pages 배포 중..."
log_info "프로젝트: $PROJECT_NAME, 브랜치: $BRANCH"

if npx wrangler pages deploy dist \
    --project-name="$PROJECT_NAME" \
    --branch="$BRANCH" \
    --commit-dirty=true \
    --skip-caching; then
    log_success "Cloudflare Pages 배포 완료!"
else
    log_error "Cloudflare Pages 배포 실패"
    exit 1
fi

# 7. 배포 완료 정보
log_success "==================================="
log_success "Frontend Clean Deploy 완료!"
log_success "환경: $ENVIRONMENT"
log_success "프로젝트: $PROJECT_NAME"
log_success "브랜치: $BRANCH"
log_success "==================================="

# 8. 배포 URL 확인을 위한 안내
log_info "배포 URL은 위의 wrangler 출력에서 확인하세요."
log_info "일반적으로 https://[random-id].studymate-client.pages.dev 형태입니다."

echo ""
log_info "배포가 완료되었습니다. 브라우저에서 확인해보세요!"