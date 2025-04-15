import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Search, 
  Menu, 
  Bell, 
  Calendar, 
  MessageSquare,
  Users,
  User,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

const TopNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  // Page titles corresponding to routes
  const pageTitles: { [key: string]: string } = {
    '/': 'Network',
    '/network': 'Network',
    '/calendar': 'Calendar',
    '/messages': 'Messages',
    '/contacts': 'Contacts',
    '/nudges': 'AI Nudges'
  };
  
  const navItems = [
    {
      path: '/network',
      label: 'Network',
      icon: <Users className="h-5 w-5" />
    },
    {
      path: '/calendar',
      label: 'Calendar',
      icon: <Calendar className="h-5 w-5" />
    },
    {
      path: '/messages',
      label: 'Messages',
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      path: '/contacts',
      label: 'Contacts',
      icon: <User className="h-5 w-5" />
    },
    {
      path: '/nudges',
      label: 'AI Nudges',
      icon: <Bell className="h-5 w-5" />
    }
  ];
  
  return (
    <>
      {/* Mobile Navigation Drawer */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary-600 text-white mr-2">
                  <i className='bx bx-vector text-lg'></i>
                </div>
                <span className="text-lg font-bold">VyneTree</span>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search contacts, events..."
                  className="pl-8"
                />
              </div>
            </div>
            
            <nav className="flex-1 overflow-auto p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <div
                        className={`
                          flex items-center p-3 text-base rounded-md cursor-pointer
                          ${location === item.path ? 'bg-primary-100 text-primary-700' : 'text-gray-700'}
                        `}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="p-4 border-t">
              <Button className="w-full">
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Mobile Menu Toggle */}
          {isMobile && (
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 -ml-2 text-gray-500 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          
          {/* Center: Page Title (Mobile) / Search (Desktop) */}
          <div className="flex-1 flex items-center justify-center md:justify-start md:ml-4">
            {isMobile ? (
              <h1 className="text-lg font-bold">{pageTitles[location] || 'VyneTree'}</h1>
            ) : (
              <div className="relative w-full max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search contacts, events..."
                  className="pl-8"
                />
              </div>
            )}
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            {!isMobile && (
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
                <MessageSquare className="h-5 w-5" />
              </button>
            )}
            
            {!isMobile && (
              <Button variant="outline" size="sm">
                Upgrade
              </Button>
            )}
            
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <img 
                src="https://via.placeholder.com/40" 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopNav;