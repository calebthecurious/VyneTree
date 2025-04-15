import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from '@/components/chat/ChatMessage';
import useChat from '@/hooks/useChat';

interface ChatInterfaceProps {
  currentUserId: number;
  otherUserId: number;
}

const ChatInterface = ({ currentUserId, otherUserId }: ChatInterfaceProps) => {
  const [newMessage, setNewMessage] = useState('');
  
  const { 
    messages, 
    otherUser, 
    isLoading, 
    isLoadingUser, 
    sendMessage, 
    isSending 
  } = useChat({ currentUserId });
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center">
        {isLoadingUser ? (
          <div className="flex items-center animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="relative mr-3">
              <img 
                src={otherUser?.profilePicture || "https://via.placeholder.com/40"} 
                alt={otherUser?.name || 'User'} 
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <h3 className="text-sm font-medium">{otherUser?.name || 'Loading...'}</h3>
              <p className="text-xs text-gray-500">Active now</p>
            </div>
          </div>
        )}
        
        <div className="ml-auto flex space-x-2">
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
            <i className='bx bx-phone text-xl'></i>
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
            <i className='bx bx-video text-xl'></i>
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
            <i className='bx bx-info-circle text-xl'></i>
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  rounded-lg p-3 max-w-[70%] 
                  ${i % 2 === 0 ? 'bg-primary-100 text-primary-900' : 'bg-gray-100 text-gray-900'}
                  animate-pulse h-12
                `}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  isCurrentUser={message.senderId === currentUserId}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <i className='bx bx-message-square-dots text-3xl text-gray-400 mb-2'></i>
                <p className="text-gray-500">No messages yet</p>
                <p className="text-sm text-gray-400">Start the conversation!</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      {/* Message Input Area */}
      <div className="p-3 border-t border-gray-200">
        <form className="flex space-x-2" onSubmit={handleSendMessage}>
          <button 
            type="button" 
            className="p-2 text-gray-400 hover:text-gray-600 rounded"
          >
            <i className='bx bx-smile text-xl'></i>
          </button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isSending || !newMessage.trim()}
          >
            <i className='bx bx-send text-xl'></i>
          </Button>
        </form>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <div className="flex space-x-3">
            <button className="flex items-center">
              <i className='bx bx-image mr-1'></i>
              <span>Photo</span>
            </button>
            <button className="flex items-center">
              <i className='bx bx-calendar mr-1'></i>
              <span>Schedule</span>
            </button>
          </div>
          <div>
            <button className="flex items-center text-primary-600">
              <i className='bx bx-bulb mr-1'></i>
              <span>AI Suggestions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;