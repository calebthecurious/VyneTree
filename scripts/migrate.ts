import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { log } from '../server/vite';

// Load environment variables
dotenv.config();

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const runMigration = async () => {
  log('Starting database migration...', 'migrate');
  
  try {
    // Create a Postgres client
    const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
    
    // Create a Drizzle instance
    const db = drizzle(sql);
    
    // Run the migrations
    log('Applying schema to database...', 'migrate');
    await migrate(db, { migrationsFolder: 'migrations' });
    
    log('Migration completed successfully!', 'migrate');
  } catch (error) {
    log(`Migration failed: ${error}`, 'migrate');
    process.exit(1);
  }
};

// Execute migration
runMigration();