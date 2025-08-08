# Workers Deployment Guide

This guide covers the deployment process for the STUDYMATE Cloudflare Workers API.

## Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account with Workers enabled
2. **API Token**: Create an API token with Workers deployment permissions
3. **Node.js**: Version 18+ installed locally
4. **Wrangler CLI**: Installed via `npm install -g wrangler`

## Environment Setup

### 1. Local Development

```bash
cd workers
npm install
npm run dev
```

Access the local API at `http://localhost:8787`

### 2. Environment Variables

Create `.dev.vars` for local development:

```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your values
```

### 3. Secrets Management

Set production secrets using wrangler:

```bash
# JWT Secret
wrangler secret put JWT_SECRET --env production

# Internal Service Secret
wrangler secret put INTERNAL_SECRET --env production

# Cloudflare Images
wrangler secret put CF_IMAGES_API_TOKEN --env production
wrangler secret put CF_ACCOUNT_HASH --env production
```

## Deployment Process

### Automatic Deployment (Recommended)

Deployments are automated via GitHub Actions:

1. **Staging**: Automatically deployed on PR to main/develop
2. **Production**: Automatically deployed on merge to main

### Manual Deployment

#### Deploy to Staging

```bash
cd workers
npm run deploy:staging
```

#### Deploy to Production

```bash
cd workers
npm run deploy:production
```

#### Deploy with Specific Environment

```bash
wrangler deploy --env staging
wrangler deploy --env production
```

## Post-Deployment Verification

### 1. Automated Tests

Run the deployment test script:

```bash
./scripts/test-deployment.sh staging
# or
./scripts/test-deployment.sh production
```

### 2. Manual Verification

Check critical endpoints:

```bash
# Health check
curl https://api.languagemate.kr/health

# API status
curl https://api.languagemate.kr/api/status

# Models endpoint
curl https://api.languagemate.kr/api/v1/models
```

### 3. Monitor Logs

```bash
# Tail production logs
npm run logs

# Tail staging logs
npm run logs:staging
```

## Rollback Procedures

### Automatic Rollback

If production deployment fails, GitHub Actions automatically rolls back to the last successful deployment.

### Manual Rollback

Use the rollback script:

```bash
./scripts/rollback.sh production <commit-sha>
```

Or manually with git and wrangler:

```bash
# Checkout previous version
git checkout <previous-commit-sha>

# Deploy
cd workers
npm ci
npm run deploy:production
```

## Environment Configuration

### Development

- **URL**: http://localhost:8787
- **CORS**: http://localhost:3000
- **Storage**: Local R2 bucket emulation
- **KV**: Local KV namespace emulation

### Staging

- **URL**: https://api-staging.languagemate.kr
- **CORS**: https://preview.languagemate.kr
- **Storage**: studymate-storage-staging
- **KV**: Staging KV namespace

### Production

- **URL**: https://api.languagemate.kr
- **CORS**: https://languagemate.kr
- **Storage**: studymate-storage-production
- **KV**: Production KV namespace

## Monitoring and Alerts

### 1. Cloudflare Analytics

Monitor via Cloudflare Dashboard:
- Request volume
- Error rates
- Performance metrics
- Worker execution time

### 2. GitHub Actions

Monitor deployment status:
- Check Actions tab for deployment logs
- Review deployment status in PR comments
- Check created issues for failures

### 3. Health Monitoring

Set up external monitoring for:
- `GET /health` - Should return 200
- `GET /api/status` - Should return API metadata

## Troubleshooting

### Common Issues

#### 1. Deployment Fails with 401

**Cause**: Invalid or expired API token

**Solution**: 
```bash
# Update GitHub secret
CLOUDFLARE_API_TOKEN with new token
```

#### 2. Route Not Found After Deployment

**Cause**: Route configuration issue

**Solution**: Check wrangler.toml routes configuration

#### 3. CORS Errors

**Cause**: Origin not whitelisted

**Solution**: Update CORS_ORIGIN in wrangler.toml

#### 4. KV/R2 Access Issues

**Cause**: Binding not configured

**Solution**: Verify namespace IDs in wrangler.toml

### Debug Commands

```bash
# Check deployment status
wrangler deployments list

# View real-time logs
wrangler tail

# Check secret values (names only)
wrangler secret list --env production

# Validate configuration
wrangler deploy --dry-run --env production
```

## Best Practices

1. **Always test in staging first**
2. **Monitor for 5-10 minutes after deployment**
3. **Keep secrets in GitHub Secrets, never in code**
4. **Use semantic versioning for releases**
5. **Document any manual changes**
6. **Review bundle size before deploying**

## CI/CD Pipeline

The deployment pipeline includes:

1. **Linting**: ESLint checks
2. **Type Checking**: TypeScript validation
3. **Unit Tests**: Vitest test suite
4. **Bundle Analysis**: Size checking
5. **Deployment**: Wrangler deploy
6. **Verification**: Health checks
7. **Monitoring**: 5-minute post-deploy check
8. **Rollback**: Automatic on failure

## Security Considerations

1. **API Tokens**: Rotate every 90 days
2. **Secrets**: Never commit to repository
3. **CORS**: Whitelist only trusted origins
4. **Rate Limiting**: Configured per route
5. **Authentication**: JWT with short expiry

## Performance Optimization

1. **Cache Headers**: Set appropriately
2. **KV Cache**: Use for frequent data
3. **Bundle Size**: Keep under 1MB
4. **Cold Starts**: Minimize dependencies
5. **Routes**: Use specific patterns

## Contact

For deployment issues:
1. Check this documentation
2. Review GitHub Actions logs
3. Contact DevOps team
4. Create issue with deployment tag