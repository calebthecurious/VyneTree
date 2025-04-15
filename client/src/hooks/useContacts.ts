import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Contact, InsertContact } from '@shared/schema';
import { contactsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseContactsProps {
  userId: number;
}

interface UseContactsReturn {
  contacts: Contact[] | undefined;
  recentContacts: Contact[] | undefined;
  isLoading: boolean;
  isLoadingRecent: boolean;
  error: unknown;
  createContact: (contact: InsertContact) => void;
  updateContact: (id: number, contact: Partial<Contact>) => void;
  deleteContact: (id: number) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;
}

export default function useContacts({ userId }: UseContactsProps): UseContactsReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Fetch all contacts
  const { data: contacts, isLoading, error } = useQuery<Contact[]>({
    queryKey: [`/api/users/${userId}/contacts`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch recent contacts
  const { data: recentContacts, isLoading: isLoadingRecent } = useQuery<Contact[]>({
    queryKey: [`/api/users/${userId}/contacts/recent`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Create a new contact
  const createContactMutation = useMutation({
    mutationFn: (contact: InsertContact) => contactsApi.createContact(contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/contacts`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/contacts/recent`] });
      toast({
        title: "Contact created",
        description: "The contact has been successfully created."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create contact. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Update an existing contact
  const updateContactMutation = useMutation({
    mutationFn: ({ id, contact }: { id: number, contact: Partial<Contact> }) => contactsApi.updateContact(id, contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/contacts`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/contacts/recent`] });
      toast({
        title: "Contact updated",
        description: "The contact has been successfully updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Delete a contact
  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => contactsApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/contacts`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/contacts/recent`] });
      if (selectedContact) {
        setSelectedContact(null);
      }
      toast({
        title: "Contact deleted",
        description: "The contact has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  return {
    contacts,
    recentContacts,
    isLoading,
    isLoadingRecent,
    error,
    createContact: (contact: InsertContact) => createContactMutation.mutate(contact),
    updateContact: (id: number, contact: Partial<Contact>) => updateContactMutation.mutate({ id, contact }),
    deleteContact: (id: number) => deleteContactMutation.mutate(id),
    isCreating: createContactMutation.isPending,
    isUpdating: updateContactMutation.isPending,
    isDeleting: deleteContactMutation.isPending,
    selectedContact,
    setSelectedContact
  };
}
