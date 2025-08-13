import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NavItem, ApplicationCardData } from '@/types';
import { Icon } from './Icon';

interface FloatingAppLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  panelRef: React.RefObject<HTMLDivElement>;
  navItems: NavItem[];
  appItems: ApplicationCardData[];
}

export const FloatingAppLauncher: React.FC<FloatingAppLauncherProps> = ({ isOpen, onClose, panelRef, navItems, appItems }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleLinkClick = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
    onClose();
  };

  const AppGridItem: React.FC<{
    iconName: string;
    name: string;
    onClick: () => void;
  }> = ({ iconName, name, onClick }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 text-center rounded-lg bg-gray-50/50 dark:bg-slate-900/30 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 transition-colors group"
    >
      {iconName.startsWith('http') || iconName.startsWith('/') ? (
        <img src={iconName} alt={`${name} icon`} className="h-10 w-10 mb-2 object-contain" />
      ) : (
        <div className="h-10 w-10 mb-2 flex items-center justify-center">
            <Icon name={iconName} className="text-3xl text-[#679a41] dark:text-emerald-400" />
        </div>
      )}
      <span className="text-xs font-medium text-gray-700 dark:text-gray-200 group-hover:text-[#679a41] dark:group-hover:text-emerald-400">{name}</span>
    </button>
  );

  const appItemNames = appItems.map(item => item.name);
  const settingsItem: NavItem = { name: 'Settings', path: '/app/settings', iconName: 'fas fa-cog' };
  
  const filteredNavItems = navItems.filter(item => 
      !appItemNames.includes(item.name) &&
      item.name !== 'Settings' && 
      item.name !== 'System' &&
      item.name !== 'Profile'
  );
  
  const dashboardItem = filteredNavItems.find(item => item.name === 'Dashboard');
  const otherNavItems = filteredNavItems.filter(item => item.name !== 'Dashboard');
  const quickLinkItems = [...otherNavItems, settingsItem];

  const coreAppIds = ['website', 'cloudedge', 'emailadmin'];
  // Sort to ensure the order is always website, cloudedge, emailadmin
  const coreApps = appItems
    .filter(app => coreAppIds.includes(app.id))
    .sort((a, b) => coreAppIds.indexOf(a.id) - coreAppIds.indexOf(b.id));

  const otherApps = appItems.filter(app => !coreAppIds.includes(app.id));

  if (!isOpen) return null;

  return (
      <div
        ref={panelRef}
        className="origin-top-right absolute right-0 mt-2 w-96 max-h-[80vh] overflow-y-auto rounded-md shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none flex flex-col z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-launcher-title"
      >
        <div className="sticky top-0 bg-transparent flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-slate-700/50 flex-shrink-0 z-10">
          <h2 id="app-launcher-title" className="text-lg font-semibold text-[#293c51] dark:text-gray-100">
            Applications & Links
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close menu">
            <Icon name="fas fa-times" className="text-xl" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <div className="flex-grow p-4">
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Core Portals</h3>
            <div className="grid grid-cols-3 gap-3">
              {coreApps.map(item => (
                <AppGridItem
                  key={item.id}
                  iconName={item.iconName}
                  name={item.name}
                  onClick={() => handleLinkClick(item.launchUrl)}
                />
              ))}
            </div>
          </section>

          {(dashboardItem || otherApps.length > 0 || quickLinkItems.length > 0) && (
            <>
              <hr className="my-4 border-gray-200/50 dark:border-slate-700/50" />
              <section>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Your Apps & Quick Links</h3>
                <div className="grid grid-cols-3 gap-3">
                  {dashboardItem && (
                    <AppGridItem
                        key={dashboardItem.name}
                        iconName={dashboardItem.iconUrl || dashboardItem.iconName || 'fas fa-link'}
                        name={dashboardItem.name}
                        onClick={() => handleLinkClick(dashboardItem.path)}
                    />
                  )}
                  {otherApps.map(item => (
                    <AppGridItem
                      key={item.id}
                      iconName={item.iconName}
                      name={item.name}
                      onClick={() => handleLinkClick(item.launchUrl)}
                    />
                  ))}
                  {quickLinkItems.map(item => (
                    <AppGridItem
                      key={item.name}
                      iconName={item.iconUrl || item.iconName || 'fas fa-link'}
                      name={item.name}
                      onClick={() => handleLinkClick(item.path)}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
  );
};