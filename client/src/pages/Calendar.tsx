import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircleIcon, ShareIcon } from 'lucide-react';
import useCalendar from '@/hooks/useCalendar';
import { CalendarEvent as CalendarEventType, InsertCalendarEvent } from '@shared/schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addDays, addHours, format, parseISO, startOfWeek, endOfWeek, isWithinInterval, addWeeks, subWeeks } from 'date-fns';
import CalendarEventComponent from '@/components/calendar/CalendarEvent';

const CalendarPage = () => {
  // For demo purposes, we'll use user ID 1
  const userId = 1;
  
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  
  const { 
    events, 
    currentWeekEvents, 
    isLoading, 
    createEvent, 
    isCreating, 
    currentWeekStart, 
    setCurrentWeekStart,
    availableSlots
  } = useCalendar({ userId });
  
  const [newEvent, setNewEvent] = useState<Partial<InsertCalendarEvent>>({
    userId,
    title: '',
    startTime: new Date(),
    endTime: addHours(new Date(), 1),
    location: '',
    description: ''
  });
  
  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'meeting', label: 'Meetings' },
    { value: 'coffee', label: 'Coffee Chats' },
    { value: 'call', label: 'Calls' }
  ];
  
  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };
  
  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };
  
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      return;
    }
    
    createEvent(newEvent as InsertCalendarEvent);
    setIsAddEventModalOpen(false);
    
    // Reset form
    setNewEvent({
      userId,
      title: '',
      startTime: new Date(),
      endTime: addHours(new Date(), 1),
      location: '',
      description: ''
    });
  };
  
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(currentWeekStart, i));
  
  // Filter events based on selected type
  const filteredEvents = currentWeekEvents?.filter(event => {
    if (selectedEventType === 'all') return true;
    if (selectedEventType === 'coffee' && event.title.toLowerCase().includes('coffee')) return true;
    if (selectedEventType === 'meeting' && event.title.toLowerCase().includes('meeting')) return true;
    if (selectedEventType === 'call' && event.title.toLowerCase().includes('call')) return true;
    return false;
  });
  
  return (
    <div className="py-6 px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Calendar
          </h2>
          <p className="mt-1 text-sm text-gray-500">Schedule and manage your interactions</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={() => {
              navigator.clipboard.writeText(`vyne.tree/${userId}/free`);
              alert('Calendar sharing link copied to clipboard!');
            }}
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Share Calendar
          </Button>
          <Button 
            className="flex items-center"
            onClick={() => setIsAddEventModalOpen(true)}
          >
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>
      
      {/* Calendar Controls */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePreviousWeek}
            >
              <i className='bx bx-chevron-left'></i>
            </Button>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {format(weekDays[0], 'MMM d')} - {format(weekDays[4], 'MMM d, yyyy')}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNextWeek}
            >
              <i className='bx bx-chevron-right'></i>
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={selectedEventType === 'today' ? 'bg-primary-50 text-primary-600' : ''}
              onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            >
              Today
            </Button>
            
            <Select 
              value={selectedEventType} 
              onValueChange={setSelectedEventType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Week View */}
        <div className="px-4 py-5 sm:p-6">
          {/* Calendar days */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-sm font-medium text-gray-500">{day}</div>
                <div className="text-lg font-medium">{format(weekDays[index], 'd')}</div>
              </div>
            ))}
          </div>
          
          {/* Events Grid */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {weekDays.map((day, dayIndex) => (
              <div 
                key={day.toString()} 
                className="min-h-[200px] border border-gray-200 rounded-md p-2"
              >
                {filteredEvents?.filter(event => {
                  const eventDate = new Date(event.startTime);
                  return eventDate.getDate() === day.getDate() &&
                         eventDate.getMonth() === day.getMonth() &&
                         eventDate.getFullYear() === day.getFullYear();
                }).map(event => (
                  <CalendarEventComponent key={event.id} event={event} />
                ))}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2 text-gray-500 hover:text-primary-600"
                  onClick={() => {
                    setNewEvent({
                      ...newEvent,
                      startTime: day,
                      endTime: addHours(day, 1)
                    });
                    setIsAddEventModalOpen(true);
                  }}
                >
                  <PlusCircleIcon className="h-4 w-4 mr-2" />
                  <span className="text-xs">Add</span>
                </Button>
              </div>
            ))}
          </div>
          
          {/* Available Slots Section */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-700">Available Coffee Chat Slots</h4>
              <Button variant="link" size="sm">
                Manage Availability
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {availableSlots.map((slot, index) => (
                <div 
                  key={index}
                  className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-center cursor-pointer hover:bg-gray-100 text-gray-700"
                >
                  {slot.day}, {slot.time}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Event Modal */}
      <Dialog open={isAddEventModalOpen} onOpenChange={setIsAddEventModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event on your calendar. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="date"
                  value={newEvent.startTime ? format(newEvent.startTime, 'PP') : ''}
                  readOnly
                  className="flex-1"
                />
                <CalendarIcon className="ml-2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Input
                  id="start-time"
                  type="time"
                  value={newEvent.startTime ? format(newEvent.startTime, 'HH:mm') : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newStartTime = new Date(newEvent.startTime || new Date());
                    newStartTime.setHours(hours, minutes);
                    setNewEvent({
                      ...newEvent,
                      startTime: newStartTime,
                      endTime: addHours(newStartTime, 1)
                    });
                  }}
                  className="flex-1"
                />
                <span>to</span>
                <Input
                  id="end-time"
                  type="time"
                  value={newEvent.endTime ? format(newEvent.endTime, 'HH:mm') : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newEndTime = new Date(newEvent.startTime || new Date());
                    newEndTime.setHours(hours, minutes);
                    setNewEvent({ ...newEvent, endTime: newEndTime });
                  }}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={newEvent.location || ''}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddEvent}
              disabled={isCreating || !newEvent.title}
            >
              {isCreating ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
