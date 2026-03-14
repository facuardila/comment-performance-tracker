"use server";

import * as XLSX from 'xlsx';
import { Comment } from '@/types';
import { insertTrackedComment } from '../db/comments';

interface ImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  errors: string[];
}

/**
 * Process an uploaded XLSX file and import comments
 */
export async function processXLSXImport(
  fileBuffer: Buffer,
  defaultCMName?: string,
  defaultCampaignTag?: string
): Promise<ImportResult> {
  try {
    // Parse the XLSX file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return {
        success: false,
        importedCount: 0,
        errorCount: 1,
        errors: ['No data found in the uploaded file']
      };
    }

    // Detect column mappings
    const columnMappings = detectColumnMappings(Object.keys(jsonData[0]));
    
    // Process each row
    let importedCount = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i];
        
        // Map row data to comment object
        const comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'last_checked_at'> = {
          source_url: getStringValue(row[columnMappings.url]) || '',
          normalized_url: getStringValue(row[columnMappings.url]) || undefined,
          platform: 'instagram',
          post_url: getStringValue(row[columnMappings.url]) || undefined,
          comment_id: undefined,
          post_id: undefined,
          comment_text: getStringValue(row[columnMappings.commentText]) || undefined,
          comment_author: getStringValue(row[columnMappings.commentAuthor]) || undefined,
          target_account: getStringValue(row[columnMappings.targetAccount]) || getStringValue(row[columnMappings.account]) || undefined,
          published_at: getDateValue(row[columnMappings.publishedAt]) ? getDateValue(row[columnMappings.publishedAt])!.toISOString() : undefined,
          first_seen_at: new Date().toISOString(),
          current_likes: getNumericValue(row[columnMappings.likes]) || 0,
          current_replies: getNumericValue(row[columnMappings.replies]) || 0,
          current_status: 'pending',
          campaign_tag: getStringValue(row[columnMappings.campaignTag]) || defaultCampaignTag || undefined,
          cm_name: getStringValue(row[columnMappings.cmName]) || defaultCMName || undefined,
          notes: getStringValue(row[columnMappings.notes]) || undefined
        };

        // Validate required fields
        if (!comment.source_url) {
          errors.push(`Row ${i + 1}: Missing required URL field`);
          continue;
        }

        // Insert the comment
        await insertTrackedComment(comment);
        importedCount++;
      } catch (error) {
        errors.push(`Row ${i + 1}: ${(error as Error).message}`);
      }
    }

    return {
      success: true,
      importedCount,
      errorCount: errors.length,
      errors
    };
  } catch (error) {
    return {
      success: false,
      importedCount: 0,
      errorCount: 1,
      errors: [`Error processing file: ${(error as Error).message}`]
    };
  }
}

/**
 * Detect column mappings based on common column names
 */
function detectColumnMappings(headers: string[]): Record<string, string> {
  const mappings: Record<string, string> = {};
  
  // Normalize headers for comparison
  const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/\s+/g, '_'));
  
  // Find URL column
  const urlIndex = normalizedHeaders.findIndex(h => 
    h.includes('url') || h.includes('link') || h.includes('permalink')
  );
  if (urlIndex !== -1) mappings.url = headers[urlIndex];
  
  // Find CM name column
  const cmNameIndex = normalizedHeaders.findIndex(h => 
    h.includes('cm') || h.includes('community') || h.includes('manager') || h.includes('name')
  );
  if (cmNameIndex !== -1) mappings.cmName = headers[cmNameIndex];
  
  // Find campaign tag column
  const campaignTagIndex = normalizedHeaders.findIndex(h => 
    h.includes('campaign') || h.includes('tag') || h.includes('group')
  );
  if (campaignTagIndex !== -1) mappings.campaignTag = headers[campaignTagIndex];
  
  // Find target account column
  const targetAccountIndex = normalizedHeaders.findIndex(h => 
    h.includes('account') || h.includes('target') || h.includes('profile')
  );
  if (targetAccountIndex !== -1) mappings.targetAccount = headers[targetAccountIndex];
  
  // Alternative for target account
  const accountIndex = normalizedHeaders.findIndex(h => 
    h === 'account' || h === 'username' || h.includes('user')
  );
  if (accountIndex !== -1) mappings.account = headers[accountIndex];
  
  // Find comment text column
  const commentTextIndex = normalizedHeaders.findIndex(h => 
    h.includes('comment') || h.includes('text') || h.includes('content')
  );
  if (commentTextIndex !== -1) mappings.commentText = headers[commentTextIndex];
  
  // Find comment author column
  const commentAuthorIndex = normalizedHeaders.findIndex(h => 
    h.includes('author') || h.includes('commenter') || h.includes('user')
  );
  if (commentAuthorIndex !== -1) mappings.commentAuthor = headers[commentAuthorIndex];
  
  // Find published date column
  const publishedAtIndex = normalizedHeaders.findIndex(h => 
    h.includes('date') || h.includes('published') || h.includes('created')
  );
  if (publishedAtIndex !== -1) mappings.publishedAt = headers[publishedAtIndex];
  
  // Find likes column
  const likesIndex = normalizedHeaders.findIndex(h => 
    h.includes('like') || h.includes('heart') || h.includes('favorite')
  );
  if (likesIndex !== -1) mappings.likes = headers[likesIndex];
  
  // Find replies column
  const repliesIndex = normalizedHeaders.findIndex(h => 
    h.includes('reply') || h.includes('response') || h.includes('comment_count')
  );
  if (repliesIndex !== -1) mappings.replies = headers[repliesIndex];
  
  // Find notes column
  const notesIndex = normalizedHeaders.findIndex(h => 
    h.includes('note') || h.includes('remark') || h.includes('comment')
  );
  if (notesIndex !== -1) mappings.notes = headers[notesIndex];
  
  return mappings;
}

/**
 * Helper to safely get string value from cell
 */
function getStringValue(value: any): string | null {
  if (value === undefined || value === null) return null;
  return String(value).trim();
}

/**
 * Helper to safely get numeric value from cell
 */
function getNumericValue(value: any): number | null {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

/**
 * Helper to safely get date value from cell
 */
function getDateValue(value: any): Date | null {
  if (value === undefined || value === null) return null;
  
  // If it's already a date object
  if (value instanceof Date) return value;
  
  // If it's a number (Excel serial date), convert it
  if (typeof value === 'number') {
    // Excel date starts from January 1, 1900
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }
  
  // Try to parse as string
  const date = new Date(String(value));
  return isNaN(date.getTime()) ? null : date;
}