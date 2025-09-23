#!/bin/bash

# =============================================================================
# STUDYMATE CLIENT - Worker Clean Deploy Script
# =============================================================================
# Cloudflare Workers 코드 변경사항이 제대로 반영되지 않을 때 사용하는 클린 배포 스크립트
# Worker 코드를 완전히 새로 빌드하여 배포합니다.
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

log_info "STUDYMATE CLIENT - Worker Clean Deploy 시작"
log_info "프로젝트 루트: $PROJECT_ROOT"

# Worker 디렉토리 확인
if [ -d "workers" ]; then
    log_info "Workers 디렉토리 발견"
    cd workers
    WORKER_DIR="$PROJECT_ROOT/workers"
elif [ ! -f "worker.js" ] && [ ! -f "src/worker.js" ]; then
    log_warning "Worker 파일을 찾을 수 없습니다. 일반적인 위치를 확인하세요:"
    log_warning "  - worker.js"
    log_warning "  - src/worker.js"
    log_warning "  - workers/ 디렉토리"
    log_warning "Worker 배포를 건너뛰고 계속 진행합니다."
    exit 0
else
    WORKER_DIR="$PROJECT_ROOT"
fi

# 1. Worker 빌드 캐시 삭제
log_info "1단계: Worker 빌드 캐시 삭제 중..."
rm -rf .wrangler/
rm -rf dist-worker/
rm -rf build/
log_success "Worker 빌드 캐시 삭제 완료"

# 2. 배포 환경 선택
ENVIRONMENT=${1:-"production"}
case $ENVIRONMENT in
    "production" | "prod")
        WORKER_NAME="studymate-api-worker"
        ENV="production"
        log_info "배포 환경: Production"
        ;;
    "staging" | "stage")
        WORKER_NAME="studymate-api-worker-staging"
        ENV="staging"
        log_info "배포 환경: Staging"
        ;;
    *)
        log_error "잘못된 환경입니다. 사용법: $0 [production|staging]"
        exit 1
        ;;
esac

# 3. wrangler.toml 파일 확인
if [ ! -f "wrangler.toml" ]; then
    log_error "wrangler.toml 파일을 찾을 수 없습니다."
    log_error "Worker 배포를 위해서는 wrangler.toml 파일이 필요합니다."
    exit 1
fi

# 4. Worker 린트 검사 (있는 경우)
if grep -q "lint" package.json 2>/dev/null; then
    log_info "3단계: Worker 코드 린트 검사 중..."
    if npm run lint; then
        log_success "린트 검사 통과"
    else
        log_warning "린트 경고가 있지만 배포를 계속 진행합니다"
    fi
fi

# 5. Worker 빌드 (있는 경우)
if grep -q "build:worker" package.json 2>/dev/null; then
    log_info "4단계: Worker 빌드 실행 중..."
    if npm run build:worker; then
        log_success "Worker 빌드 완료"
    else
        log_error "Worker 빌드 실패"
        exit 1
    fi
fi

# 6. Cloudflare Workers 배포
log_info "5단계: Cloudflare Workers 배포 중..."
log_info "Worker 이름: $WORKER_NAME"
log_info "환경: $ENV"

# wrangler 명령어 실행
if [ "$ENV" = "production" ]; then
    if npx wrangler deploy --name "$WORKER_NAME"; then
        log_success "Cloudflare Workers 배포 완료!"
    else
        log_error "Cloudflare Workers 배포 실패"
        exit 1
    fi
else
    if npx wrangler deploy --name "$WORKER_NAME" --env "$ENV"; then
        log_success "Cloudflare Workers 배포 완료!"
    else
        log_error "Cloudflare Workers 배포 실패"
        exit 1
    fi
fi

# 7. 배포 완료 정보
log_success "==================================="
log_success "Worker Clean Deploy 완료!"
log_success "환경: $ENVIRONMENT"
log_success "Worker 이름: $WORKER_NAME"
log_success "==================================="

# 8. Worker URL 안내
log_info "Worker URL은 위의 wrangler 출력에서 확인하세요."
if [ "$ENV" = "production" ]; then
    log_info "일반적으로 https://$WORKER_NAME.workers.dev 형태입니다."
else
    log_info "일반적으로 https://$ENV.$WORKER_NAME.workers.dev 형태입니다."
fi

echo ""
log_info "Worker 배포가 완료되었습니다!"