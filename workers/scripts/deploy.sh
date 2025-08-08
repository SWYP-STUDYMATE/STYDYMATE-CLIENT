#!/bin/bash

# Deployment script for Cloudflare Workers
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Deploying to $ENVIRONMENT..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check authentication
echo "🔐 Checking Cloudflare authentication..."
wrangler whoami || {
    echo "❌ Not authenticated. Please run 'wrangler login' first."
    exit 1
}

# Run type checking
echo "📝 Running type check..."
npm run typecheck || {
    echo "❌ Type checking failed. Please fix TypeScript errors."
    exit 1
}

# Run linting
echo "🧹 Running linter..."
npm run lint || {
    echo "⚠️  Linting failed. Continuing anyway..."
}

# Deploy based on environment
case $ENVIRONMENT in
    "production")
        echo "🏭 Deploying to production..."
        npm run deploy:production
        DEPLOY_URL="https://api.studymate.workers.dev"
        ;;
    "staging")
        echo "🧪 Deploying to staging..."
        npm run deploy:staging
        DEPLOY_URL="https://staging.studymate-api.workers.dev"
        ;;
    *)
        echo "❌ Unknown environment: $ENVIRONMENT"
        echo "Usage: ./scripts/deploy.sh [production|staging]"
        exit 1
        ;;
esac

# Verify deployment
echo "✅ Deployment complete!"
echo "🔍 Verifying deployment..."

sleep 5

# Check health endpoint
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/health")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Health check passed!"
    echo "🎉 Deployment successful: $DEPLOY_URL"
else
    echo "❌ Health check failed with status code: $HTTP_CODE"
    echo "Please check the logs: npm run logs"
    exit 1
fi

# Show recent logs
echo "📋 Recent logs:"
npm run logs | head -20