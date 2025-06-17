# Deployment Guide - Recipe Share

This guide covers deploying the Recipe Share application to Vercel.

## Prerequisites

- Node.js 18+ with pnpm package manager
- GitHub repository
- Vercel account
- Database (Neon/Postgres)
- Clerk account for authentication
- UploadThing account for file uploads

## Environment Variables

### Required Environment Variables

Configure these in your Vercel project settings:

```bash
# Database Configuration (Required)
DATABASE_URL=postgres://username:password@host:port/database?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://username:password@host:port/database?sslmode=require

# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# UploadThing File Upload (Required)
UPLOADTHING_TOKEN=your_uploadthing_token_here
```

### Optional Environment Variables

```bash
# Vercel Cron Security (for scheduled tasks)
CRON_SECRET=your_random_secret_string

# Analytics & Monitoring
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Deployment Steps

### 1. GitHub Repository Setup

1. Push your code to a GitHub repository
2. Ensure all sensitive data is in `.env` (not committed)

### 2. Vercel Project Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install --frozen-lockfile`
   - **Output Directory**: `.next`

### 3. Environment Variables Configuration

1. In Vercel project settings, go to "Environment Variables"
2. Add all required environment variables
3. Set appropriate environments (Production, Preview, Development)

### 4. Domain Configuration

1. Go to "Domains" tab in project settings
2. Add your custom domain (optional)
3. Configure DNS records as shown by Vercel

### 5. Database Setup

1. Ensure your database allows connections from Vercel IPs
2. Test connection using the health check endpoint: `/api/health`

## Vercel Configuration Features

The `vercel.json` file includes:

- **Performance Optimizations**: Caching headers for API routes
- **Security Headers**: XSS protection, content type options, frame options
- **Function Configuration**: Timeout settings for API routes
- **Scheduled Tasks**: Daily cleanup cron job at 2 AM UTC
- **Redirects**: Common URL redirects

## Health Check

Test your deployment:

```bash
curl https://your-domain.vercel.app/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "production",
  "version": "0.1.0",
  "database": "connected",
  "services": {
    "clerk": "configured",
    "uploadthing": "configured",
    "database": "configured"
  }
}
```

## Post-Deployment Checklist

- [ ] Health check endpoint returns 200
- [ ] Authentication works (sign up/sign in)
- [ ] File uploads work
- [ ] Database connections are stable
- [ ] PWA features work (offline mode, installability)
- [ ] Core Web Vitals meet targets
- [ ] All environment variables are configured
- [ ] Custom domain resolves (if configured)
- [ ] SSL certificate is active

## Troubleshooting

### Common Issues

1. **Build Failures**: Check pnpm lockfile and dependencies
2. **Environment Variables**: Verify all required vars are set
3. **Database Connection**: Check connection strings and firewall rules
4. **Authentication Issues**: Verify Clerk configuration and webhooks

### Monitoring

- Use Vercel Analytics for performance monitoring
- Check function logs in Vercel dashboard
- Monitor Core Web Vitals in the application
- Use the health check endpoint for uptime monitoring

## Support

For deployment issues:

- Check Vercel documentation
- Review function logs in Vercel dashboard
- Test locally with production environment variables
