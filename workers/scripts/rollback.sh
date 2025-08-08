#!/bin/bash

# Rollback script for Cloudflare Workers
# Usage: ./scripts/rollback.sh [commit-sha]

set -e

COMMIT_SHA=${1}

if [ -z "$COMMIT_SHA" ]; then
    echo "❌ Error: Commit SHA is required"
    echo "Usage: ./scripts/rollback.sh <commit-sha>"
    echo ""
    echo "Recent commits:"
    git log --oneline -10
    exit 1
fi

echo "🔄 Rolling back to commit: $COMMIT_SHA"

# Check if commit exists
if ! git rev-parse --quiet --verify "$COMMIT_SHA" > /dev/null; then
    echo "❌ Error: Commit $COMMIT_SHA not found"
    exit 1
fi

# Confirm rollback
echo "⚠️  WARNING: This will deploy an older version to production!"
echo "Current commit: $(git rev-parse --short HEAD)"
echo "Target commit: $(git rev-parse --short $COMMIT_SHA)"
echo ""
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback cancelled"
    exit 1
fi

# Checkout the target commit
echo "📦 Checking out commit $COMMIT_SHA..."
git checkout "$COMMIT_SHA"

# Install dependencies for that commit
echo "📦 Installing dependencies..."
cd workers
npm ci

# Deploy
echo "🚀 Deploying..."
npm run deploy:production

# Return to original branch
echo "🔙 Returning to original branch..."
cd ..
git checkout -

echo "✅ Rollback complete!"
echo "🔍 Please verify the deployment:"
echo "curl https://api.studymate.workers.dev/health"