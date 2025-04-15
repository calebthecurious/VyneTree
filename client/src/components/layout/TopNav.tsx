import { useState } from 'react';
import { useLocation } from 'wouter';

const TopNav = () => {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleMobileMenuOpen = () => {
    // Mobile menu implementation would go here
    console.log('Mobile menu toggled');
  };

  return (
    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 sm:px-6 md:px-8 bg-white">
      <div className="flex items-center md:hidden">
        <button 
          type="button" 
          className="text-gray-500 hover:text-gray-600"
          onClick={handleMobileMenuOpen}
        >
          <i className='bx bx-menu text-2xl'></i>
        </button>
        <div className="ml-2 md:hidden">
          <svg className="h-6 w-6 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 11C19.2091 11 21 9.20914 21 7C21 4.79086 19.2091 3 17 3C14.7909 3 13 4.79086 13 7C13 9.20914 14.7909 11 17 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 21C9.20914 21 11 19.2091 11 17C11 14.7909 9.20914 13 7 13C4.79086 13 3 14.7909 3 17C3 19.2091 4.79086 21 7 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 17H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 21C19.2091 21 21 19.2091 21 17C21 14.7909 19.2091 13 17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 11C9.20914 11 11 9.20914 11 7C11 4.79086 9.20914 3 7 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className="relative w-64 md:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className='bx bx-search text-gray-400'></i>
        </div>
        <input 
          type="text" 
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <button className="p-1 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none">
          <i className='bx bx-bell text-xl'></i>
        </button>
        <button className="ml-4 p-1 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none">
          <i className='bx bx-cog text-xl'></i>
        </button>
      </div>
    </div>
  );
};

export default TopNav;
