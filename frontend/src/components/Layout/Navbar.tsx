import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppSelector';
import { setCurrentPage, toggleDarkMode, toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  Target, 
  Settings, 
  Moon, 
  Sun, 
  Menu, 
  LogOut,
  User
} from 'lucide-react';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { darkMode, currentPage, sidebarOpen } = useAppSelector(state => state.ui);
  const { user } = useAppSelector(state => state.auth);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'budget', label: 'Budget', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (pageId: string) => {
    dispatch(setCurrentPage(pageId));
    dispatch(setSidebarOpen(false));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 w-64 h-full transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} 
        border-r
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                FinanceTracker
              </span>
            </div>
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`
                        w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200
                        ${isActive 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                          : darkMode 
                            ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <User className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'User'}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => dispatch(toggleDarkMode())}
                className={`p-2 rounded-md transition-colors ${
                  darkMode 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleLogout}
                className={`p-2 rounded-md transition-colors ${
                  darkMode 
                    ? 'hover:bg-red-900 text-gray-400 hover:text-red-300' 
                    : 'hover:bg-red-100 text-gray-600 hover:text-red-700'
                }`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Top bar for mobile */}
      <div className={`
        lg:hidden fixed top-0 left-0 right-0 z-10 h-16 
        ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} 
        border-b flex items-center justify-between px-4
      `}>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={`p-2 rounded-md ${
            darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            FinanceTracker
          </span>
        </div>
        
        <div className="w-10" /> {/* Spacer */}
      </div>
    </>
  );
};

export default Navbar;