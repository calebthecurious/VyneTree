import { useQuery } from '@tanstack/react-query';
import { Contact } from '@shared/schema';
import { contactsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import ContactItem from './ContactItem';

interface RecentContactsProps {
  userId: number;
  limit?: number;
  onContactSelect?: (contact: Contact) => void;
}

const RecentContacts = ({ userId, limit = 5, onContactSelect }: RecentContactsProps) => {
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: [`/api/users/${userId}/contacts/recent`, limit],
    staleTime: 5 * 60 * 1000,
  });
  
  const handleContactClick = (contact: Contact) => {
    if (onContactSelect) {
      onContactSelect(contact);
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60 mt-1" />
        </div>
        <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-4 py-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Recent Contacts
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          People you've recently interacted with
        </p>
      </div>
      <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
        {contacts && contacts.length > 0 ? (
          contacts.map(contact => (
            <ContactItem 
              key={contact.id} 
              contact={contact} 
              onClick={() => handleContactClick(contact)} 
            />
          ))
        ) : (
          <li className="px-4 py-6 text-center text-gray-500">
            No contacts found.
          </li>
        )}
      </ul>
      {contacts && contacts.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 text-center sm:px-6">
          <button 
            type="button" 
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            View All Contacts
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentContacts;
