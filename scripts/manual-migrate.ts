import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { log } from '../server/vite';

// Load environment variables
dotenv.config();

// Check if Supabase credentials are available
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

const runManualMigration = async () => {
  log('Starting manual database migration...', 'migrate');
  
  try {
    // Read migration SQL file
    const migrationFile = path.join(process.cwd(), 'migrations', '0000_ambiguous_nico_minoru.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
    
    // Split the migration into individual statements
    const statements = migrationSQL.split('--> statement-breakpoint');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      log(`Executing statement ${i + 1} of ${statements.length}...`, 'migrate');
      
      const { error } = await supabase.rpc('exec_sql', { query: statement });
      
      if (error) {
        log(`Error executing statement ${i + 1}: ${error.message}`, 'migrate');
        process.exit(1);
      }
    }
    
    log('Manual migration completed successfully!', 'migrate');
  } catch (error) {
    log(`Manual migration failed: ${error}`, 'migrate');
    process.exit(1);
  }
};

// Execute migration
runManualMigration();