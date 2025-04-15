import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Contact } from '@shared/schema';
import { RELATIONSHIP_TIERS } from '@/lib/constants';
import useNetworkGraph from '@/hooks/useNetworkGraph';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarIcon, PhoneIcon, MessageSquareIcon, ZoomInIcon, ZoomOutIcon, RefreshCwIcon } from 'lucide-react';

interface NetworkGraphProps {
  userId: number;
  onNodeClick?: (contact: Contact) => void;
}

// Define node and link types for D3
interface Node extends d3.SimulationNodeDatum {
  id: number;
  contact: Contact;
  tier: string;
  color: string;
  neglected: boolean;
  radius: number;
  x?: number;
  y?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node;
  target: Node;
  strength: number;
}

const NetworkGraph = ({ userId, onNodeClick }: NetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  const { 
    contacts,
    isLoading,
    getNeglectedContacts,
    getContactsByTier,
    isContactNeglected
  } = useNetworkGraph({ userId });

  // Center coordinates for the graph
  const width = 700;
  const height = 440;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Calculate radius for each tier
  const radius = {
    Intimate: 100,
    Best: 180,
    Good: 260,
    Tribe: 340
  };

  // Create nodes for the simulation
  const createNodes = useCallback((): Node[] => {
    if (!contacts || contacts.length === 0) return [];
    
    const nodes: Node[] = [];
    
    // Add center node for the user
    nodes.push({
      id: 0,
      contact: {
        id: 0,
        name: 'You',
        userId,
        relationshipTier: 'Intimate',
        photo: null,
        lastInteractedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        importantDates: null
      } as Contact,
      tier: 'You',
      color: '#3b82f6',
      neglected: false,
      radius: 20,
      x: centerX,
      y: centerY,
      fx: centerX, // Fixed position X
      fy: centerY  // Fixed position Y
    });
    
    // Add nodes for each contact
    contacts.forEach(contact => {
      const tier = contact.relationshipTier;
      const tierInfo = RELATIONSHIP_TIERS[tier as keyof typeof RELATIONSHIP_TIERS];
      const isNeglected = isContactNeglected(contact);
      
      nodes.push({
        id: contact.id,
        contact,
        tier,
        color: tierInfo.color,
        neglected: isNeglected,
        radius: tierInfo.nodeSize
      });
    });
    
    return nodes;
  }, [contacts, userId, isContactNeglected]);
  
  // Create links for the simulation
  const createLinks = useCallback((nodes: Node[]): Link[] => {
    if (nodes.length <= 1) return [];
    
    const links: Link[] = [];
    const centerNode = nodes[0]; // "You" is the first node
    
    // Create links from center to all other nodes
    nodes.slice(1).forEach(node => {
      let strength = 0;
      
      // Adjust link strength based on tier
      switch (node.tier) {
        case 'Intimate':
          strength = 0.8;
          break;
        case 'Best':
          strength = 0.6;
          break;
        case 'Good':
          strength = 0.4;
          break;
        case 'Tribe':
          strength = 0.2;
          break;
        default:
          strength = 0.1;
      }
      
      links.push({
        source: centerNode,
        target: node,
        strength
      });
    });
    
    return links;
  }, []);
  
  // Set up and update the D3 force simulation
  const setupSimulation = useCallback(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content
    
    // Create the nodes and links
    const nodes = createNodes();
    const links = createLinks(nodes);
    
    if (nodes.length <= 1) return; // No contacts to display
    
    // Add the background circles for tiers
    const tierGroup = svg.append('g').attr('class', 'tiers');
    
    Object.entries(radius).forEach(([tier, r]) => {
      tierGroup.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#f1f5f9')
        .attr('stroke-width', 1);
      
      tierGroup.append('text')
        .attr('x', centerX)
        .attr('y', centerY - r - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', '#94a3b8')
        .text(tier);
    });
    
    // Create the link group
    const linkGroup = svg.append('g').attr('class', 'links');
    
    // Create the node group
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    
    // Create the simulation
    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(d => {
          // Set distance based on tier
          const targetNode = d.target as Node;
          const tierName = targetNode.tier as keyof typeof radius;
          return radius[tierName] || 100;
        })
        .strength(d => d.strength || 0.1)
      )
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collide', d3.forceCollide<Node>().radius(d => d.radius * 2))
      .force('radial', d3.forceRadial<Node>(d => {
        // Radial positioning based on tier
        if (d.id === 0) return 0; // Center node
        const tierName = d.tier as keyof typeof radius;
        return radius[tierName] || 100;
      }, centerX, centerY).strength(0.8));
    
    // Add the links (lines between nodes)
    const link = linkGroup
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', d => (d.strength || 0.1) * 3)
      .attr('stroke-opacity', 0.6);
    
    // Create node groups
    const node = nodeGroup
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        if (d.id !== 0) { // Not the center "You" node
          setSelectedContact(d.contact);
          setIsDetailOpen(true);
          if (onNodeClick) {
            onNodeClick(d.contact);
          }
        }
      })
      .call(d3.drag<SVGGElement, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          // Center node should stay fixed, other nodes should be free
          if (d.id !== 0) {
            d.fx = null;
            d.fy = null;
          }
        })
      );
      
    // Add the node circles
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('class', d => d.neglected ? 'glow-effect' : '')
      .attr('stroke', d => d.neglected ? '#ef4444' : 'none')
      .attr('stroke-width', d => d.neglected ? 2 : 0);
    
    // Add node labels (names)
    node.append('text')
      .attr('dy', d => d.radius + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', '#1e293b')
      .text(d => d.contact.name);
    
    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);
      
      node
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
    
    // Store reference to simulation for later use
    simulationRef.current = simulation;
    
  }, [createNodes, createLinks, onNodeClick, isContactNeglected]);
  
  // Setup or update the visualization when data changes
  useEffect(() => {
    if (!isLoading && contacts) {
      setupSimulation();
    }
    
    // Cleanup function to stop simulation
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [isLoading, contacts, setupSimulation]);
  
  // Handle zoom in
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };
  
  // Reset the simulation
  const handleReset = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
  };
  
  return (
    <div className="relative">
      {isLoading ? (
        <div className="flex items-center justify-center h-[440px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="absolute top-4 right-4 z-10 flex space-x-2">
            <button 
              className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
              onClick={handleZoomIn}
            >
              <ZoomInIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button 
              className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
              onClick={handleZoomOut}
            >
              <ZoomOutIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button 
              className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
              onClick={handleReset}
            >
              <RefreshCwIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          
          {/* Network Graph Visualization */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <svg 
              ref={svgRef} 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full max-w-full h-auto"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-in-out'
              }}
            />
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded-md text-xs border border-gray-200 shadow-md">
            <div className="font-medium mb-1">Legend:</div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(RELATIONSHIP_TIERS).map(([tier, info]) => (
                <div key={tier} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: info.color }}></div>
                  <span>{tier}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center mt-1">
              <div className="w-3 h-3 rounded-full mr-1 border-2 border-red-500"></div>
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