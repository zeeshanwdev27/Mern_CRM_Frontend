import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar.jsx';
import { FiBell, FiSearch, FiUser, FiMenu } from 'react-icons/fi';

const Layout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileSidebarOpen]);

  const toggleCollapse = () => setCollapsed(!collapsed);

  const handleNavigation = () => {
  setMobileSidebarOpen(false); // Close mobile sidebar on navigation
  // Optionally also collapse the sidebar on desktop:
  // setCollapsed(true); // Uncomment if you want desktop sidebar to collapse too
};

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-transparent z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <Sidebar isCollapsed={collapsed} onToggleCollapse={toggleCollapse} onNavigate={handleNavigation} />
      </div>

      {/* Main Area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 overflow-hidden ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm z-20">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile menu button */}
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <FiMenu size={24} />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none">
                <FiBell size={20} />
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <FiUser size={16} />
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-700">
                  Admin User
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 h-full overflow-y-auto p-4 bg-gray-50">
          <div
            className={`max-w-7xl mx-auto transition-all duration-300 ${
              collapsed ? 'px-2' : 'px-4 sm:px-6 lg:px-8'
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
