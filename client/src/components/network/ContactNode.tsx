import { Contact } from '@shared/schema';
import { RELATIONSHIP_TIERS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { MailIcon, PhoneIcon, CalendarIcon } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface ContactNodeProps {
  contact: Contact;
  isNeglected: boolean;
  onSelect: (contact: Contact) => void;
}

const ContactNode = ({ contact, isNeglected, onSelect }: ContactNodeProps) => {
  const tierInfo = RELATIONSHIP_TIERS[contact.relationshipTier as keyof typeof RELATIONSHIP_TIERS];
  
  // For demo purposes, if lastInteractionDate is missing, create a random one
  const lastInteractionDate = contact.lastInteractionDate 
    ? new Date(contact.lastInteractionDate) 
    : new Date(Date.now() - Math.random() * 2592000000); // Random date within last 30 days
  
  return (
    <div className="p-4" onClick={() => onSelect(contact)}>
      <div className="flex items-start">
        <div className="relative flex-shrink-0">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center text-white text-lg"
            style={{ backgroundColor: tierInfo.color }}
          >
            {contact.photo ? (
              <img 
                src={contact.photo} 
                alt={contact.name} 
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              contact.name.charAt(0).toUpperCase()
            )}
          </div>
          {isNeglected && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
              <i className="bx bx-bell text-white text-xs"></i>
            </span>
          )}
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{contact.name}</h3>
              <p className="text-xs text-gray-500">
                {contact.email || 'No email available'}
              </p>
            </div>
            <span 
              className="text-xs px-2 py-1 rounded-full" 
              style={{ 
                backgroundColor: `${tierInfo.color}20`, 
                color: tierInfo.color 
              }}
            >
              {contact.relationshipTier}
            </span>
          </div>
          
          <div className="mt-2 text-xs text-gray-600">
            <p className="line-clamp-2">{contact.notes || 'No notes available'}</p>
          </div>
          
          <div className="mt-2 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Last: {formatDistanceToNow(lastInteractionDate, { addSuffix: true })}
            </div>
            
            <div className="flex space-x-1">
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <MailIcon className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <PhoneIcon className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <CalendarIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactNode;