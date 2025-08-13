

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Icon, FormField, Button, ToggleSwitch, DoughnutChart, FloatingAppLauncher, FeedbackSystem } from '@/components/ui';
import { useAuth } from '@/context';
import type { NavItem, ApplicationCardData } from '@/types';
import type { User } from '@/types';
import { getMockUserById } from '@/data';

const getAppLauncherItems = (role: User['role'] | undefined): ApplicationCardData[] => {
    const baseApps: ApplicationCardData[] = [
        {
            id: 'website',
            name: 'WorldPosta.com',
            description: 'Visit the main WorldPosta website for news and service information.',
            iconName: 'https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%201.png',
            launchUrl: '/'
        },
        { 
            id: 'cloudedge', 
            name: 'CloudEdge', 
            description: 'Manage your cloud infrastructure, VMs, and network resources efficiently.',
            iconName: "https://console.worldposta.com/assets/loginImgs/edgeLogo.png", 
            launchUrl: '/app/cloud-edge' 
        },
        { 
            id: 'emailadmin', 
            name: 'Email Admin Suite', 
            description: 'Administer your email services, mailboxes, users, and domains with ease.',
            iconName: "https://www.worldposta.com/assets/Posta-Logo.png", 
            launchUrl: '/app/email-admin-suite'
        }
    ];

    const customerApps: ApplicationCardData[] = [
        { 
            id: 'billing', 
            name: 'Subscriptions', 
            description: 'Oversee your subscriptions and add new services.', 
            iconName: 'fas fa-wallet', 
            launchUrl: '/app/billing',
        },
        { 
            id: 'invoices', 
            name: 'Invoice History', 
            description: 'View and download past invoices for your records.', 
            iconName: 'fas fa-file-invoice', 
            launchUrl: '/app/invoices',
        },
        {
            id: 'user-management',
            name: 'Users Management',
            description: 'Manage team members, user groups, and their permissions.',
            iconName: 'fas fa-users-cog',
            launchUrl: '/app/team-management',
        },
        {
            id: 'support',
            name: 'Support Center',
            description: 'Access knowledge base or create support tickets with our team.',
            iconName: 'fas fa-headset',
            launchUrl: '/app/support',
        },
        {
            id: 'action-logs',
            name: 'Action Logs',
            description: 'Review a detailed history of all activities and events on your account.',
            iconName: 'fas fa-history',
            launchUrl: '/app/action-logs',
        },
    ];

    if (role === 'customer') {
        return [...baseApps, ...customerApps];
    }
    if (role === 'admin') {
        return [
            { id: 'customers', name: 'Customers', description: 'Search, manage, and view customer accounts.', iconName: 'fas fa-users', launchUrl: '/app/admin/users' },
            { id: 'billing', name: 'Billing Overview', description: 'Access and manage billing for all customer accounts.', iconName: 'fas fa-cash-register', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    if (role === 'reseller') {
        return [
            { id: 'customers', name: 'My Customers', description: 'Access and manage your customer accounts.', iconName: 'fas fa-user-friends', launchUrl: '/app/reseller/customers' },
            { id: 'billing', name: 'Reseller Billing', description: 'Manage your billing, commissions, and payment history.', iconName: 'fas fa-file-invoice-dollar', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    return baseApps;
};

interface CloudEdgeSidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}
const CloudEdgeSidebar: React.FC<CloudEdgeSidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
    const location = useLocation();
    const { user } = useAuth();

    const getDashboardIcon = () => {
        if (!user) return 'fas fa-th-large'; // fallback
        switch(user.role) {
            case 'admin':
            case 'reseller':
                return 'fas fa-tachometer-alt';
            case 'customer':
            default:
                return 'fas fa-home';
        }
    };

    const sidebarNavItems = [
        { name: 'Dashboard', icon: getDashboardIcon(), path: '/app/cloud-edge' },
        { name: 'Administration', icon: 'fas fa-user-shield', path: '#', collapsible: true },
        { name: 'Organizations (worldposta)', icon: 'fas fa-sitemap', path: '#', collapsible: true },
        { name: 'Virtual Machines', icon: 'fas fa-desktop', path: '#' },
        { name: 'Reservations', icon: 'fas fa-calendar-check', path: '#' },
        { name: 'Gateways', icon: 'fas fa-dungeon', path: '#' },
        { name: 'NATs', icon: 'fas fa-random', path: '#' },
        { name: 'Route', icon: 'fas fa-route', path: '#', collapsible: true },
        { name: 'VPN', icon: 'fas fa-user-secret', path: '#', collapsible: true },
        { name: 'Reserved IP', icon: 'fas fa-map-marker-alt', path: '#' },
        { name: 'Firewall', icon: 'fas fa-fire-alt', path: '#' },
        { name: 'Backup', icon: 'fas fa-save', path: '#', collapsible: true },
        { name: 'Scheduled Tasks', icon: 'fas fa-calendar-alt', path: '#', collapsible: true },
        { name: 'Running Tasks', icon: 'fas fa-tasks', path: '#' },
    ];

    return (
        <aside className={`flex-shrink-0 bg-white dark:bg-slate-800 p-2 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center p-3 border-b border-gray-200 dark:border-slate-700 mb-2 flex-shrink-0 h-14 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && <img src="https://console.worldposta.com/assets/loginImgs/edgeLogo.png" alt="CloudEdge Logo" className="h-6" />}
                <button onClick={onToggleCollapse} title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-md">
                    <Icon name={isCollapsed ? "fas fa-angles-right" : "fas fa-angles-left"} />
                </button>
            </div>
            <nav className="flex-grow space-y-1 overflow-y-auto">
                {sidebarNavItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link to={item.path} key={item.name} title={isCollapsed ? item.name : undefined} className={`flex items-center px-3 py-3 text-base rounded-md transition-colors ${isCollapsed ? 'justify-center' : 'justify-between'} ${isActive ? 'bg-gray-200/60 dark:bg-slate-700/80 font-semibold text-[#293c51] dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-300'}`}>
                            <div className="flex items-center">
                                <Icon name={item.icon} className={`w-5 text-xl text-[#679a41] dark:text-emerald-400 ${!isCollapsed ? 'mr-3' : ''}`} />
                                {!isCollapsed && <span className="text-sm">{item.name}</span>}
                            </div>
                            {item.collapsible && !isCollapsed && <Icon name="fas fa-chevron-down" className="w-4 h-4 text-xs text-gray-400" />}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    );
};

const CloudEdgeTopBar: React.FC<{navItems: NavItem[], appItems: ApplicationCardData[]}> = ({navItems, appItems}) => {
    const { user } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [cloudSearchTerm, setCloudSearchTerm] = useState('');
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const [appLauncherOpen, setAppLauncherOpen] = useState(false);
    const appLauncherRef = useRef<HTMLDivElement>(null);
    const appLauncherButtonRef = useRef<HTMLButtonElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
                userMenuButtonRef.current && !userMenuButtonRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
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

    return (
        <header className="bg-white dark:bg-slate-800 p-4 flex justify-between items-center flex-shrink-0">
            <div className="flex-1 max-w-sm">
                <FormField id="cloud-search" label="" placeholder="Search..." value={cloudSearchTerm} onChange={(e) => setCloudSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center space-x-2">
                 <Button variant="ghost" className="hidden sm:inline-flex items-center">
                    <Icon name="fas fa-building" className="mr-2" />
                    Worldposta
                    <Icon name="fas fa-chevron-down" className="ml-2 text-xs" />
                </Button>
                <div className="relative">
                    <button
                        ref={appLauncherButtonRef}
                        onClick={() => setAppLauncherOpen(!appLauncherOpen)}
                        className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#679a41] dark:focus:ring-emerald-400 flex flex-col items-center justify-center w-14 h-14 rounded-md"
                        aria-haspopup="true"
                        aria-expanded={appLauncherOpen}
                        aria-label="Open application launcher"
                    >
                        <Icon name="fa-solid fa-grip" className="text-xl" />
                        <span className="text-xs mt-1">Apps</span>
                    </button>
                    <FloatingAppLauncher
                        isOpen={appLauncherOpen}
                        onClose={() => setAppLauncherOpen(false)}
                        panelRef={appLauncherRef}
                        navItems={navItems}
                        appItems={appItems}
                    />
                </div>
                <div className="relative">
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
                        <span className="ml-2 hidden md:inline text-[#293c51] dark:text-gray-200">Hello, {user?.displayName || 'Mine'}</span>
                        <Icon name="fas fa-chevron-down" className={`ml-1 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 text-xs ${userMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                    {userMenuOpen && (
                        <div ref={userMenuRef} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none text-[#293c51] dark:text-gray-200 z-10">
                            <Link to="/app/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                                <Icon name="fas fa-cog" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> Settings
                            </Link>
                            <Link to="/app/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                                <Icon name="fas fa-sign-out-alt" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> Exit CloudEdge
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export const CloudEdgeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('cloudEdgeSidebarCollapsed') === 'true');
    
    const [searchParams] = useSearchParams();
    const viewAsUserId = searchParams.get('viewAsUser');
    const returnToPath = searchParams.get('returnTo');
    const viewedUser = viewAsUserId ? getMockUserById(viewAsUserId) : null;
    const isViewAsMode = !!(viewAsUserId && returnToPath && viewedUser && user && (user.role === 'admin' || user.role === 'reseller'));
    const isCustomerView = useMemo(() => user?.role === 'customer' && !isViewAsMode, [user, isViewAsMode]);

    useEffect(() => {
        localStorage.setItem('cloudEdgeSidebarCollapsed', String(isSidebarCollapsed));
    }, [isSidebarCollapsed]);
    
    const userNavItems: NavItem[] = useMemo(() => {
        let dashboardPath = '/app/dashboard';
        let dashboardIcon = 'fas fa-home'; // customer default

        if (user?.role === 'admin') {
            dashboardPath = '/app/admin-dashboard';
            dashboardIcon = 'fas fa-home';
        } else if (user?.role === 'reseller') {
            dashboardPath = '/app/reseller-dashboard';
            dashboardIcon = 'fas fa-tachometer-alt';
        }
        
        const items = [
            { name: 'Dashboard', path: dashboardPath, iconName: dashboardIcon },
            { name: 'Settings', path: '/app/settings', iconName: 'fas fa-cog' },
        ];
        
        // Admins don't have a profile page in the main app
        if (user?.role === 'admin') {
            return items.filter(item => item.name !== 'Profile');
        }
        return items;
    }, [user]);

    const appLauncherItems = getAppLauncherItems(user?.role);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden">
            <CloudEdgeSidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <CloudEdgeTopBar navItems={userNavItems} appItems={appLauncherItems} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {children}
                </main>
            </div>
            {isCustomerView && <FeedbackSystem position="default" />}
        </div>
    );
};