# Deployment & CI/CD Guide

This guide covers the complete deployment process and CI/CD pipeline for the Recipe Sharing Application.

## Table of Contents

- [Production Deployment](#production-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Setup](#environment-setup)
- [Vercel Configuration](#vercel-configuration)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Dependency Management](#dependency-management)
- [Monitoring & Alerts](#monitoring--alerts)
- [Troubleshooting](#troubleshooting)

## Production Deployment

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Code must be in a GitHub repository
3. **Environment Variables**: Properly configured secrets
4. **Database**: PostgreSQL database (recommended: Neon, Supabase, or PlanetScale)

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/recipe-share)

### Manual Deployment Steps

1. **Connect Repository**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Deploy from project root
   vercel --prod
   ```

2. **Configure Environment Variables**

   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all required variables (see [Environment Setup](#environment-setup))

3. **Database Setup**
   - Ensure your database is accessible from Vercel's regions
   - Run database migrations if needed
   - Test database connectivity

## CI/CD Pipeline

### Overview

Our CI/CD pipeline uses GitHub Actions to provide:

- **Continuous Integration**: Code quality checks, testing, security audits
- **Continuous Deployment**: Automated deployment to production and preview environments
- **Dependency Management**: Automated updates with security checks
- **Issue Management**: Automated labeling and assignment

### Pipeline Stages

```mermaid
graph TD
    A[Push/PR] --> B[Lint & Type Check]
    A --> C[Security Audit]
    A --> D[Build Test]
    B --> E[Unit Tests]
    C --> E
    D --> E
    E --> F{Branch?}
    F -->|main| G[Deploy Production]
    F -->|PR| H[Deploy Preview]
    G --> I[Notify Success]
    H --> I
```

### Workflow Files

- `.github/workflows/ci.yml` - Main CI/CD pipeline
- `.github/workflows/issue-management.yml` - Issue automation
- `.github/workflows/dependabot-auto-merge.yml` - Dependency automation
- `.github/dependabot.yml` - Dependabot configuration

## Environment Setup

### Required Environment Variables

#### Production Variables (Vercel Dashboard)

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# File Upload (UploadThing)
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."

# Webhooks
WEBHOOK_SECRET="whsec_..."

# Security
BACKUP_SECRET="your-secure-backup-secret"
CRON_SECRET="your-secure-cron-secret"

# Monitoring (Sentry)
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="recipe-share"
SENTRY_AUTH_TOKEN="sntrys_..."

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
```

#### GitHub Secrets (Actions)

```bash
# Vercel Deployment
VERCEL_TOKEN="your-vercel-token"
VERCEL_ORG_ID="your-org-id"
VERCEL_PROJECT_ID="your-project-id"

# Code Quality
CODECOV_TOKEN="your-codecov-token"

# Optional: Lighthouse CI
LHCI_GITHUB_APP_TOKEN="your-lighthouse-token"
```

### Setting Up Secrets

#### Vercel Secrets

1. Go to Vercel Dashboard → Settings → Tokens
2. Create a new token with appropriate permissions
3. Add to GitHub repository secrets

#### GitHub Repository Secrets

1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Add each secret individually
3. Ensure secret names match workflow files

## Vercel Configuration

### vercel.json Configuration

Our `vercel.json` includes:

- **Build Command**: `pnpm build`
- **Install Command**: `pnpm install --frozen-lockfile`
- **Framework**: Next.js
- **Regions**: Primary deployment in `iad1` (US East)
- **Functions**: API routes with 30s timeout
- **Headers**: Security headers for all routes
- **Rewrites**: SEO-friendly URLs for sitemap/robots
- **Caching**: Optimized caching for static assets
- **Crons**: Automated database backups

### Custom Domains

1. **Add Domain**: Vercel Dashboard → Project → Settings → Domains
2. **DNS Configuration**: Point your domain to Vercel
3. **SSL**: Automatically handled by Vercel
4. **Environment**: Set production domain in environment variables

## GitHub Actions Workflows

### Main CI/CD Workflow (`.github/workflows/ci.yml`)

**Triggers**: Push to main/develop, Pull requests

**Jobs**:

1. **Lint & Type Check**: ESLint, TypeScript, Prettier
2. **Security Check**: npm audit, dependency review
3. **Build**: Production build test
4. **Unit Tests**: Jest with coverage reporting
5. **Bundle Analysis**: Size analysis for PRs
6. **Deploy Production**: Automatic deployment on main branch
7. **Deploy Preview**: Preview deployments for PRs
8. **Notifications**: Success/failure notifications

### Issue Management Workflow

**Features**:

- Auto-labeling based on issue content
- Auto-assignment to project owner
- Stale issue management
- PR status comments

### Dependency Management

**Dependabot Configuration**:

- Weekly dependency updates
- Grouped updates by ecosystem
- Auto-merge for patch/minor updates
- Manual review for major updates
- Security vulnerability prioritization

## Monitoring & Alerts

### Sentry Integration

- **Error Tracking**: Comprehensive error monitoring
- **Performance Monitoring**: Core Web Vitals tracking
- **Release Tracking**: Deployment monitoring
- **User Context**: Privacy-compliant user tracking

### Analytics

- **Performance Metrics**: Custom performance tracking
- **User Analytics**: Privacy-first analytics
- **Database Health**: Automated health checks
- **Backup Monitoring**: Backup success/failure tracking

### Health Checks

- **API Health**: `/api/database/health` endpoint
- **Database**: Connection pool monitoring
- **Performance**: Response time tracking
- **Storage**: File upload monitoring

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check build locally
npm run build

# Common fixes
rm -rf .next node_modules
npm install
npm run build
```

#### Environment Variable Issues

```bash
# Verify variables are set
vercel env ls

# Add missing variables
vercel env add [NAME] [VALUE] production
```

#### Database Connection Issues

```bash
# Test database connection
curl https://your-app.vercel.app/api/database/health

# Check database URL format
postgresql://user:password@host:port/database?sslmode=require
```

#### CI/CD Pipeline Issues

**Lint Errors**:

```bash
npm run lint:fix
npm run format
```

**Test Failures**:

```bash
npm test
npm run test:watch
```

**Security Vulnerabilities**:

```bash
npm audit fix
```

### Support

- **Vercel Support**: Check Vercel dashboard for deployment logs
- **GitHub Actions**: Check Actions tab for workflow logs
- **Sentry**: Monitor error reports and performance
- **Database**: Check database provider dashboard

### Rollback Procedures

#### Vercel Rollback

1. Go to Vercel Dashboard → Project → Deployments
2. Find previous working deployment
3. Click "Promote to Production"

#### GitHub Rollback

```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main
```

#### Database Rollback

```bash
# Use automated backups
curl -X POST https://your-app.vercel.app/api/database/backup \
  -H "Authorization: Bearer $BACKUP_SECRET"
```

## Performance Optimization

### Build Optimizations

- **Bundle Analysis**: Automatic size monitoring
- **Code Splitting**: Optimized chunk splitting
- **Image Optimization**: Next.js Image component
- **Static Generation**: ISR for dynamic content

### Caching Strategy

- **Static Assets**: 1 year cache with immutable
- **API Routes**: No cache for dynamic content
- **Images**: 1 day cache with revalidation
- **Database**: Connection pooling optimization

### Monitoring

- **Core Web Vitals**: LCP, FID, CLS tracking
- **Performance Budget**: Bundle size limits
- **Lighthouse CI**: Automated performance audits
- **Real User Monitoring**: Sentry performance tracking

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
