
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, FormField, Stepper, Icon, TreeView, Spinner, Modal } from '@/components/ui';
import type { TreeNode } from '@/components/ui';
import type { EmailMigrationProject, EmailProvider, MigrationItem, MigrationStatus, ConnectionDetails } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { mockEmailMigrationProjects } from '@/data';

const MIGRATION_COST_PER_MAILBOX = 1.00;

const steps = [
  { name: 'Connect Accounts' },
  { name: 'Select Content' },
  { name: 'Migration Options' },
  { name: 'Start Migration' },
  { name: 'Migration Report' },
];

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

const ConnectionForm: React.FC<{
  title: string;
  provider: EmailProvider;
  connectionDetails: Partial<ConnectionDetails>;
  onProviderChange: (provider: EmailProvider) => void;
  onDetailsChange: (field: keyof ConnectionDetails, value: any) => void;
}> = ({ title, provider, connectionDetails, onProviderChange, onDetailsChange }) => {
    
    const isOAuthProvider = provider === 'google' || provider === 'microsoft';

    return (
        <Card title={title}>
            <FormField as="select" id={`${title}-provider`} name="provider" label="Email Provider" value={provider} onChange={e => onProviderChange(e.target.value as EmailProvider)}>
                <option value="google">Google Workspace</option>
                <option value="microsoft">Microsoft 365</option>
                <option value="zoho">Zoho Mail</option>
                <option value="other_imap">Other (IMAP/SMTP)</option>
            </FormField>
            
            {isOAuthProvider ? (
                <>
                    <FormField id={`${title}-username`} name="username" label="Username" value={connectionDetails.username || ''} onChange={e => onDetailsChange('username', e.target.value)} placeholder={`user@${provider}.com`} required/>
                    <Button variant="outline" leftIconName={provider === 'google' ? 'fab fa-google' : 'fab fa-windows'} className="w-full mt-2">
                        Authenticate with {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </Button>
                </>
            ) : (
                <>
                    <FormField id={`${title}-username`} name="username" label="IMAP Username" value={connectionDetails.username || ''} onChange={e => onDetailsChange('username', e.target.value)} placeholder="user@source.com" required/>
                    <FormField id={`${title}-password`} name="password" label="IMAP Password" type="password" value={connectionDetails.password || ''} onChange={e => onDetailsChange('password', e.target.value)} showPasswordToggle required/>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                            <FormField id={`${title}-server`} name="server" label="IMAP Server" value={connectionDetails.server || ''} onChange={e => onDetailsChange('server', e.target.value)} placeholder="imap.example.com" required/>
                        </div>
                        <FormField id={`${title}-port`} name="port" label="Port" type="number" value={connectionDetails.port || 993} onChange={e => onDetailsChange('port', e.target.value)} required/>
                    </div>
                    <FormField type="checkbox" id={`${title}-ssl`} name="useSsl" label="Use SSL / TLS" checked={connectionDetails.useSsl ?? true} onChange={e => onDetailsChange('useSsl', (e.target as HTMLInputElement).checked)} />
                </>
            )}
        </Card>
    );
};

const MigrationGreetingView: React.FC<{ onStart: () => void }> = ({ onStart }) => (
    <Card>
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="flex-shrink-0">
                <Icon name="fas fa-rocket" className="text-5xl text-[#679a41] dark:text-emerald-400" />
            </div>
            <div className="flex-grow">
                <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">Email Migration Service</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Our secure and automated process ensures a seamless transfer of your data. We charge a flat fee of <strong>${MIGRATION_COST_PER_MAILBOX.toFixed(2)} per mailbox</strong> for this service.
                </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
                <Button onClick={onStart} size="lg" className="w-full">
                    Start New Migration
                </Button>
            </div>
        </div>
    </Card>
);


export const EmailMigrationPage: React.FC = () => {
    const navigate = useNavigate();
    const [view, setView] = useState<'list' | 'wizard'>('list');
    const [projects, setProjects] = useState<EmailMigrationProject[]>(mockEmailMigrationProjects);
    const [activeProject, setActiveProject] = useState<Partial<EmailMigrationProject> | null>(null);

    // States for the wizard
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    // Step 2 state
    const [checkedFolderIds, setCheckedFolderIds] = useState<Set<string>>(new Set(['inbox', 'inbox-work', 'inbox-personal', 'sent', 'drafts', 'archive']));
    
    // Step 4 state
    const [migrationLog, setMigrationLog] = useState<string[]>([]);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const migrationIntervalRef = useRef<number | null>(null);
    
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
        const newProject: Partial<EmailMigrationProject> = {
            id: uuidv4(),
            projectName: '',
            sourceProvider: 'google',
            sourceConnection: { useOAuth: true, useSsl: true },
            destinationProvider: 'microsoft',
            destinationConnection: { useOAuth: true, useSsl: true },
            itemsToMigrate: ['emails', 'contacts', 'calendar'],
            mailboxesToMigrate: 1,
            status: 'not_started',
            progress: 0,
            createdAt: new Date().toISOString(),
            isIncrementalSyncEnabled: true,
            migrationWindow: 'all',
        };
        setActiveProject(newProject);
        // Add to projects list immediately
        setProjects(prev => [newProject as EmailMigrationProject, ...prev]);
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

    const handleDeleteProject = (projectId: string) => {
        if(window.confirm("Are you sure you want to delete this migration project? This cannot be undone.")) {
            setProjects(prev => prev.filter(p => p.id !== projectId));
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
        if (currentStep === 0) { // Connect Accounts
            if (!activeProject?.projectName || !activeProject?.sourceConnection?.username || !activeProject?.destinationConnection?.username) {
                setErrorMessage('Please enter a project name, source, and destination usernames.');
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

    const handleConnectionChange = (
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
    };
    
    const handleProviderChange = (
        connectionType: 'sourceConnection' | 'destinationConnection',
        provider: EmailProvider
    ) => {
         updateAndSaveActiveProject(p => ({
            ...p,
            [connectionType === 'sourceConnection' ? 'sourceProvider' : 'destinationProvider']: provider,
            [connectionType]: {
                useOAuth: provider === 'google' || provider === 'microsoft',
                useSsl: true, // default to true
                username: p?.[connectionType]?.username || ''
            }
        }));
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

    const renderListView = () => (
        <Card title="Existing Migration Projects">
            {projects.length === 0 ? (
                 <p className="text-center text-gray-500 dark:text-gray-400 py-6">No migration projects have been started yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Project Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Progress</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Created</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {projects.map(p => (
                                <tr key={p.id}>
                                    <td className="px-4 py-3 font-medium">{p.projectName}</td>
                                    <td className="px-4 py-3">{getStatusChip(p.status)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                                            </div>
                                            <span className="text-xs font-semibold">{p.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        {p.status === 'completed' && <Button size="sm" variant="outline" onClick={() => handleResumeProject(p)}>View Report</Button>}
                                        {p.status === 'in_progress' && <Button size="sm" onClick={() => handleResumeProject(p)}>View Progress</Button>}
                                        {(p.status !== 'completed' && p.status !== 'in_progress') && <Button size="sm" variant="outline" onClick={() => handleResumeProject(p)}>Resume</Button>}
                                        <Button size="icon" variant="ghost" onClick={() => handleDeleteProject(p.id)} title="Delete Project"><Icon name="fas fa-trash-alt" className="text-red-500"/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );

    const renderWizardView = () => (
        <>
            <div className="w-full md:w-3/4 lg:w-2/3 mx-auto">
                <Stepper steps={steps} currentStep={currentStep} className="my-8" />
            </div>

            <div className="max-w-4xl mx-auto">
                {errorMessage && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                        <Icon name="fas fa-exclamation-triangle" className="mr-2"/>
                        <span className="font-medium">Error:</span> {errorMessage}
                    </div>
                )}

                {renderStepContent()}
            </div>
            
            <div className="max-w-4xl mx-auto flex justify-between items-center mt-8 pt-4 border-t dark:border-slate-700">
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

    const renderStepContent = () => {
        if (!activeProject) return <Spinner />;
        switch (currentStep) {
            case 0: return (
                <div className="space-y-6">
                    <FormField id="projectName" name="projectName" label="Project Name" value={activeProject.projectName || ''} onChange={e => updateAndSaveActiveProject({projectName: e.target.value})} placeholder="e.g., Marketing Team Migration" required/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ConnectionForm 
                            title="Source Account"
                            provider={activeProject.sourceProvider!}
                            connectionDetails={activeProject.sourceConnection!}
                            onProviderChange={(provider) => handleProviderChange('sourceConnection', provider)}
                            onDetailsChange={(field, value) => handleConnectionChange('sourceConnection', field, value)}
                        />
                        <ConnectionForm 
                            title="Destination Account"
                            provider={activeProject.destinationProvider!}
                            connectionDetails={activeProject.destinationConnection!}
                            onProviderChange={(provider) => handleProviderChange('destinationConnection', provider)}
                            onDetailsChange={(field, value) => handleConnectionChange('destinationConnection', field, value)}
                        />
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg flex items-center gap-3 text-sm">
                        <Icon name="fas fa-lock" className="text-green-500" />
                        <p className="text-gray-600 dark:text-gray-400">
                            Your credentials are sent over encrypted SSL/TLS channels and are never stored after the migration is complete. We recommend using provider authentication (OAuth) when available.
                        </p>
                    </div>
                </div>
            );
            case 1: return (
                 <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <Card><p className="font-bold text-lg">5,432</p><p className="text-sm text-gray-500">Emails</p></Card>
                        <Card><p className="font-bold text-lg">256</p><p className="text-sm text-gray-500">Contacts</p></Card>
                        <Card><p className="font-bold text-lg">1,024</p><p className="text-sm text-gray-500">Calendar Events</p></Card>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Select folders to migrate:</h4>
                        <TreeView nodes={mockFolderStructure} checkedIds={checkedFolderIds} onCheckedChange={setCheckedFolderIds} />
                        <p className="text-xs text-gray-500 mt-2">{checkedFolderIds.size} items selected for migration.</p>
                    </div>
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
    
    if (view === 'wizard') {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">
                        {activeProject?.projectName || 'New Migration Project'}
                    </h1>
                    <Button variant="outline" onClick={handleGoToList}>Back to Projects List</Button>
                </div>
                {renderWizardView()}
                 <Modal
                    isOpen={isCancelModalOpen}
                    onClose={() => setIsCancelModalOpen(false)}
                    title="Cancel Migration"
                    footer={<><Button variant="danger" onClick={handleCancelMigration}>Confirm Cancel</Button><Button variant="ghost" onClick={() => setIsCancelModalOpen(false)}>Continue Migration</Button></>}
                >
                    <p>Are you sure you want to cancel this migration? Any progress will be saved, but the migration will be stopped.</p>
                </Modal>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Email Migration</h1>
            <MigrationGreetingView onStart={handleStartNewMigration} />
            {renderListView()}
        </div>
    );
};
