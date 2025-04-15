import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

const Sidebar = () => {
  const [location] = useLocation();
  
  // For demo purposes, we'll fetch the user with ID 1
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/1'],
  });

  const navigation = [
    { name: 'Network', href: '/network', icon: 'bx-network-chart' },
    { name: 'Calendar', href: '/calendar', icon: 'bx-calendar' },
    { name: 'Messages', href: '/messages', icon: 'bx-message-square-dots' },
    { name: 'Contacts', href: '/contacts', icon: 'bx-user' },
    { name: 'Nudges', href: '/nudges', icon: 'bx-bell' },
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 pt-5 pb-4">
      <div className="px-6 flex items-center">
        <svg className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 11C19.2091 11 21 9.20914 21 7C21 4.79086 19.2091 3 17 3C14.7909 3 13 4.79086 13 7C13 9.20914 14.7909 11 17 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 21C9.20914 21 11 19.2091 11 17C11 14.7909 9.20914 13 7 13C4.79086 13 3 14.7909 3 17C3 19.2091 4.79086 21 7 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 17H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 21C19.2091 21 21 19.2091 21 17C21 14.7909 19.2091 13 17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 11C9.20914 11 11 9.20914 11 7C11 4.79086 9.20914 3 7 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 className="ml-2 text-xl font-bold text-gray-900">VyneTree</h1>
      </div>
      
      <nav className="mt-8 flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href || (item.href === '/network' && location === '/');
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <i className={cn(`bx ${item.icon} text-xl mr-3`)}></i>
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="px-4 mt-6">
        <div className="p-3 bg-primary-50 rounded-lg">
          <h3 className="text-sm font-medium text-primary-800">
            {user?.subscriptionPlan === 'Premium' ? 'Premium Plan' : 'Free Plan'}
          </h3>
          <div className="mt-2 text-xs text-gray-500">
            <div className="flex justify-between mb-1">
              <span>Contacts</span>
              <span className="font-medium">36/50</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
            {user?.subscriptionPlan !== 'Premium' && (
              <div className="mt-3">
                <button className="w-full py-1 px-3 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {user && (
        <div className="px-4 mt-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img 
                className="h-8 w-8 rounded-full" 
                src={user.profilePicture || "https://via.placeholder.com/40"} 
                alt="User profile"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs font-medium text-gray-500">View Profile</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
