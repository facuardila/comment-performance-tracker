// Database types
export interface TrackedComment {
  id: string;
  source_url: string;
  normalized_url: string;
  platform: string;
  post_url: string;
  comment_id: string;
  post_id: string;
  comment_text: string | null;
  comment_author: string | null;
  target_account: string | null;
  published_at: string | null;
  first_seen_at: string;
  last_checked_at: string | null;
  current_likes: number | null;
  current_replies: number | null;
  current_status: string;
  campaign_tag: string | null;
  cm_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommentSnapshot {
  id: string;
  tracked_comment_id: string;
  scraped_at: string;
  likes: number | null;
  replies: number | null;
  status: string;
  raw_json: any;
  response_time_ms: number | null;
  error_message: string | null;
}

export interface ImportBatch {
  id: string;
  file_name: string;
  imported_at: string;
  total_rows: number;
  success_rows: number;
  failed_rows: number;
}

export interface DashboardStats {
  total_comments: number;
  status_counts: {
    active: number;
    deleted: number;
    not_found: number;
    private: number;
    error: number;
  };
  total_likes: number;
  total_replies: number;
  total_engagement: number;
  top_comments_by_engagement: TrackedComment[];
  top_accounts: Record<string, number>;
  engagement_over_time: Array<{
    date: string;
    total_likes: number;
    total_replies: number;
    total_engagement: number;
  }>;
  top_cms: Record<string, number>;
  top_campaigns: Record<string, number>;
}

// Scraping result types
export interface ScrapingResult {
  success: boolean;
  data?: {
    comment_text?: string;
    comment_author?: string;
    target_account?: string;
    published_at?: Date;
    likes?: number;
    replies?: number;
    status: string;
  };
  error?: string;
  response_time_ms?: number;
}

// Form types
export interface CommentFormData {
  url: string;
  cmName: string;
  campaignTag: string;
  targetAccount?: string;
  notes?: string;
}