/**
 * Utility functions for the Comment Performance Tracker
 */

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Format a date as YYYY-MM-DD HH:mm:ss
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format a date as a human-readable string
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Extract Instagram username from URL
 */
export function extractInstagramUsername(url: string): string | null {
  const match = url.match(/instagram\.com\/([^\/\?]+)/i);
  return match ? match[1] : null;
}

/**
 * Extract Instagram post ID from URL
 */
export function extractInstagramPostId(url: string): string | null {
  // Match URLs like https://www.instagram.com/p/Cxyz123/ or https://www.instagram.com/reel/Cxyz123/
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
}

/**
 * Extract Instagram comment ID from URL (if available)
 */
export function extractInstagramCommentId(url: string): string | null {
  // Look for comment IDs in URLs - these are harder to extract reliably
  // Usually comment IDs are in the fragment or as part of the URL structure
  const match = url.match(/comment-(\d+)/i);
  return match ? match[1] : null;
}

/**
 * Normalize Instagram URL
 */
export function normalizeInstagramUrl(url: string): string {
  // Remove any query parameters and fragments
  const cleanUrl = url.split('?')[0].split('#')[0];
  
  // Ensure it ends with a slash
  return cleanUrl.endsWith('/') ? cleanUrl : cleanUrl + '/';
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce function to limit the rate at which a function can fire
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) {
    return newValue === 0 ? 0 : 100;
  }
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Merge tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
