import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contact } from '@shared/schema';
import { contactsApi } from '@/lib/api';

interface UseNetworkGraphProps {
  userId: number;
}

interface UseNetworkGraphReturn {
  contacts: Contact[] | undefined;
  isLoading: boolean;
  error: unknown;
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;
  getNeglectedContacts: () => Contact[];
  getContactsByTier: (tier: string) => Contact[];
  getTierCount: (tier: string) => number;
  isContactNeglected: (contact: Contact) => boolean;
}

export default function useNetworkGraph({ userId }: UseNetworkGraphProps): UseNetworkGraphReturn {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  const { data: contacts, isLoading, error } = useQuery<Contact[]>({
    queryKey: [`/api/users/${userId}/contacts`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Determine if a contact has been neglected based on tier and last interaction
  const isContactNeglected = (contact: Contact): boolean => {
    if (!contact.lastInteractedAt) return true;
    
    const daysSinceLastInteraction = Math.floor(
      (Date.now() - new Date(contact.lastInteractedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Define thresholds for neglect based on relationship tier
    switch (contact.relationshipTier) {
      case 'Intimate': return daysSinceLastInteraction > 14; // 2 weeks
      case 'Best': return daysSinceLastInteraction > 30; // 1 month
      case 'Good': return daysSinceLastInteraction > 60; // 2 months
      case 'Tribe': return daysSinceLastInteraction > 90; // 3 months
      default: return false;
    }
  };
  
  // Get all neglected contacts
  const getNeglectedContacts = (): Contact[] => {
    if (!contacts) return [];
    return contacts.filter(isContactNeglected);
  };
  
  // Filter contacts by relationship tier
  const getContactsByTier = (tier: string): Contact[] => {
    if (!contacts) return [];
    return contacts.filter(contact => contact.relationshipTier === tier);
  };
  
  // Get count of contacts by relationship tier
  const getTierCount = (tier: string): number => {
    if (!contacts) return 0;
    return contacts.filter(contact => contact.relationshipTier === tier).length;
  };

  return {
    contacts,
    isLoading,
    error,
    selectedContact,
    setSelectedContact,
    getNeglectedContacts,
    getContactsByTier,
    getTierCount,
    isContactNeglected
  };
}
