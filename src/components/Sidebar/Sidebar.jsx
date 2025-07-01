import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiLogOut,
  FiPieChart,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiMessageSquare,
  FiDollarSign,
  FiLayers
} from 'react-icons/fi';

const Sidebar = ({ isCollapsed, onToggleCollapse, onNavigate }) => {
  const location = useLocation();
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [hoverStates, setHoverStates] = useState({
    main: null,
    sub: null
  });
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    setActiveSubmenu(null);
  }, [location.pathname]);

  const handleLinkClick = () => {
    onNavigate?.(); // This will close the mobile sidebar
    setActiveSubmenu(null); // Close any open submenus
  };

  const toggleSubmenu = (menu) => {
    setActiveSubmenu((prev) => (prev === menu ? null : menu));
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.classList.add('overflow-hidden');
      const timer = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.classList.remove('overflow-hidden');
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isCollapsed]);

  const menuItems = [
    { name: 'Dashboard', icon: <FiHome size={20} />, path: '/dashboard' },
    { name: 'Clients', icon: <FiBriefcase size={20} />, path: '/clients' },
    { name: 'Contacts', icon: <FiUsers size={20} />, path: '/contacts' },
    { name: 'Projects', icon: <FiLayers size={20} />, path: '/projects' },
    // {
    //   name: 'Projects',
    //   icon: <FiLayers size={20} />,
    //   path: '/projects',
    //   submenu: [
    //     { name: 'All Projects', path: '/projects/all-projects' },
    //     { name: 'Active', path: '/projects/active' },
    //     { name: 'Completed', path: '/projects/completed' },
    //     { name: 'On Hold', path: '/projects/on-hold' }
    //   ]
    // },
    { 
      name: 'Team', 
      icon: <FiUsers size={20} />,
      path: '/team',
      submenu: [
        { name: 'All Members', path: '/team/all-members' },
        // { name: 'Add Member', path: '/team/add' },
        { name: 'All Roles', path: '/team/roles' }
      ]
    },
    { name: 'Tasks', icon: <FiCalendar size={20} />, path: '/tasks' },
    { name: 'Invoices', icon: <FiDollarSign size={20} />, path: '/invoices' },
    { name: 'Reports', icon: <FiPieChart size={20} />, path: '/reports' },
    { name: 'Settings', icon: <FiSettings size={20} />, path: '/settings' }
  ];

  const LogoutBtn = {
    name: 'Logout',
    icon: <FiLogOut size={20} />,
    path: '/logout'
  };

  return (
    <div
      ref={sidebarRef}
      className={`
        bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen flex flex-col 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        min-w-0 shrink-0 border-r border-gray-700
      `}
    >
      {/* Logo & Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {!isCollapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            AgencyCRM
          </h1>
        )}
        <button
          onClick={onToggleCollapse}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-all"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu List */}
      <div 
        ref={contentRef}
        className={`
          flex-1 py-4 overflow-y-auto overflow-x-hidden
          scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent
        `}
      >
        <div className="h-full px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      onMouseEnter={() => setHoverStates({ ...hoverStates, main: item.name })}
                      onMouseLeave={() => setHoverStates({ ...hoverStates, main: null })}
                      className={`w-full flex items-center p-3 rounded-lg transition-all duration-200
                        ${
                          location.pathname.startsWith(item.path)
                            ? 'bg-gray-800 text-white shadow-md'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                    >
                      <span className={`transition-all ${location.pathname.startsWith(item.path) ? 'text-blue-400' : ''}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left ml-3">{item.name}</span>
                          <span
                            className={`transform transition-transform duration-200 ${
                              activeSubmenu === item.name ? 'rotate-90' : ''
                            } ${hoverStates.main === item.name ? 'scale-110' : ''}`}
                          >
                            <FiChevronRight size={16} />
                          </span>
                        </>
                      )}
                    </button>
                    {!isCollapsed && activeSubmenu === item.name && (
                      <ul className="ml-4 mt-1 space-y-1 pl-4 border-l-2 border-gray-700">
                        {item.submenu.map((subItem) => (
                          <li 
                            key={subItem.name}
                            onMouseEnter={() => setHoverStates({ ...hoverStates, sub: subItem.name })}
                            onMouseLeave={() => setHoverStates({ ...hoverStates, sub: null })}
                          >
                            <Link
                              to={subItem.path}
                              onClick={handleLinkClick} 
                              className={`flex items-center p-2 pl-3 rounded-lg transition-all duration-150
                                ${
                                  location.pathname === subItem.path
                                    ? 'text-blue-400 font-medium'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }
                              `}
                            >
                              <span className="flex-1">{subItem.name}</span>
                              {hoverStates.sub === subItem.name && (
                                <span className="ml-2 inline-block w-2 h-2 bg-blue-400 rounded-full animate-[pulse_1.5s_infinite]"></span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    onClick={handleLinkClick} 
                    onMouseEnter={() => setHoverStates({ ...hoverStates, main: item.name })}
                    onMouseLeave={() => setHoverStates({ ...hoverStates, main: null })}
                    className={`flex items-center p-3 rounded-lg transition-all duration-200
                      ${
                        location.pathname === item.path
                          ? 'bg-gray-800 text-white shadow-md'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <span className={`transition-all ${location.pathname === item.path ? 'text-blue-400' : ''}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="ml-3">
                        {item.name}
                        {hoverStates.main === item.name && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-400 rounded-full animate-[pulse_1.5s_infinite]"></span>
                        )}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <Link
          to={LogoutBtn.path}
          onMouseEnter={() => setHoverStates({ ...hoverStates, main: 'logout' })}
          onMouseLeave={() => setHoverStates({ ...hoverStates, main: null })}
          className={`flex items-center p-3 rounded-lg transition-all duration-200
            ${
              location.pathname === LogoutBtn.path
                ? 'bg-gray-800 text-red-400'
                : 'text-gray-300 hover:bg-gray-800 hover:text-red-400'
            }
          `}
        >
          <span className={location.pathname === LogoutBtn.path ? 'text-red-400' : ''}>
            {LogoutBtn.icon}
          </span>
          {!isCollapsed && (
            <>
              <span className="ml-3">{LogoutBtn.name}</span>
              {hoverStates.main === 'logout' && (
                <span className="ml-2 inline-block w-2 h-2 bg-red-400 rounded-full animate-[pulse_1.5s_infinite]"></span>
              )}
            </>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;