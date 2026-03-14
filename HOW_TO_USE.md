# Comment Performance Tracker - User Guide

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Access to a Supabase project
- Browser with JavaScript enabled

### Initial Setup
1. Clone the repository and navigate to the project directory
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and configure your Supabase credentials
4. Run database migrations: `npx prisma migrate dev`
5. Start the development server: `npm run dev`

## Primary Workflow: Quick Add

The Quick Add interface is the heart of the application, designed for daily use by community managers.

### Step 1: Navigate to Quick Add
- Go to `/comments/new` in your browser
- The interface is optimized for speed and mobile use

### Step 2: Add a Comment
1. Copy the URL of the Instagram comment or post you want to track
2. Paste it into the "URL" field
3. Enter your name in the "CM Name" field (this will be remembered in localStorage)
4. Select or enter a "Campaign Tag" (also remembered in localStorage)
5. Optionally add the target account and any notes
6. Click "Add Comment" or "Add and Create Another"

### Step 3: Verification
- The system will immediately scrape the URL and store the initial metrics
- You'll see a success notification
- The comment will appear in your tracking list

## Importing Historical Data

If you have an XLSX file with historical comment data:

1. Go to `/imports/new`
2. Click "Choose File" and select your XLSX file
3. The system will automatically detect common column names
4. Review the detected mappings (URL, CM Name, Campaign Tag, etc.)
5. Optionally set default values for CM Name and Campaign Tag
6. Click "Import File"
7. Review the import results showing success and error counts

## Managing Comments

### Viewing All Comments
- Navigate to `/comments` to see all tracked comments
- Use the search bar to find specific comments
- Apply filters for campaign, CM, status, etc.
- Sort by clicking column headers
- Select multiple comments for bulk operations

### Comment Details
- Click on any comment to view detailed metrics
- See engagement trends over time
- View all historical snapshots
- Refresh metrics manually if needed

### Bulk Operations
- Select multiple comments using checkboxes
- Use the dropdown to perform bulk actions
- Options include refreshing selected comments

## Dashboard Analytics

The dashboard at `/dashboard` provides an overview of your tracked comments:

- Total comments tracked
- Status breakdown (active, deleted, not found)
- Total engagement metrics
- Top performing comments
- Performance by account, CM, and campaign
- Engagement trend charts

## Using the Bookmarklet

For the fastest capture of Instagram comments:

1. Go to `/tools`
2. Copy the bookmarklet code
3. Create a new bookmark in your browser
4. Name it "Track Instagram Comment"
5. Paste the code in the URL field
6. When browsing Instagram, click the bookmark to quickly capture the current URL
7. This will open the Quick Add page with the URL pre-filled

## Refreshing Metrics

### Manual Refresh
- On the comments list page, select one or more comments
- Use the "Refresh Selected" button
- Or visit a specific comment's detail page and click "Refresh Now"

### Understanding Statuses
- **Active**: Comment is visible and metrics are current
- **Deleted**: Comment is no longer visible on Instagram
- **Not Found**: URL could not be resolved
- **Private**: Content is in a private account
- **Error**: Technical issue during scraping
- **Pending**: New comment awaiting first scrape

## Troubleshooting

### Common Issues
- **Scraping fails**: Instagram may have changed their HTML structure or blocked your IP temporarily
- **Rate limiting**: Avoid rapid consecutive requests to avoid being blocked
- **Invalid URLs**: Ensure you're using valid Instagram comment or post URLs

### Error Messages
- Check the error message in the comment record for specific details
- Most errors are temporary and will resolve on subsequent attempts
- Contact your administrator if issues persist

## Best Practices

- Use consistent campaign tags for better analytics
- Add descriptive notes for context
- Regularly refresh metrics to maintain accuracy
- Use the bookmarklet for fastest capture
- Monitor the status of your tracked comments