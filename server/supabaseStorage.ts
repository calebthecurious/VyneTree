import { db } from './db';
import { IStorage } from './storage';
import { eq, and, desc, or, lt, gt, isNull, isNotNull, asc } from 'drizzle-orm';
import { log } from './vite';
import {
  User, InsertUser, users,
  Contact, InsertContact, contacts,
  Message, InsertMessage, messages,
  Interaction, InsertInteraction, interactions,
  CalendarEvent, InsertCalendarEvent, calendarEvents,
  Rsvp, InsertRsvp, rsvps,
  AiPrompt, InsertAiPrompt, aiPrompts,
  Subscription, InsertSubscription, subscriptions
} from '../shared/schema';

export class SupabaseStorage implements IStorage {
  // USER OPERATIONS
  async getUser(id: number): Promise<User | undefined> {
    try {
      const results = await db.select().from(users).where(eq(users.id, id));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      log(`Error fetching user: ${error}`, 'database');
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const results = await db.select().from(users).where(eq(users.username, username));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      log(`Error fetching user by username: ${error}`, 'database');
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const results = await db.select().from(users).where(eq(users.email, email));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      log(`Error fetching user by email: ${error}`, 'database');
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(user).returning();
      if (result.length === 0) {
        throw new Error('Failed to create user: No user returned from database');
      }
      return result[0];
    } catch (error) {
      log(`Error creating user: ${error}`, 'database');
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    try {
      const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error updating user: ${error}`, 'database');
      return undefined;
    }
  }

  // CONTACT OPERATIONS
  async getContact(id: number): Promise<Contact | undefined> {
    try {
      const results = await db.select().from(contacts).where(eq(contacts.id, id));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      log(`Error fetching contact: ${error}`, 'database');
      return undefined;
    }
  }

  async getContactsByUserId(userId: number): Promise<Contact[]> {
    try {
      return await db.select().from(contacts).where(eq(contacts.userId, userId)).orderBy(contacts.name);
    } catch (error) {
      log(`Error fetching contacts by user ID: ${error}`, 'database');
      return [];
    }
  }

  async getRecentContacts(userId: number, limit: number = 5): Promise<Contact[]> {
    try {
      return await db
        .select()
        .from(contacts)
        .where(eq(contacts.userId, userId))
        .orderBy(desc(contacts.lastInteractedAt))
        .limit(limit);
    } catch (error) {
      log(`Error fetching recent contacts: ${error}`, 'database');
      return [];
    }
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    try {
      const result = await db.insert(contacts).values(contact).returning();
      if (result.length === 0) {
        throw new Error('Failed to create contact: No contact returned from database');
      }
      return result[0];
    } catch (error) {
      log(`Error creating contact: ${error}`, 'database');
      throw new Error(`Failed to create contact: ${error}`);
    }
  }

  async updateContact(id: number, contactData: Partial<Contact>): Promise<Contact | undefined> {
    try {
      const result = await db.update(contacts).set(contactData).where(eq(contacts.id, id)).returning();
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error updating contact: ${error}`, 'database');
      return undefined;
    }
  }

  async deleteContact(id: number): Promise<boolean> {
    try {
      const result = await db.delete(contacts).where(eq(contacts.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      log(`Error deleting contact: ${error}`, 'database');
      return false;
    }
  }

  // MESSAGE OPERATIONS
  async getMessage(id: number): Promise<Message | undefined> {
    try {
      const results = await db.select().from(messages).where(eq(messages.id, id));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      log(`Error fetching message: ${error}`, 'database');
      return undefined;
    }
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number, limit: number = 50): Promise<Message[]> {
    try {
      const results = await db
        .select()
        .from(messages)
        .where(
          or(
            and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
            and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
          )
        )
        .orderBy(asc(messages.sentAt))
        .limit(limit);
      
      return results;
    } catch (error) {
      log(`Error fetching messages between users: ${error}`, 'database');
      return [];
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      const result = await db.insert(messages).values(message).returning();
      if (result.length === 0) {
        throw new Error('Failed to create message: No message returned from database');
      }
      return result[0];
    } catch (error) {
      log(`Error creating message: ${error}`, 'database');
      throw new Error(`Failed to create message: ${error}`);
    }
  }

  async updateMessageStatus(id: number, status: string): Promise<Message | undefined> {
    try {
      const result = await db
        .update(messages)
        .set({ status: status as any })
        .where(eq(messages.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error updating message status: ${error}`, 'database');
      return undefined;
    }
  }

  // INTERACTION OPERATIONS
  async getInteraction(id: number): Promise<Interaction | undefined> {
    try {
      const results = await db.select().from(interactions).where(eq(interactions.id, id));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      log(`Error fetching interaction: ${error}`, 'database');
      return undefined;
    }
  }

  async getInteractionsByContactId(contactId: number): Promise<Interaction[]> {
    try {
      return await db
        .select()
        .from(interactions)
        .where(eq(interactions.contactId, contactId))
        .orderBy(desc(interactions.timestamp));
    } catch (error) {
      log(`Error fetching interactions by contact ID: ${error}`, 'database');
      return [];
    }
  }

  async createInteraction(interaction: InsertInteraction): Promise<Interaction> {
    try {
      const result = await db.insert(interactions).values(interaction).returning();
      if (result.length === 0) {
        throw new Error('Failed to create interaction: No interaction returned from database');
      }
      return result[0];
    } catch (error) {
      log(`Error creating interaction: ${error}`, 'database');
      throw new Error(`Failed to create interaction: ${error}`);
    }
  }

  // CALENDAR EVENT OPERATIONS
  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    try {
      const results = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      log(`Error fetching calendar event: ${error}`, 'database');
      return undefined;
    }
  }

  async getCalendarEventsByUserId(userId: number): Promise<CalendarEvent[]> {
    try {
      return await db
        .select()
        .from(calendarEvents)
        .where(eq(calendarEvents.userId, userId))
        .orderBy(asc(calendarEvents.startTime));
    } catch (error) {
      log(`Error fetching calendar events by user ID: ${error}`, 'database');
      return [];
    }
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    try {
      const result = await db.insert(calendarEvents).values(event).returning();
      if (result.length === 0) {
        throw new Error('Failed to create calendar event: No event returned from database');
      }
      return result[0];
    } catch (error) {
      log(`Error creating calendar event: ${error}`, 'database');
      throw new Error(`Failed to create calendar event: ${error}`);
    }
  }

  async updateCalendarEvent(id: number, eventData: Partial<CalendarEvent>): Promise<CalendarEvent | undefined> {
    try {
      const result = await db
        .update(calendarEvents)
        .set(eventData)
        .where(eq(calendarEvents.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error updating calendar event: ${error}`, 'database');
      return undefined;
    }
  }

  async deleteCalendarEvent(id: number): Promise<boolean> {
    try {
      const result = await db.delete(calendarEvents).where(eq(calendarEvents.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      log(`Error deleting calendar event: ${error}`, 'database');
      return false;
    }
  }

  // RSVP OPERATIONS
  async getRsvp(id: number): Promise<Rsvp | undefined> {
    try {
      const results = await db.select().from(rsvps).where(eq(rsvps.id, id));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      log(`Error fetching RSVP: ${error}`, 'database');
      return undefined;
    }
  }

  async getRsvpsByEventId(eventId: number): Promise<Rsvp[]> {
    try {
      return await db.select().from(rsvps).where(eq(rsvps.eventId, eventId));
    } catch (error) {
      log(`Error fetching RSVPs by event ID: ${error}`, 'database');
      return [];
    }
  }

  async createRsvp(rsvp: InsertRsvp): Promise<Rsvp> {
    try {
      const result = await db.insert(rsvps).values(rsvp).returning();
      if (result.length === 0) {
        throw new Error('Failed to create RSVP: No RSVP returned from database');
      }
      return result[0];
    } catch (error) {
      log(`Error creating RSVP: ${error}`, 'database');
      throw new Error(`Failed to create RSVP: ${error}`);
    }
  }

  async updateRsvpStatus(id: number, status: string): Promise<Rsvp | undefined> {
    try {
      const result = await db
        .update(rsvps)
        .set({ status: status as any })
        .where(eq(rsvps.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error updating RSVP status: ${error}`, 'database');
      return undefined;
    }
  }

  // AI PROMPT OPERATIONS
  async getAiPrompt(id: number): Promise<AiPrompt | undefined> {
    try {
      const results = await db.select().from(aiPrompts).where(eq(aiPrompts.id, id));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      log(`Error fetching AI prompt: ${error}`, 'database');
      return undefined;
    }
  }

  async getAiPromptsByContactId(contactId: number): Promise<AiPrompt[]> {
    try {
      return await db.select().from(aiPrompts).where(eq(aiPrompts.contactId, contactId));
    } catch (error) {
      log(`Error fetching AI prompts by contact ID: ${error}`, 'database');
      return [];
    }
  }

  async getUnusedAiPrompts(userId: number, limit: number = 10): Promise<AiPrompt[]> {
    try {
      return await db
        .select()
        .from(aiPrompts)
        .where(and(eq(aiPrompts.userId, userId), eq(aiPrompts.used, false)))
        .limit(limit);
    } catch (error) {
      log(`Error fetching unused AI prompts: ${error}`, 'database');
      return [];
    }
  }

  async createAiPrompt(prompt: InsertAiPrompt): Promise<AiPrompt> {
    try {
      const result = await db.insert(aiPrompts).values(prompt).returning();
      if (result.length === 0) {
        throw new Error('Failed to create AI prompt: No prompt returned from database');
      }
      return result[0];
    } catch (error) {
      log(`Error creating AI prompt: ${error}`, 'database');
      throw new Error(`Failed to create AI prompt: ${error}`);
    }
  }

  async markAiPromptAsUsed(id: number): Promise<AiPrompt | undefined> {
    try {
      const result = await db
        .update(aiPrompts)
        .set({ used: true })
        .where(eq(aiPrompts.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error marking AI prompt as used: ${error}`, 'database');
      return undefined;
    }
  }

  // SUBSCRIPTION OPERATIONS
  async getSubscription(id: number): Promise<Subscription | undefined> {
    try {
      const results = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      log(`Error fetching subscription: ${error}`, 'database');
      return undefined;
    }
  }

  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    try {
      const results = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .orderBy(desc(subscriptions.startDate))
        .limit(1);
      return results.length > 0 ? results[0] : undefined;
    } catch (error) {
      log(`Error fetching subscription by user ID: ${error}`, 'database');
      return undefined;
    }
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    try {
      const result = await db.insert(subscriptions).values(subscription).returning();
      if (result.length === 0) {
        throw new Error('Failed to create subscription: No subscription returned from database');
      }
      return result[0];
    } catch (error) {
      log(`Error creating subscription: ${error}`, 'database');
      throw new Error(`Failed to create subscription: ${error}`);
    }
  }

  async updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    try {
      const result = await db
        .update(subscriptions)
        .set(subscriptionData)
        .where(eq(subscriptions.id, id))
        .returning();
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      log(`Error updating subscription: ${error}`, 'database');
      return undefined;
    }
  }
}