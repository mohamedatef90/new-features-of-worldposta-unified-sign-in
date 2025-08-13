import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, FormField, Icon, Pagination, Modal, Tooltip, ToggleSwitch } from '@/components/ui';
import type { Mailbox, MailboxPlan } from '@/types';
import { mockMailboxes, mockMailboxPlans, mockMailboxDomains } from '@/data';
import { v4 as uuidv4 } from 'uuid';

// --- MAILBOX VIEW ---

interface MailboxFilters {
    displayName: string;
    domain: string;
    plan: 'ALL' | MailboxPlan;
    dateFrom: string;
    dateTo: string;
}

const initialMailboxFilters: MailboxFilters = {
    displayName: '',
    domain: 'ALL',
    plan: 'ALL',
    dateFrom: '',
    dateTo: '',
};

const MailboxFormPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (mailboxData: Mailbox) => void;
    mailboxToEdit: Mailbox | null;
}> = ({ isOpen, onClose, onSave, mailboxToEdit }) => {
    const initialFormState = {
        firstName: '',
        initials: '',
        lastName: '',
        displayName: '',
        mailboxPlan: 'Posta Business' as MailboxPlan,
        emailUser: '',
        emailDomain: mockMailboxDomains[0],
        password: '',
        confirmPassword: '',
        mailboxType: 'User Mailbox',
        sendInstructions: false,
        additionalEmail: '',
        level: 'User' as 'User' | 'Admin',
        mfaEnabled: false,
    };
    const [form, setForm] = useState(initialFormState);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'settings', label: 'Settings' },
        { id: 'emailAddress', label: 'E-mail Address' },
        { id: 'mailFlow', label: 'Mail Flow Settings' },
        { id: 'permissions', label: 'Permissions' },
        { id: 'mobile', label: 'Mobile Devices' },
        { id: 'dlMemberships', label: 'DL Memberships' },
        { id: 'features', label: 'Features' },
    ];

    useEffect(() => {
        if (isOpen) {
            setActiveTab('general'); // Reset to first tab on open
            if (mailboxToEdit) {
                 const [emailUser, emailDomain] = mailboxToEdit.login.split('@');
                setForm({
                    firstName: '',
                    initials: '',
                    lastName: '',
                    displayName: mailboxToEdit.displayName,
                    mailboxPlan: mailboxToEdit.mailboxPlan,
                    emailUser: emailUser,
                    emailDomain: emailDomain,
                    password: '',
                    confirmPassword: '',
                    mailboxType: 'User Mailbox',
                    sendInstructions: false,
                    additionalEmail: '',
                    level: mailboxToEdit.level,
                    mfaEnabled: !!mailboxToEdit.mfaEnabled,
                });
            } else {
                setForm(initialFormState);
            }
            setErrors({});
        }
    }, [isOpen, mailboxToEdit]);

    useEffect(() => {
        if (mailboxToEdit) return; // Don't auto-fill if editing

        const { firstName, lastName } = form;
        if (firstName || lastName) {
            const newDisplayName = `${firstName} ${lastName}`.trim();
            const newEmailUser = `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9.-]/g, '');
            setForm(f => ({
                ...f,
                displayName: f.displayName ? f.displayName : newDisplayName,
                emailUser: f.emailUser ? f.emailUser : newEmailUser
            }));
        }
    }, [form.firstName, form.lastName, mailboxToEdit]);


    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
        let newPassword = '';
        for (let i = 0; i < 16; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setForm(f => ({ ...f, password: newPassword, confirmPassword: newPassword }));
        setErrors(e => ({...e, password: '', confirmPassword: ''}));
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.displayName) newErrors.displayName = "Display Name is required.";
        if (!form.emailUser) newErrors.emailUser = "Email address is required.";
        
        if (!mailboxToEdit) { // New mailbox requires a password
            if (form.password.length < 8) newErrors.password = "Complex password with minimum 8 characters required.";
        } else if (form.password && form.password.length < 8) { // If changing password, it must be valid
            newErrors.password = "Complex password with minimum 8 characters required.";
        }

        if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getQuotaForPlan = (plan: MailboxPlan): { usedGB: number, totalGB: number } => {
        switch (plan) {
            case 'Posta Light': return { usedGB: 0, totalGB: 10 };
            case 'Posta Business': return { usedGB: 0, totalGB: 100 };
            case 'Posta Pro': return { usedGB: 0, totalGB: 200 };
            case 'Posta Enterprise': return { usedGB: 0, totalGB: 1024 };
            default: return { usedGB: 0, totalGB: 100 };
        }
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const newOrUpdatedMailbox: Mailbox = {
            id: mailboxToEdit?.id || uuidv4(),
            displayName: form.displayName,
            login: `${form.emailUser}@${form.emailDomain}`,
            mailboxPlan: form.mailboxPlan,
            creationDate: mailboxToEdit?.creationDate || new Date().toISOString(),
            driveQuota: mailboxToEdit?.driveQuota || getQuotaForPlan(form.mailboxPlan),
            level: form.level,
            status: mailboxToEdit?.status || 'active',
            mfaEnabled: form.mfaEnabled,
        };

        if (form.password) {
            console.log(`Password for ${newOrUpdatedMailbox.login} was set/changed.`);
        }

        onSave(newOrUpdatedMailbox);
    };
    
    const mailboxTypeOptions = ['User Mailbox', 'Room Mailbox', 'Equipment Mailbox', 'Shared Mailbox'];

    const PlaceholderContent: React.FC<{ title: string }> = ({ title }) => (
        <div className="p-10 text-center text-gray-500 dark:text-gray-400">
            <Icon name="fas fa-tools" className="text-3xl mb-4" />
            <p className="font-semibold">{title} settings will be displayed here.</p>
            <p className="text-sm">This feature is currently under development.</p>
        </div>
    );
    
    const generalFormContent = (
        <div>
            {!mailboxToEdit && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField id="firstName" name="firstName" label="First Name" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} placeholder="Enter first name" wrapperClassName="!mb-0" />
                    <FormField id="initials" name="initials" label="Initials" value={form.initials} onChange={(e) => setForm({...form, initials: e.target.value})} placeholder="Enter initials" wrapperClassName="!mb-0" />
                    <FormField id="lastName" name="lastName" label="Last Name" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} placeholder="Enter last name" wrapperClassName="!mb-0" />
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField id="displayName" name="displayName" label="Display Name" value={form.displayName} onChange={(e) => setForm({...form, displayName: e.target.value})} required error={errors.displayName} wrapperClassName="!mb-0" />
                <FormField as="select" id="mailboxPlan" name="mailboxPlan" label="Mailbox Plan" value={form.mailboxPlan} onChange={(e) => setForm({...form, mailboxPlan: e.target.value as MailboxPlan})} wrapperClassName="!mb-0">
                    {mockMailboxPlans.map(plan => <option key={plan} value={plan}>{plan}</option>)}
                </FormField>
            </div>

            <div className="mb-4">
                <label htmlFor="emailUser" className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300">Email <span className="text-red-500 dark:text-red-400">*</span></label>
                <div className="flex items-center">
                    <input id="emailUser" name="emailUser" type="text" value={form.emailUser} onChange={(e) => setForm({...form, emailUser: e.target.value})} disabled={!!mailboxToEdit} className={`w-full px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 ${errors.emailUser ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`} />
                    <span className="inline-flex items-center px-3 border-t border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">@</span>
                    <select name="emailDomain" value={form.emailDomain} onChange={(e) => setForm({...form, emailDomain: e.target.value})} disabled={!!mailboxToEdit} className="px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white">
                        {mockMailboxDomains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                {errors.emailUser && <p className="mt-1 text-xs text-red-500">{errors.emailUser}</p>}
            </div>

            <FormField as="select" id="level" name="level" label="Level" value={form.level} onChange={(e) => setForm({...form, level: e.target.value as 'User' | 'Admin'})}>
                <option value="User">Normal</option>
                <option value="Admin">Admin</option>
            </FormField>
            
            <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField id="password" name="password" label={mailboxToEdit ? "New Password" : "Password"} type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required={!mailboxToEdit} showPasswordToggle error={errors.password} hint={mailboxToEdit ? "Leave blank to keep current password" : "Complex password with minimum 8 characters required"} wrapperClassName="!mb-0" />
                    <FormField id="confirmPassword" name="confirmPassword" label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} required={!mailboxToEdit || !!form.password} showPasswordToggle error={errors.confirmPassword} wrapperClassName="!mb-0" />
                </div>
                <div className="flex justify-end mt-2">
                    <Button type="button" variant="outline" size="sm" onClick={generatePassword}>Generate Password</Button>
                </div>
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-[#293c51] dark:text-gray-300">Choose Mailbox Type</label>
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                    <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
                        {mailboxTypeOptions.map(type => (
                            <label key={type} className="flex items-center cursor-pointer">
                                <input type="radio" name="mailboxType" value={type} checked={form.mailboxType === type} onChange={(e) => setForm({...form, mailboxType: e.target.value})} className="h-4 w-4 text-[#679a41] focus:ring-[#679a41] border-gray-300" />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type}</span>
                            </label>
                        ))}
                    </div>
                    <ToggleSwitch
                        id="mfaEnabled"
                        label="Enable Multi-Factor Authentication (MFA)"
                        checked={form.mfaEnabled}
                        onChange={(checked) => setForm(f => ({...f, mfaEnabled: checked}))}
                    />
                </div>
            </div>
            
            {!mailboxToEdit && (
                <FormField type="checkbox" id="sendInstructions" name="sendInstructions" label="Send Setup Instructions" checked={form.sendInstructions} onChange={(e) => setForm({...form, sendInstructions: (e.target as HTMLInputElement).checked})}/>
            )}
            {form.sendInstructions && !mailboxToEdit && <FormField id="additionalEmail" name="additionalEmail" label="Additional Setup Instructions Email" value={form.additionalEmail} onChange={(e) => setForm({...form, additionalEmail: e.target.value})} placeholder="another.email@example.com"/>}
        </div>
    );

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[59]" onClick={onClose} aria-hidden="true" />}
             <div
                className={`fixed top-0 right-0 h-full w-full max-w-4xl bg-[#f8f8f8] dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="mailbox-panel-title"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h2 id="mailbox-panel-title" className="text-lg font-semibold text-[#293c51] dark:text-gray-100">
                        {mailboxToEdit ? `Edit Mailbox: ${mailboxToEdit.displayName}` : 'Add New Mailbox'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close panel">
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-8">
                    {mailboxToEdit ? (
                        <>
                            <div className="border-b border-gray-200 dark:border-slate-700">
                                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                                                activeTab === tab.id
                                                    ? 'border-[#679a41] text-[#679a41] dark:border-emerald-400 dark:text-emerald-400'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="pt-6">
                                {activeTab === 'general' && generalFormContent}
                                {activeTab === 'settings' && <PlaceholderContent title="Settings"/>}
                                {activeTab === 'emailAddress' && <PlaceholderContent title="E-mail Address"/>}
                                {activeTab === 'mailFlow' && <PlaceholderContent title="Mail Flow Settings"/>}
                                {activeTab === 'permissions' && <PlaceholderContent title="Permissions"/>}
                                {activeTab === 'mobile' && <PlaceholderContent title="Mobile Devices"/>}
                                {activeTab === 'dlMemberships' && <PlaceholderContent title="DL Memberships"/>}
                                {activeTab === 'features' && <PlaceholderContent title="Features"/>}
                            </div>
                        </>
                    ) : (
                        generalFormContent
                    )}
                </div>
                 <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-x-2 flex justify-end">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </div>
            </div>
        </>
    );
};

const MailboxFilterPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: MailboxFilters) => void;
    onClear: () => void;
    currentFilters: MailboxFilters;
}> = ({ isOpen, onClose, onApply, onClear, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState<MailboxFilters>(currentFilters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);
    
    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
        onClear();
        onClose();
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[59]" onClick={onClose} aria-hidden="true" />}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#f8f8f8] dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="filter-panel-title"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h2 id="filter-panel-title" className="text-lg font-semibold text-[#293c51] dark:text-gray-100 flex items-center">
                        <Icon name="fas fa-filter" className="mr-2" />
                        Filter Mailboxes
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close filters">
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <FormField id="displayName" name="displayName" label="Display Name" value={localFilters.displayName} onChange={handleLocalChange} placeholder="Search by name..."/>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField as="select" id="domain" name="domain" label="Domain" value={localFilters.domain} onChange={handleLocalChange}>
                            <option value="ALL">All Domains</option>
                            {mockMailboxDomains.map(d => <option key={d} value={d}>{d}</option>)}
                        </FormField>
                        <FormField as="select" id="plan" name="plan" label="Mailbox Plan" value={localFilters.plan} onChange={handleLocalChange}>
                            <option value="ALL">All Plans</option>
                            {mockMailboxPlans.map(p => <option key={p} value={p}>{p}</option>)}
                        </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <FormField id="dateFrom" name="dateFrom" label="From" type="date" value={localFilters.dateFrom} onChange={handleLocalChange}/>
                         <FormField id="dateTo" name="dateTo" label="To" type="date" value={localFilters.dateTo} onChange={handleLocalChange}/>
                    </div>
                </div>

                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-x-2 flex justify-end">
                    <Button variant="outline" onClick={handleClear}>Clear Filters</Button>
                    <Button onClick={handleApply}>Apply Filters</Button>
                </div>
            </div>
        </>
    );
};

const MailboxesView: React.FC = () => {
    const [mailboxes, setMailboxes] = useState<Mailbox[]>(mockMailboxes);
    const [filters, setFilters] = useState<MailboxFilters>(initialMailboxFilters);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [editingCell, setEditingCell] = useState<{ mailboxId: string; column: 'plan' | 'level' } | null>(null);
    const [isFormPanelOpen, setIsFormPanelOpen] = useState(false);
    const [editingMailbox, setEditingMailbox] = useState<Mailbox | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [mailboxToDelete, setMailboxToDelete] = useState<Mailbox | null>(null);

    // State for selections and bulk actions
    const [selectedMailboxes, setSelectedMailboxes] = useState<string[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState<{ open: boolean; action: 'suspend' | 'activate' }>({ open: false, action: 'suspend' });
    const [isBulkPlanModalOpen, setIsBulkPlanModalOpen] = useState(false);
    const [newBulkPlan, setNewBulkPlan] = useState<MailboxPlan>('Posta Business');

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setMailboxes(mockMailboxes); 
            setIsRefreshing(false);
        }, 1000);
    };

    const handleExport = () => {
        const headers = ["Display Name", "Login", "Mailbox Plan", "Creation Date", "Quota Used (GB)", "Total Quota (GB)", "Level", "Status"];
        const rows = filteredMailboxes.map(mbx => [
            `"${mbx.displayName}"`, `"${mbx.login}"`, `"${mbx.mailboxPlan}"`, `"${new Date(mbx.creationDate).toISOString()}"`,
            mbx.driveQuota.usedGB, mbx.driveQuota.totalGB, `"${mbx.level}"`, `"${mbx.status}"`,
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "mailboxes_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleApplyFilters = (newFilters: MailboxFilters) => setFilters(newFilters);
    const clearFilters = () => setFilters(initialMailboxFilters);
    
    const activeFilterCount = useMemo(() => {
        return Object.keys(initialMailboxFilters).reduce((count, key) => {
            return filters[key as keyof MailboxFilters] !== initialMailboxFilters[key as keyof MailboxFilters] ? count + 1 : count;
        }, 0);
    }, [filters]);
    
    const handleMailboxUpdate = (mailboxId: string, field: 'mailboxPlan' | 'level', value: MailboxPlan | 'User' | 'Admin') => {
        setMailboxes(prev => prev.map(mbx => mbx.id === mailboxId ? { ...mbx, [field]: value } : mbx));
        setEditingCell(null);
    };
    
    const handleOpenFormPanel = (mailbox: Mailbox | null) => {
        setEditingMailbox(mailbox);
        setIsFormPanelOpen(true);
    };

    const handleSaveMailbox = (mailboxData: Mailbox) => {
        if (editingMailbox) {
            setMailboxes(prev => prev.map(m => m.id === mailboxData.id ? mailboxData : m));
        } else {
            setMailboxes(prev => [mailboxData, ...prev]);
        }
        setIsFormPanelOpen(false);
        setEditingMailbox(null);
    };

    const handleOpenDeleteModal = (mailbox: Mailbox) => {
        setMailboxToDelete(mailbox);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (mailboxToDelete) {
            setMailboxes(prev => prev.filter(m => m.id !== mailboxToDelete.id));
            setSelectedMailboxes(prev => prev.filter(id => id !== mailboxToDelete.id)); // Also remove from selection
            setIsDeleteModalOpen(false);
            setMailboxToDelete(null);
        }
    };

    const filteredMailboxes = useMemo(() => {
        return mailboxes.filter(mailbox => {
            const domain = mailbox.login.split('@')[1];
            if (filters.displayName && !mailbox.displayName.toLowerCase().includes(filters.displayName.toLowerCase())) return false;
            if (filters.domain !== 'ALL' && domain !== filters.domain) return false;
            if (filters.plan !== 'ALL' && mailbox.mailboxPlan !== filters.plan) return false;
            const creationDate = new Date(mailbox.creationDate);
            if (filters.dateFrom && creationDate < new Date(filters.dateFrom)) return false;
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (creationDate > toDate) return false;
            }
            return true;
        }).sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    }, [mailboxes, filters]);

    const paginatedMailboxes = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredMailboxes.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredMailboxes, currentPage, rowsPerPage]);
    
    useEffect(() => { setCurrentPage(1); }, [filters, rowsPerPage]);

    // --- Bulk Action Logic ---
    const handleSelectOne = (mailboxId: string, checked: boolean) => {
        setSelectedMailboxes(prev => checked ? [...prev, mailboxId] : prev.filter(id => id !== mailboxId));
    };

    const handleSelectAll = (checked: boolean) => {
        const pageIds = paginatedMailboxes.map(m => m.id);
        if (checked) {
            setSelectedMailboxes(prev => [...new Set([...prev, ...pageIds])]);
        } else {
            setSelectedMailboxes(prev => prev.filter(id => !pageIds.includes(id)));
        }
    };
    
    const areAllOnPageSelected = useMemo(() => {
        if (paginatedMailboxes.length === 0) return false;
        return paginatedMailboxes.every(m => selectedMailboxes.includes(m.id));
    }, [paginatedMailboxes, selectedMailboxes]);

    const handleConfirmBulkDelete = () => {
        setMailboxes(prev => prev.filter(m => !selectedMailboxes.includes(m.id)));
        setSelectedMailboxes([]);
        setIsBulkDeleteModalOpen(false);
    };
    
    const handleConfirmBulkStatusChange = () => {
        const action = isBulkStatusModalOpen.action;
        const newStatus: 'active' | 'suspended' = action === 'suspend' ? 'suspended' : 'active';
        setMailboxes(prev => prev.map(m => selectedMailboxes.includes(m.id) ? { ...m, status: newStatus } : m));
        setSelectedMailboxes([]);
        setIsBulkStatusModalOpen({ open: false, action: 'suspend' });
    };

    const handleConfirmBulkPlanChange = () => {
        setMailboxes(prev => prev.map(m => selectedMailboxes.includes(m.id) ? { ...m, mailboxPlan: newBulkPlan } : m));
        setSelectedMailboxes([]);
        setIsBulkPlanModalOpen(false);
    };

    const QuotaBar: React.FC<{ usedGB: number, totalGB: number }> = ({ usedGB, totalGB }) => {
        const percentage = totalGB > 0 ? (usedGB / totalGB) * 100 : 0;
        const barColor = percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-blue-500';
        return (
            <Tooltip text={`${percentage.toFixed(1)}% used`}>
                <div className="flex flex-col">
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 my-1">
                        <div className={`${barColor} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{usedGB.toFixed(1)} GB / {totalGB} GB</span>
                </div>
            </Tooltip>
        );
    };

    const DefaultToolbar = () => (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsFilterPanelOpen(true)} leftIconName="fas fa-filter" className="relative">
                Filters & Search
                {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 flex justify-center items-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-semibold">{activeFilterCount}</span>}
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                <Icon name={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`} className="mr-2" /> Refresh
            </Button>
            <Button variant="outline" onClick={handleExport} leftIconName="fas fa-file-export">Export all mailboxes</Button>
            <Button leftIconName="fas fa-plus-circle" onClick={() => handleOpenFormPanel(null)}>Add Mailbox</Button>
        </div>
    );

    const BulkActionsToolbar = () => (
        <div className="w-full flex justify-between items-center bg-blue-50 dark:bg-sky-900/30 p-2 rounded-lg">
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-blue-800 dark:text-sky-300">{selectedMailboxes.length} selected</span>
                <div className="h-6 w-px bg-blue-200 dark:bg-sky-700"></div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setIsBulkPlanModalOpen(true)} leftIconName="fas fa-edit">Change Plan</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsBulkStatusModalOpen({open: true, action: 'activate'})} leftIconName="fas fa-check-circle">Activate</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsBulkStatusModalOpen({open: true, action: 'suspend'})} leftIconName="fas fa-pause-circle">Suspend</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsBulkDeleteModalOpen(true)} leftIconName="fas fa-trash-alt" className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50">Delete</Button>
                </div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setSelectedMailboxes([])} title="Clear selection">
                <Icon name="fas fa-times" className="text-gray-500" />
            </Button>
        </div>
    );

    return (
        <>
        <Card title="Mailboxes" titleActions={selectedMailboxes.length > 0 ? <BulkActionsToolbar /> : <DefaultToolbar />}>
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-3 text-left w-4">
                                <input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} checked={areAllOnPageSelected} className="rounded" />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Display Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Login</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Mailbox Plan</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Creation Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-48">Drive Quota</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Level</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedMailboxes.map(mailbox => (
                            <tr key={mailbox.id} className={selectedMailboxes.includes(mailbox.id) ? 'bg-blue-50/50 dark:bg-sky-900/20' : ''}>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <input type="checkbox" onChange={(e) => handleSelectOne(mailbox.id, e.target.checked)} checked={selectedMailboxes.includes(mailbox.id)} className="rounded" />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-gray-200">{mailbox.displayName}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{mailbox.login}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <button onClick={() => setEditingCell({ mailboxId: mailbox.id, column: 'plan' })} className="group w-full flex items-center justify-between text-left p-1 rounded hover:bg-gray-100/50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-[#679a41]">
                                        <span className="text-[#679a41] dark:text-emerald-400 font-medium underline decoration-dashed underline-offset-2 group-hover:decoration-solid">{mailbox.mailboxPlan}</span>
                                        <Icon name="fas fa-pencil-alt" className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-2" />
                                    </button>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(mailbox.creationDate).toLocaleDateString()}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm"><QuotaBar usedGB={mailbox.driveQuota.usedGB} totalGB={mailbox.driveQuota.totalGB} /></td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <button onClick={() => setEditingCell({ mailboxId: mailbox.id, column: 'level' })} className="group w-full flex items-center justify-between text-left p-1 rounded hover:bg-gray-100/50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-[#679a41]">
                                        <span>{mailbox.level}</span>
                                        <Icon name="fas fa-pencil-alt" className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-2" />
                                    </button>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end items-center">
                                        <Tooltip text="Edit Mailbox">
                                            <Button size="icon" variant="ghost" onClick={() => handleOpenFormPanel(mailbox)}>
                                                <Icon name="fas fa-pencil-alt" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip text="Delete Mailbox">
                                            <Button size="icon" variant="ghost" onClick={() => handleOpenDeleteModal(mailbox)}>
                                                <Icon name="fas fa-trash-alt" className="text-red-500" />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination currentPage={currentPage} totalItems={filteredMailboxes.length} itemsPerPage={rowsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setRowsPerPage} />
            </div>
        </Card>
        
        {/* Bulk Action Modals */}
        <Modal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Delete Mailboxes" footer={<><Button variant="danger" onClick={handleConfirmBulkDelete}>Delete</Button><Button variant="ghost" onClick={() => setIsBulkDeleteModalOpen(false)}>Cancel</Button></>}>
            <p>Are you sure you want to delete {selectedMailboxes.length} selected mailbox(es)? This action cannot be undone.</p>
        </Modal>
        <Modal isOpen={isBulkStatusModalOpen.open} onClose={() => setIsBulkStatusModalOpen({ open: false, action: 'suspend' })} title={`${isBulkStatusModalOpen.action === 'suspend' ? 'Suspend' : 'Activate'} Mailboxes`}>
            <p>Are you sure you want to {isBulkStatusModalOpen.action} {selectedMailboxes.length} selected mailbox(es)?</p>
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={() => setIsBulkStatusModalOpen({ open: false, action: 'suspend' })}>Cancel</Button>
                <Button onClick={handleConfirmBulkStatusChange}>Confirm</Button>
            </div>
        </Modal>
        <Modal isOpen={isBulkPlanModalOpen} onClose={() => setIsBulkPlanModalOpen(false)} title="Change Mailbox Plan" footer={<><Button onClick={handleConfirmBulkPlanChange}>Apply</Button><Button variant="ghost" onClick={() => setIsBulkPlanModalOpen(false)}>Cancel</Button></>}>
            <FormField as="select" id="newBulkPlan" label={`Select new plan for ${selectedMailboxes.length} mailbox(es):`} value={newBulkPlan} onChange={(e) => setNewBulkPlan(e.target.value as MailboxPlan)}>
                {mockMailboxPlans.map(plan => <option key={plan} value={plan}>{plan}</option>)}
            </FormField>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Delete Mailbox"
            footer={
                <>
                    <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
                    <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                </>
            }
        >
            <p>Are you sure you want to permanently delete the mailbox for <strong>{mailboxToDelete?.displayName}</strong> ({mailboxToDelete?.login})? This action cannot be undone.</p>
        </Modal>

        <MailboxFilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApply={handleApplyFilters} onClear={clearFilters} currentFilters={filters} />
        <MailboxFormPanel isOpen={isFormPanelOpen} onClose={() => { setIsFormPanelOpen(false); setEditingMailbox(null); }} onSave={handleSaveMailbox} mailboxToEdit={editingMailbox} />
        </>
    );
};

export const MailboxesPage: React.FC = () => <MailboxesView />;