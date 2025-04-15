import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Message, InsertMessage } from '@shared/schema';
import { messagesApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  currentUserId: number;
  otherUserId: number;
}

const ChatInterface = ({ currentUserId, otherUserId }: ChatInterfaceProps) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const { data: otherUser, isLoading: loadingUser } = useQuery<User>({
    queryKey: [`/api/users/${otherUserId}`],
  });
  
  const { data: messages, isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: [`/api/messages/${currentUserId}/${otherUserId}`],
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: InsertMessage) => messagesApi.createMessage(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${currentUserId}/${otherUserId}`] });
      setMessageInput('');
    }
  });
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    sendMessageMutation.mutate({
      senderId: currentUserId,
      receiverId: otherUserId,
      content: messageInput,
      status: 'Sent'
    });
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (loadingUser || loadingMessages) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col" style={{ height: '400px' }}>
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <Skeleton className="h-16 w-3/4 mb-4" />
          <Skeleton className="h-16 w-3/4 mb-4 ml-auto" />
          <Skeleton className="h-16 w-3/4" />
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col" style={{ height: '400px' }}>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img 
              className="h-10 w-10 rounded-full object-cover" 
              src={otherUser?.profilePicture || "https://via.placeholder.com/40"} 
              alt={otherUser?.name}
            />
          </div>
          <div className="ml-3">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Chat with {otherUser?.name}
            </h3>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 text-gray-400 hover:text-gray-500">
            <i className='bx bx-phone text-xl'></i>
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-500">
            <i className='bx bx-video text-xl'></i>
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-500">
            <i className='bx bx-info-circle text-xl'></i>
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto" id="chat-messages">
        {messages && messages.map((message) => {
          const isSentByCurrentUser = message.senderId === currentUserId;
          const messageTime = new Date(message.sentAt);
          
          return (
            <div 
              key={message.id} 
              className={`flex items-end mb-4 ${isSentByCurrentUser ? 'justify-end' : ''}`}
            >
              {!isSentByCurrentUser && (
                <div className="flex-shrink-0 mr-3">
                  <img 
                    className="h-8 w-8 rounded-full object-cover" 
                    src={otherUser?.profilePicture || "https://via.placeholder.com/32"} 
                    alt={otherUser?.name}
                  />
                </div>
              )}
              <div 
                className={`py-2 px-4 max-w-xs rounded-lg ${
                  isSentByCurrentUser 
                    ? 'bg-primary-100 text-gray-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-gray-500 mt-1">{format(messageTime, 'h:mm a')}</p>
              </div>
              {isSentByCurrentUser && (
                <div className="flex-shrink-0 ml-3">
                  <img 
                    className="h-8 w-8 rounded-full object-cover" 
                    src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Current user"
                  />
                </div>
              )}
            </div>
          );
        })}
        
        {/* Calendar invitation card - shown conditionally */}
        {messages && messages.some(m => m.content.toLowerCase().includes('thursday') && m.content.toLowerCase().includes('4 pm')) && (
          <div className="flex items-center justify-center my-4">
            <div className="bg-secondary-50 border border-secondary-100 rounded-lg py-2 px-4">
              <div className="flex items-center space-x-2">
                <i className='bx bx-calendar text-secondary-500'></i>
                <div>
                  <p className="text-sm font-medium text-secondary-700">Thursday, 4:00 PM</p>
                  <p className="text-xs text-gray-500">Coffee Chat with {otherUser?.name}</p>
                </div>
                <button className="ml-2 text-xs text-primary-600 hover:text-primary-700 font-medium">Accept</button>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center">
          <button className="p-1 text-gray-400 hover:text-gray-500">
            <i className='bx bx-smile text-xl'></i>
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-500">
            <i className='bx bx-link text-xl'></i>
          </button>
          <input 
            type="text" 
            className="flex-1 mx-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" 
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button 
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
