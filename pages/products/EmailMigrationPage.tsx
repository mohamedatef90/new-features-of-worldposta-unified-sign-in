
import React, { useState, useEffect, useMemo, useCallback, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, FormField, Stepper, Icon, TreeView, Spinner, Modal, CollapsibleSection } from '@/components/ui';
import type { TreeNode } from '@/components/ui';
import type { EmailMigrationProject, EmailProvider, MigrationItem, MigrationStatus, ConnectionDetails, EmailMigrationAccount, EmailMigrationAccountStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { mockEmailMigrationProjects, mockEmailMigrationAccounts } from '@/data';

const MIGRATION_COST_PER_MAILBOX = 1.00;

interface ParsedCsvUser {
    source: string;
    destination: string;
    status: 'Ready' | 'Error';
    error?: string;
}

const steps = [
  { name: 'Connect Accounts' },
  { name: 'Scope & Options' },
  { name: 'Summary and Payment' },
  { name: 'Start Migration' },
  { name: 'Completion & Report' },
];

const allProviderOptions: { value: string, label: string }[] = [
    { value: 'google', label: 'Google Workspace' },
    { value: 'worldposta', label: 'WorldPosta' },
    { value: 'onpremises', label: 'On-premises Exchange' },
    { value: 'yahoo', label: 'Yahoo Mail' },
    { value: 'zoho', label: 'Zoho Mail' },
    { value: 'imap', label: 'IMAP' },
    { value: 'other', label: 'Other' },
];

const sourceProviderOptions = allProviderOptions.filter(p => p.value !== 'worldposta');
const destinationProviderOptions = allProviderOptions.filter(p => p.value !== 'yahoo' && p.value !== 'zoho');


const mockFolderStructure: TreeNode[] = [
    { id: 'inbox', name: 'Inbox', children: [
        { id: 'inbox-work', name: 'Work' },
        { id: 'inbox-personal', name: 'Personal' }
    ]},
    { id: 'sent', name: 'Sent Items' },
    { id: 'drafts', name: 'Drafts' },
    { id: 'archive', name: 'Archive' },
];

const BulkUserPreviewTable: React.FC<{
    users: ParsedCsvUser[];
    onClear: () => void;
}> = ({ users, onClear }) => {
    const errorCount = users.filter(u => u.status === 'Error').length;
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{users.length} users found in file.</h4>
                {errorCount > 0 && <span className="text-red-500 text-sm font-semibold">{errorCount} error(s) detected.</span>}
            </div>
            <div className="overflow-auto border rounded-lg dark:border-gray-700 max-h-64">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source Email</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destination Email</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status / Error</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user, index) => (
                            <tr key={index} className={user.status === 'Error' ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                <td className="px-3 py-2 whitespace-nowrap">{user.source}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{user.destination}</td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    {user.status === 'Ready' ? (
                                        <span className="text-green-600 dark:text-green-400 font-semibold">Ready</span>
                                    ) : (
                                        <span className="text-red-600 dark:text-red-400 font-semibold">{user.error}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={onClear}>Clear & Upload New File</Button>
            </div>
        </div>
    );
};


export const EmailMigrationPage: React.FC = () => {
    const navigate = useNavigate();
    const [view, setView] = useState<'greeting' | 'list' | 'wizard'>('greeting');
    const [projects, setProjects] = useState<EmailMigrationProject[]>(mockEmailMigrationProjects);
    const [activeProject, setActiveProject] = useState<Partial<EmailMigrationProject> | null>(null);

    // States for the wizard
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    // Step 2 state
    const [checkedFolderIds, setCheckedFolderIds] = useState<Set<string>>(new Set(['inbox', 'inbox-work', 'inbox-personal', 'sent', 'drafts', 'archive']));
    const [parsedCsvUsers, setParsedCsvUsers] = useState<ParsedCsvUser[]>([]);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    
    const csvUploadRef = useRef<HTMLInputElement>(null);
    
    // State for modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<EmailMigrationProject | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isPaying, setIsPaying] = useState(false);


    // State for connection checks
    const [sourceConnectionStatus, setSourceConnectionStatus] = useState<'idle' | 'checking'>('idle');
    const [destConnectionStatus, setDestConnectionStatus] = useState<'idle' | 'checking'>('idle');
    const [connectionModal, setConnectionModal] = useState<{
        isOpen: boolean;
        type: 'Source' | 'Destination' | null;
        status: 'success' | 'failed' | null;
        message?: string;
    }>({ isOpen: false, type: null, status: null, message: '' });

    const resetWizard = useCallback(() => {
        setActiveProject(null);
        setCurrentStep(0);
        setIsLoading(false);
        setErrorMessage('');
    }, []);

    const handleGoToList = () => {
        resetWizard();
        setView('list');
    };

    const handleStartNewMigration = () => {
        const newProject: EmailMigrationProject = {
            id: uuidv4(),
            projectName: 'Marketing Team Migration (Google to WorldPosta)',
            sourceProvider: 'google',
            sourceConnection: {
                useOAuth: false,
                username: 'marketing.lead@oldcompany.com',
                password: 'dummy-source-password',
                useSsl: true,
                port: 993,
                tokenJson: '{"client_id":"your-client-id.apps.googleusercontent.com","client_secret":"your-client-secret","refresh_token":"your-refresh-token"}',
            },
            destinationProvider: 'worldposta',
            destinationConnection: {
                useOAuth: false,
                username: 'marketing.lead@worldposta-domain.com',
                password: 'dummy-destination-password',
                useSsl: true,
                server: 'imap.worldposta.com',
                port: 993,
            },
            itemsToMigrate: ['emails', 'contacts', 'calendar'],
            mailboxesToMigrate: 1,
            status: 'not_started',
            progress: 0,
            createdAt: new Date().toISOString(),
            isIncrementalSyncEnabled: true,
            migrationWindow: 'all',
            backupWithVeeam: false,
            migrationMode: 'single',
            folderOptions: {
                selection: 'all',
                excludeInbox: false,
                includeSpamTrash: false,
            },
            dateRange: {
                type: 'all',
                from: '',
                to: '',
            },
            maxErrors: '200',
            addHeader: false,
            labelsPolicy: 'keep-existing',
            maxMessageSizeMB: 50,
        };
        setActiveProject(newProject);
        setProjects(prev => [newProject, ...prev]);
        setCurrentStep(0);
        setView('wizard');
    };
    
    const handleResumeProject = (projectToResume: EmailMigrationProject) => {
        resetWizard();
        setActiveProject(projectToResume);
        
        switch(projectToResume.status) {
            case 'completed':
                setCurrentStep(4); // New Report step
                break;
            case 'in_progress':
                setCurrentStep(3); // Migration step
                break;
            case 'error':
            case 'cancelled':
            case 'not_started':
            case 'analyzing':
            case 'ready':
            default:
                setCurrentStep(0);
        }
        setView('wizard');
    };

    const handleOpenDeleteModal = (project: EmailMigrationProject) => {
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (projectToDelete) {
            setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
            setIsDeleteModalOpen(false);
            setProjectToDelete(null);
        }
    };
    
    const updateAndSaveActiveProject = useCallback((update: Partial<EmailMigrationProject> | ((p: Partial<EmailMigrationProject>) => Partial<EmailMigrationProject>)) => {
        setActiveProject(prevActiveProject => {
            if (!prevActiveProject) return null;

            const updateObject = typeof update === 'function' ? update(prevActiveProject) : update;
            const updatedProject = { ...prevActiveProject, ...updateObject } as EmailMigrationProject;
            
            setProjects(prevProjects => {
                const existingIndex = prevProjects.findIndex(proj => proj.id === updatedProject.id);
                if (existingIndex > -1) {
                    const newProjects = [...prevProjects];
                    newProjects[existingIndex] = updatedProject;
                    return newProjects;
                }
                return prevProjects; 
            });

            return updatedProject;
        });
    }, [setActiveProject, setProjects]);

    const migrationCost = useMemo(() => {
        return (activeProject?.mailboxesToMigrate || 1) * MIGRATION_COST_PER_MAILBOX;
    }, [activeProject?.mailboxesToMigrate]);

    const handleNext = async () => {
        setErrorMessage('');

        if (currentStep === 0) { // Connect Accounts
             if (
                !activeProject?.projectName ||
                (activeProject.sourceProvider === 'google' && (!activeProject.sourceConnection?.tokenJson || !activeProject.sourceConnection?.username || !activeProject.sourceConnection?.password)) ||
                (activeProject.sourceProvider !== 'google' && !activeProject.sourceConnection?.username) ||
                !activeProject.sourceConnection.password ||
                (activeProject.sourceProvider !== 'google' && activeProject.sourceProvider !== 'worldposta' && activeProject.sourceProvider !== 'onpremises' && !activeProject.sourceConnection.server) ||
                !activeProject.destinationConnection?.username || 
                !activeProject.destinationConnection?.password ||
                !activeProject.destinationConnection?.server
            ) {
                setErrorMessage('Please fill all required fields in the Source and Destination sections.');
                return;
            }
            setIsLoading(true);
            await new Promise(res => setTimeout(res, 1500)); // Simulate API call
            setIsLoading(false);
            updateAndSaveActiveProject({ status: 'analyzing' });
        } else if (currentStep === 1) { // Scope & Options
            updateAndSaveActiveProject({ status: 'ready' });
        }

        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setErrorMessage('');
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };
    
    const handleProceedToPayment = () => {
        setIsPaymentModalOpen(true);
    };

    const handlePaymentConfirm = async () => {
        setIsPaying(true);
        await new Promise(res => setTimeout(res, 2000)); // Simulate payment processing
        setIsPaying(false);
        setIsPaymentModalOpen(false);

        updateAndSaveActiveProject({ status: 'in_progress' });
        setCurrentStep(3); // Go to the new "Start Migration" step
    };

    const handleConnectionChange = useCallback((
        connectionType: 'sourceConnection' | 'destinationConnection',
        field: keyof ConnectionDetails,
        value: any
    ) => {
        updateAndSaveActiveProject(p => ({
            ...p,
            [connectionType]: {
                ...p?.[connectionType],
                [field]: value
            }
        }));
    }, [updateAndSaveActiveProject]);

    useEffect(() => {
        if (!activeProject?.sourceProvider) return;
        
        const provider = activeProject.sourceProvider;
        const newConnection: Partial<ConnectionDetails> = {};
        if (provider === 'zoho') newConnection.server = 'imap.zoho.com';
        else if (provider === 'yahoo') newConnection.server = 'imap.mail.yahoo.com';
        else if (provider === 'worldposta') newConnection.server = 'mail.worldposta.com';
        
        updateAndSaveActiveProject({ sourceConnection: { ...activeProject.sourceConnection, ...newConnection }});

    }, [activeProject?.sourceProvider, updateAndSaveActiveProject]);
    
    useEffect(() => {
        if (!activeProject?.destinationProvider) return;

        const provider = activeProject.destinationProvider;
        const newConnection: Partial<ConnectionDetails> = {};
        if (provider === 'worldposta') newConnection.server = 'imap.worldposta.com';
        else if (provider === 'google') newConnection.server = 'imap.gmail.com';
        
        updateAndSaveActiveProject({ destinationConnection: { ...activeProject.destinationConnection, ...newConnection }});

    }, [activeProject?.destinationProvider, updateAndSaveActiveProject]);
    
    const handleCheckSourceConnection = async () => {
        if (!activeProject) return;
        setSourceConnectionStatus('checking');
        setErrorMessage('');
        await new Promise(res => setTimeout(res, 1500));
        setSourceConnectionStatus('idle');
        if (activeProject.sourceProvider === 'yahoo') {
            setConnectionModal({ isOpen: true, type: 'Source', status: 'failed', message: 'Yahoo connection failed. Please check credentials and server settings.'});
        } else if (activeProject.sourceProvider === 'google' && (!activeProject.sourceConnection?.tokenJson || !activeProject.sourceConnection?.username || !activeProject.sourceConnection?.password)) {
             setConnectionModal({ isOpen: true, type: 'Source', status: 'failed', message: 'Please provide Username, Password, and Token JSON.'});
        }
        else {
            setConnectionModal({ isOpen: true, type: 'Source', status: 'success', message: 'Source connection successful.'});
        }
    };

    const handleCheckDestConnection = async () => {
        if (!activeProject) return;
        setDestConnectionStatus('checking');
        await new Promise(res => setTimeout(res, 1500));
        setDestConnectionStatus('idle');
        setConnectionModal({ isOpen: true, type: 'Destination', status: 'success', message: 'Destination connection successful.'});
    };

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsLoading(true);
            // Simulate parsing and validation
            setTimeout(() => {
                const mockParsedData: ParsedCsvUser[] = [
                    { source: 'user1@old.com', destination: 'user1@worldposta.com', status: 'Ready' },
                    { source: 'user2@old.com', destination: 'user2@worldposta.com', status: 'Ready' },
                    { source: 'user3@old.com', destination: 'user3@worldposta.com', status: 'Error', error: 'Duplicate destination email' },
                    { source: 'invalid-email', destination: 'user4@worldposta.com', status: 'Error', error: 'Invalid source email format' },
                    { source: 'user5@old.com', destination: 'user5@worldposta.com', status: 'Ready' },
                ];
                setParsedCsvUsers(mockParsedData);
                const validUsersCount = mockParsedData.filter(u => u.status === 'Ready').length;
                updateAndSaveActiveProject({ mailboxesToMigrate: validUsersCount });
                setIsLoading(false);
            }, 1500);
        }
    };
    
    const handleMigrationComplete = useCallback(() => {
        if (activeProject?.id) {
            updateAndSaveActiveProject({ status: 'completed' });
            setCurrentStep(4);
        }
    }, [activeProject, updateAndSaveActiveProject]);

    const getStatusChip = (status: MigrationStatus) => {
        switch(status) {
            case 'completed': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Completed</span>
            case 'in_progress': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">In Progress</span>
            case 'error': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Error</span>
            case 'cancelled': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Cancelled</span>
            default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Not Started</span>
        }
    };

    const renderStepContent = () => {
        if (!activeProject) return <Spinner />;
        
        const sourceUseSsl = activeProject.sourceConnection?.useSsl ?? true;
        const destUseSsl = activeProject.destinationConnection?.useSsl ?? true;
        
        const dateRangeType = activeProject.dateRange?.type || 'all';

        switch (currentStep) {
            case 0: return (
                <div className="space-y-6">
                    <FormField 
                        id="projectName" 
                        name="projectName" 
                        label="Project Name" 
                        value={activeProject.projectName || ''} 
                        onChange={e => updateAndSaveActiveProject({ projectName: e.target.value })} 
                        placeholder="e.g., Marketing Team Migration" 
                        required 
                    />
                    
                    <Card title="Source">
                        <FormField as="select" id="sourceProvider" name="sourceProvider" label="Source Provider" value={activeProject.sourceProvider || ''} onChange={(e) => { updateAndSaveActiveProject({ sourceProvider: e.target.value as EmailProvider, sourceConnection: {} }); setErrorMessage(''); }}>
                            {sourceProviderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </FormField>

                        {activeProject.sourceProvider === 'google' ? (
                            <>
                                <div className="flex items-center gap-2 mt-4">
                                    <FormField id="sourceUser" name="sourceUser" label="User Name" required value={activeProject.sourceConnection?.username || ''} onChange={e => handleConnectionChange('sourceConnection', 'username', e.target.value)} wrapperClassName="!mb-0 flex-grow" />
                                    <FormField id="sourcePass" name="sourcePass" label="Password" type="password" showPasswordToggle value={activeProject.sourceConnection?.password || ''} onChange={e => handleConnectionChange('sourceConnection', 'password', e.target.value)} wrapperClassName="!mb-0 flex-grow" />
                                    <Button variant="outline" className="mt-1 flex-shrink-0">Validate</Button>
                                </div>
                                <FormField as="textarea" rows={3} id="sourceToken" name="sourceToken" label="Token JSON" required value={activeProject.sourceConnection?.tokenJson || ''} onChange={e => handleConnectionChange('sourceConnection', 'tokenJson', e.target.value)} wrapperClassName="mt-4" />
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mt-4">
                                    <FormField id="sourceUser" name="sourceUser" label="User Name" required value={activeProject.sourceConnection?.username || ''} onChange={e => handleConnectionChange('sourceConnection', 'username', e.target.value)} wrapperClassName="!mb-0 flex-grow" />
                                    <FormField id="sourcePass" name="sourcePass" label="Password" type="password" showPasswordToggle value={activeProject.sourceConnection?.password || ''} onChange={e => handleConnectionChange('sourceConnection', 'password', e.target.value)} wrapperClassName="!mb-0 flex-grow" />
                                    <Button variant="outline" className="mt-1 flex-shrink-0">Validate</Button>
                                </div>
                                {activeProject.sourceProvider && !['google', 'worldposta', 'onpremises'].includes(activeProject.sourceProvider) && (
                                    <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr] gap-4 items-center mt-4">
                                        <FormField id="serverName" name="serverName" label="Server Name" required value={activeProject.sourceConnection?.server || ''} onChange={e => handleConnectionChange('sourceConnection', 'server', e.target.value)} />
                                        <FormField id="port" name="port" label="Port" type="number" required value={activeProject.sourceConnection?.port || 993} onChange={e => handleConnectionChange('sourceConnection', 'port', Number(e.target.value))} />
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300">Security <span className="text-red-500">*</span></label>
                                            <div className="flex items-center gap-4 pt-2">
                                                <label className="flex items-center gap-2 text-sm"><input type="radio" name="sourceSecurity" value="none" checked={!sourceUseSsl} onChange={() => handleConnectionChange('sourceConnection', 'useSsl', false)} /> None</label>
                                                <label className="flex items-center gap-2 text-sm"><input type="radio" name="sourceSecurity" value="ssl" checked={sourceUseSsl} onChange={() => handleConnectionChange('sourceConnection', 'useSsl', true)} /> SSL</label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="mt-4 flex justify-end items-center">
                            <Button variant="secondary" onClick={handleCheckSourceConnection} isLoading={sourceConnectionStatus === 'checking'}>Check Connection</Button>
                        </div>
                    </Card>
                    
                    <Card title="Destination">
                         <FormField as="select" id="destinationProvider" name="destinationProvider" label="Destination Provider" value={activeProject.destinationProvider || ''} onChange={(e) => updateAndSaveActiveProject({ destinationProvider: e.target.value as EmailProvider })}>
                            {destinationProviderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </FormField>
                        <div className="flex items-center gap-2 mt-4">
                            <FormField id="destEmail" name="destEmail" label="Email" required value={activeProject.destinationConnection?.username || ''} onChange={e => handleConnectionChange('destinationConnection', 'username', e.target.value)} wrapperClassName="!mb-0 flex-grow" />
                            <FormField id="destPass" name="destPass" label="Password" type="password" showPasswordToggle required value={activeProject.destinationConnection?.password || ''} onChange={e => handleConnectionChange('destinationConnection', 'password', e.target.value)} wrapperClassName="!mb-0 flex-grow" />
                             <Button variant="outline" className="mt-1 flex-shrink-0">Validate</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr] gap-4 items-center mt-4">
                            <FormField id="destServerName" name="destServerName" label="Server Name" required value={activeProject.destinationConnection?.server || ''} onChange={e => handleConnectionChange('destinationConnection', 'server', e.target.value)} />
                            <FormField id="destPort" name="destPort" label="Port" type="number" required value={activeProject.destinationConnection?.port || 993} onChange={e => handleConnectionChange('destinationConnection', 'port', Number(e.target.value))} />
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300">Security <span className="text-red-500">*</span></label>
                                <div className="flex items-center gap-4 pt-2">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="destSecurity" value="none" checked={!destUseSsl} onChange={() => handleConnectionChange('destinationConnection', 'useSsl', false)} /> None</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="destSecurity" value="ssl" checked={destUseSsl} onChange={() => handleConnectionChange('destinationConnection', 'useSsl', true)} /> SSL</label>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end items-center">
                            <Button variant="secondary" onClick={handleCheckDestConnection} isLoading={destConnectionStatus === 'checking'}>Check Connection</Button>
                        </div>
                    </Card>
                </div>
            );
            case 1: return (
                <div className="space-y-6">
                    <div role="tablist" className="inline-flex space-x-1 p-1 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg">
                        {(['single', 'bulk'] as const).map(mode => (
                            <button
                                key={mode}
                                role="tab"
                                aria-selected={activeProject.migrationMode === mode}
                                onClick={() => updateAndSaveActiveProject({ migrationMode: mode })}
                                className={`px-10 py-3 text-lg font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#679a41] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                                    activeProject.migrationMode === mode
                                        ? 'bg-white dark:bg-slate-800 text-[#679a41] dark:text-emerald-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-100'
                                }`}
                            >
                                {mode === 'single' ? 'Single Migration' : 'Bulk Migration'}
                            </button>
                        ))}
                    </div>

                    {activeProject.migrationMode === 'bulk' ? (
                        <Card title="Bulk Mailbox Migration">
                            {parsedCsvUsers.length > 0 ? (
                                <BulkUserPreviewTable users={parsedCsvUsers} onClear={() => { setParsedCsvUsers([]); if(csvUploadRef.current) csvUploadRef.current.value = ""; updateAndSaveActiveProject({ mailboxesToMigrate: 1 }); }} />
                            ) : (
                                <>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        For migrating multiple mailboxes at once, please download our sample CSV file, fill in the user details, and upload it.
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" leftIconName="fas fa-download" onClick={() => {
                                                const csvContent = "data:text/csv;charset=utf-8," 
                                                    + "source_email,source_password,destination_email,destination_password\n"
                                                    + "user1@oldprovider.com,pass123,user1@worldposta.com,newpass456\n"
                                                    + "user2@oldprovider.com,pass456,user2@worldposta.com,newpass789";
                                                
                                                const encodedUri = encodeURI(csvContent);
                                                const link = document.createElement("a");
                                                link.setAttribute("href", encodedUri);
                                                link.setAttribute("download", "migration_sample.csv");
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}>Download Sample File</Button>
                                        <Button variant="secondary" leftIconName="fas fa-upload" onClick={() => csvUploadRef.current?.click()} isLoading={isLoading}>
                                            {isLoading ? 'Processing...' : 'Upload Bulk File'}
                                        </Button>
                                    </div>
                                    <input type="file" ref={csvUploadRef} className="hidden" accept=".csv" onChange={handleCsvUpload} />
                                </>
                            )}
                        </Card>
                    ) : (
                        <Card title="Individual Migration">
                            <p className="text-sm text-gray-600 dark:text-gray-400">This migration will process a single mailbox from <strong>{activeProject.sourceConnection?.username || 'the source account'}</strong> to <strong>{activeProject.destinationConnection?.username || 'the destination account'}</strong>.</p>
                        </Card>
                    )}

                    <Card title="Select Items to Migrate">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Select folders to migrate:</h4>
                                <TreeView nodes={mockFolderStructure} checkedIds={checkedFolderIds} onCheckedChange={setCheckedFolderIds} className="max-h-60 overflow-y-auto" />
                                <p className="text-xs text-gray-500 mt-2">{checkedFolderIds.size} items selected for migration.</p>
                            </div>
                            <div>
                                 <FormField
                                    type="checkbox"
                                    id="includeSpamTrash"
                                    label="Include Spam/Trash Folders"
                                    checked={!!activeProject.folderOptions?.includeSpamTrash}
                                    onChange={e => updateAndSaveActiveProject(p => ({ ...p, folderOptions: { ...p.folderOptions, includeSpamTrash: (e.target as HTMLInputElement).checked } }))}
                                    hint="Migrating these folders may significantly increase migration time and cost."
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="!p-0">
                        <button
                            type="button"
                            className="flex justify-between items-center w-full p-4 text-left hover:bg-gray-50/50 dark:hover:bg-slate-700/50"
                            onClick={() => setIsAdvancedOpen(prev => !prev)}
                            aria-expanded={isAdvancedOpen}
                            aria-controls="advanced-migration-options"
                        >
                            <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">Advanced Options</h3>
                            <Icon name={isAdvancedOpen ? "fas fa-chevron-up" : "fas fa-chevron-down"} className="text-gray-500" />
                        </button>
                        {isAdvancedOpen && (
                            <div id="advanced-migration-options" className="p-6 border-t border-gray-200 dark:border-slate-700">
                               <div className="space-y-4">
                                    <FormField as="select" id="migrationWindow" name="migrationWindow" label="Messages to migrate" value={activeProject.migrationWindow || 'all'} onChange={e => updateAndSaveActiveProject({migrationWindow: e.target.value as any})}>
                                        <option value="all">All messages</option>
                                        <option value="recent">Only messages from the last 90 days</option>
                                        <option value="unread">Only unread messages</option>
                                    </FormField>
                                    <FormField type="checkbox" id="isIncrementalSyncEnabled" name="isIncrementalSyncEnabled" label="Enable incremental sync after initial migration" checked={!!activeProject.isIncrementalSyncEnabled} onChange={e => updateAndSaveActiveProject({ isIncrementalSyncEnabled: (e.target as HTMLInputElement).checked})} hint="Keeps your new mailbox synchronized with the old one for a period after the initial migration." />

                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                                        <FormField as="select" id="labelsPolicy" name="labelsPolicy" label="Labels Policy" value={activeProject.labelsPolicy || 'keep-existing'} onChange={e => updateAndSaveActiveProject({ labelsPolicy: e.target.value as any })}>
                                            <option value="keep-existing">Keep existing labels on destination</option>
                                            <option value="apply-new">Apply new labels from source</option>
                                            <option value="ignore">Ignore all labels</option>
                                        </FormField>
                                        <FormField id="maxMessageSizeMB" name="maxMessageSizeMB" label="Maximum Message Size (MB)" type="number" min={1} max={150} value={activeProject.maxMessageSizeMB || 50} onChange={e => updateAndSaveActiveProject({ maxMessageSizeMB: Number(e.target.value) })} hint="Messages larger than this size will be skipped." />
                                    </div>
                                     <div className="pt-4 border-t dark:border-gray-700">
                                        <label className="block text-sm font-medium text-[#293c51] dark:text-gray-300 mb-2">Date Range</label>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 text-sm"><input type="radio" name="dateRangeType" value="all" checked={dateRangeType === 'all'} onChange={() => updateAndSaveActiveProject(p => ({ ...p, dateRange: {...p.dateRange, type: 'all'} }))} /> All Mails</label>
                                            <label className="flex items-center gap-2 text-sm"><input type="radio" name="dateRangeType" value="specific" checked={dateRangeType === 'specific'} onChange={() => updateAndSaveActiveProject(p => ({ ...p, dateRange: {...p.dateRange, type: 'specific'} }))} /> Specific Range</label>
                                        </div>
                                        {dateRangeType === 'specific' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                <FormField id="dateFrom" name="dateFrom" label="From" type="date" value={activeProject.dateRange?.from || ''} onChange={e => updateAndSaveActiveProject(p => ({ ...p, dateRange: {...p.dateRange, from: e.target.value} }))} />
                                                <FormField id="dateTo" name="dateTo" label="To" type="date" value={activeProject.dateRange?.to || ''} onChange={e => updateAndSaveActiveProject(p => ({ ...p, dateRange: {...p.dateRange, to: e.target.value} }))} />
                                            </div>
                                        )}
                                     </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            );
            case 2: {
                const summaryData = activeProject.migrationMode === 'bulk' && parsedCsvUsers.length > 0 
                    ? parsedCsvUsers.filter(u => u.status === 'Ready').map(u => ({ mailbox: u.source, messages: 'N/A', size: 'N/A', warnings: 0 }))
                    : [{ mailbox: activeProject.sourceConnection?.username || 'N/A', messages: '~ 15,432', size: '~ 2.1 GB', warnings: 2 }];
                
                const warnings = [
                    'Destination mailbox quota might be exceeded by ~200MB.',
                    '2 messages larger than 25MB found and may be skipped.'
                ];
                
                return (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card title="Migration Summary">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-slate-700">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mailbox</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Messages (est.)</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size (est.)</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Warnings</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {summaryData.map(row => (
                                                <tr key={row.mailbox}>
                                                    <td className="px-4 py-3 font-medium">{row.mailbox}</td>
                                                    <td className="px-4 py-3">{row.messages}</td>
                                                    <td className="px-4 py-3">{row.size}</td>
                                                    <td className="px-4 py-3 text-center">{row.warnings > 0 ? <Icon name="fas fa-exclamation-triangle" className="text-yellow-500" /> : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                            <Card title="Order Summary">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Total Price</p>
                                        <p className="text-3xl font-bold text-[#679a41] dark:text-emerald-400">${migrationCost.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">Based on {activeProject.mailboxesToMigrate} mailbox(es)</p>
                                    </div>
                                    {warnings.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-2"><Icon name="fas fa-exclamation-triangle" /> Warnings</h4>
                                            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                                                {warnings.map((w,i) => <li key={i}>{w}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                );
            }
            case 3:
                return <StartMigrationDashboard project={activeProject} onMigrationComplete={handleMigrationComplete} />;
            case 4:
                return <CompletionReportStep project={activeProject} onBackToDashboard={handleGoToList} />;

            default: return null;
        }
    };

    const renderGreetingView = () => (
        <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Ready to Migrate Your Email?</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                Our secure and automated process makes it easy to transfer your data from other providers.
            </p>
            <p className="text-md text-gray-500 dark:text-gray-400 mt-4 max-w-3xl mx-auto">
                We prioritize the security of your data above all else. Our migration process utilizes end-to-end encryption for all data in transit and at rest. We employ secure authentication protocols and ensure that our infrastructure adheres to strict compliance standards, giving you peace of mind throughout the entire process.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-4">
                <Button onClick={handleStartNewMigration} size="lg">
                    Start New Migration
                </Button>
                {projects.length > 0 && (
                    <Button onClick={() => setView('list')} size="lg" variant="outline">
                        View Existing Projects
                    </Button>
                )}
            </div>
        </div>
    );
    
    const renderListView = () => (
        <Card title="Existing Migration Projects" titleActions={
             <div className="flex items-center gap-2">
                <Button onClick={() => setView('greeting')} variant="outline" leftIconName="fas fa-home">Back to Home</Button>
                <Button onClick={handleStartNewMigration} leftIconName="fas fa-plus-circle">
                    Start New Migration
                </Button>
            </div>
        }>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Migration Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Number of Mailboxes</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Creation Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Delete</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {projects.map(p => (
                            <tr key={p.id}>
                                <td className="px-4 py-3 font-medium">{p.projectName}</td>
                                <td className="px-4 py-3">{getStatusChip(p.status)}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{p.mailboxesToMigrate}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-left">
                                    {p.status === 'completed' && <Button size="sm" variant="outline" onClick={() => handleResumeProject(p)}>View Report</Button>}
                                    {p.status === 'in_progress' && <Button size="sm" onClick={() => handleResumeProject(p)}>View Progress</Button>}
                                    {(p.status !== 'completed' && p.status !== 'in_progress') && <Button size="sm" variant="outline" onClick={() => handleResumeProject(p)}>Resume</Button>}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Button size="icon" variant="ghost" onClick={() => handleOpenDeleteModal(p)} title="Delete Project"><Icon name="fas fa-trash-alt" className="text-red-500"/></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );

    const renderWizardView = () => (
        <>
            <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">
                    {activeProject?.projectName || 'New Migration Project'}
                </h1>
                <Button variant="outline" onClick={handleGoToList}>Back to Projects List</Button>
            </div>
            
            <div className="w-full md:w-3/4 lg:w-2/3 mx-auto">
                <Stepper steps={steps} currentStep={currentStep} className="my-8" />
            </div>

            <div className="max-w-7xl mx-auto">
                {errorMessage && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                        <Icon name="fas fa-exclamation-triangle" className="mr-2"/>
                        <span className="font-medium">Error:</span> {errorMessage}
                    </div>
                )}
                {renderStepContent()}
            </div>
            
            <div className="max-w-7xl mx-auto flex justify-between items-center mt-8 pt-4 border-t dark:border-slate-700">
                <div>
                     {currentStep > 0 && currentStep < 3 && (
                        <Button variant="outline" onClick={handleBack} disabled={isLoading}>Back</Button>
                    )}
                </div>
                 <div className="flex items-center gap-2">
                    {currentStep < 2 && (
                        <Button onClick={handleNext} isLoading={isLoading} disabled={isLoading}>
                            {currentStep === 0 ? 'Connect & Analyze' : 'Next'}
                        </Button>
                    )}
                    {currentStep === 2 && (
                        <Button onClick={handleProceedToPayment} leftIconName="fas fa-credit-card">Proceed to Payment</Button>
                    )}
                </div>
            </div>
        </>
    );
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Email Migration</h1>
            {
                {
                    greeting: renderGreetingView(),
                    list: renderListView(),
                    wizard: renderWizardView(),
                }[view]
            }
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={`Delete Project: ${projectToDelete?.projectName}`}
                footer={
                    <>
                        <Button variant="danger" onClick={handleConfirmDelete}>Confirm Delete</Button>
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                    </>
                }
            >
                <p>Are you sure you want to permanently delete the migration project "<strong>{projectToDelete?.projectName}</strong>"? This action cannot be undone.</p>
            </Modal>
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Confirm Payment"
                size="md"
                footer={
                    <>
                        <Button onClick={handlePaymentConfirm} isLoading={isPaying}>Pay Now</Button>
                        <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)} disabled={isPaying}>Cancel</Button>
                    </>
                }
            >
                <p className="text-lg">You are about to be charged <strong className="text-[#679a41] dark:text-emerald-400">${migrationCost.toFixed(2)}</strong> for this migration.</p>
            </Modal>
            <Modal
                isOpen={connectionModal.isOpen}
                onClose={() => setConnectionModal({ isOpen: false, type: null, status: null })}
                title={`${connectionModal.type || ''} Connection Status`}
                size="md"
                footer={<Button onClick={() => setConnectionModal({ isOpen: false, type: null, status: null })}>Close</Button>}
            >
                <div className="text-center py-4">
                    {connectionModal.status === 'success' && (
                        <>
                            <Icon name="fas fa-check-circle" className="text-5xl text-green-500 mb-4" />
                            <p className="text-lg font-semibold">{connectionModal.message}</p>
                        </>
                    )}
                    {connectionModal.status === 'failed' && (
                        <>
                            <Icon name="fas fa-times-circle" className="text-5xl text-red-500 mb-4" />
                            <p className="text-lg font-semibold">{connectionModal.message}</p>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

// --- START MIGRATION DASHBOARD COMPONENT ---
interface MigrationLog {
    timestamp: string;
    message: string;
    level: 'INFO' | 'WARN' | 'ERROR';
}

const generateMockLogs = (account: EmailMigrationAccount): MigrationLog[] => {
    const logs: MigrationLog[] = [
        { timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'INFO', message: 'Migration process initiated.' },
        { timestamp: new Date(Date.now() - 3500000).toISOString(), level: 'INFO', message: 'Connecting to source server...' },
    ];
    if (account.status === 'Cancelled') {
        logs.push({ timestamp: new Date().toISOString(), level: 'WARN', message: 'Migration was cancelled by the user.' });
    }
    if (account.status === 'In Progress') {
        logs.push({ timestamp: new Date().toISOString(), level: 'INFO', message: `Processing mailbox folder 'Inbox'. Found ${Math.floor(account.total * 0.3)} items.` });
    }
    if (account.status === 'Completed') {
        logs.push({ timestamp: new Date(Date.now() - 1000000).toISOString(), level: 'INFO', message: 'All items processed.' });
        logs.push({ timestamp: new Date().toISOString(), level: 'INFO', message: 'Migration completed successfully.' });
    }
    return logs;
};

const StartMigrationDashboard: React.FC<{ 
    project: Partial<EmailMigrationProject>;
    onMigrationComplete: () => void; 
}> = ({ project, onMigrationComplete }) => {
    const [accounts, setAccounts] = useState<EmailMigrationAccount[]>(mockEmailMigrationAccounts);
    const [statusFilter, setStatusFilter] = useState('All Accounts');
    const [emailFilter, setEmailFilter] = useState('');
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: keyof EmailMigrationAccount, direction: 'asc' | 'desc' } | null>({ key: 'destination', direction: 'asc' });
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [selectedAccountForLogs, setSelectedAccountForLogs] = useState<EmailMigrationAccount | null>(null);
    const [isMigrationFinished, setIsMigrationFinished] = useState(false);

    const uploadRef = useRef<HTMLInputElement>(null);
    const progressIntervals = useRef<{ [key: string]: number }>({});
    
    useEffect(() => {
        const allDone = accounts.every(acc => ['Completed', 'Failed', 'Cancelled'].includes(acc.status));
        if (allDone && accounts.length > 0) {
            setIsMigrationFinished(true);
        } else {
            setIsMigrationFinished(false);
        }
    }, [accounts]);


    useEffect(() => {
        return () => {
            Object.values(progressIntervals.current).forEach(clearInterval);
        };
    }, []);
    
    const handleStartMigration = useCallback((accountId: string) => {
        if (progressIntervals.current[accountId]) {
            clearInterval(progressIntervals.current[accountId]);
        }
        setAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, status: 'In Progress', progress: 0, processed: 0, failed: 0, removed: 0 } : acc));
        const intervalId = setInterval(() => {
            setAccounts(prev => {
                const accToUpdate = prev.find(a => a.id === accountId);
                if (!accToUpdate || accToUpdate.status !== 'In Progress') {
                    clearInterval(intervalId);
                    delete progressIntervals.current[accountId];
                    return prev;
                }
                const newProcessed = Math.min(accToUpdate.processed + Math.floor(Math.random() * (accToUpdate.total * 0.05)), accToUpdate.total);
                if (newProcessed >= accToUpdate.total) {
                    clearInterval(intervalId);
                    delete progressIntervals.current[accountId];
                    return prev.map(a => a.id === accountId ? { ...a, processed: a.total, progress: 100, status: 'Completed' } : a);
                }
                return prev.map(a => a.id === accountId ? { ...a, processed: newProcessed, progress: Math.round((newProcessed / a.total) * 100) } : a);
            });
        }, 1000);
        progressIntervals.current[accountId] = intervalId as unknown as number;
    }, []);

    const handleDeleteAccount = (accountId: string) => {
        if (window.confirm("Are you sure you want to delete this migration account? This cannot be undone.")) {
            setAccounts(prev => prev.filter(a => a.id !== accountId));
            setSelectedAccountIds(prev => prev.filter(id => id !== accountId));
        }
    };
    
    const handleOpenLogsModal = (account: EmailMigrationAccount) => {
        setSelectedAccountForLogs(account);
        setIsLogsModalOpen(true);
    };

    const handleDownloadSampleCsv = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "source_email,source_password,destination_email,destination_password\n"
            + "user1@oldprovider.com,pass123,user1@worldposta.com,newpass456\n"
            + "user2@oldprovider.com,pass456,user2@worldposta.com,newpass789";
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "migration_sample.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportExcel = () => {
        const headers = ["Destination", "Source", "Status", "Note", "Progress", "Total", "Processed", "Failed", "Removed"];
        const rows = sortedAccounts.map(acc => [
            `"${acc.destination}"`, `"${acc.source}"`, acc.status, `"${acc.note.replace(/"/g, '""')}"`,
            acc.progress, acc.total, acc.processed, acc.failed, acc.removed
        ].join(','));
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", `${project.projectName || 'migration'}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredAccounts = useMemo(() => {
        return accounts.filter(acc => {
            const statusMatch = statusFilter === 'All Accounts' || acc.status === statusFilter;
            const emailMatch = !emailFilter || acc.source.toLowerCase().includes(emailFilter.toLowerCase()) || acc.destination.toLowerCase().includes(emailFilter.toLowerCase());
            return statusMatch && emailMatch;
        });
    }, [accounts, statusFilter, emailFilter]);

    const sortedAccounts = useMemo(() => {
        let sortableItems = [...filteredAccounts];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredAccounts, sortConfig]);

    const requestSort = (key: keyof EmailMigrationAccount) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
            setSelectedAccountIds(accounts.map(acc => acc.id));
        } else {
            setSelectedAccountIds([]);
        }
    };
    
    const handleSelectOne = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, id: string) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
            setSelectedAccountIds(prev => [...prev, id]);
        } else {
            setSelectedAccountIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    const isAllSelected = selectedAccountIds.length === accounts.length && accounts.length > 0;
    
    const getSortIcon = (key: keyof EmailMigrationAccount) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <Icon name="fas fa-sort" className="ml-1 opacity-30" />;
        }
        return sortConfig.direction === 'asc' ? <Icon name="fas fa-sort-up" className="ml-1" /> : <Icon name="fas fa-sort-down" className="ml-1" />;
    };
    
    const getStatusChip = (status: EmailMigrationAccountStatus) => {
        const baseClasses = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
        switch (status) {
            case 'New': return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
            case 'In Progress': return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
            case 'Completed': return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
            case 'Cancelled': return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
            case 'Failed': return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
            default: return `${baseClasses} bg-gray-200 text-gray-800`;
        }
    };
    
    const headers: { key: keyof EmailMigrationAccount, label: string, className?: string }[] = [
        { key: 'destination', label: 'Destination' },
        { key: 'source', label: 'Source' },
        { key: 'status', label: 'Status' },
        { key: 'note', label: 'Note', className: "w-1/4" },
        { key: 'progress', label: 'Progress' },
        { key: 'total', label: 'Total' },
        { key: 'processed', label: 'Processed' },
        { key: 'failed', label: 'Failed' },
        { key: 'removed', label: 'Removed' },
    ];
    
    const logLevels: { [key in MigrationLog['level']]: { icon: string, color: string } } = {
        INFO: { icon: 'fas fa-info-circle', color: 'text-blue-500' },
        WARN: { icon: 'fas fa-exclamation-triangle', color: 'text-yellow-500' },
        ERROR: { icon: 'fas fa-times-circle', color: 'text-red-500' },
    };

    return (
        <Card className="w-full max-w-full">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{project.projectName || 'Test3008'} Accounts</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField as="select" id="status-filter" label="Status:" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option>All Accounts</option>
                        <option>New</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                        <option>Failed</option>
                    </FormField>
                    <FormField id="email-filter" label="Email:" value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} placeholder="Filter by email" />
                </div>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" leftIconName="fas fa-upload" onClick={() => uploadRef.current?.click()}>Upload Bulk Accounts</Button>
                        <input type="file" ref={uploadRef} className="hidden" accept=".csv" />
                        <Button variant="outline" size="sm" leftIconName="fas fa-download" onClick={handleDownloadSampleCsv}>Download Sample</Button>
                        <Button variant="outline" size="sm" leftIconName="fas fa-file-excel" onClick={handleExportExcel}>Export As Excel</Button>
                    </div>
                    <Button size="sm" disabled={selectedAccountIds.length === 0} leftIconName="fas fa-play" onClick={() => selectedAccountIds.forEach(handleStartMigration)} className="px-8">Start</Button>
                </div>
            </div>
            
            <div className="overflow-x-auto border-t rounded-b-lg dark:border-slate-700">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-2"><FormField type="checkbox" id="select-all" label="" checked={isAllSelected} onChange={(e) => handleSelectAll(e)} wrapperClassName="!mb-0" /></th>
                            {headers.map(h => (
                                <th key={h.key} className={`px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 ${h.className || ''}`}>
                                    <button onClick={() => requestSort(h.key)} className="flex items-center">{h.label} {getSortIcon(h.key)}</button>
                                </th>
                            ))}
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Process</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Action</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Logs</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Edit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedAccounts.map(acc => (
                            <tr key={acc.id}>
                                <td className="px-4 py-2"><FormField type="checkbox" id={`select-${acc.id}`} label="" checked={selectedAccountIds.includes(acc.id)} onChange={(e) => handleSelectOne(e, acc.id)} wrapperClassName="!mb-0" /></td>
                                <td className="px-4 py-2">{acc.destination}</td>
                                <td className="px-4 py-2">{acc.source}</td>
                                <td className="px-4 py-2"><span className={getStatusChip(acc.status)}>{acc.status}</span></td>
                                <td className="px-4 py-2">{acc.note} {acc.note && <button className="text-green-600 dark:text-green-400">Read more</button>}</td>
                                <td className="px-4 py-2">{acc.progress > 0 ? `${acc.progress}%` : <span className="border-b-2 border-green-500">0</span>}</td>
                                <td className="px-4 py-2">{acc.total}</td>
                                <td className="px-4 py-2">{acc.processed}</td>
                                <td className="px-4 py-2">{acc.failed}</td>
                                <td className="px-4 py-2">{acc.removed}</td>
                                <td className="px-4 py-2">
                                    {acc.status === 'In Progress' ? (
                                        <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <Icon name="fas fa-spinner fa-spin" className="mr-2" />
                                            Processing...
                                        </span>
                                    ) : (
                                        <button onClick={() => handleStartMigration(acc.id)} className="text-green-600 dark:text-green-400 font-semibold hover:underline">
                                            {acc.status === 'New' ? 'Start' : 'Re-Start'}
                                        </button>
                                    )}
                                </td>
                                <td className="px-4 py-2"><button onClick={() => handleDeleteAccount(acc.id)}><Icon name="fas fa-trash-alt" className="text-red-500 hover:text-red-700"/></button></td>
                                <td className="px-4 py-2"><button onClick={() => handleOpenLogsModal(acc)} className="text-green-600 dark:text-green-400 font-semibold hover:underline">Logs</button></td>
                                <td className="px-4 py-2"><button><Icon name="fas fa-pencil-alt" /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isMigrationFinished && (
                <div className="p-6 flex justify-end">
                    <Button onClick={onMigrationComplete} size="lg">
                        Finish
                        <Icon name="fas fa-arrow-right" className="ml-2" />
                    </Button>
                </div>
            )}

            <Modal isOpen={isLogsModalOpen} onClose={() => setIsLogsModalOpen(false)} title={`Logs for ${selectedAccountForLogs?.destination}`} size="2xl">
                {selectedAccountForLogs && (
                    <div className="max-h-96 overflow-y-auto">
                        <table className="min-w-full text-sm">
                             <thead className="bg-gray-100 dark:bg-slate-700 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Timestamp</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Level</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Message</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {generateMockLogs(selectedAccountForLogs).map(log => (
                                    <tr key={log.timestamp}>
                                        <td className="px-4 py-2 whitespace-nowrap text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <Icon name={logLevels[log.level].icon} className={logLevels[log.level].color} />
                                            <span className="ml-2 font-semibold">{log.level}</span>
                                        </td>
                                        <td className="px-4 py-2">{log.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

const CompletionReportStep: React.FC<{ 
    project: Partial<EmailMigrationProject>; 
    onBackToDashboard: () => void;
}> = ({ project, onBackToDashboard }) => {
    // Mock data for the report
    const report = {
        moved: project.report?.transferredEmails || 12345,
        skipped: project.report?.failedItems.filter(i => i.retryable).length || 123,
        failed: project.report?.failedItems.filter(i => !i.retryable).length || 12
    };

    const handleDownload = (format: 'csv' | 'json') => {
        alert(`Downloading report in ${format.toUpperCase()} format...`);
    };

    return (
        <Card className="text-center py-10">
            <Icon name="fas fa-check-circle" className="text-6xl text-green-500 mb-6" />
            <h2 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Migration Completed</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
                The migration for project "<strong>{project.projectName}</strong>" has finished.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 max-w-3xl mx-auto">
                <Card className="bg-green-50 dark:bg-green-900/40">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{report.moved.toLocaleString()}</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Messages Moved</p>
                </Card>
                <Card className="bg-yellow-50 dark:bg-yellow-900/40">
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{report.skipped.toLocaleString()}</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Messages Skipped</p>
                </Card>
                <Card className="bg-red-50 dark:bg-red-900/40">
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{report.failed.toLocaleString()}</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Messages Failed</p>
                </Card>
            </div>

            <div className="flex justify-center gap-4 mt-8">
                <Button variant="outline" onClick={() => handleDownload('csv')} leftIconName="fas fa-file-csv">
                    Download Report (CSV)
                </Button>
                <Button variant="outline" onClick={() => handleDownload('json')} leftIconName="fas fa-file-code">
                    Download Report (JSON)
                </Button>
            </div>
            <div className="mt-6">
                <Button onClick={onBackToDashboard}>
                    Back to Dashboard
                </Button>
            </div>
        </Card>
    );
};
