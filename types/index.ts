// Define interfaces for our data models

export interface Comment {
  id: string;
  source_url: string;
  normalized_url?: string;
  platform: string;
  post_url?: string;
  comment_id?: string;
  post_id?: string;
  comment_text?: string;
  comment_author?: string;
  target_account?: string;
  published_at?: string;
  first_seen_at?: string;
  last_checked_at?: string;
  current_likes: number;
  current_replies: number;
  current_status: 'pending' | 'active' | 'deleted' | 'not_found' | 'private' | 'error';
  campaign_tag?: string;
  cm_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CommentSnapshot {
  id: string;
  tracked_comment_id: string;
  scraped_at: string;
  likes: number;
  replies: number;
  status: string;
  raw_json?: string;
  response_time_ms?: number;
  error_message?: string;
}

export interface ImportBatch {
  id: string;
  file_name: string;
  imported_at: string;
  total_rows: number;
  success_rows: number;
  failed_rows: number;
}