import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarEvent as CalendarEventType } from '@shared/schema';
import { EVENT_TYPES } from '@/lib/constants';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CalendarEventProps {
  event: CalendarEventType;
}

const CalendarEvent = ({ event }: CalendarEventProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Determine event type styling
  const getEventType = (title: string) => {
    if (title.toLowerCase().includes('coffee')) return EVENT_TYPES.coffee;
    if (title.toLowerCase().includes('lunch')) return EVENT_TYPES.lunch;
    if (title.toLowerCase().includes('call')) return EVENT_TYPES.call;
    if (title.toLowerCase().includes('meeting')) return EVENT_TYPES.meeting;
    return EVENT_TYPES.default;
  };
  
  const eventType = getEventType(event.title);
  const startTime = new Date(event.startTime);
  
  return (
    <>
      <div 
        className={`calendar-event p-2 mb-1 rounded text-xs border ${eventType.borderColor} ${eventType.bgColor} cursor-pointer`}
        onClick={() => setIsDetailsOpen(true)}
      >
        <div className="flex items-center justify-between">
          <span className={`font-medium ${eventType.textColor}`}>{event.title}</span>
          <i className={`bx ${eventType.icon} ${eventType.textColor}`}></i>
        </div>
        <div className="mt-0.5 text-gray-600">
          {format(startTime, 'h:mm a')}
        </div>
      </div>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
            <DialogDescription>
              Event details and information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <i className="bx bx-time text-gray-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Time</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(event.startTime), 'EEEE, MMMM d, yyyy')}
                  <br />
                  {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                </p>
              </div>
            </div>
            
            {event.location && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <i className="bx bx-map text-gray-500"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              </div>
            )}
            
            {event.description && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <i className="bx bx-notepad text-gray-500"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Description</p>
                  <p className="text-sm text-gray-500">{event.description}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <i className="bx bx-user text-gray-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Attendees</p>
                <p className="text-sm text-gray-500">No RSVPs yet</p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <i className="bx bx-edit mr-2"></i>
              Edit
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <i className="bx bx-trash mr-2"></i>
              Delete
            </Button>
            <Button size="sm" className="flex-1">
              <i className="bx bx-share-alt mr-2"></i>
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarEvent;