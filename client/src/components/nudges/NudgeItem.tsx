import { AiPrompt, Contact } from '@shared/schema';
import { NUDGE_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface NudgeItemProps {
  nudge: AiPrompt;
  contact: Contact;
  onAction: () => void;
}

const NudgeItem = ({ nudge, contact, onAction }: NudgeItemProps) => {
  const nudgeType = nudge.type === 'Reminder' 
    ? NUDGE_TYPES.Reminder 
    : NUDGE_TYPES.Conversation;
  
  // Get action buttons based on nudge type
  const getActionButtons = () => {
    if (nudge.type === 'Reminder') {
      return (
        <>
          <Button size="sm" variant="outline" className="flex items-center">
            <i className='bx bx-phone mr-2'></i>
            Call
          </Button>
          <Button size="sm" variant="outline" className="flex items-center">
            <i className='bx bx-message-square-dots mr-2'></i>
            Message
          </Button>
          <Button size="sm" variant="outline" className="flex items-center">
            <i className='bx bx-calendar mr-2'></i>
            Schedule
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button size="sm" variant="outline" className="flex items-center">
            <i className='bx bx-message-square-dots mr-2'></i>
            Message
          </Button>
          <Button size="sm" variant="outline" className="flex items-center">
            <i className='bx bx-coffee mr-2'></i>
            Coffee
          </Button>
          <Button size="sm" variant="outline" className="flex items-center">
            <i className='bx bx-gift mr-2'></i>
            Gift
          </Button>
        </>
      );
    }
  };
  
  return (
    <li className="p-4 hover:bg-gray-50">
      <div className="flex items-start space-x-4">
        {/* Contact Photo */}
        <div className="flex-shrink-0 relative">
          <img 
            src={contact.photo || "https://via.placeholder.com/40"} 
            alt={contact.name} 
            className="h-12 w-12 rounded-full object-cover"
          />
          <span className={`
            absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center
            ${nudge.type === 'Reminder' ? 'bg-red-500' : 'bg-blue-500'}
            text-white text-xs
          `}>
            <i className={`bx ${nudgeType.icon}`}></i>
          </span>
        </div>
        
        {/* Nudge Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-gray-900">
              {contact.name}
            </p>
            <p className="text-xs text-gray-500">
              {format(new Date(nudge.createdAt), 'MMM d')}
            </p>
          </div>
          <p className="text-xs text-primary-600 mb-1">
            {contact.relationshipTier} • {nudge.type}
          </p>
          <p className="text-sm text-gray-700 mb-3">
            {nudge.content}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {getActionButtons()}
            <Button size="sm" onClick={onAction} className="ml-auto">
              Mark Done
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default NudgeItem;