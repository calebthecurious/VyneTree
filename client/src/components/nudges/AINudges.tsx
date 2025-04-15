import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import useNudges from '@/hooks/useNudges';
import { AiPrompt, Contact } from '@shared/schema';
import { NUDGE_TYPES } from '@/lib/constants';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AINudgesProps {
  userId: number;
}

const AINudges = ({ userId }: AINudgesProps) => {
  const [selectedPrompt, setSelectedPrompt] = useState<AiPrompt | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const { 
    prompts, 
    contacts, 
    isLoading, 
    markPromptAsUsed, 
    getContactForPrompt 
  } = useNudges({ userId });
  
  const handlePromptClick = (prompt: AiPrompt) => {
    setSelectedPrompt(prompt);
    setIsDetailOpen(true);
  };
  
  const handleActionPrompt = () => {
    if (selectedPrompt) {
      markPromptAsUsed(selectedPrompt.id);
      setIsDetailOpen(false);
    }
  };
  
  // Get the contact for a specific prompt
  const getContact = (promptId: number): Contact | undefined => {
    const prompt = prompts?.find(p => p.id === promptId);
    if (!prompt) return undefined;
    return getContactForPrompt(prompt.contactId);
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          AI Relationship Nudges
        </h3>
        <Link href="/nudges" className="text-sm text-primary-600 hover:text-primary-700">
          View All
        </Link>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            {prompts && prompts.length > 0 ? (
              <div className="space-y-4">
                {prompts.slice(0, 3).map(prompt => {
                  const contact = getContactForPrompt(prompt.contactId);
                  if (!contact) return null;
                  
                  const nudgeType = prompt.type === 'Reminder' 
                    ? NUDGE_TYPES.Reminder 
                    : NUDGE_TYPES.Conversation;
                  
                  return (
                    <div 
                      key={prompt.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          <div className="relative">
                            <img 
                              src={contact.photo || "https://via.placeholder.com/40"} 
                              alt={contact.name}
                              className="h-10 w-10 rounded-full"
                            />
                            <span className={`
                              absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center
                              ${prompt.type === 'Reminder' ? 'bg-red-500' : 'bg-blue-500'}
                              text-white text-xs
                            `}>
                              <i className={`bx ${nudgeType.icon}`}></i>
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {contact.name} - {contact.relationshipTier}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {prompt.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {prompts.length > 3 && (
                  <Link href="/nudges" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-2">
                    View {prompts.length - 3} more nudges
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <i className="bx bx-check text-xl text-green-600"></i>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active nudges</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You're all caught up on your relationship maintenance!
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Nudge Detail Dialog */}
      {selectedPrompt && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Relationship Nudge</DialogTitle>
              <DialogDescription>
                AI-suggested action to nurture your relationship
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-center mb-4">
                {(() => {
                  const contact = getContact(selectedPrompt.id);
                  return contact ? (
                    <>
                      <img 
                        src={contact.photo || "https://via.placeholder.com/40"} 
                        alt={contact.name}
                        className="h-10 w-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.relationshipTier} relationship</p>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm">{selectedPrompt.content}</p>
              </div>
              
              <div className="text-xs text-gray-500 mb-4">
                Suggested on {new Date(selectedPrompt.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Remind Later
              </Button>
              <Button onClick={handleActionPrompt}>
                Mark as Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AINudges;