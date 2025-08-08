# Cloudflare Workers Deployment Guide

This guide explains how to deploy the STUDYMATE Workers backend.

## Prerequisites

1. **Cloudflare Account**: Create a free account at [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Cloudflare API Token**: Generate from your account settings with Workers permissions
3. **Node.js**: Version 18.0.0 or higher
4. **GitHub Repository**: With Actions enabled

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Run tests
npm run test
```

## Environment Configuration

### 1. Cloudflare Dashboard Setup

1. Create a new Workers project
2. Create R2 bucket: `studymate-storage`
3. Create KV namespace: `studymate-cache`
4. Enable Durable Objects in your account
5. Note down all the IDs for configuration

### 2. Update wrangler.toml

Replace placeholder IDs in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-actual-kv-namespace-id"  # Replace this

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "studymate-storage"  # Your R2 bucket name
```

### 3. GitHub Secrets

Add these secrets to your GitHub repository:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

## Deployment Process

### Automatic Deployment (Recommended)

The project uses GitHub Actions for automatic deployment:

1. **Pull Request**: Deploys to staging environment
2. **Merge to main**: Deploys to production

```yaml
# Triggers:
- Push to main branch (production)
- Pull request (staging)
- Manual workflow dispatch
```

### Manual Deployment

```bash
# Deploy to production
npm run deploy

# Deploy to staging
npm run deploy:staging

# View logs
npm run logs

# View staging logs
npm run logs:staging
```

## Environments

### Staging
- URL: `https://staging.studymate-api.workers.dev`
- Used for: Testing new features
- Deployed on: Pull requests

### Production
- URL: `https://api.studymate.workers.dev`
- Used for: Live application
- Deployed on: Merge to main

## Monitoring & Debugging

### View Logs
```bash
# Real-time logs
wrangler tail

# Staging logs
wrangler tail --env staging
```

### Cloudflare Dashboard
- Analytics: View request metrics
- Workers: Monitor performance
- R2: Check storage usage
- KV: Inspect cached data

## Rollback Process

If issues occur in production:

1. **Quick Rollback**: Run the rollback workflow in GitHub Actions
2. **Manual Rollback**: 
   ```bash
   git checkout <previous-commit>
   npm run deploy
   ```

## Secrets Management

### Required Secrets

| Secret                 | Description              | Where to Use         |
| ---------------------- | ------------------------ | -------------------- |
| `CLOUDFLARE_API_TOKEN` | API token for deployment | GitHub Actions       |
| `OPENAI_API_KEY`       | OpenAI API key           | Cloudflare dashboard |
| `ANTHROPIC_API_KEY`    | Claude API key           | Cloudflare dashboard |
| `PERPLEXITY_API_KEY`   | Perplexity API key       | Cloudflare dashboard |

### Adding Secrets

1. **GitHub Actions**: Settings → Secrets → Actions
2. **Cloudflare Workers**: Dashboard → Workers → Settings → Variables

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check API token permissions
   - Verify account ID is correct
   - Ensure KV/R2 bindings exist

2. **Runtime Errors**
   - Check logs: `wrangler tail`
   - Verify environment variables
   - Check Durable Objects configuration

3. **CORS Issues**
   - Update `CORS_ORIGIN` in wrangler.toml
   - Check request headers

### Debug Commands

```bash
# Check configuration
wrangler whoami

# Validate wrangler.toml
wrangler deploy --dry-run

# Test specific route
curl https://api.studymate.workers.dev/health
```

## Best Practices

1. **Always test in staging first**
2. **Monitor logs after deployment**
3. **Keep secrets secure and rotated**
4. **Use environment-specific configurations**
5. **Document any manual changes**

## Support

- Cloudflare Docs: [developers.cloudflare.com](https://developers.cloudflare.com)
- Workers Discord: [discord.gg/cloudflaredev](https://discord.gg/cloudflaredev)
- GitHub Issues: Report bugs in the repository