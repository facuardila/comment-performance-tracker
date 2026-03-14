"use server";

import { Browser, Page } from 'playwright';

// Define the interface for scrape results
export interface ScrapeResult {
  success: boolean;
  commentText?: string;
  commentAuthor?: string;
  publishedAt?: string;
  likes: number;
  replies: number;
  targetAccount?: string;
  status: 'active' | 'deleted' | 'not_found' | 'private' | 'error';
  errorMessage?: string;
}

export async function scrapeInstagramComment(url: string, browser: Browser): Promise<ScrapeResult> {
  let page: Page | null = null;

  try {
    // Normalize URL to handle different Instagram URL formats
    const normalizedUrl = normalizeInstagramUrl(url);
    
    page = await browser.newPage();
    
    // Set viewport to mobile to ensure we get mobile-friendly content
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to the URL
    await page.goto(normalizedUrl, { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });

    // Check if the page indicates the content is not available
    const isNotFound = await page.locator('text=Sorry, this page').isVisible({ timeout: 5000 }).catch(() => false);
    if (isNotFound) {
      return {
        success: true,
        likes: 0,
        replies: 0,
        status: 'not_found'
      };
    }

    // Try to find the comment element
    const commentSelectors = [
      '[role="button"] div[data-testid="comment"]',
      'article div[data-testid="comment"]',
      'ul div[class*=""] span', // General selector for comment text
      '.P9YgZ' // Common class for comments
    ];

    let commentElement = null;
    for (const selector of commentSelectors) {
      try {
        commentElement = await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
        if (commentElement) break;
      } catch (e) {
        continue; // Try next selector
      }
    }

    if (!commentElement) {
      // If we can't find the specific comment, try to get general post info
      const postInfo = await extractPostInfo(page);
      return {
        success: true,
        likes: postInfo.likes || 0,
        replies: postInfo.replies || 0,
        ...postInfo,
        status: postInfo.status || 'active'
      };
    }

    // Extract comment information
    const commentText = await extractCommentText(page, commentElement);
    const commentAuthor = await extractCommentAuthor(page, commentElement);
    const likesCount = await extractCommentLikes(page, commentElement);
    const repliesCount = await extractCommentReplies(page, commentElement);
    const publishedAt = await extractCommentDate(page, commentElement);

    // Get target account from the post
    const targetAccount = await extractTargetAccount(page);

    return {
      success: true,
      commentText,
      commentAuthor,
      publishedAt,
      likes: likesCount,
      replies: repliesCount,
      targetAccount,
      status: 'active'
    };
  } catch (error) {
    console.error(`Error scraping Instagram comment from ${url}:`, error);
    return {
      success: false,
      likes: 0,
      replies: 0,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  } finally {
    if (page) {
      await page.close();
    }
  }
}

// Export the function with the name expected by the API route
export async function scrapeCommentMetrics(url: string): Promise<Omit<ScrapeResult, 'success'>> {
  // This function would need a browser instance, so we'll return an error
  // In a real implementation, this would be called from a server action
  // that has access to the Playwright browser instance
  throw new Error("This function requires a browser instance and should be called from a server action");
}

function normalizeInstagramUrl(url: string): string {
  // Convert mobile URLs to desktop URLs
  if (url.includes('instagram.com/p/')) {
    // Ensure it's a desktop URL
    return url.replace(/\/$/, '').replace(/\/\?[^)]*/, '');
  }
  
  // If it's a reel URL, convert to post URL
  if (url.includes('instagram.com/reel/')) {
    return url.replace('reel/', 'p/');
  }
  
  return url;
}

async function extractCommentText(page: Page, commentElement: any): Promise<string | undefined> {
  try {
    // Look for the actual comment text within the comment element
    const textSelectors = [
      'span',
      'h3',
      'p',
      'div[dir="auto"]',
      'div[data-testid="post-comment-content"]'
    ];
    
    for (const selector of textSelectors) {
      const elements = await commentElement.$$(selector);
      for (const el of elements) {
        const text = await el.textContent();
        if (text && text.trim().length > 0 && !text.includes('like') && !text.includes('reply')) {
          return text.trim();
        }
      }
    }
    
    // Fallback: get all text content of the comment element
    return await commentElement.textContent();
  } catch (error) {
    console.warn('Could not extract comment text:', error);
    return undefined;
  }
}

async function extractCommentAuthor(page: Page, commentElement: any): Promise<string | undefined> {
  try {
    // Look for author username near the comment
    const authorSelectors = [
      'a:not([href="/"])', // Links that aren't root
      'h3',
      'span[class*=""]', // Spans with classes (often usernames)
      'a[class*=""]' // Links with classes
    ];
    
    for (const selector of authorSelectors) {
      const elements = await commentElement.$$(selector);
      for (const el of elements) {
        const href = await el.getAttribute('href');
        const text = await el.textContent();
        
        // Check if this looks like a username
        if (href && href.startsWith('/')) {
          const username = href.substring(1).split('/')[0]; // Get username from href
          if (username && username.length > 1 && username.length < 30) {
            return username;
          }
        }
        
        // Check if text content looks like a username
        if (text && text.startsWith('@') && text.length > 1 && text.length < 30) {
          return text.substring(1); // Remove @ symbol
        }
      }
    }
    
    return undefined;
  } catch (error) {
    console.warn('Could not extract comment author:', error);
    return undefined;
  }
}

async function extractCommentLikes(page: Page, commentElement: any): Promise<number> {
  try {
    // Look for like indicators near the comment
    const likeSelectors = [
      'button:has-text("like") + span',
      'button:has-text("likes") + span',
      'span:has-text(/\d+ likes?/)',
      'button:has-text(/\d+ likes?/)',
      'span:has-text(/\d+ reactions?/)'
    ];
    
    for (const selector of likeSelectors) {
      try {
        const element = await page.waitForSelector(selector, { state: 'visible', timeout: 2000 });
        const text = await element.textContent();
        const match = text?.match(/\d+/);
        if (match) {
          return parseInt(match[0], 10);
        }
      } catch (e) {
        continue; // Try next selector
      }
    }
    
    // If no explicit like count found, return 0
    return 0;
  } catch (error) {
    console.warn('Could not extract comment likes:', error);
    return 0;
  }
}

async function extractCommentReplies(page: Page, commentElement: any): Promise<number> {
  try {
    // Look for reply indicators near the comment
    const replySelectors = [
      'button:has-text("reply")',
      'button:has-text("replies")',
      'span:has-text(/\d+ repl/)i',
      'button:has-text(/\d+ repl/)i'
    ];
    
    for (const selector of replySelectors) {
      try {
        const element = await page.waitForSelector(selector, { state: 'visible', timeout: 2000 });
        const text = await element.textContent();
        const match = text?.match(/\d+/);
        if (match) {
          return parseInt(match[0], 10);
        }
      } catch (e) {
        continue; // Try next selector
      }
    }
    
    // If no explicit reply count found, return 0
    return 0;
  } catch (error) {
    console.warn('Could not extract comment replies:', error);
    return 0;
  }
}

async function extractCommentDate(page: Page, commentElement: any): Promise<string | undefined> {
  try {
    // Look for date/time information
    const dateSelectors = [
      'time',
      'a[href*="/"] time', // Time inside a link
      'time[datetime]',
      'span:has-text(/ago|yesterday|today/i)'
    ];
    
    for (const selector of dateSelectors) {
      try {
        const element = await page.waitForSelector(selector, { state: 'visible', timeout: 2000 });
        const datetime = await element.getAttribute('datetime');
        if (datetime) {
          return new Date(datetime).toISOString();
        }
        
        const text = await element.textContent();
        if (text && text.match(/\d+ (second|minute|hour|day|week|month|year)s? ago|yesterday|today/i)) {
          // Convert relative time to absolute time
          return convertRelativeTime(text);
        }
      } catch (e) {
        continue; // Try next selector
      }
    }
    
    return undefined;
  } catch (error) {
    console.warn('Could not extract comment date:', error);
    return undefined;
  }
}

async function extractTargetAccount(page: Page): Promise<string | undefined> {
  try {
    // Find the target account (the account that posted the original content)
    const accountSelectors = [
      'header a[href^="/"]',
      'article header a',
      'header h2 a',
      'header h1 a'
    ];
    
    for (const selector of accountSelectors) {
      try {
        const element = await page.waitForSelector(selector, { state: 'visible', timeout: 2000 });
        const href = await element.getAttribute('href');
        if (href) {
          const username = href.substring(1).split('/')[0];
          if (username && username !== 'p' && username !== 'reel') { // Not a post or reel URL
            return username;
          }
        }
      } catch (e) {
        continue; // Try next selector
      }
    }
    
    return undefined;
  } catch (error) {
    console.warn('Could not extract target account:', error);
    return undefined;
  }
}

async function extractPostInfo(page: Page): Promise<Partial<ScrapeResult>> {
  try {
    // Extract basic post information if comment-specific info isn't available
    const targetAccount = await extractTargetAccount(page);
    
    // Try to get engagement metrics from the post
    const engagementText = await page.locator('section span').first().textContent().catch(() => '');
    const likesMatch = engagementText?.match(/(\d+(?:\.\d+)?[KMB]?) likes?/i);
    
    let likes = 0;
    if (likesMatch) {
      likes = parseNumberWithSuffix(likesMatch[1]);
    } else {
      // Alternative: look for like buttons
      const likeButtons = await page.locator('section button span').all();
      for (const button of likeButtons) {
        const text = await button.textContent();
        const num = parseNumberWithSuffix(text || '');
        if (num > likes) {
          likes = num;
        }
      }
    }
    
    return {
      targetAccount,
      likes,
      status: 'active'
    };
  } catch (error) {
    console.warn('Could not extract post info:', error);
    return {};
  }
}

function parseNumberWithSuffix(numStr: string): number {
  if (!numStr) return 0;
  
  const cleanStr = numStr.replace(/,/g, '');
  const multiplier = cleanStr.endsWith('K') ? 1000 :
                   cleanStr.endsWith('M') ? 1000000 :
                   cleanStr.endsWith('B') ? 1000000000 : 1;
                   
  const num = parseFloat(cleanStr.replace(/[KM]/g, ''));
  return isNaN(num) ? 0 : Math.round(num * multiplier);
}

function convertRelativeTime(relativeTime: string): string {
  const now = new Date();
  
  if (relativeTime.includes('second') || relativeTime.includes('sec')) {
    const seconds = parseInt(relativeTime.match(/\d+/)?.[0] || '0');
    now.setSeconds(now.getSeconds() - seconds);
  } else if (relativeTime.includes('minute') || relativeTime.includes('min')) {
    const minutes = parseInt(relativeTime.match(/\d+/)?.[0] || '0');
    now.setMinutes(now.getMinutes() - minutes);
  } else if (relativeTime.includes('hour') || relativeTime.includes('hr')) {
    const hours = parseInt(relativeTime.match(/\d+/)?.[0] || '0');
    now.setHours(now.getHours() - hours);
  } else if (relativeTime.includes('day')) {
    const days = parseInt(relativeTime.match(/\d+/)?.[0] || '0');
    now.setDate(now.getDate() - days);
  } else if (relativeTime.includes('week')) {
    const weeks = parseInt(relativeTime.match(/\d+/)?.[0] || '0');
    now.setDate(now.getDate() - (weeks * 7));
  } else if (relativeTime.includes('month')) {
    const months = parseInt(relativeTime.match(/\d+/)?.[0] || '0');
    now.setMonth(now.getMonth() - months);
  } else if (relativeTime.includes('year')) {
    const years = parseInt(relativeTime.match(/\d+/)?.[0] || '0');
    now.setFullYear(now.getFullYear() - years);
  } else if (relativeTime.toLowerCase().includes('yesterday')) {
    now.setDate(now.getDate() - 1);
  } else if (relativeTime.toLowerCase().includes('today')) {
    // Already today
  }
  
  return now.toISOString();
}