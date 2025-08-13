


import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, StatCard, LineChart, Button, Icon, MultiSegmentDoughnutChart, Modal, FloatingActionMenu, FormField, DashboardCustomizationMenu } from '@/components/ui';
import { useNavigate, NavigateFunction, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context';

const topThreatSources = [
    { ip: '192.168.1.100', location: 'Unknown', attempts: 45, risk: 'High' },
    { ip: '203.0.113.5', location: 'Russia', attempts: 38, risk: 'Critical' },
    { ip: '198.51.100.2', location: 'China', attempts: 32, risk: 'High' },
    { ip: '172.16.0.50', location: 'Nigeria', attempts: 28, risk: 'Medium' },
    { ip: '10.0.0.15', location: 'Brazil', attempts: 21, risk: 'Medium' },
];

const getRiskTagClass = (risk: string) => {
    switch (risk.toLowerCase()) {
        case 'critical': return 'bg-red-600 text-white';
        case 'high': return 'bg-yellow-500 text-white';
        case 'medium': return 'bg-blue-500 text-white';
        default: return 'bg-gray-500 text-white';
    }
};

const MiniStatCard: React.FC<{ title: string; metric: string; iconName: string; iconColor: string; }> = ({ title, metric, iconName, iconColor }) => (
    <div className="bg-gray-50/50 dark:bg-slate-700/25 p-4 rounded-xl flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${iconColor.replace('text-', 'bg-').replace('-500', '-100 dark:bg-opacity-20')} `}>
            <Icon name={iconName} className={`text-2xl ${iconColor}`} />
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-[#293c51] dark:text-gray-100">{metric}</p>
        </div>
    </div>
);

const StatsGrid: React.FC = () => (
    <Card title="At a Glance" className="h-full flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow content-start">
            <MiniStatCard title="Total Mailboxes" metric="1,254" iconName="far fa-envelope" iconColor="text-blue-500" />
            <MiniStatCard title="Domains Managed" metric="12" iconName="fas fa-globe" iconColor="text-green-500" />
            <MiniStatCard title="Threats Blocked (24h)" metric="209" iconName="fas fa-shield-halved" iconColor="text-red-500" />
            <MiniStatCard title="Overall Health" metric="99.8%" iconName="far fa-heart" iconColor="text-indigo-500" />
        </div>
    </Card>
);

const UserStatusCard: React.FC = () => {
    const userStatusData = [
        { label: 'Active', value: 1000, color: '#22c55e' },
        { label: 'Inactive', value: 150, color: '#64748b' },
        { label: 'Suspended', value: 80, color: '#f59e0b' },
        { label: 'Archived', value: 24, color: '#3b82f6' },
    ];
    const totalUsers = userStatusData.reduce((acc, s) => acc + s.value, 0);

    const recentChanges = [
        { user: 'user1@alpha.inc', status: 'Suspended', color: 'text-yellow-600 dark:text-yellow-400' },
        { user: 'user2@alpha.inc', status: 'Activated', color: 'text-green-600 dark:text-green-400' },
        { user: 'user3@alpha.inc', status: 'Archived', color: 'text-blue-600 dark:text-blue-400' },
    ];

    return (
        <Card title="User Status" className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row items-center justify-around flex-grow gap-4">
                <MultiSegmentDoughnutChart segments={userStatusData} size={150} strokeWidth={20} />
                <div className="w-full sm:w-auto space-y-2 text-sm">
                    {userStatusData.map(segment => (
                        <div key={segment.label} className="flex items-center">
                            <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: segment.color }}></span>
                            <span className="text-gray-600 dark:text-gray-400">{segment.label}:</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300 ml-auto">{segment.value.toLocaleString()}</span>
                        </div>
                    ))}
                    <div className="pt-2 border-t dark:border-gray-600 flex items-center">
                        <span className="text-gray-600 dark:text-gray-400">Total Users:</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300 ml-auto">{totalUsers.toLocaleString()}</span>
                    </div>
                </div>
            </div>
             <div className="mt-4 pt-4 border-t dark:border-gray-600 flex-shrink-0">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Recent Status Changes</h4>
                <ul className="space-y-2 text-xs">
                    {recentChanges.map((change, index) => (
                        <li key={index} className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">{change.user}</span>
                            <span className={`font-semibold ${change.color}`}>{change.status}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    );
};


const MailFlowCard: React.FC = () => {
    const [timeRange, setTimeRange] = useState('7d');

    const mailFlowData = useMemo(() => {
        const generatePoints = (numPoints: number, max: number) => Array.from({ length: numPoints }, () => Math.floor(Math.random() * max));
        const generateLabels = (numPoints: number, unit: 'day' | 'hour') => {
            const labels: string[] = [];
            const now = new Date();
            for (let i = 0; i < numPoints; i++) {
                if (unit === 'day') {
                    const d = new Date(now);
                    d.setDate(d.getDate() - (numPoints - 1 - i));
                    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                } else { // hour
                    const h = (now.getHours() - (numPoints - 1 - i) + 24) % 24;
                    labels.push(`${h}:00`);
                }
            }
            return labels;
        };
        
        switch(timeRange) {
            case '24h':
                return {
                    labels: generateLabels(24, 'hour'),
                    data: [
                        { name: 'Emails Sent', color: '#3b82f6', points: generatePoints(24, 200) },
                        { name: 'Emails Received', color: '#10b981', points: generatePoints(24, 300) }
                    ]
                };
            case '30d':
                return {
                    labels: generateLabels(30, 'day'),
                    data: [
                        { name: 'Emails Sent', color: '#3b82f6', points: generatePoints(30, 5000) },
                        { name: 'Emails Received', color: '#10b981', points: generatePoints(30, 7000) }
                    ]
                };
            case '7d':
            default:
                return {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    data: [
                        { name: 'Emails Sent', color: '#3b82f6', points: [1200, 1900, 1500, 2100, 1800, 2400, 2000] },
                        { name: 'Emails Received', color: '#10b981', points: [1800, 2200, 1900, 2700, 2500, 3000, 2800] }
                    ]
                };
        }
    }, [timeRange]);
    
    return (
        <Card title="Mail Flow" titleActions={
            <div className="w-40">
                <FormField
                    id="mail-flow-range"
                    name="timeRange"
                    label=""
                    as="select"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    inputClassName="!py-1.5 !text-xs"
                    wrapperClassName="!mb-0"
                >
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                </FormField>
            </div>
        } className="h-full flex flex-col">
            <div className="flex-grow flex flex-col">
                <LineChart data={mailFlowData.data} labels={mailFlowData.labels} className="flex-grow" />
            </div>
        </Card>
    );
};

const ThreatSourcesCard: React.FC = () => (
    <Card title="Top Threat Sources" className="h-full flex flex-col">
         <div className="space-y-2 flex-grow overflow-y-auto">
            {topThreatSources.map((source, index) => (
                <div key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-50/20 dark:hover:bg-slate-700/30">
                    <div className="flex-grow">
                        <p className="font-semibold text-[#293c51] dark:text-gray-100">{source.ip}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{source.location} • {source.attempts} attempts</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskTagClass(source.risk)}`}>{source.risk}</span>
                    <Button size="icon" variant="ghost" onClick={() => alert(`Blocking IP: ${source.ip}`)} title={`Block ${source.ip}`} className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                        <Icon name="fas fa-ban" />
                    </Button>
                </div>
            ))}
        </div>
    </Card>
);

const HelpAndResourcesCard: React.FC = () => (
    <Card title="Help & Resources" className="h-full flex flex-col">
        <div className="flex-grow">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Find guides, documentation, and support to get the most out of the Email Admin Suite.
            </p>
            <ul className="space-y-2">
                <li>
                    <a href="#" className="flex items-center p-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">
                        <Icon name="fas fa-book" className="w-5 mr-3 text-gray-500" />
                        <span>Admin Guides & Documentation</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center p-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">
                        <Icon name="fas fa-mobile-alt" className="w-5 mr-3 text-gray-500" />
                        <span>Configure Email on Devices</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center p-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">
                        <Icon name="fas fa-shield-alt" className="w-5 mr-3 text-gray-500" />
                        <span>Security Best Practices</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center p-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">
                        <Icon name="fas fa-headset" className="w-5 mr-3 text-gray-500" />
                        <span>Contact Support</span>
                    </a>
                </li>
            </ul>
        </div>
    </Card>
);

const ExecutingTasksCard: React.FC = () => {
    const executingTasks = [
        { id: 'task1', name: 'Bulk Mailbox Creation', status: 'In Progress', progress: 75, startedOn: new Date(Date.now() - 3600000 * 0.5).toISOString() },
        { id: 'task2', name: 'Applying Retention Policy "Finance-3Y"', status: 'In Progress', progress: 40, startedOn: new Date(Date.now() - 3600000 * 1).toISOString() },
        { id: 'task3', name: 'Exporting PST for user@alpha.inc', status: 'Completed', progress: 100, startedOn: new Date(Date.now() - 3600000 * 3).toISOString() },
        { id: 'task4', name: 'Domain Health Check', status: 'Queued', progress: 0, startedOn: new Date().toISOString() },
        { id: 'task5', name: 'Mailbox Migration from Exchange 2013', status: 'Failed', progress: 15, startedOn: new Date(Date.now() - 3600000 * 5).toISOString() },
    ];

    const getStatusChipClass = (status: string) => {
        switch (status) {
            case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Queued': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-200 text-gray-800';
        }
    };
    
    return (
        <Card title="Executing Tasks" className="h-full flex flex-col">
            <div className="overflow-x-auto flex-grow">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Task</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-1/4">Progress</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Started On</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {executingTasks.map(task => (
                            <tr key={task.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-gray-200">{task.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(task.status)}`}>{task.status}</span></td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                                            <div className={`h-2.5 rounded-full ${task.status === 'Failed' ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${task.progress}%` }}></div>
                                        </div>
                                        <span className="text-xs font-semibold">{task.progress}%</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(task.startedOn).toLocaleString()}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                    <Button size="icon" variant="ghost" title="View Log"><Icon name="far fa-file-alt"/></Button>
                                    {task.status === 'In Progress' && <Button size="icon" variant="ghost" title="Cancel Task"><Icon name="fas fa-stop-circle" className="text-red-500"/></Button>}
                                    {task.status === 'Failed' && <Button size="icon" variant="ghost" title="Retry Task"><Icon name="fas fa-sync-alt" className="text-blue-500"/></Button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

interface DashboardCardInfo {
    id: string;
    name: string;
    sizeClass: string;
}

const cardComponentMap: { [key: string]: React.ComponentType<any> } = {
    stats: StatsGrid,
    userStatus: UserStatusCard,
    mailFlow: MailFlowCard,
    executingTasks: ExecutingTasksCard,
    threatSources: ThreatSourcesCard,
    helpAndResources: HelpAndResourcesCard,
};

const ALL_DASHBOARD_CARDS: DashboardCardInfo[] = [
    { id: 'stats', name: 'Statistics', sizeClass: 'md:col-span-12' },
    { id: 'mailFlow', name: 'Mail Flow', sizeClass: 'md:col-span-12 lg:col-span-7' },
    { id: 'userStatus', name: 'User Status', sizeClass: 'md:col-span-12 lg:col-span-5' },
    { id: 'executingTasks', name: 'Executing Tasks', sizeClass: 'md:col-span-12' },
    { id: 'threatSources', name: 'Top Threat Sources', sizeClass: 'md:col-span-12 lg:col-span-6' },
    { id: 'helpAndResources', name: 'Help & Resources', sizeClass: 'md:col-span-12 lg:col-span-6' },
];

export const EmailAdminSuiteDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    
    const [cardVisibility, setCardVisibility] = useState<{ [key: string]: boolean }>(() => {
        try {
            const storedVisibility = localStorage.getItem('emailAdminDashboardVisibility');
            if (storedVisibility) {
                return JSON.parse(storedVisibility);
            }
        } catch (e) {
            console.error("Failed to parse dashboard visibility from localStorage", e);
        }
        // Default: all cards visible
        return ALL_DASHBOARD_CARDS.reduce((acc, card) => {
            (acc as any)[card.id] = true;
            return acc;
        }, {});
    });

    useEffect(() => {
        localStorage.setItem('emailAdminDashboardVisibility', JSON.stringify(cardVisibility));
    }, [cardVisibility]);

    const visibleCards = useMemo(() => {
        return ALL_DASHBOARD_CARDS.filter(card => cardVisibility[card.id]);
    }, [cardVisibility]);

    const quickActions = useMemo(() => [
        { label: 'Create Mailbox', icon: 'fas fa-plus-circle', onClick: () => navigate('/app/email-admin-suite/exchange/mailboxes') },
        { label: 'Add Migration', icon: 'fas fa-exchange-alt', onClick: () => navigate('/app/email-admin-suite/migrations') },
        { label: 'Run Bulk Task', icon: 'fas fa-tasks', onClick: () => navigate('/app/email-admin-suite/exchange/bulk-module') },
        { label: 'Add New Group', icon: 'fas fa-users-cog', onClick: () => navigate('/app/email-admin-suite/admin/permission-groups') },
    ], [navigate]);

    return (
        <div className="relative">
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">Overview</h1>
                    <DashboardCustomizationMenu
                        allCards={ALL_DASHBOARD_CARDS.map(c => ({ id: c.id, name: c.name }))}
                        visibility={cardVisibility}
                        onVisibilityChange={setCardVisibility}
                        isArrangeMode={false}
                        onToggleArrangeMode={() => {}}
                    />
                </div>

                <Card className="!p-0 overflow-hidden">
                    <div className="p-6 bg-gray-50 dark:bg-slate-800/50">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#293c51] dark:text-gray-100">Organization: Alpha Inc.</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Primary Domain: <span className="font-medium text-gray-700 dark:text-gray-300">alpha-inc.com</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate('/app/email-admin-suite/orgs-and-domains')}
                                    leftIconName="fas fa-cog"
                                >
                                    Manage Organization
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x dark:divide-slate-700">
                        <div className="p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Subscription</p>
                            <p className="font-semibold text-base text-[#293c51] dark:text-gray-200">Posta Premium</p>
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Mailboxes</p>
                            <p className="font-semibold text-base text-[#293c51] dark:text-gray-200">1,254 / 1,500</p>
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Storage Used</p>
                            <p className="font-semibold text-base text-[#293c51] dark:text-gray-200">1.8 TB / 2.5 TB</p>
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Health Status</p>
                            <p className="font-semibold text-base text-green-600 dark:text-green-400 flex items-center gap-2">
                                <Icon name="fas fa-check-circle" /> Healthy
                            </p>
                        </div>
                    </div>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {visibleCards.map(cardInfo => {
                        const CardComponent = cardComponentMap[cardInfo.id];
                        return (
                            <div
                                key={cardInfo.id}
                                className={cardInfo.sizeClass}
                            >
                                <CardComponent/>
                            </div>
                        );
                    })}
                </div>
            </div>
             <FloatingActionMenu actions={quickActions} />
        </div>
    );
};