
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, FormField, Icon, CollapsibleSection, SearchableSelect, Pagination } from '@/components/ui';
import { useAuth } from '@/context';
import type { SupportTicket, TicketAttachment, SupportTicketComment, User, SupportTicketProduct, SupportTicketRequestType, SupportTicketPriority, SupportTicketDepartment, KnowledgeBaseArticle } from '@/types';
import { mockSupportTickets, MOCK_KB_ARTICLES, getAllMockCustomers } from '@/data';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (newTicketData: Omit<SupportTicket, 'id' | 'status' | 'lastUpdate' | 'customerId' | 'customerName' | 'comments' | 'internalComments'>) => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const initialFormState = {
        product: 'General Inquiry' as SupportTicketProduct,
        requestType: 'Issue' as SupportTicketRequestType,
        priority: 'Normal' as SupportTicketPriority,
        department: 'Technical Support' as SupportTicketDepartment,
        subject: '',
        description: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };
    
    const removeAttachment = (fileName: string) => {
        setAttachments(prev => prev.filter(file => file.name !== fileName));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = () => {
        if (!formData.subject || !formData.description) {
            alert("Subject and Description are required.");
            return;
        }

        const finalAttachments: TicketAttachment[] = attachments.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: '', // This would be populated by an upload service
        }));

        onSubmit({ ...formData, attachments: finalAttachments });
        // Reset form state after submission
        setFormData(initialFormState);
        setAttachments([]);
        onClose();
    };

    const productOptions: SupportTicketProduct[] = ['CloudEdge', 'Posta Email', 'Subscriptions', 'General Inquiry'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Support Ticket" size="2xl">
            <div className="space-y-4">
                <FormField id="product" name="product" label="Product/Service" as="select" value={formData.product} onChange={handleFormChange}>
                    {productOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </FormField>

                <FormField id="subject" name="subject" label="Subject" value={formData.subject} onChange={handleFormChange} required />
                <FormField id="description" name="description" label="Description" as="textarea" rows={5} value={formData.description} onChange={handleFormChange} required />

                <div>
                    <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" size="sm" leftIconName="fas fa-paperclip" onClick={() => fileInputRef.current?.click()}>
                            Attach Files
                        </Button>
                         <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Icon name="fas fa-info-circle" className="mr-1.5 flex-shrink-0" />
                            <span>To share a video, upload it on CloudSpace and share the link in Description.</span>
                        </p>
                    </div>
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                     {attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {attachments.map((file, i) => (
                                <div key={i} className="flex items-center bg-gray-200 dark:bg-slate-600 rounded-full px-3 py-1 text-sm">
                                    <Icon name="fas fa-file" className="mr-2 text-gray-500 dark:text-gray-400" />
                                    <span>{file.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400 mx-1">-</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                                    <button onClick={() => removeAttachment(file.name)} className="ml-2 text-red-500 hover:text-red-700">
                                        <Icon name="fas fa-times-circle" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!formData.subject || !formData.description}>Create Ticket</Button>
                </div>
            </div>
        </Modal>
    );
};

interface ViewTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: SupportTicket | null;
    onUpdateTicket: (updatedTicket: SupportTicket) => void;
    currentUser: User | null;
}

const ViewTicketModal: React.FC<ViewTicketModalProps> = ({ isOpen, onClose, ticket, onUpdateTicket, currentUser }) => {
    const [newComment, setNewComment] = useState('');
    const [newAttachments, setNewAttachments] = useState<TicketAttachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState('customer');
    const [newStatus, setNewStatus] = useState<SupportTicket['status'] | undefined>();

    useEffect(() => {
        if (isOpen) {
            if (ticket) {
                setNewStatus(ticket.status);
            }
        } else {
            setNewComment('');
            setNewAttachments([]);
            setActiveTab('customer');
            setNewStatus(undefined);
        }
    }, [isOpen, ticket]);

    if (!ticket) return null;

    const isUserAdminOrReseller = currentUser?.role === 'admin' || currentUser?.role === 'reseller';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (readEvt) => {
                    const newAttachment: TicketAttachment = {
                        name: file.name, type: file.type, size: file.size,
                        dataUrl: readEvt.target?.result as string,
                    };
                    setNewAttachments(prev => [...prev, newAttachment]);
                };
                reader.readAsDataURL(file);
            });
        }
    };
    
    const removeAttachment = (fileName: string) => {
        setNewAttachments(prev => prev.filter(att => att.name !== fileName));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteComment = (commentToDelete: SupportTicketComment, isInternal: boolean) => {
        if (!ticket) return;
        if (window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
            const updatedTicket = { ...ticket };
            if (isInternal) {
                updatedTicket.internalComments = ticket.internalComments?.filter(c => c.timestamp !== commentToDelete.timestamp);
            } else {
                updatedTicket.comments = ticket.comments?.filter(c => c.timestamp !== commentToDelete.timestamp);
            }
            onUpdateTicket(updatedTicket);
        }
    };

    const handleTicketUpdate = () => {
        if (!ticket) return;

        const isCommentAdded = newComment.trim() !== '' || newAttachments.length > 0;
        const isStatusChanged = newStatus !== ticket.status;
    
        if (!isCommentAdded && !isStatusChanged) return;
    
        const updatedTicket: SupportTicket = { ...ticket };
    
        if (isCommentAdded) {
            const comment: SupportTicketComment = {
                author: currentUser?.fullName || 'User',
                timestamp: new Date().toISOString(),
                content: newComment,
                attachments: newAttachments,
            };
            
            if (activeTab === 'internal' && isUserAdminOrReseller) {
                updatedTicket.internalComments = [...(ticket.internalComments || []), comment];
            } else {
                updatedTicket.comments = [...(ticket.comments || []), comment];
            }
        }
        
        // Admin/Reseller can always set the status.
        if (isStatusChanged && isUserAdminOrReseller && newStatus) {
            updatedTicket.status = newStatus;
        } 
        // If a customer adds a comment to a resolved/closed ticket, reopen it.
        else if (isCommentAdded && currentUser?.role === 'customer' && (updatedTicket.status === 'Resolved' || updatedTicket.status === 'Closed')) {
            updatedTicket.status = 'In Progress';
        }
    
        updatedTicket.lastUpdate = new Date().toISOString();
        
        onUpdateTicket(updatedTicket);
        onClose();
    };

    const getStatusChipClass = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const AttachmentChip: React.FC<{ attachment: TicketAttachment, onRemove?: () => void }> = ({ attachment, onRemove }) => (
        <div className="flex items-center bg-gray-200 dark:bg-slate-600 rounded-full px-3 py-1 text-sm">
            <Icon name="fas fa-paperclip" className="mr-2 text-gray-500 dark:text-gray-400" />
            <a href={attachment.dataUrl} download={attachment.name} className="hover:underline">{attachment.name}</a>
            <span className="text-gray-500 dark:text-gray-400 mx-1">-</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{(attachment.size / 1024).toFixed(1)} KB</span>
            {onRemove && (
                <button onClick={onRemove} className="ml-2 text-red-500 hover:text-red-700">
                    <Icon name="fas fa-times-circle" />
                </button>
            )}
        </div>
    );
    
    const Comment: React.FC<{ comment: SupportTicketComment, isInternal?: boolean, onDelete: () => void }> = ({ comment, isInternal, onDelete }) => {
        const canDelete = currentUser?.role === 'admin' && (currentUser.fullName === comment.author || comment.author === 'Support Staff');

        return (
            <div className={`p-4 rounded-lg ${isInternal ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400' : 'bg-gray-50 dark:bg-slate-700/50'}`}>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <p className="font-semibold text-sm text-[#293c51] dark:text-gray-200">{comment.author}</p>
                    <div className="flex items-center space-x-2">
                        <p>{new Date(comment.timestamp).toLocaleString()}</p>
                        {canDelete && (
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={onDelete}
                                title="Delete comment"
                                className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-500 !p-1 !h-auto !w-auto opacity-0 group-hover:opacity-100"
                            >
                                <Icon name="fas fa-trash-alt" className="text-xs" />
                            </Button>
                        )}
                    </div>
                </div>
                <p className="text-sm mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {comment.attachments.map((att, i) => <AttachmentChip key={i} attachment={att} />)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Ticket: ${ticket.id}`} size="3xl">
            <div className="flex flex-col max-h-[75vh]">
                {/* --- Pinned Section --- */}
                <div className="flex-shrink-0 pr-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-[#293c51] dark:text-gray-100">{ticket.subject}</h3>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipClass(ticket.status)}`}>{ticket.status}</span>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Product/Service: <span className="font-medium text-[#293c51] dark:text-gray-300">{ticket.product}</span>
                    </div>

                    <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
                        <h4 className="font-semibold text-sm mb-1 text-[#293c51] dark:text-gray-200">Initial Description</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{ticket.description}</p>
                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="mt-2 pt-2 border-t dark:border-gray-600 flex flex-wrap gap-2">
                                {ticket.attachments.map((att, i) => <AttachmentChip key={i} attachment={att} />)}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Scrollable Section --- */}
                <div className="flex-grow overflow-y-auto pr-4 mt-4 pt-4 border-t dark:border-gray-700">
                    <div className="space-y-4">
                        {isUserAdminOrReseller && (
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    <button onClick={() => setActiveTab('customer')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'customer' ? 'border-[#679a41] text-[#679a41] dark:border-emerald-400 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                        Customer Comments
                                    </button>
                                    <button onClick={() => setActiveTab('internal')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'internal' ? 'border-yellow-500 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                        Internal Notes
                                    </button>
                                </nav>
                            </div>
                        )}
                        
                        <div className="space-y-3">
                            {activeTab === 'customer' && (
                                ticket.comments && ticket.comments.length > 0
                                ? ticket.comments.map((comment, i) => <div className="group" key={`cust-${i}`}><Comment comment={comment} onDelete={() => handleDeleteComment(comment, false)} /></div>)
                                : <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No customer comments yet.</p>
                            )}
                            {activeTab === 'internal' && isUserAdminOrReseller && (
                                ticket.internalComments && ticket.internalComments.length > 0
                                ? ticket.internalComments.map((comment, i) => <div className="group" key={`int-${i}`}><Comment comment={comment} isInternal onDelete={() => handleDeleteComment(comment, true)} /></div>)
                                : <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No internal notes yet.</p>
                            )}
                        </div>

                        <div className="pt-4 border-t dark:border-gray-600">
                            <h4 className="font-semibold text-lg mb-2">Add Reply / Update Status</h4>
                            <FormField
                                id="new-comment"
                                label=""
                                as="textarea"
                                rows={3}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Type your reply here..."
                            />
                            
                            <div className="mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    leftIconName="fas fa-paperclip"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Attach Files
                                </Button>
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                            {newAttachments.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {newAttachments.map((att, i) => (
                                        <AttachmentChip key={i} attachment={att} onRemove={() => removeAttachment(att.name)} />
                                    ))}
                                </div>
                            )}
                            
                            {isUserAdminOrReseller && (
                                <div className="mt-4">
                                    <FormField
                                        id="ticket-status"
                                        name="status"
                                        label="Change Ticket Status"
                                        as="select"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value as SupportTicket['status'])}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
                                    </FormField>
                                </div>
                            )}

                            <div className="mt-4 flex justify-end items-center">
                                <div className="space-x-2">
                                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                                    <Button 
                                        onClick={handleTicketUpdate} 
                                        disabled={(!newComment.trim() && newAttachments.length === 0) && (newStatus === ticket.status)}
                                    >
                                        Update Ticket
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const KnowledgeBaseModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onProceed: () => void;
}> = ({ isOpen, onClose, onProceed }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const articles = MOCK_KB_ARTICLES;

    const filteredArticles = useMemo(() => {
        if (!searchTerm.trim()) {
            return articles;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return articles.filter(
            (article) =>
                article.question.toLowerCase().includes(lowercasedTerm) ||
                article.answer.toLowerCase().includes(lowercasedTerm) ||
                article.keywords.some(k => k.toLowerCase().includes(lowercasedTerm))
        );
    }, [searchTerm, articles]);

    const groupedArticles = useMemo(() => {
        return filteredArticles.reduce((acc, article) => {
            const category = article.category as keyof typeof acc;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(article);
            return acc;
        }, {} as Record<KnowledgeBaseArticle['category'], KnowledgeBaseArticle[]>);
    }, [filteredArticles]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Find a solution" size="3xl">
            <div className="space-y-4 max-h-[70vh] flex flex-col">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Before creating a ticket, search our knowledge base for a quick solution.
                </p>
                <FormField
                    id="kb-search"
                    label=""
                    placeholder="Search for keywords like 'billing', 'ssh', 'password'..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex-grow overflow-y-auto pr-2 space-y-4 -mr-2">
                    {Object.keys(groupedArticles).length > 0 ? (
                        Object.entries(groupedArticles).map(([category, articlesInCategory]) => (
                            <div key={category}>
                                <h4 className="font-semibold text-lg mb-2 text-[#293c51] dark:text-gray-200">{category}</h4>
                                {articlesInCategory.map(article => (
                                    <CollapsibleSection key={article.id} title={article.question}>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 p-2">{article.answer}</p>
                                    </CollapsibleSection>
                                ))}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No articles found matching your search.
                        </p>
                    )}
                </div>
                <div className="pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Can't find an answer?</p>
                    <Button onClick={onProceed} leftIconName="fas fa-ticket-alt">
                        Create a Support Ticket
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

interface SupportFilters {
    customerId: string;
    ticketId: string;
    subject: string;
    status: 'all' | SupportTicket['status'];
    severity: 'all' | SupportTicketPriority;
    type: 'all' | SupportTicketRequestType;
    dateFrom: string;
    dateTo: string;
}

interface SupportFilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: SupportFilters) => void;
    onClear: () => void;
    currentFilters: SupportFilters;
    customerOptions: { value: string; label: string; }[];
}

const SupportFilterPanel: React.FC<SupportFilterPanelProps> = ({ isOpen, onClose, onApply, onClear, currentFilters, customerOptions }) => {
    const [localFilters, setLocalFilters] = useState<SupportFilters>(currentFilters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);
    
    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomerFilterChange = (customerId: string) => {
        setLocalFilters(prev => ({ ...prev, customerId }));
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
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#f8f8f8] dark:bg-slate-800 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="filter-panel-title"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h2 id="filter-panel-title" className="text-lg font-semibold text-[#293c51] dark:text-gray-100 flex items-center">
                        <Icon name="fas fa-filter" className="mr-2" />
                        Filter Support Tickets
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close filters">
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <SearchableSelect
                        id="customer-filter"
                        label="Customer"
                        options={customerOptions}
                        value={localFilters.customerId}
                        onChange={handleCustomerFilterChange}
                        placeholder="All Customers"
                    />
                    <FormField id="ticketId-filter" name="ticketId" label="Ticket ID" value={localFilters.ticketId} onChange={handleLocalChange} placeholder="e.g., TKT-58291" />
                    <FormField id="subject-filter" name="subject" label="Subject" value={localFilters.subject} onChange={handleLocalChange} placeholder="e.g., Cannot access" />
                    <FormField as="select" id="status-filter" name="status" label="Status" value={localFilters.status} onChange={handleLocalChange}>
                        <option value="all">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </FormField>
                    <FormField as="select" id="severity-filter" name="severity" label="Severity" value={localFilters.severity} onChange={handleLocalChange}>
                        <option value="all">All Severities</option>
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </FormField>
                    <FormField as="select" id="type-filter" name="type" label="Type" value={localFilters.type} onChange={handleLocalChange}>
                        <option value="all">All Types</option>
                        <option value="Inquiry">Inquiry</option>
                        <option value="Issue">Issue</option>
                        <option value="Task">Task</option>
                        <option value="Feature Request">Feature Request</option>
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField id="dateFrom-filter" name="dateFrom" label="From" type="date" value={localFilters.dateFrom} onChange={handleLocalChange} />
                        <FormField id="dateTo-filter" name="dateTo" label="To" type="date" value={localFilters.dateTo} onChange={handleLocalChange} />
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

interface CustomerSupportFilters {
    ticketId: string;
    subject: string;
    status: 'all' | SupportTicket['status'];
    severity: 'all' | SupportTicketPriority;
    type: 'all' | SupportTicketRequestType;
    dateFrom: string;
    dateTo: string;
}

interface CustomerSupportFilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: CustomerSupportFilters) => void;
    onClear: () => void;
    currentFilters: CustomerSupportFilters;
}

const CustomerSupportFilterPanel: React.FC<CustomerSupportFilterPanelProps> = ({ isOpen, onClose, onApply, onClear, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState<CustomerSupportFilters>(currentFilters);

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
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#f8f8f8] dark:bg-slate-800 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="filter-panel-title"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h2 id="filter-panel-title" className="text-lg font-semibold text-[#293c51] dark:text-gray-100 flex items-center">
                        <Icon name="fas fa-filter" className="mr-2" />
                        Filter Your Tickets
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close filters">
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <FormField id="ticketId-filter" name="ticketId" label="Ticket ID" value={localFilters.ticketId} onChange={handleLocalChange} placeholder="e.g., TKT-58291" />
                    <FormField id="subject-filter" name="subject" label="Subject" value={localFilters.subject} onChange={handleLocalChange} placeholder="e.g., Cannot access" />
                    <FormField as="select" id="status-filter" name="status" label="Status" value={localFilters.status} onChange={handleLocalChange}>
                        <option value="all">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </FormField>
                    <FormField as="select" id="severity-filter" name="severity" label="Severity" value={localFilters.severity} onChange={handleLocalChange}>
                        <option value="all">All Severities</option>
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </FormField>
                    <FormField as="select" id="type-filter" name="type" label="Type" value={localFilters.type} onChange={handleLocalChange}>
                        <option value="all">All Types</option>
                        <option value="Inquiry">Inquiry</option>
                        <option value="Issue">Issue</option>
                        <option value="Task">Task</option>
                        <option value="Feature Request">Feature Request</option>
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField id="dateFrom-filter" name="dateFrom" label="From" type="date" value={localFilters.dateFrom} onChange={handleLocalChange} />
                        <FormField id="dateTo-filter" name="dateTo" label="To" type="date" value={localFilters.dateTo} onChange={handleLocalChange} />
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


export const SupportPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<SupportTicket[]>(mockSupportTickets);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isKbModalOpen, setIsKbModalOpen] = useState(false);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const isAdmin = user?.role === 'admin';

    const [filters, setFilters] = useState<SupportFilters>({
        customerId: '',
        ticketId: '',
        subject: '',
        status: 'all',
        severity: 'all',
        type: 'all',
        dateFrom: '',
        dateTo: '',
    });
    const [allCustomers] = useState<User[]>(getAllMockCustomers);

    const customerOptions = useMemo(() => 
        allCustomers.map(c => ({ value: c.id, label: `${c.fullName} (${c.companyName})` })),
        [allCustomers]
    );

    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            if (isAdmin && filters.customerId && ticket.customerId !== filters.customerId) {
                return false;
            }
            if (filters.status !== 'all' && ticket.status !== filters.status) {
                return false;
            }
            if (filters.ticketId && !ticket.id.toLowerCase().includes(filters.ticketId.toLowerCase())) {
                return false;
            }
            if (filters.subject && !ticket.subject.toLowerCase().includes(filters.subject.toLowerCase())) {
                return false;
            }
            if (filters.severity !== 'all' && ticket.priority !== filters.severity) {
                return false;
            }
            if (filters.type !== 'all' && ticket.requestType !== filters.type) {
                return false;
            }
            
            const ticketDate = new Date(ticket.lastUpdate);
            if (filters.dateFrom && ticketDate < new Date(filters.dateFrom)) {
                return false;
            }
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (ticketDate > toDate) {
                    return false;
                }
            }
            return true;
        });
    }, [tickets, filters, isAdmin]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredTickets]);

    const paginatedTickets = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredTickets.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredTickets, currentPage, rowsPerPage]);

    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(value => {
            if (typeof value === 'string') return value !== '' && value !== 'all';
            return false;
        }).length;
    }, [filters]);


    const handleApplyFilters = (newFilters: SupportFilters) => {
        setFilters(newFilters);
    };

    const handleApplyCustomerFilters = (newFilters: CustomerSupportFilters) => {
        setFilters(prev => ({ 
            ...prev, 
            ...newFilters, 
            customerId: '' // Ensure customerId is cleared for customer view
        }));
    };

    const clearFilters = () => {
        setFilters({
            customerId: '',
            ticketId: '',
            subject: '',
            status: 'all',
            severity: 'all',
            type: 'all',
            dateFrom: '',
            dateTo: '',
        });
    };

    const handleViewTicket = (ticketId: string) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
            setSelectedTicket(ticket);
            setIsViewModalOpen(true);
        }
    };
    
    const handleUpdateTicket = (updatedTicket: SupportTicket) => {
        setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    };

    const handleOpenKbModal = () => {
        setIsKbModalOpen(true);
    };

    const handleProceedToCreateTicket = () => {
        setIsKbModalOpen(false);
        if (user?.role === 'admin') {
            navigate('/app/admin/support/create');
        } else {
            setIsCreateModalOpen(true);
        }
    };
    
    const handleCreateTicketSubmit = (newTicketData: Omit<SupportTicket, 'id' | 'status' | 'lastUpdate' | 'customerId' | 'customerName' | 'comments' | 'internalComments'>) => {
        const newTicket: SupportTicket = {
            id: `TKT-${Math.floor(Math.random() * 90000) + 10000}`,
            status: 'Open',
            lastUpdate: new Date().toISOString(),
            customerName: user?.fullName || 'Customer',
            customerId: user?.id || '',
            ...newTicketData,
        };
        setTickets(prev => [newTicket, ...prev]);
        setIsCreateModalOpen(false);
    };

    const getStatusChipClass = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    
    return (
        <>
            <Card title="Support Center" titleActions={
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsFilterPanelOpen(true)}
                        leftIconName="fas fa-filter"
                        className="relative"
                    >
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex justify-center items-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-semibold">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                    <Button onClick={handleOpenKbModal} leftIconName="fas fa-plus-circle">
                        Create New Ticket
                    </Button>
                </div>
            }>
                <div className="overflow-x-auto border dark:border-gray-700 rounded-lg">
                    <table className="min-w-full bg-white dark:bg-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ticket ID</th>
                                {isAdmin && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer Name</th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Last Update</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedTickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{ticket.id}</td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ticket.customerName}</td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ticket.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ticket.product}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipClass(ticket.status)}`}>{ticket.status}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(ticket.lastUpdate).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button size="sm" onClick={() => handleViewTicket(ticket.id)}>View Ticket</Button>
                                    </td>
                                </tr>
                            ))}
                              {filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        No tickets found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                     <Pagination
                        currentPage={currentPage}
                        totalItems={filteredTickets.length}
                        itemsPerPage={rowsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(value) => {
                            setRowsPerPage(value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </Card>

            <KnowledgeBaseModal
                isOpen={isKbModalOpen}
                onClose={() => setIsKbModalOpen(false)}
                onProceed={handleProceedToCreateTicket}
            />

            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTicketSubmit}
            />

            <ViewTicketModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                ticket={selectedTicket}
                onUpdateTicket={handleUpdateTicket}
                currentUser={user}
            />
            
            {isAdmin ? (
                <SupportFilterPanel
                    isOpen={isFilterPanelOpen}
                    onClose={() => setIsFilterPanelOpen(false)}
                    onApply={handleApplyFilters}
                    onClear={clearFilters}
                    currentFilters={filters}
                    customerOptions={customerOptions}
                />
            ) : (
                <CustomerSupportFilterPanel
                    isOpen={isFilterPanelOpen}
                    onClose={() => setIsFilterPanelOpen(false)}
                    onApply={handleApplyCustomerFilters}
                    onClear={clearFilters}
                    currentFilters={{ 
                        ticketId: filters.ticketId, 
                        subject: filters.subject, 
                        status: filters.status, 
                        severity: filters.severity, 
                        type: filters.type, 
                        dateFrom: filters.dateFrom, 
                        dateTo: filters.dateTo 
                    }}
                />
            )}
        </>
    );
};