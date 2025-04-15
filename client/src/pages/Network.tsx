import { useState } from 'react';
import NetworkGraph from '@/components/network/NetworkGraph';
import AINudges from '@/components/nudges/AINudges';
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar';
import { Button } from '@/components/ui/button';
import { Contact } from '@shared/schema';
import AddContactModal from '@/components/modals/AddContactModal';
import ImportContactsModal from '@/components/modals/ImportContactsModal';
import useNetworkGraph from '@/hooks/useNetworkGraph';
import useContacts from '@/hooks/useContacts';

const Network = () => {
  // For demo purposes, we'll use user ID 1
  const userId = 1;
  
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const { 
    contacts, 
    isLoading, 
    error, 
    selectedContact, 
    setSelectedContact 
  } = useNetworkGraph({ userId });
  
  const { 
    createContact 
  } = useContacts({ userId });
  
  const handleNodeClick = (contact: Contact) => {
    setSelectedContact(contact);
  };
  
  const handleImportContacts = (importedContacts: any[]) => {
    // This would typically call the API to import contacts
    console.log('Imported contacts:', importedContacts);
  };

  return (
    <div className="py-6 px-4 sm:px-6 md:px-8">
      {/* Main content header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Network
          </h2>
          <p className="mt-1 text-sm text-gray-500">Visualize and nurture your most important 150 relationships</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center"
          >
            <i className='bx bx-import mr-2'></i>
            Import Contacts
          </Button>
          <Button 
            onClick={() => setIsAddContactModalOpen(true)}
            className="flex items-center"
          >
            <i className='bx bx-plus mr-2'></i>
            Add Contact
          </Button>
        </div>
      </div>
      
      {/* Network Graph Visualization */}
      <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Dunbar Network Graph
            </h3>
            <div className="flex space-x-2">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                <i className='bx bx-filter text-xl'></i>
              </button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                <i className='bx bx-refresh text-xl'></i>
              </button>
            </div>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Visualize your connections by relationship strength
          </p>
        </div>
        
        <NetworkGraph userId={userId} onNodeClick={handleNodeClick} />
      </div>
      
      {/* AI Nudges and Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="col-span-1 md:col-span-2">
          <AINudges userId={userId} />
        </div>
        <div className="col-span-1">
          <WeeklyCalendar userId={userId} />
        </div>
      </div>
      
      {/* Modals */}
      <AddContactModal 
        userId={userId} 
        isOpen={isAddContactModalOpen} 
        onClose={() => setIsAddContactModalOpen(false)} 
      />
      
      <ImportContactsModal 
        userId={userId} 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={handleImportContacts} 
      />
    </div>
  );
};

export default Network;
