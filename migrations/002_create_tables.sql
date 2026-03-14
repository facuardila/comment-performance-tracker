-- Create tracked_comments table
CREATE TABLE IF NOT EXISTS tracked_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL UNIQUE,
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
  current_status TEXT NOT NULL DEFAULT 'pending',
  campaign_tag TEXT,
  cm_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create comment_snapshots table
CREATE TABLE IF NOT EXISTS comment_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracked_comment_id UUID REFERENCES tracked_comments(id) ON DELETE CASCADE,
  scraped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  raw_json JSONB,
  response_time_ms INTEGER,
  error_message TEXT
);

-- Create import_batches table
CREATE TABLE IF NOT EXISTS import_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  total_rows INTEGER NOT NULL,
  success_rows INTEGER NOT NULL,
  failed_rows INTEGER NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tracked_comments_platform_status ON tracked_comments(platform, current_status);
CREATE INDEX IF NOT EXISTS idx_tracked_comments_campaign ON tracked_comments(campaign_tag);
CREATE INDEX IF NOT EXISTS idx_tracked_comments_cm ON tracked_comments(cm_name);
CREATE INDEX IF NOT EXISTS idx_tracked_comments_last_checked ON tracked_comments(last_checked_at);
CREATE INDEX IF NOT EXISTS idx_comment_snapshots_comment_id ON comment_snapshots(tracked_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_snapshots_scraped_at ON comment_snapshots(scraped_at DESC);

-- Create helper function to get status counts
CREATE OR REPLACE FUNCTION get_status_counts()
RETURNS TABLE(status TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    current_status::TEXT as status,
    COUNT(*)::BIGINT as count
  FROM tracked_comments
  GROUP BY current_status;
END;
$$ LANGUAGE plpgsql;

-- Create function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_comments BIGINT,
    status_counts JSONB,
    total_likes BIGINT,
    total_replies BIGINT,
    total_engagement BIGINT,
    top_comments_by_engagement JSONB,
    top_accounts JSONB,
    engagement_over_time JSONB,
    top_cms JSONB,
    top_campaigns JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH status_counts_cte AS (
        SELECT jsonb_object_agg(current_status, cnt) AS counts
        FROM (
            SELECT current_status, COUNT(*) AS cnt
            FROM tracked_comments
            GROUP BY current_status
        ) subquery
    ),
    engagement_totals AS (
        SELECT 
            COALESCE(SUM(current_likes), 0) AS total_likes,
            COALESCE(SUM(current_replies), 0) AS total_replies
        FROM tracked_comments
        WHERE current_status = 'active'
    ),
    top_comments AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id,
                'source_url', source_url,
                'comment_text', comment_text,
                'comment_author', comment_author,
                'current_likes', current_likes,
                'current_replies', current_replies,
                'target_account', target_account,
                'campaign_tag', campaign_tag,
                'cm_name', cm_name
            )
        ) AS comments
        FROM (
            SELECT 
                id, source_url, comment_text, comment_author, 
                current_likes, current_replies, target_account, 
                campaign_tag, cm_name
            FROM tracked_comments
            WHERE current_status = 'active'
            ORDER BY (COALESCE(current_likes, 0) + COALESCE(current_replies, 0)) DESC
            LIMIT 10
        ) tc
    ),
    top_accounts_agg AS (
        SELECT jsonb_object_agg(target_account, cnt) AS accounts
        FROM (
            SELECT target_account, COUNT(*) AS cnt
            FROM tracked_comments
            WHERE target_account IS NOT NULL
            GROUP BY target_account
            ORDER BY cnt DESC
            LIMIT 10
        ) ta
    ),
    engagement_over_time_agg AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'date', date_part,
                'total_likes', total_likes,
                'total_replies', total_replies,
                'total_engagement', total_engagement
            ) ORDER BY date_part
        ) AS engagement_data
        FROM (
            SELECT 
                DATE(scraped_at) AS date_part,
                SUM(likes) AS total_likes,
                SUM(replies) AS total_replies,
                SUM(likes + replies) AS total_engagement
            FROM comment_snapshots
            GROUP BY DATE(scraped_at)
            ORDER BY date_part DESC
        ) et
    ),
    top_cms_agg AS (
        SELECT jsonb_object_agg(cm_name, cnt) AS cms
        FROM (
            SELECT cm_name, COUNT(*) AS cnt
            FROM tracked_comments
            WHERE cm_name IS NOT NULL
            GROUP BY cm_name
            ORDER BY cnt DESC
            LIMIT 10
        ) tcm
    ),
    top_campaigns_agg AS (
        SELECT jsonb_object_agg(campaign_tag, cnt) AS campaigns
        FROM (
            SELECT campaign_tag, COUNT(*) AS cnt
            FROM tracked_comments
            WHERE campaign_tag IS NOT NULL
            GROUP BY campaign_tag
            ORDER BY cnt DESC
            LIMIT 10
        ) tca
    )
    SELECT 
        (SELECT COUNT(*) FROM tracked_comments) AS total_comments,
        (SELECT counts FROM status_counts_cte) AS status_counts,
        (SELECT total_likes FROM engagement_totals) AS total_likes,
        (SELECT total_replies FROM engagement_totals) AS total_replies,
        (SELECT total_likes + total_replies FROM engagement_totals) AS total_engagement,
        (SELECT comments FROM top_comments) AS top_comments_by_engagement,
        (SELECT accounts FROM top_accounts_agg) AS top_accounts,
        (SELECT engagement_data FROM engagement_over_time_agg) AS engagement_over_time,
        (SELECT cms FROM top_cms_agg) AS top_cms,
        (SELECT campaigns FROM top_campaigns_agg) AS top_campaigns;
END;
$$ LANGUAGE plpgsql;
