import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Wardrobe' },
    { to: '/today', label: "Today's Outfit" },
    { to: '/history', label: 'History' },
  ];

  const NavLinkComponent = ({ to, label }: { to: string; label: string }) => (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `${isActive 
          ? 'border-indigo-500 text-gray-900 dark:text-white' 
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
        } ${isMobileMenuOpen 
          ? 'block w-full py-3 px-4 text-base font-medium border-l-4' 
          : 'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
        }`
      }
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {label}
    </NavLink>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <NavLink to="/" className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  My Wardrobe
                </NavLink>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden md:flex md:space-x-8 md:ml-6">
                {navLinks.map(link => (
                  <NavLinkComponent key={link.to} {...link} />
                ))}
              </div>
            </div>
            {/* Logout button and mobile menu button */}
            <div className="flex items-center">
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="ml-2">Logout</span>
                </button>
              )}
              <div className="flex items-center space-x-2 ml-4">
                <ThemeToggle />
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`md:hidden inline-flex items-center justify-center p-2 rounded-md ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                  } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500`}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="block h-6 w-6" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map(link => (
              <NavLinkComponent key={link.to} {...link} />
            ))}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className={`w-full text-left px-4 py-3 text-base font-medium ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } border-l-4 border-transparent flex items-center`}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className={`max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 