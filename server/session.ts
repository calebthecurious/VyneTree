import session from 'express-session';
import pgSession from 'connect-pg-simple';
import dotenv from 'dotenv';
import { log } from './vite';

// Load environment variables
dotenv.config();

// Create PostgreSQL session store
const PostgresStore = pgSession(session);

// Configure session options
export const sessionOptions = {
  store: new PostgresStore({
    conString: process.env.DATABASE_URL,
    tableName: 'sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'vynetree_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
};

// Initialize session
export const initSession = (app: any) => {
  log('Initializing session middleware', 'session');
  app.use(session(sessionOptions));
};