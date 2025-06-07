# Database Setup Guide for RecipeShare

This guide will help you set up the PostgreSQL database for the RecipeShare application in different environments.

## Database Schema Overview

Our application uses a comprehensive database schema with the following key models:

- **Users**: Integrated with Clerk authentication
- **Recipes**: Core recipe data with rich content support
- **Ingredients & Instructions**: Recipe components
- **Categories & Tags**: Organization and discovery
- **Ratings & Comments**: User interactions
- **Collections**: User-curated recipe lists
- **Nutrition**: Nutritional information
- **Social Features**: Following and recipe sharing

## Environment Setup Options

### Option 1: Vercel Postgres (Recommended for Production)

1. **Create a Vercel Postgres Database**:

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to Storage > Create Database > Postgres
   - Follow the setup wizard

2. **Get Connection String**:
   - Copy the `DATABASE_URL` from your Vercel dashboard
   - Update your `.env` file:
   ```env
   DATABASE_URL="your-vercel-postgres-connection-string"
   ```

### Option 2: Neon (Alternative Cloud PostgreSQL)

1. **Create a Neon Account**:

   - Sign up at [Neon.tech](https://neon.tech)
   - Create a new project

2. **Configure Connection**:
   ```env
   DATABASE_URL="postgresql://username:password@endpoint/database?sslmode=require"
   ```

### Option 3: Local Development with Docker

1. **Install Docker**:

   - Download and install Docker Desktop

2. **Create docker-compose.yml**:

   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: password
         POSTGRES_DB: recipeshare
       ports:
         - '5432:5432'
       volumes:
         - postgres_data:/var/lib/postgresql/data

   volumes:
     postgres_data:
   ```

3. **Start PostgreSQL**:

   ```bash
   docker-compose up -d
   ```

4. **Update .env**:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/recipeshare"
   ```

### Option 4: Local PostgreSQL Installation

1. **Install PostgreSQL**:

   - Download from [PostgreSQL.org](https://www.postgresql.org/download/)
   - Follow installation instructions for your OS

2. **Create Database**:

   ```sql
   CREATE DATABASE recipeshare;
   CREATE USER recipeshare_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE recipeshare TO recipeshare_user;
   ```

3. **Update .env**:
   ```env
   DATABASE_URL="postgresql://recipeshare_user:your_password@localhost:5432/recipeshare"
   ```

## Running Migrations and Seeding

Once you have your database set up:

### 1. Generate Prisma Client

```bash
npm run db:generate
```

### 2. Run Database Migrations

```bash
npm run db:migrate
```

### 3. Seed the Database (Optional)

```bash
npm run db:seed
```

This will populate your database with:

- 5 recipe categories (Appetizers, Main Courses, Desserts, Beverages, Salads)
- 8 tags (Vegetarian, Vegan, Gluten-Free, Quick, Healthy, etc.)
- 10 common ingredients
- 1 sample user
- 1 complete sample recipe with all details

### 4. Open Prisma Studio (Optional)

```bash
npm run db:studio
```

This opens a web interface to browse and edit your database data.

## Environment Variables

Create or update your `.env` file with the following:

```env
# Database
DATABASE_URL="your-database-connection-string"

# Add other environment variables as needed
# CLERK_SECRET_KEY="your-clerk-secret"
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
```

## Available Scripts

```bash
# Generate Prisma client
npm run db:generate

# Create and run migrations
npm run db:migrate

# Run seed data
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database (careful!)
npm run db:reset
```

## Production Deployment

For production on Vercel:

1. Set up Vercel Postgres database
2. Add `DATABASE_URL` to your Vercel environment variables
3. Prisma will automatically run migrations during build

## Troubleshooting

### Common Issues

1. **Connection Refused**:

   - Ensure your database server is running
   - Check the connection string format
   - Verify network connectivity

2. **Authentication Failed**:

   - Double-check username and password
   - Ensure user has proper permissions

3. **SSL Issues**:

   - For cloud databases, ensure `?sslmode=require` is in your connection string
   - For local development, you might need `?sslmode=disable`

4. **Migration Conflicts**:
   - Run `npm run db:reset` to start fresh (destroys data!)
   - Or manually resolve conflicts in migration files

### Getting Help

- Check the [Prisma documentation](https://www.prisma.io/docs/)
- Review Vercel Postgres documentation
- Check our project README for additional setup instructions

---

**Note**: Remember to never commit your `.env` file with real credentials to version control. Use `.env.example` for sharing configuration templates.
