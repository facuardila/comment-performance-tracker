# Comment Performance Tracker - Project Summary

## Overview
The Comment Performance Tracker is an internal tool for agencies to track the performance of Instagram comments posted by community managers on third-party accounts. The tool enables tracking of engagement metrics (likes, replies) over time without requiring client credentials or official APIs.

## Core Functionality

### 1. Quick Add Interface (Primary UX)
- Fast, mobile-friendly interface at `/comments/new`
- Simple form for adding comment URLs with CM name and campaign tag
- LocalStorage persistence for frequently used values
- "Save and add another" functionality for rapid data entry
- Toast notifications for user feedback

### 2. Instagram Scraping Engine
- Playwright-based scraper in `/lib/scrapers/instagram.ts`
- Extracts public metrics: likes, replies, comment text, author, etc.
- Handles various URL formats (post URLs, comment URLs)
- Robust error handling with status tracking
- Respects rate limits to avoid blocking

### 3. Database Layer
- PostgreSQL database via Supabase
- Three main tables:
  - `tracked_comments`: Main comment records with current metrics
  - `comment_snapshots`: Historical metric snapshots
  - `import_batches`: Import job tracking
- Prisma ORM for database operations
- Proper indexing for performance

### 4. Data Import
- XLSX import functionality at `/imports/new`
- Automatic column detection and mapping
- Support for common column names
- Batch processing with error reporting
- Import validation and statistics

### 5. Data Visualization
- Dashboard at `/dashboard` with key metrics
- Comment detail pages with timeline charts
- Table view with filtering and sorting
- Recharts for visualizations
- Engagement trend analysis

### 6. Additional Tools
- Bookmarklet generator at `/tools` for quick capture
- Analytics module with derived metrics
- Responsive UI components using shadcn/ui
- Toast notification system

## Technical Architecture

### Frontend
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Client-side React components

### Backend
- Next.js API routes
- Server Actions for data mutations
- Playwright for web scraping
- Supabase for database operations

### Data Processing
- Real-time scraping when adding new comments
- Historical snapshot storage
- Batch import processing
- Derived analytics calculation

## Key Features

1. **Speed**: Optimized for rapid daily use by community managers
2. **Reliability**: Robust error handling and status tracking
3. **Scalability**: Designed to handle large volumes of comments
4. **Usability**: Mobile-responsive interface with intuitive UX
5. **Analytics**: Rich metrics and visualization capabilities
6. **Extensibility**: Modular architecture ready for additional platforms

## Implementation Quality

- Comprehensive TypeScript typing
- Proper error boundaries and user feedback
- Responsive design for desktop and mobile
- Clean, maintainable code structure
- Proper separation of concerns
- Well-documented components and functions

## Business Value

- Enables agencies to measure comment performance across client accounts
- Provides historical data for strategy optimization
- Eliminates need for client credentials
- Supports data-driven community management decisions
- Scales to handle multiple clients and campaigns