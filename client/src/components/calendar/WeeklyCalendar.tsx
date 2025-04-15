import { useState } from 'react';
import { format, parseISO, addDays, startOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import useCalendar from '@/hooks/useCalendar';
import { Link } from 'wouter';

interface WeeklyCalendarProps {
  userId: number;
}

const WeeklyCalendar = ({ userId }: WeeklyCalendarProps) => {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const { currentWeekEvents, isLoading } = useCalendar({ userId });
  
  // Generate days for the current week view
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i));
  
  const handlePreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };
  
  const handleNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };
  
  // Group events by day
  const eventsByDay = weekDays.reduce<Record<string, { count: number; hasImportant: boolean }>>((acc, day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    acc[dateKey] = { count: 0, hasImportant: false };
    
    // Count events for this day and check if there are important ones
    currentWeekEvents?.forEach(event => {
      const eventDate = new Date(event.startTime);
      if (format(eventDate, 'yyyy-MM-dd') === dateKey) {
        acc[dateKey].count += 1;
        // Consider events with "intimate" or "best" contacts as important
        if (event.title.toLowerCase().includes('coffee') || event.title.toLowerCase().includes('important')) {
          acc[dateKey].hasImportant = true;
        }
      }
    });
    
    return acc;
  }, {});
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">This Week</h3>
        <Link href="/calendar" className="text-sm text-primary-600 hover:text-primary-700">
          Full Calendar
        </Link>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePreviousWeek}
            className="p-1"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 4), 'MMM d')}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNextWeek}
            className="p-1"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-5 gap-1">
          {weekDays.map((day, i) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const eventData = eventsByDay[dateKey];
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;
            
            return (
              <div key={i} className="text-center">
                <div className={`text-xs font-medium mb-1 ${isToday ? 'text-primary-600' : 'text-gray-500'}`}>
                  {format(day, 'EEE')}
                </div>
                <Link href="/calendar">
                  <div 
                    className={`
                      rounded-full h-7 w-7 flex items-center justify-center mx-auto text-sm
                      ${isToday ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'} 
                      ${eventData?.hasImportant ? 'ring-2 ring-primary-500 ring-opacity-50' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </div>
                </Link>
                {eventData?.count > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    {eventData.count} event{eventData.count !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Upcoming Events</h4>
          
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          ) : (
            <>
              {currentWeekEvents && currentWeekEvents.length > 0 ? (
                <ul className="space-y-2">
                  {currentWeekEvents.slice(0, 3).map(event => (
                    <li key={event.id} className="flex items-center text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary-400 mr-2"></div>
                      <span className="font-medium truncate">{event.title}</span>
                      <span className="ml-auto text-gray-500 text-xs">
                        {format(new Date(event.startTime), 'E, h:mm a')}
                      </span>
                    </li>
                  ))}
                  
                  {currentWeekEvents.length > 3 && (
                    <Link href="/calendar" className="text-xs text-primary-600 block text-center mt-2">
                      View {currentWeekEvents.length - 3} more events
                    </Link>
                  )}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  No events scheduled this week
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;