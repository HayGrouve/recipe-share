# Environment Setup for RecipeShare

This document outlines the required environment variables for the RecipeShare application.

## Required Environment Variables

Create a `.env.local` file in the root of the recipe-share project with the following variables:

### Clerk Authentication

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
CLERK_SECRET_KEY=sk_test_your-secret-key-here
```

### Database Connection

```bash
DATABASE_URL=your-vercel-postgres-connection-string-here
```

### Optional: Clerk Webhook (for user sync)

```bash
CLERK_WEBHOOK_SECRET=whsec_your-webhook-secret-here
```

## Getting Clerk Keys

1. **Sign up for Clerk**: Go to [clerk.com](https://clerk.com) and create an account
2. **Create a new application**: Choose "Next.js" as your framework
3. **Get your keys**:
   - Publishable Key: Found in the "API Keys" section (starts with `pk_test_`)
   - Secret Key: Found in the "API Keys" section (starts with `sk_test_`)
4. **Configure authentication methods**: Enable Email/Password and social providers (Google, GitHub) in the Clerk dashboard

## Getting Database URL

1. **Vercel Postgres**: If using Vercel Postgres, get the connection string from your Vercel dashboard
2. **Format**: `postgresql://username:password@host:port/database?sslmode=require`

## Security Notes

- Never commit `.env.local` to version control
- The `.env.local` file is already included in `.gitignore`
- Use different keys for development and production environments
- Rotate keys regularly for security

## Next Steps

After setting up the environment variables:

1. Restart your development server: `npm run dev`
2. Test the Clerk authentication flow
3. Verify database connection works
