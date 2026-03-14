# Comment Performance Tracker

An internal tool for agencies to track the performance of Instagram comments posted by community managers on third-party accounts, without using client credentials and without depending on official APIs.

## Features

- **Quick Add**: Ultra-fast interface for daily use by community managers
- **Instagram Scraping**: Extracts public metrics without API credentials
- **Historical Tracking**: Saves snapshots of comment performance over time
- **Dashboard**: Visual analytics and KPIs
- **XLSX Import**: Seed historical data from spreadsheets
- **Bookmarklet**: Quick capture from Instagram web interface
- **Database View**: Usable table view with filters and search

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind + shadcn/ui
- Supabase (Postgres)
- Playwright for scraping
- Recharts for graphs
- xlsx for importer
- Prisma for database operations

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd comment-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. Initialize the database:
```bash
npm run db:init
# or run the SQL migrations manually
```

## Database Setup

The application uses the following tables:

### tracked_comments
- id: UUID primary key
- source_url: Original URL of the comment/post
- normalized_url: Normalized URL
- platform: Platform name (currently 'instagram')
- post_url: URL of the post
- comment_id: Unique identifier for the comment
- post_id: Unique identifier for the post
- comment_text: Text content of the comment
- comment_author: Author of the comment
- target_account: Account being commented on
- published_at: When the comment was published
- first_seen_at: When we first tracked this comment
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
- scraped_at: Timestamp when metrics were captured
- likes: Number of likes at that time
- replies: Number of replies at that time
- status: Status at that time
- raw_json: Raw scraped data (optional)
- response_time_ms: How long scraping took
- error_message: Error details if scraping failed

### import_batches
- id: UUID primary key
- file_name: Name of the imported file
- imported_at: When the import happened
- total_rows: Total rows in the file
- success_rows: Successfully processed rows
- failed_rows: Failed rows

## Usage

### Quick Add (Primary UX)

1. Navigate to `/comments/new`
2. Paste the Instagram comment or post URL
3. Fill in CM name and campaign tag (these will be remembered in localStorage)
4. Click "Save and Add Another" to quickly add multiple comments

This is the heart of the product - designed for speed and usability on both desktop and mobile.

### Import Historical Data

1. Go to `/imports/new`
2. Upload your XLSX file with historical comment data
3. The system will automatically detect columns and map them appropriately
4. You can override default CM name and campaign tag if needed

### Dashboard

View at `/dashboard` to see:
- Total comments tracked
- Status breakdown (active vs deleted vs not_found)
- Total engagement metrics
- Top performing comments
- Performance by account, CM, and campaign

### Individual Comment Details

Each comment has a detail page at `/comments/[id]` showing:
- Full metadata
- Engagement timeline
- Historical snapshots
- Refresh button to update metrics

### Bookmarklet

1. Visit `/tools`
2. Copy the bookmarklet code
3. Create a new bookmark in your browser
4. Name it "Track Instagram Comment"
5. Paste the code in the URL field
6. When browsing Instagram, click the bookmark to quickly capture the current URL

## Limitations Known

### Scraping Limitations

- Instagram has anti-bot measures that may temporarily block requests
- Metrics are only as accurate as what's publicly visible
- Comment-specific links work better than post links (when available)
- Scraping may fail if Instagram changes their HTML structure
- Rate limiting should be respected to avoid IP blocking

### Maintenance Requirements

- DOM selectors may need updating when Instagram changes their UI
- Monitor scraping success rates and adjust selectors as needed
- Regular cleanup of old snapshots may be necessary

## Development

To run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture Notes

- `/lib/scrapers/`: Modular scraping architecture ready for additional platforms
- `/lib/db/`: Database operations layer
- `/app/api/`: API routes for core functionality
- `/types/`: Shared TypeScript interfaces
- `/components/`: Reusable UI components

## Future Enhancements

- TikTok support (architecture prepared)
- Advanced analytics and insights
- Automated refresh scheduling
- Export functionality
- Team collaboration features