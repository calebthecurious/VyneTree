import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AiPrompt, Contact } from '@shared/schema';
import { aiPromptApi, contactsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseNudgesProps {
  userId: number;
}

interface UseNudgesReturn {
  prompts: AiPrompt[] | undefined;
  contacts: Contact[] | undefined;
  isLoading: boolean;
  isLoadingContacts: boolean;
  error: unknown;
  markPromptAsUsed: (promptId: number) => void;
  isMarking: boolean;
  getContactForPrompt: (contactId: number) => Contact | undefined;
  selectedPrompt: AiPrompt | null;
  setSelectedPrompt: (prompt: AiPrompt | null) => void;
}

export default function useNudges({ userId }: UseNudgesProps): UseNudgesReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedPrompt, setSelectedPrompt] = useState<AiPrompt | null>(null);
  
  // Fetch all AI prompts (nudges)
  const { data: prompts, isLoading, error } = useQuery<AiPrompt[]>({
    queryKey: [`/api/users/${userId}/prompts/unused`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch all contacts (to link with prompts)
  const { data: contacts, isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: [`/api/users/${userId}/contacts`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Mark a prompt as used
  const markPromptUsedMutation = useMutation({
    mutationFn: (promptId: number) => aiPromptApi.markAsUsed(promptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/prompts/unused`] });
      toast({
        title: "Action taken",
        description: "Nudge has been marked as actioned."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark nudge as used. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Helper to get contact details for a prompt
  const getContactForPrompt = (contactId: number): Contact | undefined => {
    return contacts?.find(contact => contact.id === contactId);
  };
  
  return {
    prompts,
    contacts,
    isLoading,
    isLoadingContacts,
    error,
    markPromptAsUsed: (promptId: number) => markPromptUsedMutation.mutate(promptId),
    isMarking: markPromptUsedMutation.isPending,
    getContactForPrompt,
    selectedPrompt,
    setSelectedPrompt
  };
}
