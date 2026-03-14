"use server";

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.source_url || !body.cm_name || !body.campaign_tag) {
      return Response.json(
        { message: 'Missing required fields: source_url, cm_name, or campaign_tag' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.source_url);
    } catch (error) {
      return Response.json(
        { message: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Prepare the record to insert
    const newComment = {
      source_url: body.source_url,
      platform: body.platform || 'instagram',
      cm_name: body.cm_name,
      campaign_tag: body.campaign_tag,
      target_account: body.target_account || null,
      notes: body.notes || null,
      first_seen_at: new Date().toISOString(),
      last_checked_at: new Date().toISOString(),
      current_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('tracked_comments')
      .insert([newComment])
      .select()
      .single();

    if (error) {
      console.error('Error inserting comment:', error);
      return Response.json(
        { message: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return Response.json(
      { message: 'Comment added successfully', comment: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/comments:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch comments from Supabase
    const { data, error, count } = await supabase
      .from('tracked_comments')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return Response.json(
        { message: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return Response.json({
      comments: data,
      count,
      limit,
      offset
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/comments:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}