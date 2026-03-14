import { scrapeInstagramComment, ScrapeResult } from './instagram';

export { scrapeInstagramComment, ScrapeResult };

// Main function to scrape comment metrics regardless of platform
export async function scrapeCommentMetrics(url: string): Promise<Omit<ScrapeResult, 'success'>> {
  // Determine platform based on URL
  if (url.includes('instagram.com')) {
    // For this to work properly, we'd need access to a browser instance
    // This is a simplified version - in practice, this would be handled differently
    throw new Error("Platform-specific scraping requires browser instance");
  } else {
    throw new Error("Unsupported platform");
  }
}