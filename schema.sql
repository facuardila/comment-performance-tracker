-- Table: tracked_comments
CREATE TABLE tracked_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_url TEXT NOT NULL UNIQUE,
    normalized_url TEXT,
    platform VARCHAR(50) NOT NULL DEFAULT 'instagram',
    post_url TEXT,
    comment_id TEXT,
    post_id TEXT,
    comment_text TEXT,
    comment_author TEXT,
    target_account TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_checked_at TIMESTAMP WITH TIME ZONE,
    current_likes INTEGER,
    current_replies INTEGER,
    current_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    campaign_tag TEXT,
    cm_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table: comment_snapshots
CREATE TABLE comment_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracked_comment_id UUID NOT NULL REFERENCES tracked_comments(id) ON DELETE CASCADE,
    scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    likes INTEGER,
    replies INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    raw_json JSONB,
    response_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table: import_batches
CREATE TABLE import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    total_rows INTEGER NOT NULL,
    success_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_tracked_comments_platform_status ON tracked_comments(platform, current_status);
CREATE INDEX idx_tracked_comments_cm_name ON tracked_comments(cm_name);
CREATE INDEX idx_tracked_comments_campaign_tag ON tracked_comments(campaign_tag);
CREATE INDEX idx_tracked_comments_target_account ON tracked_comments(target_account);
CREATE INDEX idx_tracked_comments_last_checked ON tracked_comments(last_checked_at);
CREATE INDEX idx_comment_snapshots_comment_id ON comment_snapshots(tracked_comment_id);
CREATE INDEX idx_comment_snapshots_scraped_at ON comment_snapshots(scraped_at DESC);