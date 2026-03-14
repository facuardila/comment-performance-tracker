"use server";

import { createClient } from '@supabase/supabase-js';
import { TrackedComment, CommentSnapshot } from '@/types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get all tracked comments with pagination and filtering
 */
export async function getTrackedComments(
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: string;
    platform?: string;
    campaignTag?: string;
    cmName?: string;
    search?: string;
  }
): Promise<{ data: TrackedComment[]; count: number }> {
  let query = supabase
    .from('tracked_comments')
    .select('*', { count: 'exact' })
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });

  if (filters) {
    if (filters.status) {
      query = query.eq('current_status', filters.status);
    }
    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }
    if (filters.campaignTag) {
      query = query.eq('campaign_tag', filters.campaignTag);
    }
    if (filters.cmName) {
      query = query.eq('cm_name', filters.cmName);
    }
    if (filters.search) {
      query = query.or(`comment_text.ilike.%${filters.search}%,source_url.ilike.%${filters.search}%`);
    }
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Error fetching comments: ${error.message}`);
  }

  return { data, count: count || 0 };
}

/**
 * Get a single tracked comment by ID
 */
export async function getTrackedCommentById(id: string): Promise<TrackedComment | null> {
  const { data, error } = await supabase
    .from('tracked_comments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Row not found
    throw new Error(`Error fetching comment: ${error.message}`);
  }

  return data;
}

/**
 * Get snapshots for a specific comment
 */
export async function getCommentSnapshots(commentId: string): Promise<CommentSnapshot[]> {
  const { data, error } = await supabase
    .from('comment_snapshots')
    .select('*')
    .eq('tracked_comment_id', commentId)
    .order('scraped_at', { ascending: true });

  if (error) {
    throw new Error(`Error fetching snapshots: ${error.message}`);
  }

  return data;
}

/**
 * Insert a new tracked comment
 */
export async function insertTrackedComment(comment: Omit<TrackedComment, 'id' | 'created_at' | 'updated_at'>): Promise<TrackedComment> {
  const { data, error } = await supabase
    .from('tracked_comments')
    .insert([{ ...comment }])
    .select()
    .single();

  if (error) {
    throw new Error(`Error inserting comment: ${error.message}`);
  }

  return data;
}

/**
 * Update a tracked comment
 */
export async function updateTrackedComment(id: string, updates: Partial<TrackedComment>): Promise<TrackedComment> {
  const { data, error } = await supabase
    .from('tracked_comments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating comment: ${error.message}`);
  }

  return data;
}

/**
 * Insert a new comment snapshot
 */
export async function insertCommentSnapshot(snapshot: Omit<CommentSnapshot, 'id' | 'scraped_at'>): Promise<CommentSnapshot> {
  const { data, error } = await supabase
    .from('comment_snapshots')
    .insert([{ ...snapshot }])
    .select()
    .single();

  if (error) {
    throw new Error(`Error inserting snapshot: ${error.message}`);
  }

  return data;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  // Get dashboard stats using the RPC function
  const { data, error } = await supabase.rpc('get_dashboard_stats');
  
  if (error) {
    throw new Error(`Error getting dashboard stats: ${error.message}`);
  }
  
  // Initialize status counts object
  const statusCountsObj: any = {
    active: 0,
    deleted: 0,
    not_found: 0,
    private: 0,
    error: 0
  };

  // Fill status counts
  if (data && data.status_counts) {
    Object.entries(data.status_counts).forEach(([status, count]) => {
      statusCountsObj[status] = count;
    });
  }

  return {
    total_comments: data?.total_comments || 0,
    status_counts: statusCountsObj,
    total_likes: data?.total_likes || 0,
    total_replies: data?.total_replies || 0,
    total_engagement: data?.total_engagement || 0,
    top_comments_by_engagement: data?.top_comments_by_engagement || [],
    top_accounts: data?.top_accounts || {},
    engagement_over_time: data?.engagement_over_time || [],
    top_cms: data?.top_cms || {},
    top_campaigns: data?.top_campaigns || {}
  };
}

/**
 * Refresh a single comment
 */
export async function refreshComment(id: string) {
  // Get the tracked comment first
  const trackedComment = await getTrackedCommentById(id);
  if (!trackedComment) {
    throw new Error(`Comment with id ${id} not found`);
  }

  // Get browser instance
  const { initBrowser } = await import('../playwright');
  const browser = await initBrowser();

  try {
    // Scrape the comment metrics
    const { scrapeCommentMetrics } = await import('../scrapers');
    const scrapingResult = await scrapeCommentMetrics(trackedComment.source_url, browser);

    // Update the tracked comment with new metrics
    const updates: Partial<TrackedComment> = {
      last_checked_at: new Date().toISOString(),
      current_status: scrapingResult.data?.status || 'error',
    };

    if (scrapingResult.success && scrapingResult.data) {
      updates.comment_text = scrapingResult.data.commentText || updates.comment_text;
      updates.comment_author = scrapingResult.data.commentAuthor || updates.comment_author;
      updates.published_at = scrapingResult.data.publishedAt || updates.published_at;
      updates.current_likes = scrapingResult.data.likes || 0;
      updates.current_replies = scrapingResult.data.replies || 0;
      updates.target_account = scrapingResult.data.targetAccount || updates.target_account;
    } else {
      updates.current_status = 'error';
    }

    // Update the tracked comment
    const updatedComment = await updateTrackedComment(id, updates);

    // Create a snapshot record
    await insertCommentSnapshot({
      tracked_comment_id: id,
      likes: scrapingResult.data?.likes || 0,
      replies: scrapingResult.data?.replies || 0,
      status: scrapingResult.data?.status || 'error',
      raw_json: scrapingResult,
      response_time_ms: null, // We don't have this metric here
      error_message: scrapingResult.error || scrapingResult.data?.errorMessage || null
    });

    return {
      success: scrapingResult.success,
      comment: updatedComment,
      snapshot: {
        likes: scrapingResult.data?.likes || 0,
        replies: scrapingResult.data?.replies || 0,
        status: scrapingResult.data?.status || 'error',
        error_message: scrapingResult.error || scrapingResult.data?.errorMessage
      }
    };
  } finally {
    // Don't close the browser here since it's shared
  }
}

/**
 * Refresh multiple comments
 */
export async function refreshComments(ids: string[]) {
  const results = [];
  for (const id of ids) {
    try {
      const result = await refreshComment(id);
      results.push({ id, success: true, data: result });
    } catch (error) {
      results.push({ id, success: false, error: (error as Error).message });
    }
  }
  return results;
}
