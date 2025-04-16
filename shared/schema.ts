import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const relationshipTierEnum = pgEnum('relationship_tier', ['Intimate', 'Best', 'Good', 'Tribe']);
export const interactionTypeEnum = pgEnum('interaction_type', ['Call', 'Meetup']);
export const messageStatusEnum = pgEnum('message_status', ['Sent', 'Delivered', 'Read']);
export const rsvpStatusEnum = pgEnum('rsvp_status', ['Accepted', 'Declined', 'Pending']);
export const promptTypeEnum = pgEnum('prompt_type', ['Reminder', 'Conversation']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['Free', 'Premium']);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  profilePicture: text("profile_picture"),
  subscriptionPlan: subscriptionPlanEnum("subscription_plan").notNull().default('Free'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contacts
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  photo: text("photo"),
  relationshipTier: relationshipTierEnum("relationship_tier").notNull(),
  lastInteractedAt: timestamp("last_interacted_at"),
  importantDates: json("important_dates"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  status: messageStatusEnum("status").default('Sent'),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// Interactions (calls, meetups)
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  type: interactionTypeEnum("type").notNull(),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Calendar Events
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  shareableLink: text("shareable_link"),
  location: text("location"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RSVPs
export const rsvps = pgTable("rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => calendarEvents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: rsvpStatusEnum("status").default('Pending'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Prompts
export const aiPrompts = pgTable("ai_prompts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  type: promptTypeEnum("type").notNull(),
  content: text("content").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  plan: subscriptionPlanEnum("plan").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true,
    passwordHash: true 
  })
  .extend({
    // Add password field for client-side forms
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' })
  });

export const insertContactSchema = createInsertSchema(contacts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true, 
  sentAt: true 
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({ 
  id: true, 
  timestamp: true 
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ 
  id: true, 
  createdAt: true 
});

export const insertRsvpSchema = createInsertSchema(rsvps).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertAiPromptSchema = createInsertSchema(aiPrompts).omit({ 
  id: true, 
  createdAt: true 
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ 
  id: true 
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type Rsvp = typeof rsvps.$inferSelect;
export type InsertRsvp = z.infer<typeof insertRsvpSchema>;

export type AiPrompt = typeof aiPrompts.$inferSelect;
export type InsertAiPrompt = z.infer<typeof insertAiPromptSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
