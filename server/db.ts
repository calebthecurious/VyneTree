import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import * as schema from '../shared/schema.js';
import { log } from './vite.js';

// Load environment variables
dotenv.config();

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  log('DATABASE_URL environment variable is required', 'database');
  throw new Error('DATABASE_URL environment variable is required');
}

// Create a Postgres client
const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20
});

// Create a Drizzle ORM instance
export const db = drizzle(sql, { schema });

// Test database connection
export async function testDatabaseConnection() {
  try {
    // Execute a simple query to test the connection
    const result = await sql`SELECT 1 as connected`;
    log('Successfully connected to PostgreSQL database', 'database');
    return true;
  } catch (error) {
    log(`Failed to connect to PostgreSQL database: ${error}`, 'database');
    return false;
  }
}