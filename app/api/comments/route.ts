import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Function to initialize Supabase client safely
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key are required');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Get filters
    const status = url.searchParams.get('status');
    const campaignTag = url.searchParams.get('campaignTag');
    const cmName = url.searchParams.get('cmName');
    const search = url.searchParams.get('search');

    // Build query
    let query = supabase
      .from('tracked_comments')
      .select(`
        *,
        comment_snapshots (
          id,
          scraped_at,
          likes,
          replies,
          status
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('current_status', status);
    }
    if (campaignTag) {
      query = query.eq('campaign_tag', campaignTag);
    }
    if (cmName) {
      query = query.eq('cm_name', cmName);
    }
    if (search) {
      query = query.or(`comment_text.ilike.%${search}%,source_url.ilike.%${search}%,target_account.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count! / limit),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();

    // Validate required fields
    if (!body.source_url) {
      return new Response(JSON.stringify({ error: 'Source URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert new tracked comment
    const { data, error } = await supabase
      .from('tracked_comments')
      .insert([{
        source_url: body.source_url,
        platform: body.platform || 'instagram',
        comment_text: body.comment_text,
        comment_author: body.comment_author,
        target_account: body.target_account,
        campaign_tag: body.campaign_tag,
        cm_name: body.cm_name,
        notes: body.notes,
        current_status: 'pending',
        first_seen_at: new Date().toISOString(),
        last_checked_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting comment:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}