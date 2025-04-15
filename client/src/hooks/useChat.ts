import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message, InsertMessage, User } from '@shared/schema';
import { messagesApi, userApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseChatProps {
  currentUserId: number;
}

interface UseChatReturn {
  selectedUserId: number | null;
  setSelectedUserId: (userId: number | null) => void;
  messages: Message[] | undefined;
  otherUser: User | undefined;
  isLoading: boolean;
  isLoadingUser: boolean;
  error: unknown;
  sendMessage: (content: string) => void;
  isSending: boolean;
}

export default function useChat({ currentUserId }: UseChatProps): UseChatReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Fetch messages between users
  const { 
    data: messages, 
    isLoading, 
    error 
  } = useQuery<Message[]>({
    queryKey: [`/api/messages/${currentUserId}/${selectedUserId}`],
    enabled: !!selectedUserId,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  // Fetch other user information
  const { 
    data: otherUser, 
    isLoading: isLoadingUser 
  } = useQuery<User>({
    queryKey: [`/api/users/${selectedUserId}`],
    enabled: !!selectedUserId,
  });
  
  // Send a message
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: InsertMessage) => messagesApi.createMessage(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${currentUserId}/${selectedUserId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Send message helper function
  const sendMessage = (content: string) => {
    if (!selectedUserId || !content.trim()) return;
    
    sendMessageMutation.mutate({
      senderId: currentUserId,
      receiverId: selectedUserId,
      content,
      status: 'Sent'
    });
  };
  
  return {
    selectedUserId,
    setSelectedUserId,
    messages,
    otherUser,
    isLoading,
    isLoadingUser,
    error,
    sendMessage,
    isSending: sendMessageMutation.isPending
  };
}
