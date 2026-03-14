# Comment Performance Tracker - Deployment Guide

## Prerequisites

Before deploying the Comment Performance Tracker, ensure you have:

- Node.js 18+ runtime environment
- Access to a Supabase project with PostgreSQL database
- Domain name (if applicable)
- SSL certificate (if serving over HTTPS)

## Environment Configuration

### Supabase Setup

1. Create a new Supabase project at [supabase.io](https://supabase.io)
2. Note down the following credentials from your project settings:
   - Project URL
   - Anonymous key (anon key)
   - Service role key

3. In your Supabase dashboard, run the following SQL to create the required tables:

```sql
-- Create tracked_comments table
CREATE TABLE tracked_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  normalized_url TEXT,
  platform TEXT NOT NULL DEFAULT 'instagram',
  post_url TEXT,
  comment_id TEXT,
  post_id TEXT,
  comment_text TEXT,
  comment_author TEXT,
  target_account TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  current_likes INTEGER DEFAULT 0,
  current_replies INTEGER DEFAULT 0,
  current_status TEXT DEFAULT 'pending',
  campaign_tag TEXT,
  cm_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create comment_snapshots table
CREATE TABLE comment_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracked_comment_id UUID REFERENCES tracked_comments(id) ON DELETE CASCADE,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  raw_json JSONB,
  response_time_ms INTEGER,
  error_message TEXT
);

-- Create import_batches table
CREATE TABLE import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  total_rows INTEGER NOT NULL,
  success_rows INTEGER NOT NULL,
  failed_rows INTEGER NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_tracked_comments_platform_status ON tracked_comments(platform, current_status);
CREATE INDEX idx_tracked_comments_campaign ON tracked_comments(campaign_tag);
CREATE INDEX idx_tracked_comments_cm ON tracked_comments(cm_name);
CREATE INDEX idx_tracked_comments_last_checked ON tracked_comments(last_checked_at);
CREATE INDEX idx_comment_snapshots_comment_id ON comment_snapshots(tracked_comment_id);
CREATE INDEX idx_comment_snapshots_scraped_at ON comment_snapshots(scraped_at DESC);
```

### Environment Variables

Create a `.env.production` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Connection (if using direct connection)
DIRECT_URL=postgresql://username:password@host:port/database

# Application Configuration
NODE_ENV=production

# Playwright Configuration (if running in headless environment)
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

## Build Process

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Build the Application

```bash
npm run build
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install the Vercel CLI:
```bash
npm i -g vercel
```

2. Link your project:
```bash
vercel link
```

3. Deploy:
```bash
vercel --prod
```

4. Configure environment variables in the Vercel dashboard under Settings > Environment Variables

### Option 2: Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t comment-tracker .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=... -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... -e SUPABASE_SERVICE_ROLE_KEY=... comment-tracker
```

### Option 3: Traditional Server Deployment

1. Build the application:
```bash
npm run build
```

2. Transfer the build files to your server

3. Set environment variables:
```bash
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Start the application:
```bash
npm start
```

## Post-Deployment Steps

### 1. Run Database Migrations

After deployment, run the database migrations:

```bash
npx prisma migrate deploy
```

### 2. Verify Scraping Capabilities

Test that the Playwright scraper works in your production environment:

1. Visit your deployed application
2. Try adding a test Instagram URL
3. Verify that metrics are scraped correctly

### 3. Set Up Monitoring

Consider setting up monitoring for:

- Application uptime
- Database connection health
- Scraping success rates
- Error logging

## Scaling Considerations

### Database Scaling

As your comment volume grows:

- Monitor database performance
- Consider adding additional indexes based on query patterns
- Plan for archiving old snapshots if needed

### Scraping Limits

To handle increased scraping load:

- Implement rate limiting to respect Instagram's terms
- Consider using proxy rotation if needed
- Plan for distributed scraping if volume increases significantly

### Caching Strategy

For improved performance:

- Cache static assets appropriately
- Consider implementing Redis for session management if needed
- Optimize database queries with proper indexing

## Security Considerations

### Environment Variables

- Never commit sensitive keys to version control
- Use environment variables for all credentials
- Rotate keys periodically

### Input Validation

- The application validates URLs and sanitizes inputs
- Monitor for any unusual activity patterns

### Database Security

- Use proper database permissions
- Enable SSL connections to the database
- Regularly backup your database

## Maintenance Tasks

### Regular Maintenance

- Monitor scraping success rates
- Clean up old snapshots periodically if needed
- Update dependencies regularly
- Monitor for changes in Instagram's HTML structure

### Backup Strategy

- Regular database backups
- Version control for application code
- Document environment configurations

## Troubleshooting

### Common Issues

#### Scraping Failures
- Check if Instagram has updated their HTML structure
- Verify Playwright is properly configured in production
- Monitor for rate limiting

#### Database Connection Issues
- Verify environment variables are set correctly
- Check firewall rules if applicable
- Ensure database connection pooling is configured properly

#### Performance Issues
- Review database indexes
- Check for N+1 query problems
- Monitor server resources

### Logs and Monitoring

Enable logging in your production environment to track:

- API request/response cycles
- Database query performance
- Scraping success/failure rates
- Error occurrences

## Rollback Plan

In case of deployment issues:

1. Keep previous versions accessible
2. Have database migration rollback procedures ready
3. Monitor application health after deployment
4. Prepare quick rollback commands/scripts