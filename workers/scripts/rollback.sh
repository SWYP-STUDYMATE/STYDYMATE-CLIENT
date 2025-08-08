#!/bin/bash

# Manual Rollback Script for STUDYMATE Workers API
# Usage: ./rollback.sh <environment> <commit-sha>
# Example: ./rollback.sh production abc123f

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check parameters
if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Missing parameters${NC}"
    echo "Usage: $0 <environment> <commit-sha>"
    echo "Example: $0 production abc123f"
    exit 1
fi

ENVIRONMENT=$1
COMMIT_SHA=$2

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}Error: Invalid environment${NC}"
    echo "Environment must be 'staging' or 'production'"
    exit 1
fi

# Set API URL for verification
if [ "$ENVIRONMENT" = "production" ]; then
    API_URL="https://api.languagemate.kr"
else
    API_URL="https://api-staging.languagemate.kr"
fi

echo -e "${BLUE}🔄 Rollback Configuration${NC}"
echo "Environment: $ENVIRONMENT"
echo "Target commit: $COMMIT_SHA"
echo "API URL: $API_URL"
echo "----------------------------------------"

# Confirm rollback
echo -e "${YELLOW}⚠️  Warning: This will rollback the $ENVIRONMENT environment${NC}"
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled"
    exit 1
fi

# Get current directory
ORIGINAL_DIR=$(pwd)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
WORKERS_DIR="$PROJECT_ROOT/workers"

# Change to project root
cd "$PROJECT_ROOT"

echo ""
echo "📋 Pre-rollback checks..."

# Check if commit exists
if ! git rev-parse "$COMMIT_SHA" >/dev/null 2>&1; then
    echo -e "${RED}Error: Commit $COMMIT_SHA not found${NC}"
    exit 1
fi

# Show commit info
echo ""
echo "Target commit information:"
git log --oneline -n 1 "$COMMIT_SHA"

# Get current health status
echo ""
echo "Current deployment health:"
current_health=$(curl -s "$API_URL/health" | jq -r '.status' 2>/dev/null || echo "unknown")
echo "Status: $current_health"

# Stash any local changes
echo ""
echo "💾 Stashing local changes..."
git stash push -m "Rollback stash $(date +%Y%m%d_%H%M%S)"

# Checkout target commit
echo ""
echo "🔀 Checking out commit $COMMIT_SHA..."
git checkout "$COMMIT_SHA"

# Change to workers directory
cd "$WORKERS_DIR"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo ""
echo "🧪 Running tests..."
npm test || {
    echo -e "${YELLOW}⚠️  Tests failed, but continuing with rollback${NC}"
}

# Deploy
echo ""
echo "🚀 Deploying to $ENVIRONMENT..."

if [ "$ENVIRONMENT" = "production" ]; then
    npm run deploy:production
else
    npm run deploy:staging
fi

# Wait for deployment to propagate
echo ""
echo "⏳ Waiting for deployment to propagate..."
sleep 15

# Verify deployment
echo ""
echo "✅ Verifying rollback..."

# Test deployment
"$SCRIPT_DIR/test-deployment.sh" "$ENVIRONMENT" || {
    echo -e "${RED}❌ Deployment verification failed!${NC}"
    echo "The rollback may have succeeded, but verification tests failed."
    echo "Please check the deployment manually."
}

# Return to original directory
cd "$ORIGINAL_DIR"

# Create rollback record
echo ""
echo "📝 Creating rollback record..."

ROLLBACK_LOG="$PROJECT_ROOT/.rollback-history.log"
echo "[$(date +"%Y-%m-%d %H:%M:%S")] Rolled back $ENVIRONMENT to $COMMIT_SHA" >> "$ROLLBACK_LOG"

echo ""
echo -e "${GREEN}✅ Rollback completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify the application is working correctly"
echo "2. Create an issue to track the problem that caused the rollback"
echo "3. Fix the issue in a new branch"
echo "4. Test thoroughly before deploying again"
echo ""
echo "To return to the main branch:"
echo "  git checkout main"
echo "  git stash pop  # (if you had local changes)"