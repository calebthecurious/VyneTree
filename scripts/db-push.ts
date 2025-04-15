import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import * as schema from '../shared/schema';
import { log } from '../server/vite';

// Load environment variables
dotenv.config();

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const runPush = async () => {
  log('Starting database schema push...', 'db-push');
  
  try {
    // Create a Postgres client
    const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
    
    // Create a Drizzle instance
    const db = drizzle(sql, { schema });
    
    // Execute custom SQL to ensure the enums exist first
    log('Creating enum types...', 'db-push');
    
    // List of enum creation statements
    const enumStatements = [
      `DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_tier') THEN
           CREATE TYPE "relationship_tier" AS ENUM('Intimate', 'Best', 'Good', 'Tribe');
         END IF;
       END $$;`,
      `DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interaction_type') THEN
           CREATE TYPE "interaction_type" AS ENUM('Call', 'Meetup');
         END IF;
       END $$;`,
      `DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
           CREATE TYPE "message_status" AS ENUM('Sent', 'Delivered', 'Read');
         END IF;
       END $$;`,
      `DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rsvp_status') THEN
           CREATE TYPE "rsvp_status" AS ENUM('Accepted', 'Declined', 'Pending');
         END IF;
       END $$;`,
      `DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prompt_type') THEN
           CREATE TYPE "prompt_type" AS ENUM('Reminder', 'Conversation');
         END IF;
       END $$;`,
      `DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
           CREATE TYPE "subscription_plan" AS ENUM('Free', 'Premium');
         END IF;
       END $$;`
    ];
    
    // Execute each enum statement
    for (const statement of enumStatements) {
      await sql.unsafe(statement);
    }
    
    log('Creating tables...', 'db-push');
    
    // Create tables for users first since other tables reference it
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "email" text NOT NULL UNIQUE,
        "name" text NOT NULL,
        "username" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "profile_picture" text,
        "subscription_plan" subscription_plan DEFAULT 'Free' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create contacts table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "contacts" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id"),
        "name" text NOT NULL,
        "photo" text,
        "relationship_tier" relationship_tier NOT NULL,
        "last_interacted_at" timestamp,
        "important_dates" json,
        "notes" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create messages table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" serial PRIMARY KEY NOT NULL,
        "sender_id" integer NOT NULL REFERENCES "users"("id"),
        "receiver_id" integer NOT NULL REFERENCES "users"("id"),
        "content" text NOT NULL,
        "status" message_status DEFAULT 'Sent',
        "sent_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create interactions table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "interactions" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id"),
        "contact_id" integer NOT NULL REFERENCES "contacts"("id"),
        "type" interaction_type NOT NULL,
        "notes" text,
        "timestamp" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create calendar_events table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "calendar_events" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id"),
        "title" text NOT NULL,
        "start_time" timestamp NOT NULL,
        "end_time" timestamp NOT NULL,
        "shareable_link" text,
        "location" text,
        "description" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create rsvps table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "rsvps" (
        "id" serial PRIMARY KEY NOT NULL,
        "event_id" integer NOT NULL REFERENCES "calendar_events"("id"),
        "user_id" integer NOT NULL REFERENCES "users"("id"),
        "status" rsvp_status DEFAULT 'Pending',
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create ai_prompts table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "ai_prompts" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id"),
        "contact_id" integer NOT NULL REFERENCES "contacts"("id"),
        "type" prompt_type NOT NULL,
        "content" text NOT NULL,
        "used" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create subscriptions table
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id"),
        "plan" subscription_plan NOT NULL,
        "start_date" timestamp DEFAULT now() NOT NULL,
        "end_date" timestamp
      );
    `);
    
    log('Database schema push completed successfully!', 'db-push');
  } catch (error) {
    log(`Database schema push failed: ${error}`, 'db-push');
    console.error(error);
    process.exit(1);
  }
};

// Execute push
runPush();