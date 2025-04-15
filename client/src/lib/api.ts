import { apiRequest } from './queryClient';
import type { 
  User, InsertUser, 
  Contact, InsertContact,
  Message, InsertMessage,
  CalendarEvent, InsertCalendarEvent,
  Rsvp, InsertRsvp,
  AiPrompt, InsertAiPrompt
} from '@shared/schema';

// Authentication API
export const authApi = {
  login: async (email: string, password: string): Promise<{ message: string; user: User }> => {
    const res = await apiRequest('POST', '/api/auth/login', { email, password });
    return res.json();
  },
  
  logout: async (): Promise<{ message: string }> => {
    const res = await apiRequest('POST', '/api/auth/logout');
    return res.json();
  },
  
  register: async (userData: InsertUser): Promise<{ message: string; user: User }> => {
    const res = await apiRequest('POST', '/api/auth/register', userData);
    return res.json();
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const res = await apiRequest('GET', '/api/auth/me');
      return res.json();
    } catch (error) {
      // If not authenticated, return null
      return null;
    }
  }
};

// User API
export const userApi = {
  getUser: async (id: number): Promise<User> => {
    const res = await apiRequest('GET', `/api/users/${id}`);
    return res.json();
  },
  
  createUser: async (user: InsertUser): Promise<User> => {
    const res = await apiRequest('POST', '/api/users', user);
    return res.json();
  }
};

// Contacts API
export const contactsApi = {
  getContacts: async (userId: number): Promise<Contact[]> => {
    const res = await apiRequest('GET', `/api/users/${userId}/contacts`);
    return res.json();
  },
  
  getRecentContacts: async (userId: number, limit?: number): Promise<Contact[]> => {
    const queryStr = limit ? `?limit=${limit}` : '';
    const res = await apiRequest('GET', `/api/users/${userId}/contacts/recent${queryStr}`);
    return res.json();
  },
  
  createContact: async (contact: InsertContact): Promise<Contact> => {
    const res = await apiRequest('POST', '/api/contacts', contact);
    return res.json();
  },
  
  updateContact: async (id: number, contact: Partial<Contact>): Promise<Contact> => {
    const res = await apiRequest('PUT', `/api/contacts/${id}`, contact);
    return res.json();
  },
  
  deleteContact: async (id: number): Promise<{ success: boolean }> => {
    const res = await apiRequest('DELETE', `/api/contacts/${id}`);
    return res.json();
  }
};

// Messages API
export const messagesApi = {
  getMessagesBetweenUsers: async (userId: number, otherUserId: number, limit?: number): Promise<Message[]> => {
    const queryStr = limit ? `?limit=${limit}` : '';
    const res = await apiRequest('GET', `/api/messages/${userId}/${otherUserId}${queryStr}`);
    return res.json();
  },
  
  createMessage: async (message: InsertMessage): Promise<Message> => {
    const res = await apiRequest('POST', '/api/messages', message);
    return res.json();
  }
};

// Calendar Events API
export const calendarApi = {
  getEvents: async (userId: number): Promise<CalendarEvent[]> => {
    const res = await apiRequest('GET', `/api/users/${userId}/events`);
    return res.json();
  },
  
  createEvent: async (event: InsertCalendarEvent): Promise<CalendarEvent> => {
    const res = await apiRequest('POST', '/api/events', event);
    return res.json();
  },
  
  getRsvps: async (eventId: number): Promise<Rsvp[]> => {
    const res = await apiRequest('GET', `/api/events/${eventId}/rsvps`);
    return res.json();
  },
  
  createRsvp: async (rsvp: InsertRsvp): Promise<Rsvp> => {
    const res = await apiRequest('POST', '/api/rsvps', rsvp);
    return res.json();
  }
};

// AI Prompts API
export const aiPromptApi = {
  getUnusedPrompts: async (userId: number, limit?: number): Promise<AiPrompt[]> => {
    const queryStr = limit ? `?limit=${limit}` : '';
    const res = await apiRequest('GET', `/api/users/${userId}/prompts/unused${queryStr}`);
    return res.json();
  },
  
  createPrompt: async (prompt: InsertAiPrompt): Promise<AiPrompt> => {
    const res = await apiRequest('POST', '/api/prompts', prompt);
    return res.json();
  },
  
  markAsUsed: async (id: number): Promise<AiPrompt> => {
    const res = await apiRequest('PUT', `/api/prompts/${id}/use`);
    return res.json();
  }
};
