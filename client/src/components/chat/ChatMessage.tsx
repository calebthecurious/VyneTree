import { Message } from '@shared/schema';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

const ChatMessage = ({ message, isCurrentUser }: ChatMessageProps) => {
  // Format timestamp
  const formattedTime = new Date(message.sentAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          rounded-lg px-4 py-2 max-w-[70%] relative message-enter message-enter-active
          ${isCurrentUser 
            ? 'bg-primary-100 text-primary-900 rounded-br-none' 
            : 'bg-gray-100 text-gray-900 rounded-bl-none'}
        `}
      >
        <p className="text-sm">{message.content}</p>
        <span className="text-[10px] text-gray-500 block text-right mt-1">
          {formattedTime}
          {isCurrentUser && (
            <span className="ml-1">
              {message.status === 'Read' ? (
                <i className='bx bx-check-double text-primary-600'></i>
              ) : message.status === 'Delivered' ? (
                <i className='bx bx-check-double'></i>
              ) : (
                <i className='bx bx-check'></i>
              )}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;