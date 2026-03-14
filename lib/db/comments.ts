import { createClient } from '@supabase/supabase-js';
import { Comment, CommentSnapshot } from '../../types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all tracked comments
export async function getTrackedComments(): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('tracked_comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tracked comments:', error);
    throw error;
  }

  return data as Comment[];
}

// Get a single tracked comment by ID
export async function getTrackedCommentById(id: string): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('tracked_comments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching tracked comment:', error);
    return null;
  }

  return data as Comment;
}

// Get snapshots for a specific comment
export async function getCommentSnapshots(commentId: string): Promise<CommentSnapshot[]> {
  const { data, error } = await supabase
    .from('comment_snapshots')
    .select('*')
    .eq('tracked_comment_id', commentId)
    .order('scraped_at', { ascending: true });

  if (error) {
    console.error('Error fetching comment snapshots:', error);
    throw error;
  }

  return data as CommentSnapshot[];
}

// Insert a new tracked comment
export async function insertTrackedComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'current_likes' | 'current_replies' | 'current_status' | 'last_checked_at'>): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('tracked_comments')
    .insert([{ 
      ...comment,
      current_likes: 0,
      current_replies: 0,
      current_status: 'pending',
      last_checked_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error inserting tracked comment:', error);
    return null;
  }

  return data as Comment;
}

// Refresh selected comments
export async function refreshSelectedComments(commentIds: string[]): Promise<void> {
  // This function would trigger the scraping process for each comment
  // In a real implementation, this might queue jobs or call an API endpoint
  for (const id of commentIds) {
    try {
      // Call the refresh API for each comment
      const response = await fetch(`/api/comments/${id}/refresh`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        console.error(`Failed to refresh comment ${id}:`, await response.text());
      }
    } catch (error) {
      console.error(`Error refreshing comment ${id}:`, error);
    }
  }
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<any> {
  // Get total comments
  const { count: totalComments, error: totalError } = await supabase
    .from('tracked_comments')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error getting total comments:', totalError);
  }

  // Get status breakdown
  const { data: statusBreakdown, error: statusError } = await supabase
    .from('tracked_comments')
    .select('current_status, count(*)')
    .group('current_status');

  if (statusError) {
    console.error('Error getting status breakdown:', statusError);
  }

  // Get total engagement
  const { data: engagementData, error: engagementError } = await supabase
    .from('tracked_comments')
    .select('current_likes, current_replies')
    .is('current_status', 'active');

  if (engagementError) {
    console.error('Error getting engagement data:', engagementError);
  }

  let totalLikes = 0;
  let totalReplies = 0;
  if (engagementData) {
    totalLikes = engagementData.reduce((sum, row) => sum + row.current_likes, 0);
    totalReplies = engagementData.reduce((sum, row) => sum + row.current_replies, 0);
  }

  // Get recent snapshots for trends
  const { data: recentSnapshots, error: snapshotsError } = await supabase
    .from('comment_snapshots')
    .select('*')
    .gt('scraped_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
    .order('scraped_at', { ascending: false });

  if (snapshotsError) {
    console.error('Error getting recent snapshots:', snapshotsError);
  }

  return {
    totalComments: totalComments || 0,
    statusBreakdown: statusBreakdown || [],
    totalLikes,
    totalReplies,
    totalEngagement: totalLikes + totalReplies,
    recentSnapshots: recentSnapshots || []
  };
}