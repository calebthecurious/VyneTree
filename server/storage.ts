import {
  users, contacts, messages, interactions, calendarEvents, rsvps, aiPrompts, subscriptions,
  type User, type InsertUser,
  type Contact, type InsertContact,
  type Message, type InsertMessage,
  type Interaction, type InsertInteraction,
  type CalendarEvent, type InsertCalendarEvent,
  type Rsvp, type InsertRsvp,
  type AiPrompt, type InsertAiPrompt,
  type Subscription, type InsertSubscription,
} from "@shared/schema";

export interface IStorage {
  // User Operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Contact Operations
  getContact(id: number): Promise<Contact | undefined>;
  getContactsByUserId(userId: number): Promise<Contact[]>;
  getRecentContacts(userId: number, limit?: number): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contactData: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  
  // Message Operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBetweenUsers(userId1: number, userId2: number, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: string): Promise<Message | undefined>;
  
  // Interaction Operations
  getInteraction(id: number): Promise<Interaction | undefined>;
  getInteractionsByContactId(contactId: number): Promise<Interaction[]>;
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;
  
  // Calendar Event Operations
  getCalendarEvent(id: number): Promise<CalendarEvent | undefined>;
  getCalendarEventsByUserId(userId: number): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, eventData: Partial<CalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: number): Promise<boolean>;
  
  // RSVP Operations
  getRsvp(id: number): Promise<Rsvp | undefined>;
  getRsvpsByEventId(eventId: number): Promise<Rsvp[]>;
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
  updateRsvpStatus(id: number, status: string): Promise<Rsvp | undefined>;
  
  // AI Prompt Operations
  getAiPrompt(id: number): Promise<AiPrompt | undefined>;
  getAiPromptsByContactId(contactId: number): Promise<AiPrompt[]>;
  getUnusedAiPrompts(userId: number, limit?: number): Promise<AiPrompt[]>;
  createAiPrompt(prompt: InsertAiPrompt): Promise<AiPrompt>;
  markAiPromptAsUsed(id: number): Promise<AiPrompt | undefined>;
  
  // Subscription Operations
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private contacts: Map<number, Contact> = new Map();
  private messages: Map<number, Message> = new Map();
  private interactions: Map<number, Interaction> = new Map();
  private calendarEvents: Map<number, CalendarEvent> = new Map();
  private rsvps: Map<number, Rsvp> = new Map();
  private aiPrompts: Map<number, AiPrompt> = new Map();
  private subscriptions: Map<number, Subscription> = new Map();
  
  private userIdCounter = 1;
  private contactIdCounter = 1;
  private messageIdCounter = 1;
  private interactionIdCounter = 1;
  private calendarEventIdCounter = 1;
  private rsvpIdCounter = 1;
  private aiPromptIdCounter = 1;
  private subscriptionIdCounter = 1;

  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...userData,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Contact Operations
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async getContactsByUserId(userId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(
      (contact) => contact.userId === userId
    );
  }

  async getRecentContacts(userId: number, limit: number = 5): Promise<Contact[]> {
    return Array.from(this.contacts.values())
      .filter((contact) => contact.userId === userId)
      .sort((a, b) => {
        if (!a.lastInteractedAt) return 1;
        if (!b.lastInteractedAt) return -1;
        return b.lastInteractedAt.getTime() - a.lastInteractedAt.getTime();
      })
      .slice(0, limit);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactIdCounter++;
    const now = new Date();
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: number, contactData: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact = {
      ...contact,
      ...contactData,
      updatedAt: new Date()
    };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Message Operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number, limit: number = 50): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (message) => 
          (message.senderId === userId1 && message.receiverId === userId2) ||
          (message.senderId === userId2 && message.receiverId === userId1)
      )
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
      .slice(-limit);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      sentAt: now
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessageStatus(id: number, status: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = {
      ...message,
      status: status as any
    };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Interaction Operations
  async getInteraction(id: number): Promise<Interaction | undefined> {
    return this.interactions.get(id);
  }

  async getInteractionsByContactId(contactId: number): Promise<Interaction[]> {
    return Array.from(this.interactions.values())
      .filter((interaction) => interaction.contactId === contactId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createInteraction(insertInteraction: InsertInteraction): Promise<Interaction> {
    const id = this.interactionIdCounter++;
    const now = new Date();
    const interaction: Interaction = {
      ...insertInteraction,
      id,
      timestamp: now
    };
    this.interactions.set(id, interaction);
    
    // Update last interaction date on contact
    const contact = this.contacts.get(insertInteraction.contactId);
    if (contact) {
      this.contacts.set(contact.id, {
        ...contact,
        lastInteractedAt: now,
        updatedAt: now
      });
    }
    
    return interaction;
  }

  // Calendar Event Operations
  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    return this.calendarEvents.get(id);
  }

  async getCalendarEventsByUserId(userId: number): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values())
      .filter((event) => event.userId === userId)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = this.calendarEventIdCounter++;
    const now = new Date();
    const event: CalendarEvent = {
      ...insertEvent,
      id,
      createdAt: now
    };
    this.calendarEvents.set(id, event);
    return event;
  }

  async updateCalendarEvent(id: number, eventData: Partial<CalendarEvent>): Promise<CalendarEvent | undefined> {
    const event = this.calendarEvents.get(id);
    if (!event) return undefined;
    
    const updatedEvent = {
      ...event,
      ...eventData
    };
    this.calendarEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteCalendarEvent(id: number): Promise<boolean> {
    return this.calendarEvents.delete(id);
  }

  // RSVP Operations
  async getRsvp(id: number): Promise<Rsvp | undefined> {
    return this.rsvps.get(id);
  }

  async getRsvpsByEventId(eventId: number): Promise<Rsvp[]> {
    return Array.from(this.rsvps.values())
      .filter((rsvp) => rsvp.eventId === eventId);
  }

  async createRsvp(insertRsvp: InsertRsvp): Promise<Rsvp> {
    const id = this.rsvpIdCounter++;
    const now = new Date();
    const rsvp: Rsvp = {
      ...insertRsvp,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.rsvps.set(id, rsvp);
    return rsvp;
  }

  async updateRsvpStatus(id: number, status: string): Promise<Rsvp | undefined> {
    const rsvp = this.rsvps.get(id);
    if (!rsvp) return undefined;
    
    const updatedRsvp = {
      ...rsvp,
      status: status as any,
      updatedAt: new Date()
    };
    this.rsvps.set(id, updatedRsvp);
    return updatedRsvp;
  }

  // AI Prompt Operations
  async getAiPrompt(id: number): Promise<AiPrompt | undefined> {
    return this.aiPrompts.get(id);
  }

  async getAiPromptsByContactId(contactId: number): Promise<AiPrompt[]> {
    return Array.from(this.aiPrompts.values())
      .filter((prompt) => prompt.contactId === contactId);
  }

  async getUnusedAiPrompts(userId: number, limit: number = 10): Promise<AiPrompt[]> {
    return Array.from(this.aiPrompts.values())
      .filter((prompt) => prompt.userId === userId && !prompt.used)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createAiPrompt(insertPrompt: InsertAiPrompt): Promise<AiPrompt> {
    const id = this.aiPromptIdCounter++;
    const now = new Date();
    const prompt: AiPrompt = {
      ...insertPrompt,
      id,
      createdAt: now
    };
    this.aiPrompts.set(id, prompt);
    return prompt;
  }

  async markAiPromptAsUsed(id: number): Promise<AiPrompt | undefined> {
    const prompt = this.aiPrompts.get(id);
    if (!prompt) return undefined;
    
    const updatedPrompt = {
      ...prompt,
      used: true
    };
    this.aiPrompts.set(id, updatedPrompt);
    return updatedPrompt;
  }

  // Subscription Operations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values())
      .find((subscription) => subscription.userId === userId);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionIdCounter++;
    const subscription: Subscription = {
      ...insertSubscription,
      id
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    
    const updatedSubscription = {
      ...subscription,
      ...subscriptionData
    };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
}

import { SupabaseStorage } from './supabaseStorage';

// Use Supabase storage by default, and MemStorage only for testing
const useMemStorage = process.env.NODE_ENV === 'test';

// For now, we're using Supabase storage for all environments
export const storage = new SupabaseStorage();
