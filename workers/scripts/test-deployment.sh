#!/bin/bash

# Deployment Testing Script for STUDYMATE Workers API
# Usage: ./test-deployment.sh <environment>
# Example: ./test-deployment.sh staging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-staging}

# Set API URL based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    API_URL="https://api.languagemate.kr"
elif [ "$ENVIRONMENT" = "staging" ]; then
    API_URL="https://api-staging.languagemate.kr"
else
    API_URL="http://localhost:8787"
fi

echo "🧪 Testing deployment at: $API_URL"
echo "Environment: $ENVIRONMENT"
echo "----------------------------------------"

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} (Status: $response)"
        return 0
    else
        echo -e "${RED}✗${NC} (Expected: $expected_status, Got: $response)"
        return 1
    fi
}

# Function to test endpoint with data
test_endpoint_data() {
    local endpoint=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    response=$(curl -s "$API_URL$endpoint")
    
    if echo "$response" | jq . > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} (Valid JSON)"
        echo "  Response: $(echo "$response" | jq -c .)"
        return 0
    else
        echo -e "${RED}✗${NC} (Invalid response)"
        echo "  Response: $response"
        return 1
    fi
}

# Function to measure response time
test_performance() {
    local endpoint=$1
    local max_time=$2
    local description=$3
    
    echo -n "Testing $description performance... "
    
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$API_URL$endpoint")
    response_time_ms=$(echo "$response_time * 1000" | bc)
    
    if (( $(echo "$response_time < $max_time" | bc -l) )); then
        echo -e "${GREEN}✓${NC} (${response_time_ms}ms)"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} (${response_time_ms}ms - exceeds ${max_time}s limit)"
        return 1
    fi
}

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

# Run tests
echo "🔍 Running endpoint tests..."
echo ""

# Health check
if test_endpoint "/health" "200" "Health endpoint"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# API Status
if test_endpoint_data "/api/status" "API status endpoint"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Version endpoints
if test_endpoint "/api/v1/models" "200" "Models endpoint"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Test 404 handling
if test_endpoint "/api/v1/nonexistent" "404" "404 error handling"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Test CORS preflight
echo -n "Testing CORS preflight... "
cors_response=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
    -H "Origin: https://languagemate.kr" \
    -H "Access-Control-Request-Method: POST" \
    "$API_URL/api/v1/llm/generate")

if [ "$cors_response" = "200" ] || [ "$cors_response" = "204" ]; then
    echo -e "${GREEN}✓${NC} (Status: $cors_response)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} (Status: $cors_response)"
    ((TESTS_FAILED++))
fi

echo ""
echo "⚡ Running performance tests..."
echo ""

# Performance tests
if test_performance "/health" "0.5" "Health endpoint"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

if test_performance "/api/status" "1.0" "API status"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi

# Test Workers AI endpoints (if available)
if [ "$ENVIRONMENT" != "local" ]; then
    echo ""
    echo "🤖 Testing Workers AI endpoints..."
    echo ""
    
    # Test LLM models endpoint
    echo -n "Testing LLM models listing... "
    models_response=$(curl -s "$API_URL/api/v1/llm/models")
    
    if echo "$models_response" | jq -e '.data.available_models' > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        model_count=$(echo "$models_response" | jq '.data.available_models | length')
        echo "  Found $model_count models"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC}"
        ((TESTS_FAILED++))
    fi
fi

# Summary
echo ""
echo "========================================="
echo "📊 Test Summary"
echo "========================================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi