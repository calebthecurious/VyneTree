import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertContactSchema, insertMessageSchema, 
  insertCalendarEventSchema, insertRsvpSchema, insertAiPromptSchema } from "@shared/schema";
import { z } from "zod";
import passport from "passport";
import { isAuthenticated, isAuthenticatedOrDev, hashPassword } from "./auth";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed some initial data for demo purposes
  await seedInitialData();

  // Authentication routes
  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        log(`Login error: ${err}`, 'auth');
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      
      req.logIn(user, (err) => {
        if (err) {
          log(`Login session error: ${err}`, 'auth');
          return next(err);
        }
        
        // Remove password from response
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        log(`User logged in: ${user.username}`, 'auth');
        return res.json({ message: "Login successful", user: userWithoutPassword });
      });
    })(req, res, next);
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      const username = (req.user as any)?.username;
      req.logout((err) => {
        if (err) {
          log(`Logout error: ${err}`, 'auth');
          return res.status(500).json({ message: "Logout failed" });
        }
        log(`User logged out: ${username}`, 'auth');
        res.json({ message: "Logout successful" });
      });
    } else {
      res.json({ message: "No active session" });
    }
  });
  
  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      // Remove password from response
      const user = { ...(req.user as any) };
      delete user.password;
      
      return res.json(user);
    }
    
    if (process.env.NODE_ENV === 'development') {
      // In development, default to demo user
      storage.getUser(1).then(user => {
        if (user) {
          const userWithoutPassword = { ...user };
          delete userWithoutPassword.password;
          return res.json(userWithoutPassword);
        } else {
          return res.status(401).json({ message: "Not authenticated" });
        }
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user with hashed password
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
        profilePicture: userData.profilePicture || null,
        subscriptionPlan: userData.subscriptionPlan || 'Free'
      });
      
      // Remove password from response
      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;
      
      log(`User registered: ${newUser.username}`, 'auth');
      
      // Log the user in automatically
      req.logIn(newUser, (err) => {
        if (err) {
          log(`Auto login error after registration: ${err}`, 'auth');
          return res.status(201).json({ 
            message: "Registration successful, but auto-login failed", 
            user: userWithoutPassword 
          });
        }
        
        return res.status(201).json({ 
          message: "Registration and login successful", 
          user: userWithoutPassword 
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid registration data", 
          errors: error.errors 
        });
      }
      
      log(`Registration error: ${error}`, 'auth');
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  // Users routes
  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID" });
    
    const user = await storage.getUser(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    return res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Contacts routes
  app.get("/api/users/:userId/contacts", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
    
    const contacts = await storage.getContactsByUserId(userId);
    return res.json(contacts);
  });

  app.get("/api/users/:userId/contacts/recent", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const contacts = await storage.getRecentContacts(userId, limit);
    return res.json(contacts);
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      return res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid contact ID" });
    
    try {
      const updatedContact = await storage.updateContact(id, req.body);
      if (!updatedContact) return res.status(404).json({ message: "Contact not found" });
      
      return res.json(updatedContact);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid contact ID" });
    
    const success = await storage.deleteContact(id);
    if (!success) return res.status(404).json({ message: "Contact not found" });
    
    return res.json({ success: true });
  });

  // Messages routes
  app.get("/api/messages/:userId/:otherUserId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const otherUserId = parseInt(req.params.otherUserId);
    
    if (isNaN(userId) || isNaN(otherUserId)) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const messages = await storage.getMessagesBetweenUsers(userId, otherUserId, limit);
    return res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      return res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Calendar events routes
  app.get("/api/users/:userId/events", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
    
    const events = await storage.getCalendarEventsByUserId(userId);
    return res.json(events);
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(eventData);
      return res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create event" });
    }
  });

  // RSVPs routes
  app.get("/api/events/:eventId/rsvps", async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) return res.status(400).json({ message: "Invalid event ID" });
    
    const rsvps = await storage.getRsvpsByEventId(eventId);
    return res.json(rsvps);
  });

  app.post("/api/rsvps", async (req, res) => {
    try {
      const rsvpData = insertRsvpSchema.parse(req.body);
      const rsvp = await storage.createRsvp(rsvpData);
      return res.status(201).json(rsvp);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid RSVP data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create RSVP" });
    }
  });

  // AI prompts routes
  app.get("/api/users/:userId/prompts/unused", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const prompts = await storage.getUnusedAiPrompts(userId, limit);
    return res.json(prompts);
  });

  app.post("/api/prompts", async (req, res) => {
    try {
      const promptData = insertAiPromptSchema.parse(req.body);
      const prompt = await storage.createAiPrompt(promptData);
      return res.status(201).json(prompt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid prompt data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create prompt" });
    }
  });

  app.put("/api/prompts/:id/use", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid prompt ID" });
    
    const updatedPrompt = await storage.markAiPromptAsUsed(id);
    if (!updatedPrompt) return res.status(404).json({ message: "Prompt not found" });
    
    return res.json(updatedPrompt);
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function seedInitialData() {
  // Only seed if no users exist
  const existingUser = await storage.getUserByUsername("demo");
  if (existingUser) return;
  
  // Hash password for demo user
  const hashedPassword = await hashPassword("password123");
  
  // Create demo user
  const user = await storage.createUser({
    username: "demo",
    password: hashedPassword,
    email: "demo@vynetree.com",
    name: "Sarah Chen",
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    subscriptionPlan: "Free"
  });
  
  // Create some sample contacts
  const contacts = [
    { name: "Mom", relationshipTier: "Intimate", userId: user.id, photo: "https://images.unsplash.com/photo-1581535571342-5cf4e9b5a2c8?w=400&auto=format&fit=crop" },
    { name: "Dad", relationshipTier: "Intimate", userId: user.id, photo: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=400&auto=format&fit=crop" },
    { name: "Partner", relationshipTier: "Intimate", userId: user.id, photo: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&auto=format&fit=crop" },
    { name: "Sister", relationshipTier: "Intimate", userId: user.id, photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop", lastInteractedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000) },
    { name: "Alex", relationshipTier: "Best", userId: user.id, photo: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&auto=format&fit=crop", lastInteractedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { name: "Maya", relationshipTier: "Best", userId: user.id, photo: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=400&auto=format&fit=crop" },
    { name: "Jordan", relationshipTier: "Best", userId: user.id, photo: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop", lastInteractedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { name: "Taylor", relationshipTier: "Best", userId: user.id, photo: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&auto=format&fit=crop" },
    { name: "Sam", relationshipTier: "Good", userId: user.id, photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop" },
    { name: "Jamie", relationshipTier: "Good", userId: user.id, photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop", lastInteractedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
    { name: "Casey", relationshipTier: "Good", userId: user.id, photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop" },
    { name: "Drew", relationshipTier: "Good", userId: user.id, photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop" },
    { name: "Pat", relationshipTier: "Tribe", userId: user.id, photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop" },
    { name: "Ari", relationshipTier: "Tribe", userId: user.id, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop" },
    { name: "Robin", relationshipTier: "Tribe", userId: user.id, photo: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&auto=format&fit=crop" },
    { name: "Quinn", relationshipTier: "Tribe", userId: user.id, photo: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&auto=format&fit=crop", lastInteractedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) }
  ];
  
  const createdContacts = await Promise.all(
    contacts.map(contact => storage.createContact(contact))
  );
  
  // Create some AI nudges
  const nudges = [
    { 
      userId: user.id, 
      contactId: createdContacts[3].id, // Sister
      type: "Reminder", 
      content: "Ask her about her new job at Google. She started 2 weeks ago and would appreciate your support."
    },
    { 
      userId: user.id, 
      contactId: createdContacts[6].id, // Jordan
      type: "Reminder", 
      content: "Ask how his startup is progressing. He mentioned funding challenges in your last conversation."
    },
    { 
      userId: user.id, 
      contactId: createdContacts[9].id, // Jamie
      type: "Conversation", 
      content: "Jamie just updated their LinkedIn with a new position at Tesla. Send a congratulatory message!"
    }
  ];
  
  await Promise.all(
    nudges.map(nudge => storage.createAiPrompt(nudge))
  );
  
  // Create some calendar events
  const now = new Date();
  const calendarEvents = [
    {
      userId: user.id,
      title: "Coffee with Jordan",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0),
      location: "Blue Bottle Coffee",
      description: "Catch up on startup progress",
      shareableLink: "vyne.tree/demo/event1"
    },
    {
      userId: user.id,
      title: "Lunch with Team",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 12, 30),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 13, 30),
      location: "Chipotle",
      description: "Monthly team lunch",
      shareableLink: "vyne.tree/demo/event2"
    },
    {
      userId: user.id,
      title: "Call with Mom",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 18, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 18, 30),
      description: "Weekly check-in call",
      shareableLink: "vyne.tree/demo/event3"
    }
  ];
  
  await Promise.all(
    calendarEvents.map(event => storage.createCalendarEvent(event))
  );
  
  // Create messages with second user if needed
  const otherUser = await storage.getUserByUsername("sarah");
  if (!otherUser) {
    const sarah = await storage.createUser({
      username: "sarah",
      password: "password123",
      email: "sarah@example.com",
      name: "Sarah",
      profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      subscriptionPlan: "Free"
    });
    
    // Create some sample messages
    const messagesSarah = [
      {
        senderId: sarah.id,
        receiverId: user.id,
        content: "Hey! How's the new project coming along? Would love to catch up soon!",
        status: "Read"
      },
      {
        senderId: user.id,
        receiverId: sarah.id,
        content: "It's going well! The client is happy with the progress. Would love to catch up - are you free this Thursday?",
        status: "Read"
      },
      {
        senderId: sarah.id,
        receiverId: user.id,
        content: "Thursday works for me! Would 4 PM work for you?",
        status: "Read"
      }
    ];
    
    await Promise.all(
      messagesSarah.map(message => storage.createMessage(message))
    );
  }
}
