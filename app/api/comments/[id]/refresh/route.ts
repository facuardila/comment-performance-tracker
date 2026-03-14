"use server";

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initBrowser } from '@/lib/playwright';
import { scrapeCommentMetrics } from '@/lib/scrapers';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return Response.json(
        { message: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Get the comment from the database
    const { data: comment, error: commentError } = await supabase
      .from('tracked_comments')
      .select('*')
      .eq('id', id)
      .single();

    if (commentError || !comment) {
      return Response.json(
        { message: 'Comment not found' },
        { status: 404 }
      );
    }

    // Initialize browser for scraping
    const browser = await initBrowser();
    
    // Perform scraping
    const startTime = Date.now();
    const scrapeResult = await scrapeCommentMetrics(comment.source_url, browser);
    const responseTime = Date.now() - startTime;

    // Update the tracked comment with new metrics
    const updateData: any = {
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (scrapeResult.success && scrapeResult.data) {
      updateData.current_status = scrapeResult.data.status;
      updateData.current_likes = scrapeResult.data.likes || 0;
      updateData.current_replies = scrapeResult.data.replies || 0;
      
      if (scrapeResult.data.commentText) updateData.comment_text = scrapeResult.data.commentText;
      if (scrapeResult.data.commentAuthor) updateData.comment_author = scrapeResult.data.commentAuthor;
      if (scrapeResult.data.publishedAt) updateData.published_at = scrapeResult.data.publishedAt;
      if (scrapeResult.data.targetAccount) updateData.target_account = scrapeResult.data.targetAccount;
    } else {
      updateData.current_status = 'error';
      updateData.notes = `${comment.notes || ''}\nLast error: ${scrapeResult.error}`.trim();
    }

    // Update the tracked comment
    const { error: updateError } = await supabase
      .from('tracked_comments')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating comment:', updateError);
      return Response.json(
        { message: `Database error: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Create a snapshot record
    const snapshotData = {
      tracked_comment_id: id,
      scraped_at: new Date().toISOString(),
      likes: scrapeResult.data?.likes || 0,
      replies: scrapeResult.data?.replies || 0,
      status: scrapeResult.data?.status || 'error',
      raw_json: scrapeResult,
      response_time_ms: responseTime,
      error_message: scrapeResult.success ? null : scrapeResult.error
    };

    const { error: snapshotError } = await supabase
      .from('comment_snapshots')
      .insert([snapshotData]);

    if (snapshotError) {
      console.error('Error creating snapshot:', snapshotError);
      // Don't fail the entire operation if snapshot creation fails
    }

    return Response.json({
      message: 'Comment refreshed successfully',
      comment: { ...comment, ...updateData },
      scrapeResult
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/comments/[id]/refresh:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}