"use server";

import { Browser } from 'playwright';
import { scrapeInstagramComment } from './instagram';

interface ScrapeResult {
  success: boolean;
  data?: {
    commentText?: string;
    commentAuthor?: string;
    publishedAt?: string;
    likes?: number;
    replies?: number;
    targetAccount?: string;
    status: 'active' | 'deleted' | 'not_found' | 'private' | 'error';
    errorMessage?: string;
  };
  error?: string;
}

export async function scrapeCommentMetrics(url: string, browser: Browser): Promise<ScrapeResult> {
  // Determine platform based on URL
  if (url.includes('instagram.com')) {
    return await scrapeInstagramComment(url, browser);
  } else {
    // For now, only Instagram is supported
    // This structure allows for easy extension to other platforms
    return {
      success: false,
      error: 'Unsupported platform. Currently only Instagram is supported.'
    };
  }
}