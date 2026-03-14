"use server";

import { chromium, Browser } from 'playwright';

let browserSingleton: Browser | null = null;

export async function initBrowser(): Promise<Browser> {
  if (!browserSingleton) {
    browserSingleton = await chromium.launch({
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
  return browserSingleton;
}

export async function closeBrowser(): Promise<void> {
  if (browserSingleton) {
    await browserSingleton.close();
    browserSingleton = null;
  }
}