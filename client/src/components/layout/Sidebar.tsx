import { Link, useLocation } from 'wouter';
import { 
  UsersIcon, 
  CalendarIcon, 
  MessageSquareIcon, 
  UserIcon, 
  BellIcon, 
  SettingsIcon,
  LogOutIcon
} from 'lucide-react';
import { DEMO_USER_ID } from '@/lib/constants';

const Sidebar = () => {
  const [location] = useLocation();
  
  const menuItems = [
    {
      path: '/network',
      label: 'Network',
      icon: <UsersIcon className="h-5 w-5" />
    },
    {
      path: '/calendar',
      label: 'Calendar',
      icon: <CalendarIcon className="h-5 w-5" />
    },
    {
      path: '/messages',
      label: 'Messages',
      icon: <MessageSquareIcon className="h-5 w-5" />
    },
    {
      path: '/contacts',
      label: 'Contacts',
      icon: <UserIcon className="h-5 w-5" />
    },
    {
      path: '/nudges',
      label: 'AI Nudges',
      icon: <BellIcon className="h-5 w-5" />
    }
  ];

  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-white border-r border-gray-200">
      {/* Logo Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary-600 text-white mr-2">
            <i className='bx bx-vector text-xl'></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">VyneTree</h1>
            <p className="text-xs text-gray-500">Stay Connected</p>
          </div>
        </div>
      </div>
      
      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
            <img 
              src="https://via.placeholder.com/40" 
              alt="Profile" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Demo User</p>
            <p className="text-xs text-gray-500 truncate">Free Plan</p>
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <a 
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm
                    ${location === item.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <span className="mr-3">
                    {item.icon}
                  </span>
                  {item.label}
                  
                  {/* Indicator for unread items */}
                  {item.label === 'Messages' && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  )}
                  
                  {item.label === 'AI Nudges' && (
                    <span className="ml-auto bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      5
                    </span>
                  )}
                </a>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="mt-8 pt-4 border-t border-gray-200">
          <a 
            className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={() => console.log('Logout')}
          >
            <span className="mr-3">
              <LogOutIcon className="h-5 w-5" />
            </span>
            Sign Out
          </a>
          
          <div className="mt-4 px-3">
            <button className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        <p>© 2025 VyneTree</p>
        <p>v2.0.0 - Beta</p>
      </div>
    </div>
  );
};

export default Sidebar;