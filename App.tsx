











import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet, useSearchParams, Link } from 'react-router-dom';
import { AuthProvider, ThemeProvider, useAuth, AppLayoutContext } from '@/context';
import type { User, AuthContextType, NavItem, UserGroup, ApplicationCardData } from '@/types';
import { Navbar, Sidebar, Spinner, Breadcrumbs, Footer, Icon, Button, Chatbot, FeedbackSystem } from '@/components/ui'; 
import { getMockUserById } from '@/data';
import { 
    LandingPage, 
    LoginPage, 
    SignupPage, 
    EmailVerificationPage, 
    DashboardPage,
    AdminDashboardPage,
    ResellerDashboardPage,
    UserManagementPage,
    AddCustomerPage,
    ResellerCustomersPage,
    StaffManagementPage,
    AdminRouterPage,
    InvoiceRouterPage,
    SettingsRouterPage,
    ProfilePage,
    AccountSettingsPage,
    SecuritySettingsPage,
    BillingSettingsPage,
    EmailConfigurationsPage,
    InvoiceHistoryPage,
    InvoiceDetailPage,
    ActionLogsPage,
    CustomerTeamManagementPage,
    AddTeamUserPage,
    EditTeamUserPage,
    ResellerProgramPage,
    SupportPage,
    NotFoundPage,
    AllNotificationsPage,
    CloudEdgeLayout,
    CloudEdgeDashboardPage,
    EmailAdminSubscriptionsPage,
    CloudEdgeConfigurationsPage,
    PostaPricingPage,
    CreateTicketPage,
    EmailAdminSmtpLogsPage,
    EmailAdminSidebar,
    EmailAdminSuiteDashboardPage,
    PlaceholderPage,
    MailboxesPage,
    DistributionListsPage,
    SharedContactsPage,
    KubernetesPage,
    NetworkingPage,
    StoragePage,
    MonitoringPage,
    BackupPage,
    EmailMigrationPage
} from '@/pages';


const ProtectedRoute: React.FC<{
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    allowedRoles?: User['role'][];
}> = ({ user, isAuthenticated, isLoading, allowedRoles }) => {
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="w-full h-screen flex justify-center items-center bg-gray-100 dark:bg-slate-900">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/app/dashboard" replace />;
    }

    return <Outlet />;
};

const getNavItems = (role: User['role']): NavItem[] => {
  switch (role) {
    case 'admin':
      return [
        { name: 'Dashboard', path: '/app/admin-dashboard', iconName: 'fas fa-home' },
        { name: 'Admins Management', path: '/app/admin/staff', iconName: 'fas fa-user-tie' },
        { name: 'Customers', path: '/app/admin/users', iconName: 'fas fa-users' },
        { name: 'Billings', path: '/app/billing', iconName: 'fas fa-file-invoice-dollar' },
        { name: 'Support Center', path: '/app/admin/support', iconName: 'fas fa-headset' },
      ];
    case 'reseller':
      return [
        { name: 'Dashboard', path: '/app/reseller-dashboard', iconName: 'fas fa-tachometer-alt' },
        { name: 'My Customers', path: '/app/reseller/customers', iconName: 'fas fa-user-friends' },
        { name: 'My Program', path: '/app/reseller/program', iconName: 'fas fa-award' },
        { name: 'Subscriptions', path: '/app/billing', iconName: 'fas fa-file-invoice-dollar' },
        { name: 'Support', path: '/app/support', iconName: 'fas fa-headset' },
      ];
    case 'customer':
    default:
      return [
        { name: 'Dashboard', path: '/app/dashboard', iconName: 'fas fa-home' },
        { name: 'Users Management', path: '/app/team-management', iconName: 'fas fa-users-cog' },
      ];
  }
};

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
            description: 'Manage mailboxes, security, and settings for your email services.',
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
        {
            id: 'email-migration',
            name: 'Email Migration',
            description: 'Migrate your mailboxes from other providers to WorldPosta seamlessly.',
            iconName: 'fas fa-exchange-alt',
            launchUrl: '/app/email-migration',
        },
    ];

    if (role === 'customer') {
        return [...baseApps, ...customerApps];
    }
    if (role === 'admin') {
        return [
            { id: 'billing', name: 'Billings', description: 'Access and manage billing for all customer accounts.', iconName: 'fas fa-cash-register', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    if (role === 'reseller') {
        return [
            { id: 'billing', name: 'Reseller Billing', description: 'Manage your billing, commissions, and payment history.', iconName: 'fas fa-file-invoice-dollar', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    return baseApps;
};


const AppLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(() => {
        const isEmailAdmin = location.pathname.startsWith('/app/email-admin-suite');
        const storageKey = isEmailAdmin ? 'emailAdminSidebarCollapsed' : 'sidebarCollapsed';
        return localStorage.getItem(storageKey) === 'true';
    });
    const [isSearchPanelOpen, setSearchPanelOpen] = useState(false);

    const isEmailAdminSuite = location.pathname.startsWith('/app/email-admin-suite');

    useEffect(() => {
        const storageKey = isEmailAdminSuite ? 'emailAdminSidebarCollapsed' : 'sidebarCollapsed';
        localStorage.setItem(storageKey, String(isDesktopSidebarCollapsed));
    }, [isDesktopSidebarCollapsed, isEmailAdminSuite]);

    const viewAsUserId = searchParams.get('viewAsUser');
    const returnToPath = searchParams.get('returnTo');
    const viewedUser = viewAsUserId ? getMockUserById(viewAsUserId) : null;
    const isViewAsMode = !!(viewAsUserId && returnToPath && viewedUser && user && (user.role === 'admin' || user.role === 'reseller'));
    const isCustomerView = useMemo(() => user?.role === 'customer' && !isViewAsMode, [user, isViewAsMode]);

    
    const navItems = useMemo(() => {
        // Always show the logged-in user's navigation items.
        return user ? getNavItems(user.role) : [];
    }, [user]);
    
    const appLauncherItems = useMemo(() => getAppLauncherItems(user?.role), [user]);

    const breadcrumbItems = useMemo(() => {
        const viewAsUserId = searchParams.get('viewAsUser');
        const returnToPath = searchParams.get('returnTo');
        const pathnames = location.pathname.split('/').filter(x => x);

        const BREADCRUMB_LABELS: { [key: string]: string } = {
            'admin': 'Admin',
            'users': 'Customer Management',
            'staff': 'Admins Management',
            'system': 'System Settings',
            'team-management': 'Users Management',
            'add': 'Add User',
            'edit': 'Edit User',
            'billing': 'Billings',
            'email-subscriptions': 'Email Subscriptions',
            'email-configurations': 'Email Configurations',
            'cloudedge-configurations': 'CloudEdge Configurations',
            'invoices': 'Invoices',
            'action-logs': 'Action Logs',
            'support': 'Support Center',
            'create': 'Create Ticket',
            'settings': 'Settings',
            'account': 'Account Settings',
            'security': 'Security Settings',
            'notifications': 'Notifications',
            'reseller': 'Reseller',
            'customers': 'My Customers',
            'program': 'My Program',
            'email-admin-suite': 'Email Admin Suite',
            'kubernetes': 'Kubernetes',
            'networking': 'Networking',
            'storage': 'Storage',
            'monitoring': 'Monitoring & Security',
            'backup': 'Backup & DR',
            'mailboxes': 'Mailboxes',
            'distribution-lists': 'Distribution Lists',
            'shared-contacts': 'Shared Contacts',
            'email-migration': 'Email Migration',
        };
        
        const getLabel = (value: string) => {
            return BREADCRUMB_LABELS[value] || value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };

        // "View As" mode breadcrumbs for admin/reseller
        if (viewAsUserId && returnToPath && user && (user.role === 'admin' || user.role === 'reseller')) {
            const viewedUser = getMockUserById(viewAsUserId);
            if (!viewedUser) return [];

            const adminHomePath = user.role === 'admin' ? '/app/admin-dashboard' : '/app/reseller-dashboard';
            const crumbs = [{ label: 'Dashboard', path: adminHomePath }];

            let returnLabel = getLabel(returnToPath.split('/').pop() || '');
            crumbs.push({ label: returnLabel, path: returnToPath });
            
            const customerDashboardPath = `/app/dashboard?viewAsUser=${viewAsUserId}&returnTo=${encodeURIComponent(returnToPath)}`;
            crumbs.push({ label: viewedUser.fullName, path: customerDashboardPath });
            
            let segmentsToProcess = pathnames.slice(1);
            if (
                segmentsToProcess.length === 3 &&
                segmentsToProcess[0] === 'team-management' &&
                segmentsToProcess[1] === 'edit'
            ) {
                segmentsToProcess = segmentsToProcess.slice(0, 2);
            }

            segmentsToProcess.forEach((value, index) => {
                if (value === 'dashboard') return; 

                const to = `/app/${pathnames.slice(1, index + 2).join('/')}?viewAsUser=${viewAsUserId}&returnTo=${encodeURIComponent(returnToPath)}`;
                const label = getLabel(value);
                crumbs.push({ label, path: to });
            });
            
            if (crumbs.length > 1) {
                delete crumbs[crumbs.length - 1].path;
            }

            return crumbs;
        }

        // Original breadcrumb logic for other cases
        if (pathnames[0] !== 'app') return [];

        let homePath = '/app/dashboard';
        if (user?.role === 'admin') homePath = '/app/admin-dashboard';
        if (user?.role === 'reseller') homePath = '/app/reseller-dashboard';
        if (isEmailAdminSuite) homePath = '/app/email-admin-suite';

        const crumbs = [{ label: 'Home', path: homePath }];
        
        let segmentsToProcess = pathnames.slice(1);
        if (
            segmentsToProcess.length === 3 &&
            segmentsToProcess[0] === 'team-management' &&
            segmentsToProcess[1] === 'edit'
        ) {
            segmentsToProcess = segmentsToProcess.slice(0, 2);
        }

        segmentsToProcess.forEach((value, index) => {
            if (value === 'admin' || value.endsWith('-dashboard')) return;

            // When in email admin suite, if a view is selected, remove the container tab.
            if (isEmailAdminSuite && (value === 'exchange' || value === 'admin') && index < segmentsToProcess.length - 1) {
                return;
            }

            const to = `/app/${pathnames.slice(1, index + 2).join('/')}`;
            const label = getLabel(value);
            if (label !== 'Dashboard' && label !== 'App' && label !== 'Home') {
                 crumbs.push({ label, path: to });
            }
        });

        if (crumbs.length > 1) {
            delete crumbs[crumbs.length - 1].path;
        }

        return crumbs;
    }, [location, user, searchParams, isEmailAdminSuite]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Special layout for CloudEdge
    if (location.pathname.startsWith('/app/cloud-edge')) {
        return (
            <CloudEdgeLayout>
                <Outlet />
            </CloudEdgeLayout>
        );
    }
    
    const appLayoutContextValue = {
        setSearchPanelOpen,
    };

    return (
        <AppLayoutContext.Provider value={appLayoutContextValue}>
            <div className={`flex h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden`}>
                {isEmailAdminSuite ? (
                    <EmailAdminSidebar 
                         isCollapsed={isDesktopSidebarCollapsed}
                         isOpen={isMobileSidebarOpen} 
                         onClose={() => setMobileSidebarOpen(false)}
                    />
                ) : (
                    <Sidebar 
                        navItems={navItems}
                        isOpen={isMobileSidebarOpen}
                        isCollapsed={isDesktopSidebarCollapsed}
                        onClose={() => setMobileSidebarOpen(false)}
                    />
                )}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar
                        user={user}
                        onLogout={logout}
                        onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
                        onToggleDesktopSidebar={() => setDesktopSidebarCollapsed(prev => !prev)}
                        sidebarCollapsed={isDesktopSidebarCollapsed}
                        navItems={navItems}
                        appItems={appLauncherItems}
                        isViewAsMode={isViewAsMode}
                        viewedUser={viewedUser}
                        returnToPath={returnToPath}
                    />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {location.pathname !== '/app/admin-dashboard' && location.pathname !== '/app/email-admin-suite' && <Breadcrumbs items={breadcrumbItems} />}
                        <Outlet />
                    </main>
                </div>
                {isCustomerView && !isEmailAdminSuite && <FeedbackSystem position="raised" />}
                <Chatbot />
            </div>
        </AppLayoutContext.Provider>
    );
};


const AppIndexRedirect: React.FC = () => {
    const { user } = useAuth();
  
    // This component is rendered within ProtectedRoute, so user should exist.
    if (!user) {
      // This is a fallback, should not be reached in normal flow.
      return <Navigate to="/login" replace />; 
    }
  
    switch (user.role) {
      case 'admin':
        return <Navigate to="/app/admin-dashboard" replace />;
      case 'reseller':
        return <Navigate to="/app/reseller-dashboard" replace />;
      case 'customer':
      default:
        return <Navigate to="/app/dashboard" replace />;
    }
};

const AppRoutes: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/email-verification" element={<EmailVerificationPage />} />
            <Route path="/posta-pricing" element={<PostaPricingPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute user={user} isAuthenticated={isAuthenticated} isLoading={isLoading} />}>
                <Route path="/app" element={<AppLayout />}>
                    <Route index element={<AppIndexRedirect />} />
                    
                    {/* Customer Routes */}
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="billing" element={<BillingSettingsPage />} />
                    <Route path="billing/email-subscriptions" element={<EmailAdminSubscriptionsPage />} />
                    <Route path="billing/email-configurations" element={<EmailConfigurationsPage />} />
                    <Route path="billing/cloudedge-configurations" element={<CloudEdgeConfigurationsPage />} />
                    <Route path="invoices" element={<InvoiceRouterPage />}>
                        <Route index element={<InvoiceHistoryPage />} />
                        <Route path=":invoiceId" element={<InvoiceDetailPage />} />
                    </Route>
                    <Route path="action-logs" element={<ActionLogsPage />} />
                    <Route path="team-management">
                        <Route index element={<CustomerTeamManagementPage />} />
                        <Route path="add" element={<AddTeamUserPage />} />
                        <Route path="edit/:userId" element={<EditTeamUserPage />} />
                    </Route>
                    <Route path="support" element={<SupportPage />} />

                    {/* NEW Product Routes */}
                    <Route path="kubernetes" element={<KubernetesPage />} />
                    <Route path="networking" element={<NetworkingPage />} />
                    <Route path="storage" element={<StoragePage />} />
                    <Route path="monitoring" element={<MonitoringPage />} />
                    <Route path="backup" element={<BackupPage />} />
                    <Route path="email-migration" element={<EmailMigrationPage />} />

                    {/* Settings Routes */}
                    <Route path="settings" element={<SettingsRouterPage />}>
                        <Route index element={<Navigate to="account" replace />} />
                        <Route path="account" element={<AccountSettingsPage />} />
                        <Route path="security" element={<SecuritySettingsPage />} />
                    </Route>
                     <Route path="notifications" element={<AllNotificationsPage />} />

                    {/* Admin Routes */}
                     <Route path="admin" element={<AdminRouterPage />}>
                        <Route index element={<Navigate to="/app/admin-dashboard" replace />} />
                        <Route path="users" element={<UserManagementPage />} />
                        <Route path="users/add" element={<AddCustomerPage />} />
                        <Route path="staff" element={<StaffManagementPage />} />
                        <Route path="support" element={<Outlet />}>
                            <Route index element={<SupportPage />} />
                            <Route path="create" element={<CreateTicketPage />} />
                        </Route>
                    </Route>
                    <Route path="admin-dashboard" element={<AdminDashboardPage />} />
                    
                    {/* Reseller Routes */}
                    <Route path="reseller" element={<Outlet />}>
                         <Route index element={<Navigate to="/app/reseller-dashboard" replace />} />
                         <Route path="customers" element={<ResellerCustomersPage />} />
                         <Route path="program" element={<ResellerProgramPage />} />
                    </Route>
                    
                    {/* CloudEdge Route (Based on AppLayout) */}
                    <Route path="cloud-edge" element={<CloudEdgeDashboardPage />} />
                    
                    {/* Email Admin Suite Routes */}
                    <Route path="email-admin-suite">
                        <Route index element={<EmailAdminSuiteDashboardPage />} />
                        <Route path="orgs-and-domains" element={<PlaceholderPage />} />
                        <Route path="exchange/mailboxes" element={<MailboxesPage />} />
                        <Route path="exchange/distribution-lists" element={<DistributionListsPage />} />
                        <Route path="exchange/shared-contacts" element={<SharedContactsPage />} />
                        <Route path="exchange/bulk-module" element={<PlaceholderPage />} />
                        <Route path="exchange/running-tasks" element={<PlaceholderPage />} />
                        <Route path="exchange/mailbox-plans" element={<PlaceholderPage />} />
                        <Route path="exchange/smtp-logs" element={<EmailAdminSmtpLogsPage />} />
                        <Route path="exchange/pst-logs" element={<PlaceholderPage />} />
                        <Route path="exchange/rules" element={<PlaceholderPage />} />
                        <Route path="exchange/account-statistics" element={<PlaceholderPage />} />
                        <Route path="admin/billing" element={<PlaceholderPage />} />
                        <Route path="admin/users" element={<PlaceholderPage />} />
                        <Route path="admin/permission-groups" element={<PlaceholderPage />} />
                        <Route path="admin/background-tasks" element={<PlaceholderPage />} />
                        <Route path="admin/action-logs" element={<PlaceholderPage />} />
                        <Route path="admin/lists" element={<PlaceholderPage />} />
                        <Route path="admin/sister-companies" element={<PlaceholderPage />} />
                        <Route path="admin/ip-lists" element={<PlaceholderPage />} />
                        <Route path="migrations" element={<PlaceholderPage />} />
                    </Route>

                </Route>
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

const MainApp: React.FC = () => (
    <ThemeProvider>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    </ThemeProvider>
);

export default MainApp;