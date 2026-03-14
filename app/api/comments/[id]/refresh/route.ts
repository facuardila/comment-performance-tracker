import { NextRequest } from 'next/server';
import { scrapeAndSaveCommentMetrics } from '../../../../../lib/scraping-service'; // Updated path

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const commentId = params.id;

    // Scrape and save metrics
    const result = await scrapeAndSaveCommentMetrics(commentId);

    return new Response(JSON.stringify(result), {
      status: 200,
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