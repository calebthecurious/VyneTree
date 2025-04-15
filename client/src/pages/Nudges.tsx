import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AiPrompt, Contact } from '@shared/schema';
import { aiPromptApi, contactsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCcwIcon, BellRingIcon, CheckIcon } from 'lucide-react';
import NudgeItem from '@/components/nudges/NudgeItem';
import useNudges from '@/hooks/useNudges';

const Nudges = () => {
  // For demo purposes, we'll use user ID 1
  const userId = 1;
  
  const [filter, setFilter] = useState<string>('all');
  
  const {
    prompts,
    contacts,
    isLoading,
    isLoadingContacts,
    markPromptAsUsed,
    isMarking,
    getContactForPrompt
  } = useNudges({ userId });
  
  // Filter prompts based on selected filter
  const filteredPrompts = prompts?.filter(prompt => {
    if (filter === 'all') return true;
    
    const contact = getContactForPrompt(prompt.contactId);
    if (!contact) return false;
    
    if (filter === 'intimate') return contact.relationshipTier === 'Intimate';
    if (filter === 'best') return contact.relationshipTier === 'Best';
    if (filter === 'good') return contact.relationshipTier === 'Good';
    if (filter === 'tribe') return contact.relationshipTier === 'Tribe';
    if (filter === 'reminder') return prompt.type === 'Reminder';
    if (filter === 'conversation') return prompt.type === 'Conversation';
    
    return true;
  });
  
  const handleAction = (promptId: number) => {
    markPromptAsUsed(promptId);
  };

  return (
    <div className="py-6 px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            AI Relationship Nudges
          </h2>
          <p className="mt-1 text-sm text-gray-500">Personalized prompts to maintain your important connections</p>
        </div>
        <div className="mt-4 flex items-center md:mt-0 md:ml-4 space-x-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter nudges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Nudges</SelectItem>
              <SelectItem value="reminder">Reminders</SelectItem>
              <SelectItem value="conversation">Conversations</SelectItem>
              <SelectItem value="intimate">Intimate Contacts</SelectItem>
              <SelectItem value="best">Best Friends</SelectItem>
              <SelectItem value="good">Good Friends</SelectItem>
              <SelectItem value="tribe">Tribe</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={() => {
              // This would refresh the nudges in a real application
              // Here we just refetch the query
              window.location.reload();
            }}
          >
            <RefreshCcwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Nudges List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <BellRingIcon className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Active Nudges
            </h3>
          </div>
          <span className="text-sm bg-primary-100 text-primary-800 py-1 px-2 rounded-full">
            {filteredPrompts?.length || 0} nudges
          </span>
        </div>
        
        {isLoading || isLoadingContacts ? (
          <div className="px-4 py-5 sm:p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredPrompts && filteredPrompts.length > 0 ? (
              filteredPrompts.map(prompt => {
                const contact = getContactForPrompt(prompt.contactId);
                if (!contact) return null;
                
                return (
                  <NudgeItem 
                    key={prompt.id}
                    nudge={prompt}
                    contact={contact}
                    onAction={() => handleAction(prompt.id)}
                  />
                );
              })
            ) : (
              <li className="px-4 py-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  <CheckIcon className="h-6 w-6 text-gray-600" />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  No active nudges at the moment.
                </p>
                <p className="text-sm text-gray-500">
                  Check back later for new relationship recommendations.
                </p>
              </li>
            )}
          </ul>
        )}
      </div>
      
      {/* Completed Nudges Section (Empty in demo) */}
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Completed Nudges
          </h3>
        </div>
        
        <div className="px-4 py-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            You've taken action on all your nudges.
          </p>
          <p className="text-sm text-gray-500">
            Great job maintaining your relationships!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Nudges;
