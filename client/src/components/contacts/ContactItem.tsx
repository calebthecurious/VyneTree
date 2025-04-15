import { Contact } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

interface ContactItemProps {
  contact: Contact;
  onClick: () => void;
}

const ContactItem = ({ contact, onClick }: ContactItemProps) => {
  const getRelationshipTierStyle = (tier: string) => {
    switch (tier) {
      case 'Intimate':
        return 'bg-red-100 text-red-800';
      case 'Best':
        return 'bg-amber-100 text-amber-800';
      case 'Good':
        return 'bg-secondary-100 text-secondary-800';
      case 'Tribe':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getLastContactedText = () => {
    if (!contact.lastInteractedAt) return 'Never contacted';
    
    return `Last contacted ${formatDistanceToNow(new Date(contact.lastInteractedAt), { addSuffix: true })}`;
  };

  return (
    <li>
      <a href="#" className="block hover:bg-gray-50" onClick={(e) => { e.preventDefault(); onClick(); }}>
        <div className="flex items-center px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1 flex items-center">
            <div className="flex-shrink-0">
              <img 
                className="h-12 w-12 rounded-full object-cover" 
                src={contact.photo || "https://via.placeholder.com/48"} 
                alt={contact.name}
              />
            </div>
            <div className="min-w-0 flex-1 px-4">
              <div>
                <p className="text-sm font-medium text-primary-600 truncate">{contact.name}</p>
                <p className="mt-1 flex items-center text-sm text-gray-500">
                  <span className="truncate">{getLastContactedText()}</span>
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRelationshipTierStyle(contact.relationshipTier)}`}>
                {contact.relationshipTier}
              </span>
              <i className='bx bx-chevron-right text-lg text-gray-400'></i>
            </div>
          </div>
        </div>
      </a>
    </li>
  );
};

export default ContactItem;
