import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
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

const testSupabase = async () => {
  log('Testing Supabase connection...', 'test');
  
  try {
    // Try to query the users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      log(`Error querying users table: ${usersError.message}`, 'test');
      
      // Try to create the demo user
      const demoUser = {
        email: 'demo@example.com',
        name: 'Demo User',
        username: 'demo',
        password: 'password123',
        profilePicture: null,
        subscriptionPlan: 'Free'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert(demoUser)
        .select();
      
      if (insertError) {
        log(`Error creating demo user: ${insertError.message}`, 'test');
      } else {
        log(`Successfully created demo user: ${JSON.stringify(insertData)}`, 'test');
      }
    } else {
      log(`Successfully queried users table: ${JSON.stringify(usersData)}`, 'test');
    }
    
    // Check if we can access schema information
    log('Checking schema information...', 'test');
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_schema_info');
    
    if (schemaError) {
      log(`Error getting schema info: ${schemaError.message}`, 'test');
      
      // Try a more direct approach
      const { data: tablesData, error: tablesError } = await supabase
        .from('pg_tables')
        .select('*')
        .eq('schemaname', 'public');
      
      if (tablesError) {
        log(`Error listing tables: ${tablesError.message}`, 'test');
      } else {
        log(`Tables in public schema: ${JSON.stringify(tablesData)}`, 'test');
      }
    } else {
      log(`Schema info: ${JSON.stringify(schemaData)}`, 'test');
    }
  } catch (error) {
    log(`Test failed with error: ${error}`, 'test');
  }
};

// Run test
testSupabase();