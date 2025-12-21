import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const StudentLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/student/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/student/courses',
      name: 'My Courses',
      icon: <BookOpen size={20} />,
    },
    {
      path: '/student/certificates',
      name: 'Certificates',
      icon: <Award size={20} />,
    },
  ];

  const currentPage = navItems.find(item => item.path === location.pathname)?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen bg-white shadow-lg z-40
        hidden lg:block transition-all duration-300
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-gray-200">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1">
                  <h1 className="font-bold text-lg text-text">Student Portal</h1>
                  <p className="text-gray-500 text-sm">Welcome back</p>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-primary">
                    {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user?.name || 'Student'}</p>
                  <p className="text-gray-500 text-xs truncate">{user?.email || 'student@example.com'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center rounded-lg px-3 py-3 transition-colors
                      ${isActive 
                        ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                        : 'text-text/70 hover:bg-gray-100 hover:text-text'
                      }
                      ${sidebarCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <div className={`${isActive ? 'text-primary' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="ml-3 font-medium">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`
                w-full flex items-center justify-center p-3 rounded-lg
                bg-gray-100 text-text hover:bg-gray-200 transition-colors
                ${sidebarCollapsed ? '' : 'justify-between'}
              `}
            >
              {sidebarCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <>
                  <span className="text-sm font-medium">Collapse</span>
                  <ChevronLeft size={18} />
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className={`
                mt-3 w-full flex items-center p-3 rounded-lg
                bg-danger/10 text-danger hover:bg-danger/20 transition-colors
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
            >
              <LogOut size={18} />
              {!sidebarCollapsed && (
                <span className="ml-3 font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        transition-all duration-300 min-h-screen
        lg:ml-${sidebarCollapsed ? '20' : '64'}
      `}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <ChevronRight size={24} className="text-text" />
                </button>
                <h1 className="text-xl font-bold text-text">{currentPage}</h1>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-text"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline font-medium text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-text">Student Portal</h1>
                    <p className="text-gray-500 text-sm">Welcome back</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user?.name || 'Student'}</p>
                    <p className="text-gray-500 text-xs truncate">{user?.email || 'student@example.com'}</p>
                  </div>
                </div>
              </div>

              <nav className="p-4">
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center space-x-3 rounded-lg px-3 py-3 transition-colors
                          ${isActive 
                            ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <div className={`${isActive ? 'text-primary' : 'text-gray-500'}`}>
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 space-y-2">
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;