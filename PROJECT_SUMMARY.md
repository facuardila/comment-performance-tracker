# Comment Performance Tracker - Project Summary

## Overview
This is a complete MVP of an internal tool called "Comment Performance Tracker" designed for agencies to track the performance of Instagram comments posted by community managers on third-party accounts, without using client credentials and without relying on official APIs.

## Architecture
- **Frontend**: Next.js App Router + TypeScript
- **Styling**: Tailwind + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Scraper**: Playwright for web scraping
- **Charts**: Recharts for data visualization
- **Import**: xlsx for XLSX processing
- **ORM**: Direct Supabase client

## Database Schema

### tracked_comments
- id: UUID primary key
- source_url: Original URL of the comment/post
- normalized_url: Normalized URL
- platform: Platform (currently only 'instagram')
- post_url: URL of the post
- comment_id: Unique identifier for the comment
- post_id: Unique identifier for the post
- comment_text: Text content of the comment
- comment_author: Author of the comment
- target_account: Account that posted the original content
- published_at: Publication date of the comment
- first_seen_at: When the comment was first added to the tracker
- last_checked_at: Last time metrics were scraped
- current_likes: Current number of likes
- current_replies: Current number of replies
- current_status: Status (pending/active/deleted/not_found/private/error)
- campaign_tag: Campaign identifier
- cm_name: Community manager name
- notes: Additional notes
- created_at: Record creation timestamp
- updated_at: Record update timestamp

### comment_snapshots
- id: UUID primary key
- tracked_comment_id: Reference to tracked_comments
- scraped_at: Timestamp when metrics were scraped
- likes: Number of likes at that time
- replies: Number of replies at that time
- status: Status at that time
- raw_json: Raw scraping result
- response_time_ms: Time taken for scraping
- error_message: Error message if scraping failed

### import_batches
- id: UUID primary key
- file_name: Name of the imported file
- imported_at: Import timestamp
- total_rows: Total rows in the import
- success_rows: Successfully processed rows
- failed_rows: Failed rows

## Features Implemented

### 1. Quick Add (Primary UX)
- `/comments/new` - Ultra-fast form for daily use by CMs
- Fields: URL, CM name, campaign tag, target account, notes
- Very fast workflow: paste URL + submit in 2 seconds
- "Save and add another" button
- Shows recently added comments
- Persists CM name and campaign tag in localStorage
- Toast notifications for success/error

### 2. XLSX Importer (Seed Data)
- `/imports/new` - Upload XLSX files for historical data
- Automatic column detection
- Column mapping capability
- Import batch tracking
- Creates tracked_comments from import

### 3. Instagram Scraper
- `/lib/scrapers/instagram.ts` - Instagram-specific scraping logic
- `/lib/scrapers/index.ts` - Unified scraping interface
- Function: `scrapeCommentMetrics(url, browser)`
- Extracts: date, likes, replies, text, author, target account
- Handles comment URL vs post URL detection
- Implements timeout handling and basic retries
- Supports status states: active, deleted, not_found, private, error

### 4. Refresh & Snapshots
- Individual comment refresh
- Bulk refresh operations
- Updates tracked_comments with new metrics
- Creates historical snapshots
- Tracks engagement evolution over time

### 5. Table View (Database-like)
- `/comments` - Usable database-like interface
- Search, filters, sorting, pagination
- Multi-select and CSV export
- Refresh selected comments
- View comment details

### 6. Comment Detail View
- `/comments/[id]` - Complete comment information
- Metadata, original link, current status
- Timeline charts for likes, replies, engagement
- Historical snapshots table
- Editable notes

### 7. Dashboard
- `/dashboard` - Key performance indicators
- Total comments tracked
- Status distribution (active vs deleted vs not_found)
- Total likes, replies, and engagement accumulated
- Top 10 comments by engagement
- Top 10 target accounts
- Engagement evolution over time
- CM and campaign rankings
- Comments with highest growth velocity

### 8. Extra Analytics Variables
- Comment length calculation
- Emoji count approximation
- Question detection
- CTA detection
- Content classification (short/medium/long, conversational/assertive)
- Growth metrics (absolute and percentage)

### 9. Bookmarklet Generator
- `/tools` - Simple bookmarklet for quick capture
- Captures current page URL
- Pre-fills the Quick Add form

## Technical Implementation Details

### Scraping Limitations
- Instagram's anti-bot measures require careful implementation
- Rate limiting and delays between requests
- Mobile viewport simulation for better content visibility
- Multiple selectors to handle UI changes
- Error handling for various failure scenarios

### Data Persistence
- Supabase PostgreSQL backend
- Real-time updates possible
- Secure API with service role keys
- Proper error handling and validation

### Performance Considerations
- Browser reuse to minimize startup overhead
- Efficient database queries with pagination
- Caching strategies for frequently accessed data
- Asynchronous operations for better UX

## Installation & Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase project and get credentials
4. Create `.env.local` with the required environment variables
5. Run database migrations
6. Start the development server: `npm run dev`

## Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key for client access

## Usage Instructions

### Quick Add Process
1. Go to `/comments/new`
2. Paste the Instagram comment or post URL
3. Enter CM name and campaign tag
4. Click "Save" or "Save and add another"

### Bulk Import
1. Go to `/imports/new`
2. Upload XLSX file with comment URLs
3. Map columns if necessary
4. Process the import

### Monitoring Comments
1. Visit `/comments` to see all tracked comments
2. Use filters and search to find specific items
3. Check the dashboard for overall performance

### Refreshing Data
- Individual refresh: Click refresh button on comment detail
- Bulk refresh: Select multiple comments and use refresh action
- Scheduled refresh: Can be implemented with cron jobs

## Known Limitations

### Scraping Challenges
- Instagram frequently changes UI elements and class names
- Anti-bot measures may block requests
- Mobile-only content may not be accessible
- Private accounts require special handling
- Rate limits may apply

### Scalability Considerations
- Large numbers of comments may impact performance
- Frequent scraping may trigger Instagram's anti-bot systems
- Database costs may increase with large datasets

## Future Enhancements

### Platform Expansion
- TikTok support (architecture prepared)
- Twitter/X support
- Facebook support
- YouTube support

### Advanced Features
- Email notifications for significant changes
- Webhook support for external integrations
- Proxy support for scraping
- Advanced analytics and insights
- Team collaboration features
- Permission management

### Performance Improvements
- Scheduled scraping jobs
- Rate limiting implementation
- More robust error handling
- Performance monitoring

## Conclusion

This MVP provides a complete, working solution for tracking Instagram comment performance. It's designed specifically for agency use cases where community managers need to track the performance of their comments without accessing client credentials. The architecture is extensible to support additional platforms and features as needed.

The core functionality is fully implemented and tested, with proper error handling and a user-friendly interface optimized for daily use by community managers.