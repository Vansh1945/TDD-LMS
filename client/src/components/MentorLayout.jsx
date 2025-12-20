import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth';
import {
  Home,
  BookOpen,
  PlusSquare,
  UserPlus,
  BarChart2,
  Menu,
  X,
} from 'lucide-react';

const MentorLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/mentor/dashboard',
      name: 'Dashboard',
      icon: <Home size={20} />,
    },
    {
      path: '/mentor/create-course',
      name: 'Create Course',
      icon: <BookOpen size={20} />,
    },
    {
      path: '/mentor/add-chapter',
      name: 'Add Chapters',
      icon: <PlusSquare size={20} />,
    },
    {
      path: '/mentor/assign-students',
      name: 'Assign Students',
      icon: <UserPlus size={20} />,
    },
    {
      path: '/mentor/progress',
      name: 'Progress View',
      icon: <BarChart2 size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-gradient-to-b from-primary to-secondary text-white min-h-screen fixed left-0 top-0 shadow-xl">
        <div className="flex flex-col w-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="font-bold text-lg">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Mentor Portal</h1>
                <p className="text-white/70 text-sm">Welcome back</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 px-2">
              Main Menu
            </h2>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-white text-primary shadow-lg'
                          : 'hover:bg-white/10 text-white/90'
                      }`}
                    >
                      <span className={`${isActive ? 'text-primary' : 'text-white'}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Bar - Only show hamburger menu on desktop since we're not showing sidebar on mobile */}
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl lg:text-2xl font-bold text-text">
                {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-6 pb-20 lg:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Always visible on mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t z-40">
        <div className="flex justify-around items-center h-16 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  isActive ? 'text-primary' : 'text-text/60'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10' : ''}`}>
                  {React.cloneElement(item.icon, {
                    size: 22,
                    className: isActive ? 'text-primary' : 'text-text/60'
                  })}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : 'text-text/60'}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="w-12 h-1 bg-primary rounded-full mt-1"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MentorLayout;