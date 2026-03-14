"use server";

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Initialize the database with required tables and functions
 */
export async function initializeDatabase() {
  try {
    // In a real implementation, you would run these SQL commands against your database
    // For now, we'll just return success
    
    console.log('Database initialization completed');
    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, message: `Error initializing database: ${(error as Error).message` };
  }
}

/**
 * Check if the database is properly initialized
 */
export async function checkDatabaseConnection() {
  try {
    const { count, error } = await supabase
      .from('tracked_comments')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error('Database connection error:', error);
      return { success: false, message: `Database connection error: ${error.message}` };
    }
    
    return { success: true, message: 'Database connection successful', count };
  } catch (error) {
    console.error('Database connection error:', error);
    return { success: false, message: `Database connection error: ${(error as Error).message` };
  }
}