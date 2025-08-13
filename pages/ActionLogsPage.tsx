import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, FormField, Icon, Button, Pagination } from '@/components/ui';
import { useAppLayout } from '@/context';
import type { LogEntry } from '@/types';
import { MOCK_USERS } from '@/data';

const mockCloudEdgeLogs: LogEntry[] = [
    { id: 'ce1', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'VM Started', resource: 'prod-web-01', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'ce2', timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'Firewall Rule Updated', resource: 'default-fw', performedBy: 'System', status: 'Success' },
    { id: 'ce3', timestamp: new Date(Date.now() - 10800000).toISOString(), action: 'Snapshot Creation Failed', resource: 'db-main-vm', performedBy: 'customer@worldposta.com', status: 'Failed' },
  ];
const mockPostaLogs: LogEntry[] = [
    { id: 'po1', timestamp: new Date(Date.now() - 4000000).toISOString(), action: 'Mailbox Created', resource: 'new.user@alpha.inc', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'po2', timestamp: new Date(Date.now() - 8000000).toISOString(), action: 'Spam Filter Updated', resource: 'alpha.inc domain', performedBy: 'admin@worldposta.com', status: 'Information' },
    { id: 'po3', timestamp: new Date(Date.now() - 12000000).toISOString(), action: 'Password Reset', resource: 'user@alpha.inc', performedBy: 'customer@worldposta.com', status: 'Pending User Action' },
  ];
  
const mockSubscriptionLogs: LogEntry[] = [
    { id: 'sub1', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), action: 'Subscription Added', resource: 'Posta Standard Plan (10 users)', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'sub2', timestamp: new Date(Date.now() - 26 * 3600000).toISOString(), action: 'Payment Method Updated', resource: 'Visa ending in 4242', performedBy: 'customer@worldposta.com', status: 'Information' },
    { id: 'sub3', timestamp: new Date(Date.now() - 50 * 3600000).toISOString(), action: 'Auto-renewal Failed', resource: 'CloudEdge - Web Server', performedBy: 'System', status: 'Failed' },
  ];

const mockUserManagementLogs: LogEntry[] = [
    { id: 'um1', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), action: 'User Invited', resource: 'charlie.new@alpha.inc', performedBy: 'customer@worldposta.com', status: 'Pending User Action' },
    { id: 'um2', timestamp: new Date(Date.now() - 32 * 3600000).toISOString(), action: 'Group Permissions Updated', resource: 'Team Administrators', performedBy: 'customer@worldposta.com', status: 'Success' },
    { id: 'um3', timestamp: new Date(Date.now() - 72 * 3600000).toISOString(), action: 'User Removed from Group', resource: 'beta.user@alpha.inc from Viewers', performedBy: 'customer@worldposta.com', status: 'Success' },
  ];

const mockSupportLogs: LogEntry[] = [
    { id: 'sup1', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), action: 'Ticket Created', resource: 'TKT-58291: Cannot access my VM', performedBy: 'customer@worldposta.com', status: 'Information' },
    { id: 'sup2', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), action: 'Support Staff Replied', resource: 'TKT-58291', performedBy: 'Support Staff', status: 'Information' },
    { id: 'sup3', timestamp: new Date(Date.now() - 100 * 3600000).toISOString(), action: 'Ticket Resolved', resource: 'TKT-58275: Invoice Discrepancy', performedBy: 'Support Staff', status: 'Success' },
  ];

const mockInvoiceLogs: LogEntry[] = [
    { id: 'inv1', timestamp: new Date().toISOString(), action: 'Invoice Downloaded', resource: 'INV-2024-003', performedBy: 'customer@worldposta.com', status: 'Information' },
    { id: 'inv2', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), action: 'Payment Succeeded', resource: 'Invoice INV-2024-002', performedBy: 'System', status: 'Success' },
];

const logSources = {
  cloudEdge: { title: "CloudEdge Action Logs", logs: mockCloudEdgeLogs, type: 'product', name: 'CloudEdge' },
  posta: { title: "Posta Action Logs", logs: mockPostaLogs, type: 'product', name: 'Posta Email' },
  subscriptions: { title: "Subscription Action Logs", logs: mockSubscriptionLogs, type: 'application', name: 'Subscriptions' },
  userManagement: { title: "User Management Action Logs", logs: mockUserManagementLogs, type: 'application', name: 'User Management' },
  support: { title: "Support Action Logs", logs: mockSupportLogs, type: 'application', name: 'Support' },
  invoices: { title: "Invoice Action Logs", logs: mockInvoiceLogs, type: 'application', name: 'Invoices' },
};

const LogTable: React.FC<{ logs: LogEntry[], title?: string }> = ({ logs, title }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return logs.slice(startIndex, startIndex + rowsPerPage);
    }, [logs, currentPage, rowsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [logs]);

    const getStatusChipClass = (status: LogEntry['status']) => {
        switch (status) {
            case 'Success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Pending User Action':
            case 'Pending System Action':
            case 'Warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Information': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    return (
        <div className="space-y-4">
             {title && <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-200">{title}</h3>}
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-y-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date & Time</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Resource/Details</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Performed By</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedLogs.length > 0 ? paginatedLogs.map((log) => (
                            <tr key={log.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-gray-200">{log.action}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.resource}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.performedBy}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipClass(log.status)}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-6 text-gray-500 dark:text-gray-400">
                                    No log entries found for this source.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                 <Pagination
                    currentPage={currentPage}
                    totalItems={logs.length}
                    itemsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(value) => {
                        setRowsPerPage(value);
                        setCurrentPage(1);
                    }}
                />
            </div>
        </div>
    );
};

interface ActionLogsSearchPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (filters: any) => void;
    onClear: () => void;
}

const ActionLogsSearchPanel: React.FC<ActionLogsSearchPanelProps> = ({ isOpen, onClose, onSearch, onClear }) => {
    const [localFilters, setLocalFilters] = useState({
        objectName: '',
        action: '',
        performedBy: '',
        product: '',
        application: '',
        status: '',
        dateFrom: '',
        dateTo: '',
    });

    const allLogs = useMemo(() => Object.values(logSources).flatMap(source => source.logs), []);
    
    const actionOptions = useMemo(() => 
        [...new Set(allLogs.map(log => log.action))]
            .sort()
            .map(action => ({ value: action, label: action })), 
    [allLogs]);
    
    const userOptions = useMemo(() => 
        Object.values(MOCK_USERS).map(user => ({
            value: user.email,
            label: `${user.fullName} (${user.email})`,
        })), 
    []);
    
    const productOptions = useMemo(() =>
        Object.values(logSources)
            .filter(s => s.type === 'product')
            .map(s => ({ value: s.name, label: s.title })),
    []);

    const applicationOptions = useMemo(() =>
        Object.values(logSources)
            .filter(s => s.type === 'application')
            .map(s => ({ value: s.name, label: s.title })),
    []);

    const statusOptions: LogEntry['status'][] = ['Success', 'Failed', 'Pending User Action', 'Pending System Action', 'Information', 'Warning'];

    const handleFieldChange = (name: string, value: string) => {
        setLocalFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            if (name === 'product' && value) {
                newFilters.application = '';
            }
            if (name === 'application' && value) {
                newFilters.product = '';
            }
            return newFilters;
        });
    };

    const handleSearch = () => {
        onSearch(localFilters);
    };

    const handleClear = () => {
        const clearedFilters = {
            objectName: '', action: '', performedBy: '', product: '',
            application: '', status: '', dateFrom: '', dateTo: '',
        };
        setLocalFilters(clearedFilters);
        onClear();
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[59]" onClick={onClose} aria-hidden="true" />}

            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#f8f8f8] dark:bg-slate-800 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="advanced-search-title"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h2 id="advanced-search-title" className="text-lg font-semibold text-[#293c51] dark:text-gray-100 flex items-center">
                        <Icon name="fas fa-search-plus" className="mr-2" />
                        Advanced Log Search
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close search">
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <FormField id="objectName" name="objectName" label="Object Name" placeholder="e.g., prod-web-01" value={localFilters.objectName} onChange={e => handleFieldChange('objectName', e.target.value)} />
                    
                    <FormField as="select" id="action" name="action" label="Action" value={localFilters.action} onChange={e => handleFieldChange('action', e.target.value)}>
                        <option value="">All Actions</option>
                        {actionOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </FormField>
                    
                    <FormField as="select" id="product" name="product" label="Product" value={localFilters.product} onChange={e => handleFieldChange('product', e.target.value)}>
                        <option value="">All Products</option>
                        {productOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </FormField>

                    <FormField as="select" id="application" name="application" label="Application" value={localFilters.application} onChange={e => handleFieldChange('application', e.target.value)}>
                        <option value="">All Applications</option>
                        {applicationOptions.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </FormField>
                    
                    <FormField as="select" id="status" name="status" label="Status" value={localFilters.status} onChange={e => handleFieldChange('status', e.target.value)}>
                        <option value="">All Statuses</option>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </FormField>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <FormField id="dateFrom" name="dateFrom" label="From Date" type="date" value={localFilters.dateFrom} onChange={e => handleFieldChange('dateFrom', e.target.value)} />
                         <FormField id="dateTo" name="dateTo" label="To Date" type="date" value={localFilters.dateTo} onChange={e => handleFieldChange('dateTo', e.target.value)} />
                    </div>
                </div>
                
                 <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-x-2 flex justify-end">
                    <Button variant="outline" onClick={handleClear}>Clear Filters</Button>
                    <Button onClick={handleSearch}>Search</Button>
                </div>
            </div>
        </>
    );
};

export const ActionLogsPage: React.FC = () => {
    const { setSearchPanelOpen } = useAppLayout();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('source') || 'product');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdvancedSearchPanelOpen, setIsAdvancedSearchPanelOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<Partial<LogEntry & { dateFrom?: string, dateTo?: string, objectName?: string, product?: string, application?: string }>>({});

    const handleTabClick = useCallback((tabId: string) => {
        setActiveTab(tabId);
        setSearchParams({ source: tabId }, { replace: true });

        if (tabId === 'advanced') {
            setIsAdvancedSearchPanelOpen(true);
            setSearchPanelOpen(true);
        } else {
            setIsAdvancedSearchPanelOpen(false);
            setSearchPanelOpen(false);
        }
    }, [setSearchPanelOpen, setSearchParams]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isAdvancedSearchPanelOpen) {
                handleTabClick('product'); 
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isAdvancedSearchPanelOpen, handleTabClick]);
    
    useEffect(() => {
        return () => {
            setSearchPanelOpen(false);
        }
    }, [setSearchPanelOpen]);

    const handleSearch = (filters: any) => {
        setAdvancedFilters(filters);
        setIsAdvancedSearchPanelOpen(false);
        setSearchPanelOpen(false);
    };

    const handleClear = () => {
        setAdvancedFilters({});
        setIsAdvancedSearchPanelOpen(false);
        setSearchPanelOpen(false);
    };

    const productLogSources = useMemo(() => Object.values(logSources).filter(source => source.type === 'product'), []);
    const applicationLogSources = useMemo(() => Object.values(logSources).filter(source => source.type === 'application'), []);
    const allLogs = useMemo(() => Object.values(logSources).flatMap(source => source.logs), []);
    
    const filterBySearchTerm = useCallback((logs: LogEntry[], term: string): LogEntry[] => {
        if (!term) return logs;
        const lowerCaseTerm = term.toLowerCase();
        return logs.filter(log =>
            log.action.toLowerCase().includes(lowerCaseTerm) ||
            log.resource.toLowerCase().includes(lowerCaseTerm) ||
            log.performedBy.toLowerCase().includes(lowerCaseTerm) ||
            log.status.toLowerCase().includes(lowerCaseTerm)
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, []);

    const advancedFilteredLogs = useMemo(() => {
        let logsToFilter: LogEntry[] = allLogs;
        
        const { product, application, dateFrom, dateTo, performedBy, action, objectName, status } = advancedFilters;

        if (product) {
            const productSourceKey = Object.keys(logSources).find(key => logSources[key].name === product);
            logsToFilter = productSourceKey ? logSources[productSourceKey].logs : [];
        } else if (application) {
            const appSourceKey = Object.keys(logSources).find(key => logSources[key].name === application);
            logsToFilter = appSourceKey ? logSources[appSourceKey].logs : [];
        }

        const filtered = logsToFilter.filter(log => {
            const logDate = new Date(log.timestamp);
            if (dateFrom && logDate < new Date(dateFrom)) return false;
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (logDate > toDate) return false;
            }
            if (performedBy && log.performedBy.toLowerCase() !== performedBy.toLowerCase()) return false;
            if (action && log.action !== action) return false;
            if (objectName && !log.resource.toLowerCase().includes(objectName.toLowerCase())) return false;
            if (status && log.status !== status) return false;
            return true;
        });
        return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [allLogs, advancedFilters]);

    const tabItems = [
        { id: 'product', name: 'Product' },
        { id: 'applications', name: 'Applications' },
        { id: 'advanced', name: 'Advanced Search' },
    ];

    return (
        <>
            <Card title="Action Logs">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div role="tablist" className="inline-flex space-x-1 p-1 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg">
                        {tabItems.map(tab => (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#679a41] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                                    activeTab === tab.id
                                        ? 'bg-white dark:bg-slate-800 text-[#679a41] dark:text-emerald-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-100'
                                }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                    {activeTab !== 'advanced' && (
                        <div className="w-full md:w-auto md:max-w-xs">
                            <FormField 
                                id="log-search"
                                label=""
                                placeholder="Search current view..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="mt-4 space-y-8">
                    {activeTab === 'product' && productLogSources.map(source => (
                        <LogTable key={source.name} title={source.title} logs={filterBySearchTerm(source.logs, searchTerm)} />
                    ))}
                    
                    {activeTab === 'applications' && applicationLogSources.map(source => (
                        <LogTable key={source.name} title={source.title} logs={filterBySearchTerm(source.logs, searchTerm)} />
                    ))}
                    
                    {activeTab === 'advanced' && (
                        <div>
                             <LogTable title="Advanced Search Results" logs={advancedFilteredLogs} />
                        </div>
                    )}
                </div>
            </Card>
            <ActionLogsSearchPanel
                isOpen={isAdvancedSearchPanelOpen}
                onClose={() => handleTabClick('product')}
                onSearch={handleSearch}
                onClear={handleClear}
            />
        </>
    );
};