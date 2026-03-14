# Comment Performance Tracker - Development Tasks

## Completed Tasks ✅

### Phase 1: Architecture & DB
- [x] Propose technical architecture
- [x] Design database schema
- [x] Explain Instagram scraping limitations
- [x] Create tracked_comments table
- [x] Create comment_snapshots table
- [x] Create import_batches table
- [x] Set up Supabase integration

### Phase 2: Quick Add (Main UX)
- [x] Create /comments/new page
- [x] Implement URL input form
- [x] Add CM name field
- [x] Add campaign tag field
- [x] Add target account field
- [x] Add notes field
- [x] Implement quick save functionality
- [x] Add "Save and add another" button
- [x] Show recent comments
- [x] Implement localStorage persistence for CM name and campaign tag
- [x] Add toast notifications

### Phase 3: XLSX Importer (Seed Only)
- [x] Create /imports/new page
- [x] Implement file upload functionality
- [x] Parse XLSX columns automatically
- [x] Detect reasonable columns
- [x] Allow column mapping
- [x] Save import batches
- [x] Create tracked_comments from import

### Phase 4: Real Instagram Scraper
- [x] Create /lib/scrapers/instagram.ts
- [x] Create /lib/scrapers/index.ts
- [x] Implement scrapeCommentMetrics function
- [x] Extract comment date
- [x] Extract comment likes
- [x] Extract comment replies
- [x] Extract comment text
- [x] Extract comment author
- [x] Extract target account
- [x] Handle comment URL vs post URL detection
- [x] Implement timeout handling
- [x] Add basic retries
- [x] Add useful logging
- [x] Handle different status states (active, deleted, not_found, private, error)

### Phase 5: Refresh & Snapshots
- [x] Create refresh individual action
- [x] Create refresh selected action
- [x] Create refresh all action
- [x] Create refresh stale action
- [x] Execute scraper on refresh
- [x] Update tracked_comments on refresh
- [x] Insert comment_snapshots on refresh

### Phase 6: Table View (Database-like)
- [x] Create /comments page
- [x] Implement search functionality
- [x] Add filters
- [x] Add sorting
- [x] Add pagination
- [x] Implement multi-select
- [x] Add CSV export
- [x] Add refresh selected
- [x] Add view detail
- [x] Show required columns (platform, source_url, comment_text, etc.)

### Phase 7: Comment Detail View
- [x] Create /comments/[id] page
- [x] Show complete metadata
- [x] Display original link
- [x] Show current status
- [x] Show likes timeline chart
- [x] Show replies timeline chart
- [x] Show engagement timeline chart
- [x] Show snapshots table
- [x] Show raw_json/debug if exists
- [x] Add editable notes

### Phase 8: Dashboard
- [x] Create /dashboard page
- [x] Show total comments tracked KPI
- [x] Show active vs deleted vs not_found distribution
- [x] Show total likes accumulated KPI
- [x] Show total replies accumulated KPI
- [x] Show total engagement accumulated KPI
- [x] Show top 10 comments by engagement chart
- [x] Show top 10 target accounts chart
- [x] Show likes evolution over time chart
- [x] Show replies evolution over time chart
- [x] Show total engagement evolution over time chart
- [x] Show ranking by CM chart
- [x] Show ranking by campaign_tag chart
- [x] Show comments with highest growth velocity chart

### Phase 9: Extra Interesting Variables
- [x] Add comment length calculation
- [x] Add emoji count approximation
- [x] Add contains question detection
- [x] Add CTA-ish heuristic
- [x] Add short/medium/long classification
- [x] Add conversational/assertive classification
- [x] Add absolute growth likes
- [x] Add % growth likes
- [x] Add absolute growth replies
- [x] Add % growth replies

### Phase 10: Simple Bookmarklet (Bonus)
- [x] Create /tools page
- [x] Add bookmarklet generator
- [x] Capture window.location.href
- [x] Open /comments/new?url=... with pre-filled URL

### Phase 11: Documentation & Quality
- [x] Create project structure
- [x] Add SQL schema/migrations
- [x] Create .env.example
- [x] Write detailed README
- [x] Document installation process
- [x] Document Supabase connection
- [x] Document Quick Add usage
- [x] Document XLSX importer usage
- [x] Document manual refresh process
- [x] Document bookmarklet usage
- [x] Document known scraping limitations
- [x] Document DOM selector maintenance

## Remaining Tasks 📋

### Enhancements & Improvements
- [ ] Add advanced filtering options
- [ ] Implement bulk operations
- [ ] Add email notifications for significant changes
- [ ] Add webhook support for external integrations
- [ ] Implement rate limiting for scraping
- [ ] Add proxy support for scraping
- [ ] Add more robust error handling and retry mechanisms
- [ ] Implement scheduled scraping jobs
- [ ] Add performance monitoring
- [ ] Add more detailed analytics and insights

### Additional Platforms Support
- [ ] Add TikTok support (prepare architecture)
- [ ] Add Twitter/X support
- [ ] Add Facebook support
- [ ] Add YouTube support

### Advanced Features
- [ ] Add AI-powered sentiment analysis
- [ ] Add competitor analysis features
- [ ] Add automated reporting
- [ ] Add custom alert rules
- [ ] Add advanced visualization options
- [ ] Add team collaboration features
- [ ] Add permission management