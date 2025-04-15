import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Contact } from '@shared/schema';
import { contactsApi } from '@/lib/api';
import ChatInterface from '@/components/chat/ChatInterface';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import useChat from '@/hooks/useChat';

const Messages = () => {
  // For demo purposes, we'll use user ID 1
  const userId = 1;
  
  const [search, setSearch] = useState('');
  const { 
    selectedUserId, 
    setSelectedUserId 
  } = useChat({ currentUserId: userId });
  
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: [`/api/users/${userId}/contacts`],
    staleTime: 5 * 60 * 1000,
  });
  
  const { data: recentContacts } = useQuery<Contact[]>({
    queryKey: [`/api/users/${userId}/contacts/recent`],
    staleTime: 5 * 60 * 1000,
  });
  
  const filteredContacts = contacts?.filter(contact => 
    contact.name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Create a map by relationship tier for filtered display
  const contactsByTier: Record<string, Contact[]> = {
    Intimate: [],
    Best: [],
    Good: [],
    Tribe: []
  };
  
  filteredContacts?.forEach(contact => {
    if (contactsByTier[contact.relationshipTier]) {
      contactsByTier[contact.relationshipTier].push(contact);
    }
  });
  
  // If no contact is selected, select the first one
  useEffect(() => {
    if (!selectedUserId && contacts && contacts.length > 0) {
      // For demo purposes, we're assuming contact.id can be used as a user ID
      // In a real application, this would require proper mapping to user IDs
      setSelectedUserId(contacts[0].id);
    }
  }, [selectedUserId, contacts, setSelectedUserId]);
  
  const handleContactClick = (contactId: number) => {
    // For demo purposes, we're assuming contact.id can be used as a user ID
    setSelectedUserId(contactId);
  };
  
  const renderContactItem = (contact: Contact) => (
    <div 
      key={contact.id}
      className={`flex items-center p-3 cursor-pointer rounded-md ${selectedUserId === contact.id ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
      onClick={() => handleContactClick(contact.id)}
    >
      <div className="relative flex-shrink-0">
        <img 
          src={contact.photo || "https://via.placeholder.com/40"} 
          alt={contact.name} 
          className="h-10 w-10 rounded-full object-cover"
        />
        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></span>
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
        <p className="text-xs text-gray-500 truncate">Last message: Hey, how are you?</p>
      </div>
      <div className="text-xs text-gray-400">5m</div>
    </div>
  );

  return (
    <div className="py-6 px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Messages
        </h2>
        <p className="mt-1 text-sm text-gray-500">Chat with your network contacts</p>
      </div>
      
      <div className="flex flex-col md:flex-row h-[calc(100vh-220px)]">
        {/* Contacts List */}
        <div className="w-full md:w-80 border-r border-gray-200 bg-white rounded-lg md:rounded-r-none shadow md:shadow-none overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Tabs defaultValue="recent" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 border-b rounded-none">
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="all">All Contacts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2">
                    {recentContacts?.length ? (
                      recentContacts.map(contact => renderContactItem(contact))
                    ) : (
                      <div className="text-center p-4 text-gray-500">No recent contacts</div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="all" className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2">
                    {Object.entries(contactsByTier).map(([tier, contacts]) => (
                      contacts.length > 0 && (
                        <div key={tier} className="mb-4">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-1">
                            {tier}
                          </h3>
                          <div className="space-y-1">
                            {contacts.map(contact => renderContactItem(contact))}
                          </div>
                        </div>
                      )
                    ))}
                    
                    {!filteredContacts?.length && (
                      <div className="text-center p-4 text-gray-500">No contacts found</div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 bg-white md:rounded-r-lg shadow-sm">
          {selectedUserId ? (
            <ChatInterface currentUserId={userId} otherUserId={selectedUserId} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <i className='bx bx-message-square-dots text-5xl mb-2'></i>
                <p>Select a contact to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
