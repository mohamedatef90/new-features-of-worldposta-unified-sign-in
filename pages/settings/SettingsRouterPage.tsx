
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '@/context';
import { Card, Icon } from '@/components/ui';

export const SettingsRouterPage: React.FC = () => {
    const { toggleTheme, ThemeIconComponent } = useTheme();

    const settingsNavItems = [
        { name: "Account", path: "account", iconName: "fas fa-user-circle" },
        { name: "Security", path: "security", iconName: "fas fa-shield-alt" },
        { name: "Notifications", path: "notifications", iconName: "fas fa-bell" },
    ];
    
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4 lg:w-1/5">
                <Card className="p-4">
                    <h2 className="text-lg font-semibold mb-4 text-[#293c51] dark:text-gray-100">Settings</h2>
                    <nav className="space-y-1">
                        {settingsNavItems.map(item => (
                             <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) => `flex items-center px-3 py-2 text-sm font-medium rounded-md ${ isActive ? 'bg-[#679a41] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700' }`}
                            >
                                <Icon name={item.iconName} className="mr-3 w-5" />
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                    <hr className="my-4 dark:border-gray-600"/>
                    <div className="px-3 py-2">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600">
                                <ThemeIconComponent className="text-lg text-gray-500 dark:text-gray-400" />
                            </button>
                        </label>
                    </div>
                </Card>
            </div>
            <div className="md:w-3/4 lg:w-4/5">
                <Outlet />
            </div>
        </div>
    );
};
