import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { User, AppNotification, NavItem, ApplicationCardData } from '@/types';
import { NotificationType } from '@/types';
import { Icon } from './Icon';
import { FloatingAppLauncher } from './FloatingAppLauncher';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onToggleMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  sidebarCollapsed: boolean;
  navItems: NavItem[];
  appItems: ApplicationCardData[];
  isViewAsMode?: boolean;
  viewedUser?: User | null;
  returnToPath?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onToggleMobileSidebar, onToggleDesktopSidebar, sidebarCollapsed, navItems, appItems, isViewAsMode, viewedUser, returnToPath }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);
  const appLauncherRef = useRef<HTMLDivElement>(null);
  const appLauncherButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
          userMenuButtonRef.current && !userMenuButtonRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node) &&
          notificationsButtonRef.current && !notificationsButtonRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (appLauncherRef.current && !appLauncherRef.current.contains(event.target as Node) &&
          appLauncherButtonRef.current && !appLauncherButtonRef.current.contains(event.target as Node)) {
        setAppLauncherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const mockNotifications: AppNotification[] = [
    { id: '1', type: NotificationType.INFO, message: 'Welcome to WorldPosta!', timestamp: new Date(Date.now() - 3600000) },
    { id: '2', type: NotificationType.SUCCESS, message: 'Your profile has been updated.', timestamp: new Date(Date.now() - 7200000) },
    { id: '3', type: NotificationType.WARNING, message: 'Billing due soon.', timestamp: new Date(Date.now() - 10800000) },
  ];
  
  const getNotificationIconName = (type: NotificationType) => {
    switch (type) {
        case NotificationType.INFO: return 'fas fa-info-circle';
        case NotificationType.SUCCESS: return 'fas fa-check-circle';
        case NotificationType.WARNING: return 'fas fa-exclamation-triangle';
        case NotificationType.ERROR: return 'fas fa-times-circle';
        case NotificationType.SECURITY: return 'fas fa-shield-halved';
        default: return 'fas fa-bell';
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-800 text-[#293c51] dark:text-gray-200 shadow-md dark:shadow-slate-900/50 sticky top-0 z-40 w-full">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={onToggleDesktopSidebar}
              className="mr-2 text-gray-500 dark:text-gray-400 hover:text-[#679a41] dark:hover:text-emerald-400 hidden lg:block"
              aria-label="Toggle desktop sidebar"
            >
              <Icon name={sidebarCollapsed ? "fas fa-angles-right" : "fas fa-angles-left"} className="text-xl" />
            </button>
            <button
              onClick={onToggleMobileSidebar}
              className="mr-2 text-gray-500 dark:text-gray-400 hover:text-[#679a41] dark:hover:text-emerald-400 lg:hidden"
              aria-label="Toggle mobile sidebar"
            >
              <Icon name="fas fa-bars" className="text-xl" />
            </button>
            {isViewAsMode && viewedUser && returnToPath && (
                <div className="hidden sm:flex items-center border-l border-gray-200 dark:border-gray-700 ml-4 pl-4">
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                        <Icon name="fas fa-user-secret" className="mr-2 text-blue-500" />
                        <span>Viewing as: <span className="font-bold text-[#293c51] dark:text-gray-100">{viewedUser.fullName}</span></span>
                        <Link
                            to={returnToPath}
                            title="Exit View As Mode"
                            className="ml-3 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                        >
                            <Icon name="fas fa-times-circle" />
                        </Link>
                    </div>
                </div>
            )}
          </div>

          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-center">
            {!isViewAsMode && (
              <div className="max-w-md w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="fas fa-search" className="text-gray-400" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 text-[#293c51] dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 sm:text-sm"
                    placeholder="Global Search..."
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center ml-auto">
            <div className="relative">
              <button
                ref={notificationsButtonRef}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#679a41] dark:focus:ring-emerald-400"
                aria-haspopup="true" aria-expanded={notificationsOpen}
              >
                <Icon name="fas fa-bell" className="text-xl" />
                {mockNotifications.length > 0 && <span className="absolute top-1 right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
              </button>
              {notificationsOpen && (
                <div ref={notificationsRef} className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none z-10">
                   <div className="p-3 border-b dark:border-slate-700">
                      <h3 className="font-semibold text-[#293c51] dark:text-gray-100">Notifications</h3>
                    </div>
                  <div className="py-1">
                    {mockNotifications.slice(0, 3).map(notif => (
                      <Link key={notif.id} to="/app/notifications" onClick={() => setNotificationsOpen(false)} className="flex items-start px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                        <Icon name={getNotificationIconName(notif.type)} className="mr-3 mt-1" />
                        <div>
                            <p>{notif.message}</p>
                            <p className="text-xs text-gray-400">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="p-2 border-t dark:border-slate-700">
                    <Link to="/app/notifications" onClick={() => setNotificationsOpen(false)} className="block text-center text-sm font-medium text-[#679a41] dark:text-emerald-400 hover:underline">View all notifications</Link>
                  </div>
                </div>
              )}
            </div>

            <div className="relative ml-2">
                <button
                    ref={appLauncherButtonRef}
                    onClick={() => setAppLauncherOpen(!appLauncherOpen)}
                    className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#679a41] dark:focus:ring-emerald-400 flex flex-col items-center justify-center w-14 h-16 rounded-md transition-colors"
                    aria-haspopup="true"
                    aria-expanded={appLauncherOpen}
                    aria-label="Open application launcher"
                >
                    <Icon name="fa-solid fa-grip" className="text-xl" />
                    <span className="text-xs mt-0">Apps</span>
                </button>
                <FloatingAppLauncher 
                    isOpen={appLauncherOpen}
                    onClose={() => setAppLauncherOpen(false)}
                    panelRef={appLauncherRef}
                    navItems={navItems}
                    appItems={appItems}
                />
            </div>
            
            <div className="relative ml-3">
              <button 
                ref={userMenuButtonRef}
                onClick={() => setUserMenuOpen(!userMenuOpen)} 
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#679a41] dark:focus:ring-emerald-400" 
                aria-haspopup="true" aria-expanded={userMenuOpen}
              >
                {user?.avatarUrl ? (
                  <img className="h-8 w-8 rounded-full" src={user.avatarUrl} alt="User avatar" />
                ) : (
                  <Icon name="fas fa-user-circle" className="h-8 w-8 text-gray-500 dark:text-gray-400 text-3xl" />
                )}
                <span className="ml-2 hidden md:inline">{user?.displayName || user?.fullName}</span>
                <Icon name="fas fa-chevron-down" className={`ml-1 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 text-xs ${userMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              {userMenuOpen && (
                <div ref={userMenuRef} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none text-[#293c51] dark:text-gray-200 z-10">
                  <Link to="/app/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                    <Icon name="fas fa-cog" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> Settings
                  </Link>
                  <button
                    onClick={() => { onLogout(); setUserMenuOpen(false); }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600 text-red-600 dark:text-red-400"
                  >
                    <Icon name="fas fa-sign-out-alt" className="w-5 h-5 mr-2" fixedWidth /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};