import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { log } from './vite';

// Load environment variables
dotenv.config();

// We need to ask for Supabase credentials
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  log('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.', 'supabase');
}

// Create Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
);

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      log(`Database connection error: ${error.message}`, 'supabase');
      return false;
    }
    
    log('Successfully connected to Supabase', 'supabase');
    return true;
  } catch (error) {
    log(`Failed to connect to Supabase: ${error}`, 'supabase');
    return false;
  }
}