import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contact } from '@shared/schema';
import { contactsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRoundPlusIcon, UploadIcon, SearchIcon } from 'lucide-react';
import AddContactModal from '@/components/modals/AddContactModal';
import ImportContactsModal from '@/components/modals/ImportContactsModal';
import ContactNode from '@/components/network/ContactNode';
import useContacts from '@/hooks/useContacts';
import useNetworkGraph from '@/hooks/useNetworkGraph';

const Contacts = () => {
  // For demo purposes, we'll use user ID 1
  const userId = 1;
  
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isImportContactsModalOpen, setIsImportContactsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { 
    contacts, 
    isLoading, 
    createContact,
    selectedContact,
    setSelectedContact
  } = useContacts({ userId });
  
  const {
    isContactNeglected,
  } = useNetworkGraph({ userId });
  
  // Filter contacts based on search and active tab
  const filteredContacts = contacts?.filter(contact => {
    // Search filter
    if (search && !contact.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Tab filter
    if (activeTab === 'neglected') {
      return isContactNeglected(contact);
    } else if (activeTab !== 'all') {
      return contact.relationshipTier.toLowerCase() === activeTab.toLowerCase();
    }
    
    return true;
  });
  
  const handleImportContacts = (importedContacts: any[]) => {
    // This would typically call the API to import contacts
    console.log('Imported contacts:', importedContacts);
  };
  
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  return (
    <div className="py-6 px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Contacts
          </h2>
          <p className="mt-1 text-sm text-gray-500">Manage your network relationships</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setIsImportContactsModalOpen(true)}
            className="flex items-center"
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            Import Contacts
          </Button>
          <Button 
            onClick={() => setIsAddContactModalOpen(true)}
            className="flex items-center"
          >
            <UserRoundPlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>
      
      {/* Contacts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Search and Filters */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search contacts..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="intimate">Intimate</TabsTrigger>
                <TabsTrigger value="best">Best</TabsTrigger>
                <TabsTrigger value="good">Good</TabsTrigger>
                <TabsTrigger value="tribe">Tribe</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Contact List */}
        <div className="px-4 py-5 sm:p-6">
          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <>
              {filteredContacts && filteredContacts.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredContacts.map(contact => (
                    <div 
                      key={contact.id}
                      className={`border rounded-lg overflow-hidden ${
                        selectedContact?.id === contact.id ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200'
                      }`}
                    >
                      <ContactNode 
                        contact={contact} 
                        isNeglected={isContactNeglected(contact)} 
                        onSelect={handleContactSelect} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className='bx bx-user text-4xl text-gray-400'></i>
                  <p className="mt-2 text-gray-500">No contacts found</p>
                  <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsAddContactModalOpen(true)}
                  >
                    Add Your First Contact
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Pagination if needed */}
        {filteredContacts && filteredContacts.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredContacts.length}</span> contacts
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <AddContactModal 
        userId={userId} 
        isOpen={isAddContactModalOpen} 
        onClose={() => setIsAddContactModalOpen(false)} 
      />
      
      <ImportContactsModal 
        userId={userId} 
        isOpen={isImportContactsModalOpen} 
        onClose={() => setIsImportContactsModalOpen(false)} 
        onImport={handleImportContacts} 
      />
    </div>
  );
};

export default Contacts;
