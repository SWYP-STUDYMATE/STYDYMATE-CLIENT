# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing and deployment of the STUDYMATE application.

## Workflows

### 1. Deploy Cloudflare Workers (`deploy-workers.yml`)

Automates the deployment of Cloudflare Workers to staging and production environments.

#### Triggers
- **Push to main**: Deploys to production
- **Push to develop**: Deploys to staging
- **Pull Request**: Deploys to staging for testing
- **Manual dispatch**: Deploy to specific environment with options

#### Environments
- **Staging**: https://api-staging.languagemate.kr
- **Production**: https://api.languagemate.kr

#### Required Secrets

The following secrets must be configured in GitHub repository settings:

| Secret Name | Description | Required For |
|------------|-------------|--------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers deployment permissions | All deployments |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | All deployments |
| `CLOUDFLARE_ZONE_ID` | Zone ID for cache purging | Production only |
| `JWT_SECRET_STAGING` | JWT secret for staging environment | Staging |
| `JWT_SECRET_PRODUCTION` | JWT secret for production environment | Production |
| `INTERNAL_SECRET` | Shared secret for internal service communication | All environments |
| `CF_IMAGES_API_TOKEN` | Cloudflare Images API token | All environments |
| `CF_ACCOUNT_HASH` | Cloudflare account hash for Images | All environments |

#### Workflow Jobs

1. **Lint and Test**
   - Runs ESLint, TypeScript type checking, and unit tests
   - Generates and uploads coverage reports
   - Required for all deployments

2. **Analyze Bundle**
   - Analyzes bundle size after build
   - Helps track size changes over time

3. **Deploy Staging**
   - Deploys to staging environment
   - Runs smoke tests on critical endpoints
   - Updates deployment status in GitHub

4. **Deploy Production**
   - Deploys to production environment
   - Performs comprehensive health checks
   - Clears CDN cache after successful deployment
   - Creates deployment notifications

5. **Post-deployment Monitoring**
   - Monitors production for 5 minutes after deployment
   - Checks health and response times
   - Creates issue if problems detected

6. **Automatic Rollback**
   - Triggers if production deployment fails
   - Automatically rolls back to last successful deployment
   - Creates issue for investigation

### 2. Deploy Frontend (`deploy.yml`)

Handles the deployment of the React frontend application.

### 3. Run Tests (`test.yml`)

Runs comprehensive test suite for the entire application.

## Setting Up Secrets

1. Go to your GitHub repository settings
2. Navigate to Secrets and variables → Actions
3. Add each required secret with appropriate values

### Getting Cloudflare Credentials

1. **API Token**: 
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create token with "Edit Workers" permissions
   
2. **Account ID**:
   - Found in Cloudflare Dashboard → Right sidebar
   
3. **Zone ID**:
   - Go to your domain in Cloudflare Dashboard
   - Found in the right sidebar

## Manual Deployment

To manually trigger a deployment:

1. Go to Actions tab in GitHub
2. Select "Deploy Cloudflare Workers"
3. Click "Run workflow"
4. Choose:
   - Branch to deploy from
   - Target environment (staging/production)
   - Whether to skip tests (not recommended)

## Monitoring Deployments

- Check the Actions tab for deployment status
- Production deployments create GitHub deployment records
- Failed deployments automatically create issues
- Post-deployment monitoring runs for 5 minutes

## Troubleshooting

### Deployment Failures

1. Check the workflow logs in GitHub Actions
2. Verify all secrets are correctly configured
3. Ensure wrangler.toml has correct environment configs
4. Check Cloudflare dashboard for any account issues

### Rollback Procedure

If automatic rollback fails:

1. Manually trigger workflow with previous commit SHA
2. Or use wrangler CLI locally:
   ```bash
   git checkout <previous-sha>
   cd workers
   npm ci
   wrangler deploy --env production
   ```

### Common Issues

- **401 Unauthorized**: Check CLOUDFLARE_API_TOKEN
- **Resource not found**: Verify CLOUDFLARE_ACCOUNT_ID
- **Deployment verification failed**: Check domain/route configuration
- **Post-deployment monitoring fails**: Investigate performance issues

## Best Practices

1. Always test in staging before production
2. Monitor deployments for at least 5 minutes
3. Keep secrets rotated regularly
4. Review bundle size changes
5. Ensure comprehensive test coverage

## Contact

For issues or questions about the deployment pipeline, contact the DevOps team or create an issue in the repository.