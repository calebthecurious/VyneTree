import { useEffect, useRef, useState } from 'react';
import { Contact } from '@shared/schema';
import { RELATIONSHIP_TIERS } from '@/lib/constants';
import useNetworkGraph from '@/hooks/useNetworkGraph';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarIcon, PhoneIcon, MessageSquareIcon } from 'lucide-react';

interface NetworkGraphProps {
  userId: number;
  onNodeClick?: (contact: Contact) => void;
}

const NetworkGraph = ({ userId, onNodeClick }: NetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const { 
    contacts,
    isLoading,
    getNeglectedContacts,
    getContactsByTier,
    isContactNeglected
  } = useNetworkGraph({ userId });
  
  // Center coordinates for the graph
  const centerX = 350;
  const centerY = 220;
  
  // Calculate radius for each tier
  const radius = {
    Intimate: 80,
    Best: 150,
    Good: 220,
    Tribe: 290
  };
  
  // Handle node click
  const handleNodeClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
    if (onNodeClick) {
      onNodeClick(contact);
    }
  };
  
  // Position nodes in a circle based on their tier
  const positionNodes = () => {
    // Skip if no contacts yet
    if (!contacts || contacts.length === 0) return [];

    const nodes: { contact: Contact; x: number; y: number }[] = [];
    
    // Position nodes for each tier
    Object.keys(RELATIONSHIP_TIERS).forEach(tier => {
      const tierContacts = getContactsByTier(tier);
      const tierRadius = radius[tier as keyof typeof radius];
      
      tierContacts.forEach((contact, index) => {
        // Calculate angle based on position in the array
        const angleStep = (2 * Math.PI) / tierContacts.length;
        const angle = index * angleStep;
        
        // Calculate x,y coordinates
        const x = centerX + tierRadius * Math.cos(angle);
        const y = centerY + tierRadius * Math.sin(angle);
        
        nodes.push({ contact, x, y });
      });
    });
    
    return nodes;
  };
  
  return (
    <div className="relative">
      {isLoading ? (
        <div className="flex items-center justify-center h-[440px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          <svg 
            ref={svgRef} 
            viewBox="0 0 700 440" 
            className="w-full max-w-full h-auto"
            style={{ background: 'white' }}
          >
            {/* Circle guides for each relationship tier */}
            <circle cx={centerX} cy={centerY} r={radius.Intimate} fill="none" stroke="#f1f5f9" strokeWidth="1" />
            <circle cx={centerX} cy={centerY} r={radius.Best} fill="none" stroke="#f1f5f9" strokeWidth="1" />
            <circle cx={centerX} cy={centerY} r={radius.Good} fill="none" stroke="#f1f5f9" strokeWidth="1" />
            <circle cx={centerX} cy={centerY} r={radius.Tribe} fill="none" stroke="#f1f5f9" strokeWidth="1" />
            
            {/* Tier labels */}
            <text x={centerX} y={centerY - radius.Intimate - 10} textAnchor="middle" fontSize="12" fill="#94a3b8">Intimate</text>
            <text x={centerX} y={centerY - radius.Best - 10} textAnchor="middle" fontSize="12" fill="#94a3b8">Best Friends</text>
            <text x={centerX} y={centerY - radius.Good - 10} textAnchor="middle" fontSize="12" fill="#94a3b8">Good Friends</text>
            <text x={centerX} y={centerY - radius.Tribe - 10} textAnchor="middle" fontSize="12" fill="#94a3b8">Tribe</text>
            
            {/* Center point (you) */}
            <circle cx={centerX} cy={centerY} r="20" fill="#3b82f6" />
            <text x={centerX} y={centerY + 5} textAnchor="middle" fill="white" fontSize="12">You</text>
            
            {/* Contact nodes */}
            {positionNodes().map(({ contact, x, y }) => {
              const tierInfo = RELATIONSHIP_TIERS[contact.relationshipTier as keyof typeof RELATIONSHIP_TIERS];
              const neglected = isContactNeglected(contact);
              
              return (
                <g key={contact.id} className="network-node" onClick={() => handleNodeClick(contact)}>
                  {/* Connection line */}
                  <line 
                    x1={centerX} 
                    y1={centerY} 
                    x2={x} 
                    y2={y} 
                    className="network-link" 
                  />
                  
                  {/* Contact node */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={tierInfo.nodeSize} 
                    fill={tierInfo.color}
                    className={neglected ? 'glow-effect' : ''}
                  />
                  
                  {/* Name label */}
                  <text 
                    x={x} 
                    y={y + tierInfo.nodeSize + 15} 
                    textAnchor="middle" 
                    fill="#1e293b" 
                    fontSize="11"
                  >
                    {contact.name}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded-md text-xs border border-gray-200">
            <div className="font-medium mb-1">Legend:</div>
            <div className="flex space-x-4">
              {Object.entries(RELATIONSHIP_TIERS).map(([tier, info]) => (
                <div key={tier} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: info.color }}></div>
                  <span>{tier}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center mt-1">
              <div className="w-3 h-3 rounded-full mr-1 glow-effect bg-red-500"></div>
              <span>Neglected</span>
            </div>
          </div>
        </>
      )}
      
      {/* Contact Details Dialog */}
      {selectedContact && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedContact.name}</DialogTitle>
              <DialogDescription>
                {selectedContact.relationshipTier}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-start mb-4">
                <img 
                  src={selectedContact.photo || "https://via.placeholder.com/80"} 
                  alt={selectedContact.name}
                  className="h-16 w-16 rounded-full mr-4"
                />
                <div>
                  <p className="text-sm">{selectedContact.notes || 'No notes available.'}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Last interaction: {selectedContact.lastInteractedAt ? 
                      new Date(selectedContact.lastInteractedAt).toLocaleDateString() : 
                      'Never'}
                  </p>
                  {isContactNeglected(selectedContact) && (
                    <p className="text-xs text-red-500 mt-1">
                      This relationship needs attention!
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" className="flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" className="flex items-center">
                <MessageSquareIcon className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default NetworkGraph;