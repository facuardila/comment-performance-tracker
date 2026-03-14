"use server";

import { chromium, Browser } from 'playwright';
import { scrapeInstagramComment, ScrapeResult } from './scrapers/instagram';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Global browser instance to reuse
let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: true, // Set to false for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }
  return browserInstance;
}

export async function scrapeAndSaveCommentMetrics(commentId: string) {
  try {
    // Fetch the tracked comment
    const { data: comment, error } = await supabase
      .from('tracked_comments')
      .select('*')
      .eq('id', commentId)
      .single();

    if (error || !comment) {
      throw new Error('Comment not found');
    }

    // Get browser instance
    const browser = await getBrowser();

    // Scrape metrics
    const startTime = Date.now();
    const result: ScrapeResult = await scrapeInstagramComment(comment.source_url, browser);
    const responseTime = Date.now() - startTime;

    // Update tracked comment with new metrics
    const updateData: any = {
      current_likes: result.likes,
      current_replies: result.replies,
      current_status: result.status,
      last_checked_at: new Date().toISOString(),
    };

    if (result.commentText) updateData.comment_text = result.commentText;
    if (result.commentAuthor) updateData.comment_author = result.commentAuthor;
    if (result.publishedAt) updateData.published_at = result.publishedAt;

    const { error: updateError } = await supabase
      .from('tracked_comments')
      .update(updateData)
      .eq('id', commentId);

    if (updateError) {
      console.error('Error updating comment:', updateError);
      throw updateError;
    }

    // Prepare snapshot data with conditional error message
    const snapshotData: any = {
      tracked_comment_id: commentId,
      scraped_at: new Date().toISOString(),
      likes: result.likes,
      replies: result.replies,
      status: result.status,
      response_time_ms: responseTime,
    };

    if (result.errorMessage) {
      snapshotData.error_message = result.errorMessage;
    }

    const { error: snapshotError } = await supabase
      .from('comment_snapshots')
      .insert([snapshotData]);

    if (snapshotError) {
      console.error('Error saving snapshot:', snapshotError);
      // Continue anyway, as the main update was successful
    }

    return {
      success: true,
      comment: { ...comment, ...updateData },
      snapshot: snapshotData
    };
  } catch (error) {
    console.error('Error in scrapeAndSaveCommentMetrics:', error);
    throw error;
  }
}

// Clean up browser instance when needed
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}