#!/bin/bash

# Cloudflare Workers 배포 스크립트
# Usage: ./deploy.sh [dev|production]

ENV=${1:-production}
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Cloudflare Workers 배포 시작 (환경: $ENV)${NC}"

# 1. 빌드 체크
echo -e "\n${YELLOW}📦 TypeScript 빌드 확인...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 빌드 실패! 코드를 확인해주세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 빌드 성공${NC}"

# 2. D1 Database ID 체크 (프로덕션만)
if [ "$ENV" = "production" ]; then
    echo -e "\n${YELLOW}🔍 프로덕션 설정 확인...${NC}"
    if grep -q "REPLACE_WITH_PROD_D1_ID" wrangler.toml; then
        echo -e "${RED}❌ D1 Database ID가 설정되지 않았습니다!${NC}"
        echo "wrangler.toml에서 REPLACE_WITH_PROD_D1_ID를 실제 ID로 변경하세요."
        echo "Cloudflare Dashboard → Workers & Pages → D1 → studymate-prod"
        exit 1
    fi
    echo -e "${GREEN}✅ D1 설정 확인${NC}"
fi

# 3. 배포
echo -e "\n${YELLOW}🚀 Workers 배포 중...${NC}"
if [ "$ENV" = "production" ]; then
    npx wrangler deploy --env production
else
    npx wrangler deploy
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 배포 실패!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 배포 완료!${NC}"

# 4. 배포 확인
if [ "$ENV" = "production" ]; then
    URL="https://api.languagemate.kr"
else
    URL="http://localhost:8787"
fi

echo -e "\n${YELLOW}🔍 헬스체크 진행 중...${NC}"
sleep 3

# Health check
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL/health)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ 서비스 정상 작동 확인!${NC}"
    echo -e "${GREEN}🎉 배포가 성공적으로 완료되었습니다!${NC}"
    echo -e "\n📍 접속 URL: $URL"
else
    echo -e "${RED}⚠️  헬스체크 실패 (HTTP $HEALTH_RESPONSE)${NC}"
    echo "수동으로 확인이 필요합니다: $URL/health"
fi

# 5. 로그 확인 안내
echo -e "\n${YELLOW}💡 실시간 로그 확인:${NC}"
echo "npx wrangler tail --env $ENV"