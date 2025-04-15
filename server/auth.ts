import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { log } from './vite';
import bcrypt from 'bcrypt';

// Set up the Passport Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await storage.getUserByEmail(email);
        
        // If user not found
        if (!user) {
          log(`Login attempt failed: User with email ${email} not found`, 'auth');
          return done(null, false, { message: 'Incorrect email or password' });
        }
        
        // Verify password (in production, compare hashed passwords)
        // For now, we're doing a simple comparison for development
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
          log(`Login attempt failed: Invalid password for user ${user.email}`, 'auth');
          return done(null, false, { message: 'Incorrect email or password' });
        }
        
        // User authenticated successfully
        log(`User authenticated: ${user.email}`, 'auth');
        return done(null, user);
      } catch (error) {
        log(`Authentication error: ${error}`, 'auth');
        return done(error);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Authentication middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: 'Authentication required' });
};

// Allow unauthenticated access to specific API routes for development
export const isAuthenticatedOrDev = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() || process.env.NODE_ENV === 'development') {
    return next();
  }
  
  res.status(401).json({ message: 'Authentication required' });
};

// Hash password for new user registrations
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};