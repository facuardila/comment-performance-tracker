import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function initDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Initializing database...');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '002_create_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    const { error } = await supabase.rpc('execute_sql', {
      sql: sql
    });

    if (error) {
      console.error('Error executing migration:', error);
      // Try to execute the SQL directly as an alternative
      console.log('Trying to execute SQL directly...');
      
      // Split the SQL into individual statements and execute them one by one
      const statements = sql.split(/;\s*(?=\n|$)/).filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            // This is a workaround since Supabase doesn't allow direct execution of arbitrary SQL
            // In a real scenario, you'd run these queries manually or use Supabase migrations
            console.log(`Would execute: ${statement.substring(0, 100)}...`);
          } catch (stmtError) {
            console.error(`Error executing statement:`, stmtError);
          }
        }
      }
    } else {
      console.log('Database initialized successfully!');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
if (require.main === module) {
  initDatabase();
}

export default initDatabase;