import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import type { NavItem } from '@/types';
import { Icon } from './Icon';
import { Logo } from './Logo';

interface SidebarProps {
  navItems: NavItem[];
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, isOpen, isCollapsed, onClose }) => {
  const baseTextColor = "text-gray-700 dark:text-gray-300";
  const hoverBgColor = "hover:bg-gray-200 dark:hover:bg-slate-700";
  const hoverTextColor = "hover:text-[#679a41] dark:hover:text-emerald-400";
  const activeBgColor = "bg-[#679a41] dark:bg-emerald-600";
  const activeTextColor = "text-white dark:text-white";
  
  const iconBaseColor = "text-[#679a41] dark:text-emerald-400";
  const iconActiveColor = "text-white dark:text-white"; 
  const iconHoverColor = "group-hover:text-[#588836] dark:group-hover:text-emerald-500";

  const settingsNavItem: NavItem = { name: 'Settings', path: '/app/settings', iconName: "fas fa-cog" };
  
  const additionalNavItems: NavItem[] = [
    { name: 'Workspace Hub', path: 'https://cloudspace.worldposta.com/index.php/login', iconUrl: 'https://www.worldposta.com/assets/CloudSpace.png' },
    { name: 'Mail In-box', path: 'https://mail.worldposta.com/owa/auth/logon.aspx?replaceCurrent=1&url=https://mail.worldposta.com/owa/', iconUrl: 'https://www.worldposta.com/assets/Newhomeimgs/postaImgs/Microsoft_Exchange_(2019-present)%201.png' },
  ];

  const imageIconClasses = `h-5 w-5 object-contain ${isCollapsed ? '' : 'mr-3'} transition-opacity duration-150 ease-in-out group-hover:opacity-75`;
  const faIconBaseClasses = `text-lg ${isCollapsed ? '' : 'mr-3'} transition-colors duration-150 ease-in-out`;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" 
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}
      <aside className={`fixed top-0 left-0 z-40 h-screen bg-[#f8f8f8] dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 ease-in-out flex flex-col
                       ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                       lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen 
                       ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-slate-700 ${isCollapsed ? 'lg:justify-center' : ''}`}>
          {isCollapsed ? (
             <Link to="/" className="flex items-center justify-center">
                <img 
                    src="https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%201.png" 
                    alt="WorldPosta Collapsed Logo" 
                    className="h-7 w-auto"
                />
             </Link>
          ) : (
            <Logo iconClassName="h-6 w-auto lg:h-7" />
          )}
          <button onClick={onClose} className={`lg:hidden ${baseTextColor} ${hoverTextColor}`}>
            <Icon name="fas fa-times" className="text-xl" />
          </button>
        </div>
        <nav className="py-4 px-2 space-y-1 overflow-y-auto flex-grow">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={isOpen ? onClose : undefined} 
              title={isCollapsed ? item.name : undefined}
              className={({ isActive: isNavLinkActive }) =>
                `flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group
                 ${isCollapsed ? 'px-3 justify-center' : 'px-3'}
                 ${isNavLinkActive
                    ? `${activeBgColor} ${activeTextColor} shadow-inner`
                    : `${baseTextColor} ${hoverBgColor} ${hoverTextColor}`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.iconUrl ? (
                     <img src={item.iconUrl} alt={`${item.name} icon`} className={`${imageIconClasses} ${isActive ? 'opacity-100' : 'opacity-90'}`} />
                  ) : item.iconName ? (
                    <Icon 
                      name={item.iconName}
                      fixedWidth
                      className={`${faIconBaseClasses} ${isActive ? iconActiveColor : `${iconBaseColor} ${iconHoverColor}`}`} 
                    />
                  ) : null}
                  {!isCollapsed && <span>{item.name}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="px-2 pb-2 pt-0 mt-auto">
            {additionalNavItems.map((item) => {
                 const commonClasses = `flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${baseTextColor} ${hoverBgColor} ${hoverTextColor} ${isCollapsed ? 'px-3 justify-center' : 'px-3'}`;
                 const currentFaIconClasses = `${faIconBaseClasses} ${iconBaseColor} ${iconHoverColor}`;

                return (
                    <a
                        key={item.name}
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={isCollapsed ? item.name : undefined}
                        className={`${commonClasses} mb-1`} 
                        onClick={isOpen ? onClose : undefined}
                    >
                        {item.iconUrl ? (
                           <img src={item.iconUrl} alt={`${item.name} icon`} className={imageIconClasses} />
                        ) : item.iconName ? (
                            <Icon name={item.iconName} fixedWidth className={currentFaIconClasses} />
                        ) : null}
                        {!isCollapsed && <span>{item.name}</span>}
                    </a>
                );
            })}

            <NavLink
              key={settingsNavItem.name}
              to={settingsNavItem.path}
              onClick={isOpen ? onClose : undefined}
              title={isCollapsed ? settingsNavItem.name : undefined}
              className={({ isActive: isNavLinkActive }) =>
                `flex items-center py-2.5 mb-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group
                 ${isCollapsed ? 'px-3 justify-center' : 'px-3'}
                 ${isNavLinkActive
                    ? `${activeBgColor} ${activeTextColor} shadow-inner`
                    : `${baseTextColor} ${hoverBgColor} ${hoverTextColor}`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {settingsNavItem.iconUrl ? (
                     <img src={settingsNavItem.iconUrl} alt={`${settingsNavItem.name} icon`} className={`${imageIconClasses} ${isActive ? 'opacity-100' : 'opacity-90'}`} />
                  ) : settingsNavItem.iconName ? (
                    <Icon
                      name={settingsNavItem.iconName}
                      fixedWidth
                      className={`${faIconBaseClasses} ${isActive ? iconActiveColor : `${iconBaseColor} ${iconHoverColor}`}`} 
                    />
                  ) : null}
                  {!isCollapsed && <span>{settingsNavItem.name}</span>}
                </>
              )}
            </NavLink>
            <hr className={`my-2 border-gray-300 dark:border-slate-600 ${isCollapsed ? 'mx-auto w-10/12' : ''}`} />
            {!isCollapsed && (
              <div className="pt-1 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  &copy; {new Date().getFullYear()} WorldPosta.
                </p>
              </div>
            )}
        </div>
      </aside>
    </>
  );
};
