import { createClient } from '@supabase/supabase-js'

export async function initializeDatabase() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return { success: false, message: 'Supabase URL and key are required' }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test connection
    const { error } = await supabase.from('tracked_comments').select('count').limit(1)
    
    if (error) {
      console.error('Database connection test failed:', error)
      return { success: false, message: `Database connection failed: ${error.message}` }
    }
    
    return { success: true, message: 'Database initialized successfully', supabase }
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, message: `Error initializing database: ${error instanceof Error ? error.message : String(error)}` };
  }
}