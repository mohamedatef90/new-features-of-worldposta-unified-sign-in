
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, FormField, Stepper, Icon, TreeView, Spinner, Modal } from '@/components/ui';
import type { TreeNode } from '@/components/ui';
import type { EmailMigrationProject, EmailProvider, MigrationItem, MigrationStatus, ConnectionDetails } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { mockEmailMigrationProjects } from '@/data';

const MIGRATION_COST_PER_MAILBOX = 1.00;

interface BulkMigrationUser {
  id: string;
  destination: string;
  source: string;
  status: 'Ready' | 'In Progress' | 'Completed' | 'Failed' | 'Queued' | 'Paused';
  note?: string;
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  removedItems: number;
}


const steps = [
  { name: 'Connect Accounts' },
  { name: 'Scope & Options' },
  { name: 'Migration Options' },
  { name: 'Start Migration' },
  { name: 'Migration Report' },
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
    { id: 'deleted', name: 'Deleted Items' },
];


const ProgressBar: React.FC<{ progress: number; status: BulkMigrationUser['status'] }> = ({ progress, status }) => {
    const barColor = status === 'Failed' ? 'bg-red-500' : status === 'Completed' ? 'bg-green-500' : 'bg-blue-500';
    return (
        <div className="flex items-center gap-2 w-32">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className={`${barColor} h-2 rounded-full`} style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-xs font-semibold w-8 text-right">{progress}%</span>
        </div>
    );
};

const getBulkStatusChipClass = (status: BulkMigrationUser['status']) => {
    switch(status) {
        case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'Paused':
        case 'Queued': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'Ready':
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const BulkMigrationReportTable: React.FC<{
    users: BulkMigrationUser[];
    onOpenNote: (title: string, content: string) => void;
    onClear: () => void;
}> = ({ users, onOpenNote, onClear }) => {
    // Mock handlers for actions
    const handleProcess = (userId: string) => alert(`Processing user ${userId}`);
    const handleAction = (userId: string, action: string) => alert(`${action} on user ${userId}`);
    const handleLogs = (userId: string) => alert(`Showing logs for user ${userId}`);
    const handleEdit = (userId: string) => alert(`Editing user ${userId}`);

    return (
        <Card title="Bulk Migration Report">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            {['Destination', 'Source', 'Status', 'Note', 'Progress', 'Total', 'Processed', 'Failed', 'Removed', 'Process', 'Action', 'Logs', 'Edit'].map(header => (
                                <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-3 py-2 whitespace-nowrap">{user.destination}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{user.source}</td>
                                <td className="px-3 py-2 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBulkStatusChipClass(user.status)}`}>{user.status}</span></td>
                                <td className="px-3 py-2">
                                    {user.note && <Button size="sm" variant="ghost" onClick={() => onOpenNote(`Note for ${user.source}`, user.note!)}>Read More</Button>}
                                </td>
                                <td className="px-3 py-2"><ProgressBar progress={user.progress} status={user.status} /></td>
                                <td className="px-3 py-2 text-center">{user.totalItems.toLocaleString()}</td>
                                <td className="px-3 py-2 text-center">{user.processedItems.toLocaleString()}</td>
                                <td className="px-3 py-2 text-center">{user.failedItems.toLocaleString()}</td>
                                <td className="px-3 py-2 text-center">{user.removedItems.toLocaleString()}</td>
                                <td className="px-3 py-2">
                                    <Button size="sm" variant="outline" onClick={() => handleProcess(user.id)}>Process</Button>
                                </td>
                                <td className="px-3 py-2">
                                    <Button size="sm" variant="outline" onClick={() => handleAction(user.id, 'Stop')}>Stop</Button>
                                </td>
                                <td className="px-3 py-2">
                                    <Button size="sm" variant="ghost" onClick={() => handleLogs(user.id)}>Logs</Button>
                                </td>
                                <td className="px-3 py-2">
                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(user.id)}><Icon name="fas fa-pencil-alt" /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={onClear}>Clear & Upload New File</Button>
            </div>
        </Card>
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
    const [bulkMigrationUsers, setBulkMigrationUsers] = useState<BulkMigrationUser[]>([]);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteModalContent, setNoteModalContent] = useState({ title: '', content: '' });
    
    // Step 4 state
    const [migrationLog, setMigrationLog] = useState<string[]>([]);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const migrationIntervalRef = useRef<number | null>(null);
    const csvUploadRef = useRef<HTMLInputElement>(null);
    
    // State for delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<EmailMigrationProject | null>(null);

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
        setMigrationLog([]);
        if (migrationIntervalRef.current) {
            clearInterval(migrationIntervalRef.current);
            migrationIntervalRef.current = null;
        }
    }, []);

    const handleGoToList = () => {
        resetWizard();
        setView('list');
    };

    const handleStartNewMigration = () => {
        const newProject: EmailMigrationProject = {
            id: uuidv4(),
            projectName: '',
            sourceProvider: 'google', 
            sourceConnection: { 
                useOAuth: false, 
                username: '',
                password: '',
                useSsl: true,
                port: 993,
                tokenJson: '',
            },
            destinationProvider: 'worldposta', 
            destinationConnection: { 
                useOAuth: false, 
                username: '',
                password: '',
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
            folderOptions: {
                selection: 'all',
                excludeInbox: false,
            },
            dateRange: {
                type: 'all',
                from: '',
                to: '',
            },
            maxErrors: '200',
            addHeader: false,
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
                setCurrentStep(4);
                break;
            case 'in_progress':
                setCurrentStep(3);
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

    
    const handleCancelMigration = () => {
        if (migrationIntervalRef.current) {
            clearInterval(migrationIntervalRef.current);
            migrationIntervalRef.current = null;
        }
        updateAndSaveActiveProject({ status: 'cancelled' });
        setIsCancelModalOpen(false);
        handleGoToList();
    };

    const handleRetryFailed = async () => {
        if (!activeProject?.report?.failedItems?.some(item => item.retryable)) {
            alert("No retryable items to process.");
            return;
        }
        setIsLoading(true);
        setMigrationLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Retrying failed items...`]);
        await new Promise(res => setTimeout(res, 2000));
        setIsLoading(false);
        
        updateAndSaveActiveProject({
            report: {
                ...activeProject.report!,
                failedItems: activeProject.report!.failedItems.filter(item => !item.retryable) // Remove retryable items
            }
        });
        setMigrationLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Retry complete.`]);
        alert("Retry process finished. Check the report for any remaining non-retryable items.");
    };


    const migrationCost = useMemo(() => {
        return (activeProject?.mailboxesToMigrate || 1) * MIGRATION_COST_PER_MAILBOX;
    }, [activeProject?.mailboxesToMigrate]);

    const handleNext = async () => {
        setErrorMessage('');
        const isNewProject = activeProject ? projects.find(p => p.id === activeProject.id)?.status === 'not_started' : false;

        if (currentStep === 0) { // Connect Accounts
             if (
                !activeProject?.projectName ||
                (activeProject.sourceProvider === 'google' && (!activeProject.sourceConnection?.tokenJson || !activeProject.sourceConnection?.username || !activeProject.sourceConnection?.password)) ||
                (activeProject.sourceProvider !== 'google' && !activeProject.sourceConnection?.username) ||
                (isNewProject && activeProject.sourceProvider !== 'google' && !activeProject.sourceConnection.password) ||
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
        }

        if (currentStep === 3) { // Start Migration
            if (activeProject?.status === 'completed') {
                setCurrentStep(4);
                return;
            }
            updateAndSaveActiveProject({ status: 'in_progress', progress: 0 });
            setMigrationLog([`[${new Date().toLocaleTimeString()}] Migration started...`]);

            migrationIntervalRef.current = window.setInterval(() => {
                updateAndSaveActiveProject((p: Partial<EmailMigrationProject>) => {
                    if (!p) {
                        if (migrationIntervalRef.current) clearInterval(migrationIntervalRef.current);
                        return {};
                    }
                    const newProgress = Math.min((p.progress || 0) + 10, 100);

                    setMigrationLog(prevLog => {
                        let newLogEntry = '';
                        switch (newProgress) {
                            case 10: newLogEntry = `[${new Date().toLocaleTimeString()}] Analyzing source mailbox structure...`; break;
                            case 20: newLogEntry = `[${new Date().toLocaleTimeString()}] Found 5,432 emails and 256 contacts to migrate.`; break;
                            case 30: newLogEntry = `[${new Date().toLocaleTimeString()}] Starting email migration batch 1 of 5...`; break;
                            case 40: newLogEntry = `[${new Date().toLocaleTimeString()}] Migrated 1,200/5,432 emails.`; break;
                            case 50: newLogEntry = `[${new Date().toLocaleTimeString()}] WARNING: Skipped oversized attachment 'Q4_Report.pptx' in 'Sent'.`; break;
                            case 60: newLogEntry = `[${new Date().toLocaleTimeString()}] Finished email migration. Starting contact migration...`; break;
                            case 70: newLogEntry = `[${new Date().toLocaleTimeString()}] Migrated 256/256 contacts.`; break;
                            case 80: newLogEntry = `[${new Date().toLocaleTimeString()}] Starting calendar event migration...`; break;
                            case 90: newLogEntry = `[${new Date().toLocaleTimeString()}] Migrated 1,024/1,024 calendar events.`; break;
                            case 100: newLogEntry = `[${new Date().toLocaleTimeString()}] Finalizing migration, checking data integrity...`; break;
                            default: break;
                        }
                        return newLogEntry ? [...prevLog, newLogEntry] : prevLog;
                    });
                    
                    if (newProgress === 100) {
                        if (migrationIntervalRef.current) clearInterval(migrationIntervalRef.current);
                        migrationIntervalRef.current = null;
                        const finalReport = {
                           transferredEmails: 5432,
                           transferredContacts: 256,
                           transferredCalendarEvents: 1024,
                           failedItems: [{ name: 'Q4_Report.pptx', type: 'Email' as const, reason: 'File size exceeds destination limit (50MB > 25MB).', retryable: true }]
                        };
                        return { progress: newProgress, status: 'completed', report: finalReport };
                    }
                    return { progress: newProgress };
                });
            }, 1000);
            return;
        }

        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setErrorMessage('');
        setCurrentStep(prev => Math.max(prev - 1, 0));
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

    }, [activeProject?.sourceProvider]);
    
    useEffect(() => {
        if (!activeProject?.destinationProvider) return;

        const provider = activeProject.destinationProvider;
        const newConnection: Partial<ConnectionDetails> = {};
        if (provider === 'worldposta') newConnection.server = 'imap.worldposta.com';
        else if (provider === 'google') newConnection.server = 'imap.gmail.com';
        
        updateAndSaveActiveProject({ destinationConnection: { ...activeProject.destinationConnection, ...newConnection }});

    }, [activeProject?.destinationProvider]);
    
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

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsLoading(true);
            // Simulate parsing and validation
            setTimeout(() => {
                const mockParsedData: BulkMigrationUser[] = [
                    { id: 'bulk-1', destination: 'user1@worldposta.com', source: 'user1@old.com', status: 'Ready', progress: 0, totalItems: 15234, processedItems: 0, failedItems: 0, removedItems: 0 },
                    { id: 'bulk-2', destination: 'user2@worldposta.com', source: 'user2@old.com', status: 'Completed', progress: 100, totalItems: 8765, processedItems: 8765, failedItems: 0, removedItems: 0 },
                    { id: 'bulk-3', destination: 'user3@worldposta.com', source: 'user3@old.com', status: 'Failed', note: 'Source authentication failed. Invalid credentials provided. Please check the password for the source account and try again.', progress: 15, totalItems: 12000, processedItems: 1800, failedItems: 10200, removedItems: 0 },
                    { id: 'bulk-4', destination: 'user4@worldposta.com', source: 'user4@old.com', status: 'In Progress', progress: 65, totalItems: 25000, processedItems: 16250, failedItems: 10, removedItems: 0 },
                    { id: 'bulk-5', destination: 'user5@worldposta.com', source: 'user5@old.com', status: 'Queued', progress: 0, totalItems: 9500, processedItems: 0, failedItems: 0, removedItems: 0 },
                ];
                setBulkMigrationUsers(mockParsedData);
                updateAndSaveActiveProject({ mailboxesToMigrate: mockParsedData.length });
                setIsLoading(false);
            }, 1500);
        }
    };


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
    
                    <Card title="Date Range">
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
                    </Card>
    
                    <Card title="">
                        <div className="flex items-center gap-8">
                            <FormField as="select" id="maxErrors" name="maxErrors" label="Max Errors" value={activeProject.maxErrors || '200'} onChange={e => updateAndSaveActiveProject({ maxErrors: e.target.value })}>
                                <option value="100">100 Errors</option>
                                <option value="200">200 Errors</option>
                                <option value="500">500 Errors</option>
                            </FormField>
                            <div className="mt-6">
                                <FormField type="checkbox" id="addHeader" name="addHeader" label="Add Header" checked={!!activeProject.addHeader} onChange={e => updateAndSaveActiveProject({ addHeader: (e.target as HTMLInputElement).checked })} />
                            </div>
                        </div>
                    </Card>
                </div>
            );
            case 1: return (
                <div className="space-y-6">
                    {bulkMigrationUsers.length > 0 ? (
                        <BulkMigrationReportTable 
                            users={bulkMigrationUsers} 
                            onOpenNote={(title, content) => {
                                setNoteModalContent({ title, content });
                                setIsNoteModalOpen(true);
                            }}
                            onClear={() => {
                                setBulkMigrationUsers([]);
                                if(csvUploadRef.current) csvUploadRef.current.value = "";
                                updateAndSaveActiveProject({ mailboxesToMigrate: 1 });
                            }}
                        />
                    ) : (
                        <>
                            <Card title="Bulk option">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    For migrating multiple mailboxes at once, please download our sample CSV file, fill in the user details, and upload it.
                                </p>
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" leftIconName="fas fa-download" onClick={handleDownloadSampleCsv}>
                                        Download Sample File
                                    </Button>
                                    <Button variant="secondary" leftIconName="fas fa-upload" onClick={() => csvUploadRef.current?.click()} isLoading={isLoading}>
                                        {isLoading ? 'Processing...' : 'Upload Bulk File'}
                                    </Button>
                                </div>
                                <input type="file" ref={csvUploadRef} className="hidden" accept=".csv" onChange={handleCsvUpload} />
                            </Card>

                            <div className="relative flex items-center">
                                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                                <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 font-semibold">OR</span>
                                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                            </div>

                            <Card title="Individual migration">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                        <Card><p className="font-bold text-lg">5,432</p><p className="text-sm text-gray-500">Emails</p></Card>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Select folders to migrate:</h4>
                                        <TreeView nodes={mockFolderStructure} checkedIds={checkedFolderIds} onCheckedChange={setCheckedFolderIds} />
                                        <p className="text-xs text-gray-500 mt-2">{checkedFolderIds.size} items selected for migration.</p>
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}
                </div>
            );
            case 2: return (
                <div className="space-y-6">
                    <FormField id="mailboxesToMigrate" name="mailboxesToMigrate" label="Number of Mailboxes to Migrate" type="number" min={1} value={activeProject.mailboxesToMigrate || 1} onChange={e => updateAndSaveActiveProject({mailboxesToMigrate: Number(e.target.value)})} />
                    <Card>
                        <h4 className="font-semibold mb-2">Migration Scope</h4>
                        <FormField as="select" id="migrationWindow" name="migrationWindow" label="Messages to migrate" value={activeProject.migrationWindow || 'all'} onChange={e => updateAndSaveActiveProject({migrationWindow: e.target.value as any})}>
                            <option value="all">All messages</option>
                            <option value="recent">Only messages from the last 90 days</option>
                            <option value="unread">Only unread messages</option>
                        </FormField>
                    </Card>
                    <Card>
                        <FormField type="checkbox" id="isIncrementalSyncEnabled" name="isIncrementalSyncEnabled" label="Enable incremental sync after initial migration" checked={!!activeProject.isIncrementalSyncEnabled} onChange={e => updateAndSaveActiveProject({ isIncrementalSyncEnabled: (e.target as HTMLInputElement).checked})} hint="Keeps your new mailbox synchronized with the old one for a period after the initial migration. This ensures no new emails are missed during your transition and allows for zero downtime." />
                    </Card>
                </div>
            );
             case 3: return (
                <div className="space-y-6">
                    <Card title="Migration Summary & Confirmation">
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between"><span>Source:</span> <span className="font-semibold">{activeProject.sourceConnection?.username}</span></li>
                            <li className="flex justify-between"><span>Destination:</span> <span className="font-semibold">{activeProject.destinationConnection?.username}</span></li>
                            <li className="flex justify-between"><span>Mailboxes:</span> <span className="font-semibold">{activeProject.mailboxesToMigrate}</span></li>
                        </ul>
                         <div className="mt-4 pt-4 border-t dark:border-gray-600 text-right">
                            <p className="text-gray-600 dark:text-gray-400">Estimated Cost:</p>
                            <p className="text-2xl font-bold text-[#679a41] dark:text-emerald-400">${migrationCost.toFixed(2)}</p>
                        </div>
                    </Card>
                    
                    {activeProject.status === 'in_progress' && (
                        <Card>
                            <h4 className="font-semibold mb-2">Migration in Progress...</h4>
                            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                                <div className="bg-green-500 h-4 rounded-full transition-all duration-500" style={{ width: `${activeProject.progress}%` }}></div>
                            </div>
                            <p className="text-center text-sm font-semibold mt-2">{activeProject.progress}% Complete</p>
                             <div className="mt-4 p-2 bg-gray-800 text-white font-mono text-xs rounded h-40 overflow-y-auto">
                                {migrationLog.map((log, i) => <p key={i}>{log}</p>)}
                            </div>
                        </Card>
                    )}
                </div>
            );
            case 4: 
                const report = activeProject.report || { transferredEmails: 0, transferredContacts: 0, transferredCalendarEvents: 0, failedItems: [] };

                const handleDownload = () => {
                    const headers = ["Item Name", "Type", "Reason for Failure"];
                    const rows = (report.failedItems || []).map(item => `"${item.name}","${item.type}","${item.reason}"`);
                    const csv = [headers.join(','), ...rows].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'migration_report.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
                return (
                    <Card title="Migration Complete">
                        <div className="text-center mb-6">
                            <Icon name="fas fa-check-circle" className="text-5xl text-green-500" />
                            <h3 className="text-xl font-bold mt-2">Migration Successful</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card className="text-center !p-4"><p className="text-2xl font-bold">{report.transferredEmails?.toLocaleString()}</p><p className="text-sm text-gray-500">Emails</p></Card>
                            <Card className="text-center !p-4"><p className="text-2xl font-bold">{report.transferredContacts?.toLocaleString()}</p><p className="text-sm text-gray-500">Contacts</p></Card>
                             <Card className="text-center !p-4"><p className="text-2xl font-bold">{report.transferredCalendarEvents?.toLocaleString()}</p><p className="text-sm text-gray-500">Calendar Events</p></Card>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Items Not Transferred ({report.failedItems?.length || 0})</h4>
                            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-slate-700">
                                        <tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reason</th></tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {(report.failedItems || []).map((item, i) => (
                                            <tr key={i}><td className="px-4 py-2 text-sm">{item.name} <span className="text-xs text-gray-400">({item.type})</span></td><td className="px-4 py-2 text-sm">{item.reason}</td></tr>
                                        ))}
                                        {(report.failedItems?.length || 0) === 0 && <tr><td colSpan={2} className="text-center p-4 text-sm text-gray-500">All items were transferred successfully.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between items-center">
                            <div>
                                <Button onClick={handleDownload} leftIconName="fas fa-download" variant='outline'>Download Report</Button>
                                {(report.failedItems?.length || 0) > 0 && 
                                    <Button onClick={handleRetryFailed} isLoading={isLoading} leftIconName="fas fa-sync-alt" variant="outline" className="ml-2">Retry Failed Items</Button>
                                }
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleStartNewMigration}>Start New Migration</Button>
                                <Button onClick={handleGoToList}>Finish & View All Projects</Button>
                            </div>
                        </div>
                    </Card>
                );
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

            <div className="max-w-5xl mx-auto">
                {errorMessage && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                        <Icon name="fas fa-exclamation-triangle" className="mr-2"/>
                        <span className="font-medium">Error:</span> {errorMessage}
                    </div>
                )}
                {renderStepContent()}
            </div>
            
            <div className="max-w-5xl mx-auto flex justify-between items-center mt-8 pt-4 border-t dark:border-slate-700">
                <div>
                     {currentStep > 0 && currentStep < 4 && activeProject?.status !== 'in_progress' && (
                        <Button variant="outline" onClick={handleBack} disabled={isLoading}>Back</Button>
                    )}
                </div>
                 <div className="flex items-center gap-2">
                    {currentStep < 3 && (
                        <Button onClick={handleNext} isLoading={isLoading} disabled={isLoading}>
                            {currentStep === 0 ? 'Connect & Analyze' : 'Next'}
                        </Button>
                    )}
                    {currentStep === 3 && activeProject?.status !== 'in_progress' && activeProject?.status !== 'completed' && (
                        <Button onClick={handleNext} leftIconName="fas fa-rocket">Start Migration</Button>
                    )}
                    {currentStep === 3 && activeProject?.status === 'in_progress' && (
                        <Button variant="danger" onClick={() => setIsCancelModalOpen(true)}>Cancel Migration</Button>
                    )}
                    {currentStep === 3 && activeProject?.status === 'completed' && (
                        <Button onClick={handleNext} leftIconName="far fa-file-alt">View Report</Button>
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
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title="Cancel Migration"
                footer={<><Button variant="danger" onClick={handleCancelMigration}>Confirm Cancel</Button><Button variant="ghost" onClick={() => setIsCancelModalOpen(false)}>Continue Migration</Button></>}
            >
                <p>Are you sure you want to cancel this migration? Any progress will be saved, but the migration will be stopped.</p>
            </Modal>
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
            <Modal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                title={noteModalContent.title}
                footer={<Button onClick={() => setIsNoteModalOpen(false)}>Close</Button>}
            >
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {noteModalContent.content}
                </p>
            </Modal>
        </div>
    );
};
